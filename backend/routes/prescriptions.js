const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../db/pg');
const { protect } = require('../middleware/auth');

const router = express.Router();

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
          req.body.patientId,
          req.body.queueEntryId || null,
          req.user.id,
          req.body.items,
          req.body.notes || null,
        ]
      );

      const row = inserted.rows[0];
      const patientRow = await query(`SELECT patient_id, first_name, last_name FROM patients WHERE id = $1`, [row.patient_id]);
      const patient = patientRow.rows[0];
      res.status(201).json({
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
  }
);

router.patch('/:id/status', protect, async (req, res) => {
  try {
    const allowed = ['Pending', 'Ready', 'Dispensed'];
    const status = String(req.body.status || '');
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
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
