const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../db/pg');
const { protect } = require('../middleware/auth');

const router = express.Router();

const mapTicket = (row) => ({
  _id: row.id,
  ticketId: row.ticket_id,
  title: row.title,
  description: row.description,
  status: row.status,
  priority: row.priority,
  category: row.category,
  module: row.module || 'General',
  assignedTo: row.assigned_to,
  comments: row.comments || [],
  resolution: row.resolution_notes ? { notes: row.resolution_notes } : null,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];
    const filters = { status: 'status', priority: 'priority', category: 'category', assignedTo: 'assigned_to', createdBy: 'created_by' };
    for (const [qk, col] of Object.entries(filters)) {
      if (req.query[qk]) { params.push(req.query[qk]); where.push(`${col} = $${params.length}`); }
    }
    if (req.query.search) {
      params.push(`%${req.query.search}%`);
      where.push(`(title ILIKE $${params.length} OR description ILIKE $${params.length} OR ticket_id ILIKE $${params.length})`);
    }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = await query(`SELECT COUNT(*)::int AS total FROM tickets ${whereClause}`, params);
    const rows = await query(
      `SELECT * FROM tickets ${whereClause} ORDER BY created_at DESC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, offset, limit]
    );
    const t = total.rows[0]?.total || 0;
    res.json({
      success: true,
      count: rows.rows.length,
      pagination: { currentPage: page, totalPages: Math.ceil(t / limit), totalTickets: t, hasNext: page * limit < t, hasPrev: page > 1 },
      data: rows.rows.map(mapTicket),
    });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const result = await query(`SELECT * FROM tickets WHERE id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Ticket not found' });
    res.json({ success: true, data: mapTicket(result.rows[0]) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post(
  '/',
  [protect, [body('ticketId').not().isEmpty(), body('title').not().isEmpty(), body('description').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const inserted = await query(
        `INSERT INTO tickets (ticket_id, title, description, status, priority, category, assigned_to, comments, resolution_notes, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [
          req.body.ticketId,
          req.body.title,
          req.body.description,
          req.body.status || 'Open',
          req.body.priority || 'Medium',
          req.body.category || null,
          req.body.assignedTo || null,
          req.body.comments || [],
          req.body.resolution?.notes || null,
          req.user.id,
        ]
      );
      res.status(201).json({ success: true, data: mapTicket(inserted.rows[0]) });
    } catch (err) {
      if (err.code === '23505') return res.status(400).json({ success: false, error: 'Ticket ID already exists' });
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

router.put('/:id', protect, async (req, res) => {
  try {
    const updates = [];
    const values = [];
    let i = 1;
    const fields = { ticketId: 'ticket_id', title: 'title', description: 'description', status: 'status', priority: 'priority', category: 'category', assignedTo: 'assigned_to', comments: 'comments' };
    for (const [k, col] of Object.entries(fields)) {
      if (req.body[k] !== undefined) { updates.push(`${col} = $${i++}`); values.push(req.body[k]); }
    }
    if (req.body.resolution?.notes !== undefined) { updates.push(`resolution_notes = $${i++}`); values.push(req.body.resolution.notes); }
    if (!updates.length) return res.status(400).json({ success: false, error: 'No fields to update' });
    values.push(req.params.id);
    const updated = await query(`UPDATE tickets SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`, values);
    if (!updated.rows[0]) return res.status(404).json({ success: false, error: 'Ticket not found' });
    res.json({ success: true, data: mapTicket(updated.rows[0]) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const deleted = await query(`DELETE FROM tickets WHERE id = $1 RETURNING id`, [req.params.id]);
    if (!deleted.rows[0]) return res.status(404).json({ success: false, error: 'Ticket not found' });
    res.json({ success: true, data: {} });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
