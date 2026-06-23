const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../db/pg');
const { protect, checkPermission } = require('../middleware/auth');

const router = express.Router();

const isUuid = (value) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(String(value || ''));

const mapAppointment = (row) => ({
  _id: row.id,
  appointmentId: row.id,
  patient: row.patient_id,
  doctor: row.doctor_id,
  appointmentDate: row.appointment_date,
  appointmentTime: row.appointment_time,
  status: row.status,
  reason: row.reason_for_visit,
  notes: row.notes,
  department: row.department || null,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

router.get('/', protect, checkPermission('appointments', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];

    if (req.query.status) { params.push(req.query.status); where.push(`status = $${params.length}`); }
    if (req.query.patient) { params.push(req.query.patient); where.push(`patient_id = $${params.length}`); }
    if (req.query.doctor) { params.push(req.query.doctor); where.push(`doctor_id = $${params.length}`); }
    if (req.query.startDate) { params.push(req.query.startDate); where.push(`appointment_date >= $${params.length}`); }
    if (req.query.endDate) { params.push(req.query.endDate); where.push(`appointment_date <= $${params.length}`); }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const totalResult = await query(`SELECT COUNT(*)::int AS total FROM appointments ${whereClause}`, params);
    const total = totalResult.rows[0]?.total || 0;
    const rows = await query(
      `SELECT * FROM appointments ${whereClause} ORDER BY appointment_date ASC, appointment_time ASC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, offset, limit]
    );

    res.json({
      success: true,
      count: rows.rows.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalAppointments: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      data: rows.rows.map(mapAppointment),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/:id', protect, checkPermission('appointments', 'read'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM appointments WHERE id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Appointment not found' });
    res.json({ success: true, data: mapAppointment(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post(
  '/',
  [
    protect,
    checkPermission('appointments', 'create'),
    [
      body('patient', 'Patient ID is required').not().isEmpty(),
      body('doctor', 'Doctor ID is required').not().isEmpty(),
      body('appointmentDate', 'Appointment date is required').not().isEmpty(),
      body('appointmentTime', 'Appointment time is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const inserted = await query(
        `INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status, reason_for_visit, notes, department, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [
          req.body.patient,
          req.body.doctor,
          req.body.appointmentDate,
          req.body.appointmentTime,
          req.body.status || 'Scheduled',
          req.body.reason || req.body.reasonForVisit || null,
          req.body.notes || null,
          req.body.department || null,
          req.user.id,
        ]
      );
      res.status(201).json({ success: true, data: mapAppointment(inserted.rows[0]) });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

router.put('/:id', protect, checkPermission('appointments', 'update'), async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid appointment id' });
    const updates = [];
    const values = [];
    let i = 1;
    const fields = {
      patient: 'patient_id',
      doctor: 'doctor_id',
      appointmentDate: 'appointment_date',
      appointmentTime: 'appointment_time',
      status: 'status',
      reason: 'reason_for_visit',
      reasonForVisit: 'reason_for_visit',
      notes: 'notes',
      department: 'department',
    };
    for (const [k, col] of Object.entries(fields)) {
      if (req.body[k] !== undefined) {
        updates.push(`${col} = $${i++}`);
        values.push(req.body[k]);
      }
    }
    if (!updates.length) return res.status(400).json({ success: false, error: 'No fields to update' });
    values.push(req.params.id);
    const updated = await query(
      `UPDATE appointments SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`,
      values
    );
    if (!updated.rows[0]) return res.status(404).json({ success: false, error: 'Appointment not found' });
    res.json({ success: true, data: mapAppointment(updated.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', protect, checkPermission('appointments', 'delete'), async (req, res) => {
  try {
    const deleted = await query(`DELETE FROM appointments WHERE id = $1 RETURNING id`, [req.params.id]);
    if (!deleted.rows[0]) return res.status(404).json({ success: false, error: 'Appointment not found' });
    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
