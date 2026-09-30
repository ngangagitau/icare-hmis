const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../db/pg');
const { protect } = require('../middleware/auth');

const router = express.Router();

const isUuid = (value) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    String(value || '')
  );

async function resolvePatientId(patientRef) {
  if (!patientRef) return null;
  const ref = String(patientRef).trim();
  const result = await query(
    isUuid(ref)
      ? `SELECT id FROM patients WHERE id = $1`
      : `SELECT id FROM patients WHERE patient_id = $1`,
    [ref]
  );
  return result.rows[0]?.id || null;
}

const mapRadiologyOrder = (row) => {
  const res = row.results || {};
  return {
    _id: row.id,
    id: row.id,
    orderId: row.order_number,
    orderNumber: row.order_number,
    patientId: row.patient_id,
    patientName: row.patient_name || 'Walk-in Patient',
    patientDisplayId: row.patient_display_id || (row.patient_id ? String(row.patient_id).slice(0, 8) : 'WALK-IN'),
    patientGender: row.patient_gender || 'Unknown',
    patientDob: row.patient_dob,
    modality: row.modality || 'X-Ray',
    bodyPart: row.imaging_type || res.bodyPart || 'Unspecified',
    imagingType: row.imaging_type || 'Diagnostic Scan',
    urgency: res.urgency || 'Routine',
    orderDate: row.order_date || row.created_at,
    status: row.status || 'Pending',
    findings: res.findings || '',
    impression: res.impression || '',
    recommendations: res.recommendations || '',
    technique: res.technique || '',
    clinicalIndication: res.clinicalIndication || row.radiologist_notes || '',
    radiologistName: res.radiologistName || row.requested_by_name || 'Staff Radiologist',
    technicianName: res.technicianName || '',
    paymentStatus: res.paymentStatus || 'Cleared',
    paymentAmount: res.paymentAmount || 0,
    paymentMethod: res.paymentMethod || 'Cash',
    images: Array.isArray(res.images) ? res.images : [],
    notes: row.radiologist_notes || res.notes || '',
    results: res,
    requestedBy: row.requested_by_name || 'Attending Physician',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const ORDER_SELECT = `
  SELECT
    ro.*,
    pa.patient_id AS patient_display_id,
    CONCAT(pa.first_name, ' ', pa.last_name) AS patient_name,
    pa.gender AS patient_gender,
    pa.date_of_birth AS patient_dob,
    CONCAT(req.first_name, ' ', req.last_name) AS requested_by_name
  FROM radiology_orders ro
  LEFT JOIN patients pa ON pa.id = ro.patient_id
  LEFT JOIN users req ON req.id = ro.requested_by
`;

async function generateOrderNumber() {
  const today = new Date();
  const prefix = `RAD${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const result = await query(
    `SELECT COUNT(*)::int AS count FROM radiology_orders WHERE order_number LIKE $1`,
    [`${prefix}-%`]
  );
  return `${prefix}-${String((result.rows[0]?.count || 0) + 1).padStart(4, '0')}`;
}

// GET /api/radiology/stats
router.get('/stats', protect, async (_req, res) => {
  try {
    const totalOrders = await query(`SELECT COUNT(*)::int AS count FROM radiology_orders`);
    const pending = await query(`SELECT COUNT(*)::int AS count FROM radiology_orders WHERE status = 'Pending'`);
    const inProgress = await query(`SELECT COUNT(*)::int AS count FROM radiology_orders WHERE status = 'In Progress'`);
    const completed = await query(`SELECT COUNT(*)::int AS count FROM radiology_orders WHERE status = 'Completed'`);

    res.json({
      success: true,
      data: {
        total: totalOrders.rows[0]?.count || 0,
        pending: pending.rows[0]?.count || 0,
        inProgress: inProgress.rows[0]?.count || 0,
        completed: completed.rows[0]?.count || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/radiology
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];

    if (req.query.status && req.query.status !== 'All') {
      params.push(req.query.status);
      where.push(`ro.status = $${params.length}`);
    }

    if (req.query.modality && req.query.modality !== 'All') {
      params.push(req.query.modality);
      where.push(`ro.modality = $${params.length}`);
    }

    if (req.query.patient || req.query.patientId) {
      const pRef = String(req.query.patient || req.query.patientId);
      if (isUuid(pRef)) {
        params.push(pRef);
        where.push(`ro.patient_id = $${params.length}`);
      } else {
        params.push(pRef);
        where.push(`pa.patient_id = $${params.length}`);
      }
    }

    if (req.query.search) {
      params.push(`%${req.query.search}%`);
      where.push(
        `(ro.order_number ILIKE $${params.length} OR ro.imaging_type ILIKE $${params.length} OR ro.modality ILIKE $${params.length} OR CONCAT(pa.first_name, ' ', pa.last_name) ILIKE $${params.length} OR pa.patient_id ILIKE $${params.length})`
      );
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const totalResult = await query(
      `SELECT COUNT(*)::int AS total FROM radiology_orders ro LEFT JOIN patients pa ON pa.id = ro.patient_id ${whereClause}`,
      params
    );
    const total = totalResult.rows[0]?.total || 0;

    const rows = await query(
      `${ORDER_SELECT} ${whereClause} ORDER BY ro.created_at DESC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, offset, limit]
    );

    res.json({
      success: true,
      count: rows.rows.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
        totalOrders: total,
        totalRecords: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      data: rows.rows.map(mapRadiologyOrder),
    });
  } catch (err) {
    console.error('Radiology list error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/radiology/:id
router.get('/:id', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid order ID' });
    const result = await query(`${ORDER_SELECT} WHERE ro.id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Radiology order not found' });
    res.json({ success: true, data: mapRadiologyOrder(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/radiology
router.post(
  '/',
  protect,
  [
    body('patientId', 'Patient ID is required').not().isEmpty(),
    body('modality', 'Modality is required').not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const patientId = await resolvePatientId(req.body.patientId || req.body.patient);
      if (!patientId) return res.status(404).json({ success: false, error: 'Patient not found' });

      const orderNumber = req.body.orderNumber || (await generateOrderNumber());
      const modality = req.body.modality;
      const imagingType = req.body.bodyPart || req.body.imagingType || `${modality} Examination`;
      const urgency = req.body.urgency || 'Routine';
      const initialResults = {
        urgency,
        bodyPart: req.body.bodyPart || imagingType,
        clinicalIndication: req.body.clinicalIndication || req.body.notes || '',
        paymentStatus: 'Awaiting Cashier Payment',
        paymentAmount: Number(req.body.paymentAmount || 0),
        paymentMethod: req.body.paymentMethod || 'Cash',
        images: Array.isArray(req.body.images) ? req.body.images : [],
      };

      const inserted = await query(
        `INSERT INTO radiology_orders (
          order_number, patient_id, imaging_type, modality, order_date, requested_by, status, results, radiologist_notes, payment_status, created_by
        ) VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, 'Pending', $6, $7, 'Awaiting Cashier Payment', $5)
        RETURNING id`,
        [
          orderNumber,
          patientId,
          imagingType,
          modality,
          req.user.id,
          JSON.stringify(initialResults),
          req.body.notes || null,
        ]
      );

      const orderId = inserted.rows[0].id;

      // Auto-bill: create/append invoice and sync payment_status (cash vs insurance)
      const { billClinicalOrder } = require('../lib/clinicalBillingBridge');
      const billingResult = await billClinicalOrder({
        patientId,
        department: 'Radiology',
        orderId,
        orderNumber,
        items: [{ description: imagingType, quantity: 1, unitPrice: 2500, amount: 2500 }],
        notes: req.body.notes || '',
        createdBy: req.user.id,
      });

      if (billingResult) {
        const resolvedPaymentStatus = billingResult.clinicalPaymentStatus;
        await query(
          `UPDATE radiology_orders
             SET payment_status = $1,
                 results = jsonb_set(COALESCE(results,'{}'), '{paymentStatus}', $2)
           WHERE id = $3`,
          [resolvedPaymentStatus, JSON.stringify(resolvedPaymentStatus), orderId]
        );
      }

      const orderRow = await query(`${ORDER_SELECT} WHERE ro.id = $1`, [orderId]);
      res.status(201).json({ success: true, data: mapRadiologyOrder(orderRow.rows[0]) });
    } catch (err) {
      console.error('Radiology create error:', err);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// PUT /api/radiology/:id/start
router.put('/:id/start', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid order ID' });
    const orderRes = await query(`SELECT * FROM radiology_orders WHERE id = $1`, [req.params.id]);
    if (!orderRes.rows[0]) return res.status(404).json({ success: false, error: 'Order not found' });

    const paymentStatus = orderRes.rows[0].payment_status || orderRes.rows[0].results?.paymentStatus;
    if (paymentStatus === 'Awaiting Cashier Payment' && !req.body.emergencyOverride) {
      return res.status(402).json({
        success: false,
        error: 'Payment required: Patient must complete payment at Cashier Desk before examination begins.',
      });
    }
    if (paymentStatus === 'Awaiting Insurance Approval' && !req.body.emergencyOverride) {
      return res.status(402).json({
        success: false,
        error: 'Insurance approval required: Cashier must approve claim pre-authorization before examination begins.',
      });
    }

    const currentResults = orderRes.rows[0].results || {};
    const updatedResults = {
      ...currentResults,
      technicianName: req.body.technicianName || `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Technician',
      examinationStartTime: new Date().toISOString(),
    };

    await query(
      `UPDATE radiology_orders SET status = 'In Progress', results = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(updatedResults), req.params.id]
    );

    const updated = await query(`${ORDER_SELECT} WHERE ro.id = $1`, [req.params.id]);
    res.json({ success: true, data: mapRadiologyOrder(updated.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /api/radiology/:id/report (or /results)
router.put(['/:id/report', '/:id/results'], protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid order ID' });
    const orderRes = await query(`SELECT * FROM radiology_orders WHERE id = $1`, [req.params.id]);
    if (!orderRes.rows[0]) return res.status(404).json({ success: false, error: 'Order not found' });

    const currentResults = orderRes.rows[0].results || {};
    const updatedResults = {
      ...currentResults,
      findings: req.body.findings ?? currentResults.findings ?? '',
      impression: req.body.impression ?? currentResults.impression ?? '',
      recommendations: req.body.recommendations ?? currentResults.recommendations ?? '',
      technique: req.body.technique ?? currentResults.technique ?? '',
      radiologistName: req.body.radiologistName || `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Radiologist',
      reportedAt: new Date().toISOString(),
      reportStatus: req.body.publish ? 'Final' : (req.body.reportStatus || 'Draft'),
      images: Array.isArray(req.body.images) ? req.body.images : currentResults.images || [],
    };

    const newStatus = req.body.publish ? 'Completed' : (req.body.status || 'In Progress');

    await query(
      `UPDATE radiology_orders SET status = $1, results = $2, radiologist_notes = $3, updated_at = NOW() WHERE id = $4`,
      [newStatus, JSON.stringify(updatedResults), req.body.notes || orderRes.rows[0].radiologist_notes, req.params.id]
    );

    const updated = await query(`${ORDER_SELECT} WHERE ro.id = $1`, [req.params.id]);
    res.json({ success: true, data: mapRadiologyOrder(updated.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /api/radiology/:id
router.put('/:id', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid order ID' });
    const orderRes = await query(`SELECT * FROM radiology_orders WHERE id = $1`, [req.params.id]);
    if (!orderRes.rows[0]) return res.status(404).json({ success: false, error: 'Order not found' });

    const currentResults = orderRes.rows[0].results || {};
    const updatedResults = {
      ...currentResults,
      ...(req.body.results || {}),
      urgency: req.body.urgency || currentResults.urgency,
      paymentStatus: req.body.paymentStatus || currentResults.paymentStatus,
      paymentAmount: req.body.paymentAmount !== undefined ? req.body.paymentAmount : currentResults.paymentAmount,
    };

    await query(
      `UPDATE radiology_orders SET
        status = COALESCE($1, status),
        imaging_type = COALESCE($2, imaging_type),
        modality = COALESCE($3, modality),
        results = $4,
        radiologist_notes = COALESCE($5, radiologist_notes),
        updated_at = NOW()
       WHERE id = $6`,
      [
        req.body.status || null,
        req.body.imagingType || req.body.bodyPart || null,
        req.body.modality || null,
        JSON.stringify(updatedResults),
        req.body.notes || null,
        req.params.id,
      ]
    );

    const updated = await query(`${ORDER_SELECT} WHERE ro.id = $1`, [req.params.id]);
    res.json({ success: true, data: mapRadiologyOrder(updated.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /api/radiology/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid order ID' });
    const deleted = await query(`DELETE FROM radiology_orders WHERE id = $1 RETURNING id`, [req.params.id]);
    if (!deleted.rows[0]) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
