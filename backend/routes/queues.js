const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../db/pg');
const { protect } = require('../middleware/auth');

const router = express.Router();

const formatEntry = (row) => {
  const queuedAt = new Date(row.queued_at);
  const waitMinutes = Math.max(
    0,
    Math.floor((Date.now() - queuedAt.getTime()) / 60000)
  );

  return {
    _id: row.id,
    ticketNumber: row.ticket_number,
    patient: row.patient
      ? {
          _id: row.patient.id,
          patientId: row.patient.patient_id,
          firstName: row.patient.first_name,
          lastName: row.patient.last_name,
          dateOfBirth: row.patient.date_of_birth,
          gender: row.patient.gender,
          phone: row.patient.phone,
        }
      : row.patient_id,
    patientDisplayId: row.patient_display_id,
    patientName: row.patient_name,
    department: row.department,
    priority: row.priority,
    status: row.status,
    complaint: row.complaint,
    serviceName: row.service_name,
    queuedAt: row.queued_at,
    startedAt: row.started_at,
    servedAt: row.served_at,
    waitMinutes,
    waitTime: waitMinutes === 0 ? '0 min' : `${waitMinutes} min`,
  };
};

async function generateTicketNumber() {
  const today = new Date();
  const prefix = `Q${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const result = await query(
    `SELECT COUNT(*)::int AS count FROM queue_entries WHERE ticket_number LIKE $1`,
    [`${prefix}-%`]
  );
  return `${prefix}-${String((result.rows[0]?.count || 0) + 1).padStart(4, '0')}`;
}

async function resolvePatient(patientRef) {
  if (!patientRef) return null;

  const ref = String(patientRef).trim();
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(ref);

  const result = isUuid
    ? await query(`SELECT * FROM patients WHERE id = $1`, [ref])
    : await query(`SELECT * FROM patients WHERE patient_id = $1`, [ref]);

  return result.rows[0] || null;
}

const DEPARTMENTS = ['opd', 'triage', 'doctor', 'lab', 'pharmacy', 'radiology'];

// @desc    List queue entries (filter by department, status)
// @route   GET /api/queues
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const where = [];
    const params = [];

    if (req.query.department) {
      params.push(String(req.query.department).toLowerCase());
      where.push(`qe.department = $${params.length}`);
    }

    if (req.query.status) {
      params.push(String(req.query.status));
      where.push(`qe.status = $${params.length}`);
    } else if (req.query.active !== 'false') {
      where.push(`qe.status IN ('Waiting','In Progress')`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const result = await query(
      `
      SELECT
        qe.*,
        jsonb_build_object(
          'id', p.id,
          'patient_id', p.patient_id,
          'first_name', p.first_name,
          'last_name', p.last_name,
          'date_of_birth', p.date_of_birth,
          'gender', p.gender,
          'phone', p.phone
        ) AS patient
      FROM queue_entries qe
      JOIN patients p ON p.id = qe.patient_id
      ${whereClause}
      ORDER BY
        CASE qe.priority WHEN 'Emergency' THEN 0 WHEN 'Urgent' THEN 1 ELSE 2 END,
        qe.queued_at ASC
      `,
      params
    );

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows.map(formatEntry),
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Get single queue entry
// @route   GET /api/queues/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const result = await query(
      `
      SELECT
        qe.*,
        jsonb_build_object(
          'id', p.id,
          'patient_id', p.patient_id,
          'first_name', p.first_name,
          'last_name', p.last_name,
          'date_of_birth', p.date_of_birth,
          'gender', p.gender,
          'phone', p.phone
        ) AS patient
      FROM queue_entries qe
      JOIN patients p ON p.id = qe.patient_id
      WHERE qe.id = $1
      `,
      [req.params.id]
    );
    const entry = result.rows[0];

    if (!entry) {
      return res.status(404).json({ success: false, error: 'Queue entry not found' });
    }

    res.json({ success: true, data: formatEntry(entry) });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// @desc    Push patient to a department queue
// @route   POST /api/queues
// @access  Private
router.post(
  '/',
  protect,
  [
    body('patientId', 'Patient reference is required').not().isEmpty(),
    body('department', 'Department is required').isIn(DEPARTMENTS),
    body('priority').optional().isIn(['Normal', 'Urgent', 'Emergency']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const patient = await resolvePatient(req.body.patientId);
      if (!patient) {
        return res.status(404).json({ success: false, error: 'Patient not found' });
      }

      const department = String(req.body.department).toLowerCase();

      const existing = await query(
        `
        SELECT id, ticket_number, patient_id, patient_display_id, patient_name, department, priority, status, complaint, service_name, queued_at, started_at, served_at
        FROM queue_entries
        WHERE patient_id = $1 AND department = $2 AND status IN ('Waiting','In Progress')
        LIMIT 1
        `,
        [patient.id, department]
      );

      if (existing.rows[0]) {
        return res.status(400).json({
          success: false,
          error: 'Patient is already in this department queue',
          data: formatEntry({ ...existing.rows[0], patient }),
        });
      }

      const ticketNumber = await generateTicketNumber();
      const inserted = await query(
        `
        INSERT INTO queue_entries (
          ticket_number, patient_id, patient_display_id, patient_name,
          department, priority, status, complaint, service_name, created_by
        )
        VALUES ($1,$2,$3,$4,$5,$6,'Waiting',$7,$8,$9)
        RETURNING *
        `,
        [
          ticketNumber,
          patient.id,
          patient.patient_id,
          `${patient.first_name} ${patient.last_name}`,
          department,
          req.body.priority || 'Normal',
          req.body.complaint || null,
          req.body.serviceName || null,
          req.user.id,
        ]
      );

      res.status(201).json({
        success: true,
        data: formatEntry({ ...inserted.rows[0], patient }),
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// @desc    Update queue entry status
// @route   PATCH /api/queues/:id/status
// @access  Private
router.patch(
  '/:id/status',
  protect,
  [body('status').isIn(['Waiting', 'In Progress', 'Served', 'Cancelled'])],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const currentResult = await query(`SELECT * FROM queue_entries WHERE id = $1`, [req.params.id]);
      const entry = currentResult.rows[0];
      if (!entry) {
        return res.status(404).json({ success: false, error: 'Queue entry not found' });
      }

      const nextStatus = req.body.status;
      const startedAt = nextStatus === 'In Progress' && !entry.started_at ? new Date() : entry.started_at;
      const servedAt = nextStatus === 'Served' ? new Date() : entry.served_at;

      const updated = await query(
        `
        UPDATE queue_entries
        SET status = $1,
            started_at = $2,
            served_at = $3
        WHERE id = $4
        RETURNING *
        `,
        [nextStatus, startedAt, servedAt, req.params.id]
      );

      const patientResult = await query(`SELECT * FROM patients WHERE id = $1`, [updated.rows[0].patient_id]);
      res.json({ success: true, data: formatEntry({ ...updated.rows[0], patient: patientResult.rows[0] }) });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// @desc    Transfer patient to another department queue
// @route   POST /api/queues/:id/transfer
// @access  Private
router.post(
  '/:id/transfer',
  protect,
  [
    body('department', 'Target department is required').isIn(DEPARTMENTS),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const currentResult = await query(`SELECT * FROM queue_entries WHERE id = $1`, [req.params.id]);
      const current = currentResult.rows[0];
      if (!current) {
        return res.status(404).json({ success: false, error: 'Queue entry not found' });
      }

      await query(
        `UPDATE queue_entries SET status = 'Served', served_at = NOW() WHERE id = $1`,
        [current.id]
      );

      const targetDept = String(req.body.department).toLowerCase();
      const ticketNumber = await generateTicketNumber();

      const inserted = await query(
        `
        INSERT INTO queue_entries (
          ticket_number, patient_id, patient_display_id, patient_name,
          department, priority, status, complaint, service_name, created_by
        )
        VALUES ($1,$2,$3,$4,$5,$6,'Waiting',$7,$8,$9)
        RETURNING *
        `,
        [
          ticketNumber,
          current.patient_id,
          current.patient_display_id,
          current.patient_name,
          targetDept,
          req.body.priority || current.priority,
          req.body.complaint || current.complaint,
          req.body.serviceName || current.service_name,
          req.user.id,
        ]
      );

      const patientResult = await query(`SELECT * FROM patients WHERE id = $1`, [inserted.rows[0].patient_id]);

      res.status(201).json({
        success: true,
        data: formatEntry({ ...inserted.rows[0], patient: patientResult.rows[0] }),
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

module.exports = router;
