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
  const result = await query(
    isUuid(patientRef)
      ? `SELECT id FROM patients WHERE id = $1`
      : `SELECT id FROM patients WHERE patient_id = $1`,
    [patientRef]
  );
  return result.rows[0]?.id || null;
}

const mapPrescription = (row) => ({
  _id: row.id,
  prescriptionNumber: row.prescription_number,
  patientId: row.patient_id,
  patientName: row.patient_name,
  patientDisplayId: row.patient_display_id,
  queueEntryId: row.queue_entry_id,
  doctorId: row.doctor_id,
  items: row.items || [],
  notes: row.notes || '',
  status: row.status,
  paymentStatus: row.payment_status || 'Pending',
  payment_status: row.payment_status || 'Pending',
  preparedAt: row.prepared_at,
  dispensedAt: row.dispensed_at,
  createdAt: row.created_at,
});

async function generatePrescriptionNumber() {
  const today = new Date();
  const prefix = `RX${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const result = await query(
    `SELECT COUNT(*)::int AS count FROM prescriptions WHERE prescription_number LIKE $1`,
    [`${prefix}-%`]
  );
  return `${prefix}-${String((result.rows[0]?.count || 0) + 1).padStart(4, '0')}`;
}

router.get('/', protect, async (req, res) => {
  try {
    const params = [];
    const where = [];

    if (req.query.status) {
      params.push(String(req.query.status));
      where.push(`p.status = $${params.length}`);
    }
    if (req.query.patientId) {
      params.push(String(req.query.patientId));
      where.push(`p.patient_id = $${params.length}`);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const result = await query(
      `
      SELECT
        p.*,
        pa.patient_id AS patient_display_id,
        CONCAT(pa.first_name, ' ', pa.last_name) AS patient_name
      FROM prescriptions p
      JOIN patients pa ON pa.id = p.patient_id
      ${whereClause}
      ORDER BY p.created_at DESC
      `,
      params
    );

    res.json({ success: true, count: result.rows.length, data: result.rows.map(mapPrescription) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post(
  '/',
  protect,
  [
    body('patientId', 'patientId is required').not().isEmpty(),
    body('items', 'At least one prescription item is required').isArray({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const patientId = await resolvePatientId(req.body.patientId);
      if (!patientId) return res.status(404).json({ success: false, error: 'Patient not found' });

      const doctorResult = await query(`SELECT id FROM users WHERE id = $1`, [req.user.id]);
      if (!doctorResult.rows[0]) return res.status(401).json({ success: false, error: 'Authenticated user not found' });

      const rxNumber = await generatePrescriptionNumber();
      const inserted = await query(
        `
        INSERT INTO prescriptions (
          prescription_number, patient_id, queue_entry_id, doctor_id, items, notes, status
        ) VALUES ($1,$2,$3,$4,$5,$6,'Pending')
        RETURNING *
        `,
        [
          rxNumber,
          patientId,
          req.body.queueEntryId || null,
          req.user.id,
          JSON.stringify(req.body.items),
          req.body.notes || null,
        ]
      );

      const row = inserted.rows[0];
      const patientRow = await query(`SELECT patient_id, first_name, last_name FROM patients WHERE id = $1`, [row.patient_id]);
      const patient = patientRow.rows[0];

      // Auto-bill: create/append invoice and sync payment_status (cash vs insurance)
      const { billClinicalOrder } = require('../lib/clinicalBillingBridge');
      const rxItems = Array.isArray(req.body.items) ? req.body.items : [];
      const billingItems = rxItems.map((it) => ({
        description: it.drugName || it.name || it.drug || 'Medication',
        quantity: Number(it.quantity || it.qty || 1),
        unitPrice: Number(it.unitPrice || it.price || 150),
        amount: Number(it.amount || (it.quantity || 1) * (it.unitPrice || 150)),
      }));
      const billingResult = await billClinicalOrder({
        patientId,
        department: 'Pharmacy',
        orderId: row.id,
        orderNumber: rxNumber,
        items: billingItems.length ? billingItems : [{ description: 'Pharmacy - Prescription', quantity: 1, unitPrice: 500, amount: 500 }],
        notes: req.body.notes || '',
        createdBy: req.user.id,
      });

      if (billingResult) {
        await query(
          `UPDATE prescriptions SET payment_status = $1 WHERE id = $2`,
          [billingResult.clinicalPaymentStatus, row.id]
        );
      }

      res.status(201).json({
        success: true,
        data: mapPrescription({
          ...row,
          payment_status: billingResult?.clinicalPaymentStatus || row.payment_status,
          patient_display_id: patient?.patient_id,
          patient_name: `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim(),
        }),
      });
    } catch (err) {
      console.error('Prescription creation error:', err);
      res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Server error',
      });
    }
  }
);

router.patch('/:id/status', protect, async (req, res) => {
  try {
    const allowed = ['Pending', 'Ready', 'Dispensed'];
    const status = String(req.body.status || '');
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const existing = await query(`SELECT * FROM prescriptions WHERE id = $1`, [req.params.id]);
    if (!existing.rows[0]) return res.status(404).json({ success: false, error: 'Prescription not found' });
    const currentRx = existing.rows[0];

    if (status === 'Dispensed') {
      if (currentRx.payment_status === 'Awaiting Cashier Payment' && !req.body.emergencyOverride) {
        return res.status(402).json({
          success: false,
          error: 'Payment required: Patient must complete payment at Cashier Desk before medications can be dispensed.',
        });
      }
      if (currentRx.payment_status === 'Awaiting Insurance Approval' && !req.body.emergencyOverride) {
        return res.status(402).json({
          success: false,
          error: 'Insurance approval required: Cashier must approve claim pre-authorization before medications can be dispensed.',
        });
      }
    }

    const preparedAt = status === 'Ready' ? new Date() : null;
    const dispensedAt = status === 'Dispensed' ? new Date() : null;

    const updated = await query(
      `
      UPDATE prescriptions
      SET status = $1,
          prepared_at = COALESCE($2, prepared_at),
          dispensed_at = COALESCE($3, dispensed_at),
          updated_at = NOW()
      WHERE id = $4
      RETURNING *
      `,
      [status, preparedAt, dispensedAt, req.params.id]
    );
    if (!updated.rows[0]) return res.status(404).json({ success: false, error: 'Prescription not found' });

    const row = updated.rows[0];
    const patientRow = await query(`SELECT patient_id, first_name, last_name FROM patients WHERE id = $1`, [row.patient_id]);
    const patient = patientRow.rows[0];
    res.json({
      success: true,
      data: mapPrescription({
        ...row,
        patient_display_id: patient?.patient_id,
        patient_name: `${patient?.first_name || ''} ${patient?.last_name || ''}`.trim(),
      }),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
