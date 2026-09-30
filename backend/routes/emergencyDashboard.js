const express = require('express');
const { randomBytes } = require('crypto');
const { pool, query } = require('../db/pg');
const { protect, checkPermission } = require('../middleware/auth');

const router = express.Router();
const validTriageLevels = ['Red', 'Orange', 'Yellow', 'Green', 'Black'];

router.post('/cases', protect, checkPermission('emergency', 'create'), async (req, res) => {
  const { patientId, triageLevel, presentingComplaint, vitalSigns = {}, notes } = req.body;
  if (!patientId || !triageLevel || !presentingComplaint?.trim()) {
    return res.status(400).json({ success: false, error: 'Patient, triage level, and chief complaint are required' });
  }
  if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(patientId) || !validTriageLevels.includes(triageLevel)) {
    return res.status(400).json({ success: false, error: 'A valid patient and triage level are required' });
  }

  let client;
  let transactionStarted = false;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    transactionStarted = true;
    const patientResult = await client.query('SELECT id FROM patients WHERE id = $1', [patientId]);
    if (!patientResult.rows[0]) {
      await client.query('ROLLBACK');
      transactionStarted = false;
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }

    const caseNumber = `EM-${Date.now()}-${randomBytes(2).toString('hex').toUpperCase()}`;
    const caseStatus = triageLevel === 'Black' ? 'Deceased' : 'Active';
    const caseResult = await client.query(
      `INSERT INTO emergency_cases (case_number, patient_id, arrival_time, chief_complaint, severity_level, status, created_by)
       VALUES ($1, $2, NOW(), $3, $4, $5, $6)
       RETURNING id, case_number, patient_id, arrival_time, chief_complaint, severity_level, status`,
      [caseNumber, patientId, presentingComplaint.trim(), triageLevel, caseStatus, req.user.id]
    );

    await client.query(
      `INSERT INTO triage_nursing (patient_id, triage_date, triage_time, vital_signs, chief_complaint, triage_level, nursing_notes, created_by)
       VALUES ($1, CURRENT_DATE, CURRENT_TIME, $2, $3, $4, $5, $6)`,
      [patientId, vitalSigns, presentingComplaint.trim(), triageLevel, notes || null, req.user.id]
    );
    await client.query('COMMIT');
    transactionStarted = false;

    const record = caseResult.rows[0];
    res.status(201).json({
      success: true,
      data: {
        _id: record.id,
        caseId: record.case_number,
        patientId: record.patient_id,
        presentingComplaint: record.chief_complaint,
        triageLevel: record.severity_level,
        status: record.status,
        createdAt: record.arrival_time,
      },
    });
  } catch (error) {
    if (client && transactionStarted) {
      await client.query('ROLLBACK').catch(() => {});
    }
    console.error('Emergency intake save failed:', error);
    res.status(500).json({ success: false, error: 'Unable to save emergency case' });
  } finally {
    client?.release();
  }
});

