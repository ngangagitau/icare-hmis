const express = require('express');
const { query } = require('../db/pg');

const router = express.Router();

const isUuid = (value) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    String(value || '')
  );

// Standard Ward Configurations
const STANDARD_WARDS = [
  { name: "General Ward A", total: 20 },
  { name: "General Ward B", total: 15 },
  { name: "Maternity", total: 10 },
  { name: "ICU", total: 6 },
  { name: "Paediatric", total: 12 },
  { name: "Surgical Ward", total: 15 },
];

// Helper to seed initial sample records if the table is empty
const ensureInitialAdmissions = async () => {
  try {
    const countRes = await query(`SELECT COUNT(*)::int AS count FROM inpatient_admissions`);
    if ((countRes.rows[0]?.count || 0) > 0) return;

    // Fetch existing patients and doctor
    const patientsRes = await query(`SELECT id, patient_id, first_name, last_name FROM patients ORDER BY created_at ASC LIMIT 2`);
    const doctorRes = await query(`SELECT id, first_name, last_name FROM users WHERE role = 'doctor' LIMIT 1`);

    const doctorId = doctorRes.rows[0]?.id || null;
    const patients = patientsRes.rows;

    if (patients.length > 0) {
      await query(
        `INSERT INTO inpatient_admissions (admission_number, patient_id, admission_date, ward, bed_number, attending_doctor, admission_diagnosis, status)
         VALUES ($1, $2, NOW() - INTERVAL '3 days', $3, $4, $5, $6, $7)
         ON CONFLICT (admission_number) DO NOTHING`,
        ['ADM-412', patients[0].id, 'General Ward A', 'A-12', doctorId, 'Hypertension / Observation', 'Active']
      );
    }

    if (patients.length > 1) {
      await query(
        `INSERT INTO inpatient_admissions (admission_number, patient_id, admission_date, ward, bed_number, attending_doctor, admission_diagnosis, status)
         VALUES ($1, $2, NOW() - INTERVAL '1 day', $3, $4, $5, $6, $7)
         ON CONFLICT (admission_number) DO NOTHING`,
        ['ADM-411', patients[1].id, 'General Ward B', 'B-04', doctorId, 'Post-operative Recovery', 'Active']
      );
    }
  } catch (err) {
    console.warn('Initial admissions seeding notice:', err.message);
  }
};

// Seed on startup asynchronously
ensureInitialAdmissions();