router.get('/cases', protect, checkPermission('emergency', 'read'), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const offset = (page - 1) * limit;
    const filters = [];
    const values = [];

    if (req.query.status && req.query.status !== 'All') {
      values.push(req.query.status);
      filters.push(`ec.status ILIKE $${values.length}`);
    }

    if (req.query.triageLevel && req.query.triageLevel !== 'All') {
      values.push(req.query.triageLevel);
      filters.push(`ec.severity_level ILIKE $${values.length}`);
    }

    if (req.query.activeOnly === 'true') {
      filters.push(`LOWER(ec.status) IN ('active', 'incoming', 'triage', 'treatment')`);
    }

    if (req.query.search) {
      values.push(`%${req.query.search}%`);
      filters.push(`(
        ec.case_number ILIKE $${values.length} OR
        ec.chief_complaint ILIKE $${values.length} OR
        p.first_name ILIKE $${values.length} OR
        p.last_name ILIKE $${values.length} OR
        p.patient_id ILIKE $${values.length}
      )`);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const [countResult, summaryResult, casesResult] = await Promise.all([
      query(`SELECT COUNT(*)::int AS total FROM emergency_cases ec LEFT JOIN patients p ON p.id = ec.patient_id ${whereClause}`, values),
      query(`
        SELECT
          COUNT(*) FILTER (WHERE arrival_time::date = CURRENT_DATE)::int AS arrivals_today,
          COUNT(*) FILTER (WHERE LOWER(status) IN ('active', 'incoming', 'triage', 'treatment'))::int AS active_cases,
          COUNT(*) FILTER (WHERE LOWER(severity_level) = 'red')::int AS red_cases,
          COUNT(*) FILTER (WHERE LOWER(severity_level) = 'orange')::int AS orange_cases
        FROM emergency_cases
      `),
      query(
        `
          SELECT
            ec.id,
            ec.case_number,
            ec.patient_id,
            ec.arrival_time,
            ec.chief_complaint,
            ec.severity_level,
            ec.status,
            ec.disposition,
            p.patient_id AS patient_number,
            p.first_name AS patient_first_name,
            p.last_name AS patient_last_name,
            p.date_of_birth,
            p.gender,
            u.first_name AS doctor_first_name,
            u.last_name AS doctor_last_name,
            tn.vital_signs
          FROM emergency_cases ec
          LEFT JOIN patients p ON p.id = ec.patient_id
          LEFT JOIN users u ON u.id = ec.assigned_doctor
          LEFT JOIN LATERAL (
            SELECT vital_signs
            FROM triage_nursing
            WHERE patient_id = ec.patient_id
            ORDER BY triage_date DESC, triage_time DESC NULLS LAST, created_at DESC
            LIMIT 1
          ) tn ON TRUE
          ${whereClause}
          ORDER BY ec.arrival_time DESC
          OFFSET $${values.length + 1}
          LIMIT $${values.length + 2}
        `,
        [...values, offset, limit]
      ),
    ]);

    const total = countResult.rows[0]?.total || 0;
    const summary = summaryResult.rows[0] || {};
    const data = casesResult.rows.map((row) => ({
      _id: row.id,
      caseId: row.case_number,
      patientId: row.patient_id,
      patientNumber: row.patient_number || '',
      patientName: [row.patient_first_name, row.patient_last_name].filter(Boolean).join(' ') || 'Patient record unavailable',
      dateOfBirth: row.date_of_birth,
      gender: row.gender || '',
      triageLevel: row.severity_level || '',
      presentingComplaint: row.chief_complaint || '',
      vitalSigns: row.vital_signs || null,
      status: row.status || '',
      disposition: row.disposition || '',
      doctorAssigned: [row.doctor_first_name, row.doctor_last_name].filter(Boolean).join(' '),
      createdAt: row.arrival_time,
    }));

    res.json({
      success: true,
      count: data.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalCases: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      summary: {
        arrivalsToday: summary.arrivals_today || 0,
        activeCases: summary.active_cases || 0,
        redCases: summary.red_cases || 0,
        orangeCases: summary.orange_cases || 0,
      },
      data,
    });
  } catch (error) {
    console.error('Emergency dashboard query failed:', error);
    res.status(500).json({ success: false, error: 'Unable to load emergency cases' });
  }
});

router.get('/billing', protect, checkPermission('billing', 'read'), async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 25, 1), 100);
    const offset = (page - 1) * limit;
    const where = `WHERE EXISTS (
      SELECT 1 FROM emergency_cases ec WHERE ec.patient_id = b.patient_id
    )`;
    const [countResult, invoicesResult] = await Promise.all([
      query(`SELECT COUNT(*)::int AS total FROM billing b ${where}`),
      query(
        `SELECT
           b.id,
           b.invoice_number,
           b.invoice_date,
           b.patient_id,
           b.items,
           b.amount_due,
           b.balance,
           b.payment_status,
           b.payment_method,
           p.patient_id AS patient_number,
           p.first_name,
           p.last_name,
           COALESCE(p.insurance->>'provider', 'Cash / self-pay') AS payer
         FROM billing b
         LEFT JOIN patients p ON p.id = b.patient_id
         ${where}
         ORDER BY b.invoice_date DESC NULLS LAST, b.created_at DESC
         OFFSET $1 LIMIT $2`,
        [offset, limit]
      ),
    ]);
    const total = countResult.rows[0]?.total || 0;

    res.json({
      success: true,
      count: invoicesResult.rows.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalInvoices: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      data: invoicesResult.rows.map((row) => ({
        _id: row.id,
        invoiceNumber: row.invoice_number,
        invoiceDate: row.invoice_date,
        patientId: row.patient_id,
        patientNumber: row.patient_number || '',
        patientName: [row.first_name, row.last_name].filter(Boolean).join(' ') || 'Patient record unavailable',
        items: row.items || [],
        amountDue: Number(row.amount_due || 0),
        balance: Number(row.balance || 0),
        paymentStatus: row.payment_status || 'Not recorded',
        paymentMethod: row.payment_method || '',
        payer: row.payer,
      })),
    });
  } catch (error) {
    console.error('Emergency billing query failed:', error);
    res.status(500).json({ success: false, error: 'Unable to load patient invoices' });
  }
});

module.exports = router;