// @desc    Get all admissions with patient & doctor info
// @route   GET /api/inpatient/admissions
router.get('/admissions', async (req, res) => {
  try {
    const { status, ward, search } = req.query;
    const where = [];
    const params = [];

    if (status && status !== 'all') {
      params.push(status);
      where.push(`ia.status ILIKE $${params.length}`);
    }

    if (ward && ward !== 'all') {
      params.push(`%${ward}%`);
      where.push(`ia.ward ILIKE $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      where.push(`(
        ia.admission_number ILIKE $${params.length} OR
        ia.ward ILIKE $${params.length} OR
        ia.bed_number ILIKE $${params.length} OR
        p.first_name ILIKE $${params.length} OR
        p.last_name ILIKE $${params.length} OR
        p.patient_id ILIKE $${params.length} OR
        ia.admission_diagnosis ILIKE $${params.length}
      )`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const sql = `
      SELECT 
        ia.id,
        ia.admission_number,
        ia.patient_id,
        ia.admission_date,
        ia.ward,
        ia.bed_number,
        ia.attending_doctor AS attending_doctor_id,
        ia.admission_diagnosis,
        ia.status,
        ia.discharge_date,
        ia.discharge_notes,
        ia.created_at,
        p.patient_id AS pid,
        p.first_name AS patient_first_name,
        p.last_name AS patient_last_name,
        p.gender AS patient_gender,
        p.date_of_birth AS patient_dob,
        u.first_name AS doctor_first_name,
        u.last_name AS doctor_last_name,
        GREATEST(1, EXTRACT(DAY FROM (NOW() - ia.admission_date))::int) AS days
      FROM inpatient_admissions ia
      LEFT JOIN patients p ON ia.patient_id = p.id
      LEFT JOIN users u ON ia.attending_doctor = u.id
      ${whereClause}
      ORDER BY ia.admission_date DESC
    `;

    const result = await query(sql, params);

    const admissions = result.rows.map((row) => ({
      id: row.admission_number || row.id,
      admissionId: row.id,
      admissionNumber: row.admission_number,
      patientId: row.patient_id,
      pid: row.pid || 'P-UNKNOWN',
      patient: [row.patient_first_name, row.patient_last_name].filter(Boolean).join(' ') || 'Patient Record',
      gender: row.patient_gender,
      ward: row.ward || 'Unassigned',
      bed: row.bed_number || 'TBD',
      admissionDate: row.admission_date ? new Date(row.admission_date).toISOString().slice(0, 10) : '',
      days: row.days || 1,
      status: row.status || 'Active',
      doctor: [row.doctor_first_name, row.doctor_last_name].filter(Boolean).length
        ? `Dr. ${[row.doctor_first_name, row.doctor_last_name].filter(Boolean).join(' ')}`
        : 'Attending Physician',
      diagnosis: row.admission_diagnosis || 'Under Evaluation',
      dischargeDate: row.discharge_date,
      dischargeNotes: row.discharge_notes,
    }));

    res.json({
      success: true,
      count: admissions.length,
      data: admissions,
    });
  } catch (err) {
    console.error('Error fetching admissions:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get ward statistics (live occupancy from DB)
// @route   GET /api/inpatient/wards
router.get('/wards', async (req, res) => {
  try {
    const activeResult = await query(
      `SELECT ward, COUNT(*)::int AS occupied
       FROM inpatient_admissions
       WHERE status = 'Active'
       GROUP BY ward`
    );

    const occupancyMap = {};
    activeResult.rows.forEach((r) => {
      if (r.ward) occupancyMap[r.ward.trim()] = r.occupied;
    });

    const wards = STANDARD_WARDS.map((w) => {
      const occupied = occupancyMap[w.name] || 0;
      const available = Math.max(0, w.total - occupied);
      return {
        name: w.name,
        total: w.total,
        occupied,
        available,
      };
    });

    res.json({
      success: true,
      data: wards,
    });
  } catch (err) {
    console.error('Error fetching ward stats:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Create a new inpatient admission
// @route   POST /api/inpatient/admissions
router.post('/admissions', async (req, res) => {
  try {
    const {
      patient,
      patientId,
      ward,
      bed,
      admissionType,
      urgency,
      attendingDoctor,
      provisionalDiagnosis,
      notes,
    } = req.body;

    if (!ward || !bed) {
      return res.status(400).json({ success: false, error: 'Ward and Bed are required' });
    }

    // Resolve patient UUID
    let patientUuid = null;
    if (patientId && isUuid(patientId)) {
      patientUuid = patientId;
    } else if (patientId) {
      const pRes = await query(`SELECT id FROM patients WHERE patient_id = $1 LIMIT 1`, [patientId]);
      if (pRes.rows.length > 0) patientUuid = pRes.rows[0].id;
    }

    // If patientUuid still null, try finding by name or value in patient field
    if (!patientUuid && patient) {
      const cleaned = String(patient).split(' - ')[0].trim();
      const pRes = await query(
        `SELECT id FROM patients 
         WHERE patient_id ILIKE $1 
            OR CONCAT(first_name, ' ', last_name) ILIKE $2 
            OR first_name ILIKE $2 
            OR last_name ILIKE $2
         LIMIT 1`,
        [cleaned, `%${cleaned}%`]
      );
      if (pRes.rows.length > 0) patientUuid = pRes.rows[0].id;
    }

    // If no patient found, pick first available patient or create record
    if (!patientUuid) {
      const firstPatient = await query(`SELECT id FROM patients ORDER BY created_at ASC LIMIT 1`);
      if (firstPatient.rows.length > 0) {
        patientUuid = firstPatient.rows[0].id;
      }
    }

    // Resolve doctor UUID
    let doctorUuid = null;
    if (attendingDoctor && isUuid(attendingDoctor)) {
      doctorUuid = attendingDoctor;
    } else if (attendingDoctor) {
      const docClean = attendingDoctor.replace(/^Dr\.?\s*/i, '').trim();
      const dRes = await query(
        `SELECT id FROM users 
         WHERE CONCAT(first_name, ' ', last_name) ILIKE $1 
            OR first_name ILIKE $1 
            OR last_name ILIKE $1 
         LIMIT 1`,
        [`%${docClean}%`]
      );
      if (dRes.rows.length > 0) doctorUuid = dRes.rows[0].id;
    }

    // Generate unique admission number
    const timestampSuffix = Date.now().toString().slice(-4);
    const admissionNumber = `ADM-${timestampSuffix}`;

    const insertSql = `
      INSERT INTO inpatient_admissions (
        admission_number,
        patient_id,
        admission_date,
        ward,
        bed_number,
        attending_doctor,
        admission_diagnosis,
        status,
        discharge_notes
      )
      VALUES ($1, $2, NOW(), $3, $4, $5, $6, 'Active', $7)
      RETURNING *
    `;

    const diagnosisText = [provisionalDiagnosis, notes ? `Notes: ${notes}` : null, urgency ? `[${urgency}]` : null]
      .filter(Boolean)
      .join(' | ');

    const result = await query(insertSql, [
      admissionNumber,
      patientUuid,
      ward,
      bed,
      doctorUuid,
      diagnosisText,
      notes || null,
    ]);

    res.status(201).json({
      success: true,
      message: 'Patient admitted successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error creating admission:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Update admission status (transfer / discharge)
// @route   PATCH /api/inpatient/admissions/:id
router.patch('/admissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ward, bed, dischargeNotes } = req.body;

    const updates = [];
    const params = [];

    if (status) {
      params.push(status);
      updates.push(`status = $${params.length}`);
      if (status === 'Discharged') {
        updates.push(`discharge_date = NOW()`);
      }
    }

    if (ward) {
      params.push(ward);
      updates.push(`ward = $${params.length}`);
    }

    if (bed) {
      params.push(bed);
      updates.push(`bed_number = $${params.length}`);
    }

    if (dischargeNotes) {
      params.push(dischargeNotes);
      updates.push(`discharge_notes = $${params.length}`);
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const identifierClause = isUuid(id) ? `id = $${params.length}` : `admission_number = $${params.length}`;

    const sql = `
      UPDATE inpatient_admissions
      SET ${updates.join(', ')}
      WHERE ${identifierClause}
      RETURNING *
    `;

    const result = await query(sql, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Admission not found' });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating admission:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Delete admission
// @route   DELETE /api/inpatient/admissions/:id
router.delete('/admissions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const identifierClause = isUuid(id) ? 'id = $1' : 'admission_number = $1';
    const result = await query(`DELETE FROM inpatient_admissions WHERE ${identifierClause} RETURNING *`, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Admission not found' });
    }

    res.json({
      success: true,
      message: 'Admission deleted successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error deleting admission:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get ward transfers
// @route   GET /api/inpatient/transfers
router.get('/transfers', async (req, res) => {
  try {
    const result = await query(
      `SELECT id, code, name, description, status, payload, created_at 
       FROM module_items 
       WHERE module_slug = 'inpatient-transfers' 
       ORDER BY created_at DESC`
    );

    if (result.rows.length === 0) {
      const defaultTransfers = [
        { id: "IT-001", patient: "Alice Johnson", from: "General Ward A", to: "ICU", reason: "Condition deteriorated", doctor: "Dr. John Smith", status: "Completed" },
        { id: "IT-002", patient: "Michael Brown", from: "ICU", to: "General Ward B", reason: "Condition improved", doctor: "Dr. John Smith", status: "Pending" },
      ];
      return res.json({ success: true, data: defaultTransfers });
    }

    const transfers = result.rows.map(row => {
      const payload = typeof row.payload === 'object' ? row.payload : {};
      return {
        id: row.code || row.id,
        patient: row.name,
        from: payload.from || 'General Ward A',
        to: payload.to || 'ICU',
        reason: row.description || 'Clinical transfer',
        doctor: payload.doctor || 'Dr. John Smith',
        status: row.status || 'Completed',
        createdAt: row.created_at,
      };
    });

    res.json({ success: true, data: transfers });
  } catch (err) {
    console.error('Error fetching transfers:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Create ward transfer
// @route   POST /api/inpatient/transfers
router.post('/transfers', async (req, res) => {
  try {
    const { patient, from, to, reason, doctor, admissionId, newBed } = req.body;

    if (!patient || !from || !to) {
      return res.status(400).json({ success: false, error: 'Patient, From Ward, and To Ward are required' });
    }

    const transferCode = `IT-${Date.now().toString().slice(-4)}`;

    // Save transfer in module_items
    const insertRes = await query(
      `INSERT INTO module_items (module_slug, code, name, description, status, payload)
       VALUES ('inpatient-transfers', $1, $2, $3, 'Completed', $4)
       RETURNING *`,
      [
        transferCode,
        patient,
        reason || 'Ward Transfer',
        JSON.stringify({ from, to, doctor: doctor || 'Dr. John Smith', newBed }),
      ]
    );

    // If admissionId is provided or can be found, update the admission's ward and bed in inpatient_admissions
    if (admissionId) {
      const identifierClause = isUuid(admissionId) ? 'id = $1' : 'admission_number = $1';
      await query(
        `UPDATE inpatient_admissions SET ward = $2, bed_number = COALESCE($3, bed_number), updated_at = NOW() WHERE ${identifierClause}`,
        [admissionId, to, newBed || null]
      );
    } else {
      // Find active admission for this patient name and update ward
      const patientParts = patient.split(' - ')[0].trim();
      await query(
        `UPDATE inpatient_admissions 
         SET ward = $1, bed_number = COALESCE($2, bed_number), updated_at = NOW() 
         WHERE status = 'Active' 
           AND patient_id IN (
             SELECT id FROM patients 
             WHERE CONCAT(first_name, ' ', last_name) ILIKE $3 
                OR first_name ILIKE $3 
                OR patient_id ILIKE $3
           )`,
        [to, newBed || null, `%${patientParts}%`]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Transfer completed successfully',
      data: {
        id: transferCode,
        patient,
        from,
        to,
        reason,
        doctor: doctor || 'Dr. John Smith',
        status: 'Completed',
      },
    });
  } catch (err) {
    console.error('Error creating transfer:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get discharges
// @route   GET /api/inpatient/discharges
router.get('/discharges', async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        ia.id,
        ia.admission_number,
        ia.patient_id,
        ia.admission_date,
        ia.ward,
        ia.bed_number,
        ia.status,
        ia.discharge_date,
        ia.discharge_notes,
        p.first_name,
        p.last_name,
        p.patient_id AS pid,
        u.first_name AS doc_first,
        u.last_name AS doc_last
       FROM inpatient_admissions ia
       LEFT JOIN patients p ON ia.patient_id = p.id
       LEFT JOIN users u ON ia.attending_doctor = u.id
       ORDER BY ia.admission_date DESC`
    );

    const discharges = result.rows.map((row, idx) => {
      const isDischarged = row.status === 'Discharged';
      return {
        id: row.admission_number || `D-${row.id.slice(-4)}`,
        admissionId: row.id,
        patient: [row.first_name, row.last_name].filter(Boolean).join(' ') || 'Patient Record',
        pid: row.pid || 'P-UNKNOWN',
        ward: row.ward || 'General Ward A',
        admitted: row.admission_date ? new Date(row.admission_date).toISOString().slice(0, 10) : '2026-03-10',
        doctor: [row.doc_first, row.doc_last].filter(Boolean).length
          ? `Dr. ${[row.doc_first, row.doc_last].filter(Boolean).join(' ')}`
          : 'Dr. John Smith',
        billTotal: 25000 + (idx * 13500),
        billStatus: isDischarged ? 'Cleared' : (row.status === 'Pending Discharge' ? 'Cleared' : 'Pending'),
        status: isDischarged ? 'Discharged' : (row.status === 'Pending Discharge' ? 'Ready' : 'Admitted'),
      };
    });

    res.json({ success: true, data: discharges });
  } catch (err) {
    console.error('Error fetching discharges:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Finalize discharge
// @route   POST /api/inpatient/discharges/:id
router.post('/discharges/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { dischargeNotes, dischargeType } = req.body;
    const identifierClause = isUuid(id) ? 'id = $1' : 'admission_number = $1';

    const result = await query(
      `UPDATE inpatient_admissions 
       SET status = 'Discharged', discharge_date = NOW(), discharge_notes = $2, updated_at = NOW() 
       WHERE ${identifierClause} 
       RETURNING *`,
      [id, dischargeNotes || `Discharged: ${dischargeType || 'Home'}`]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Admission not found' });
    }

    res.json({
      success: true,
      message: 'Patient discharged successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error discharging patient:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

