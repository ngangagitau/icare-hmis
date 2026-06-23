const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { query } = require('../db/pg');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

const mapUser = (row) => ({
  id: row.id,
  name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
  firstName: row.first_name,
  lastName: row.last_name,
  email: row.email,
  username: row.username,
  role: row.role,
  department: row.department,
  phone: row.phone,
  isActive: row.is_active,
  permissions: row.permissions || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

router.get('/', protect, authorize('Super Admin', 'Admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];
    if (req.query.role) { params.push(req.query.role); where.push(`role = $${params.length}`); }
    if (req.query.status) { params.push(req.query.status === 'Active'); where.push(`is_active = $${params.length}`); }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = await query(`SELECT COUNT(*)::int AS total FROM users ${whereClause}`, params);
    const rows = await query(
      `SELECT * FROM users ${whereClause} ORDER BY created_at DESC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, offset, limit]
    );
    const t = total.rows[0]?.total || 0;
    res.json({
      success: true,
      count: rows.rows.length,
      pagination: { currentPage: page, totalPages: Math.ceil(t / limit), totalUsers: t, hasNext: page * limit < t, hasPrev: page > 1 },
      data: rows.rows.map(mapUser),
    });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const result = await query(`SELECT * FROM users WHERE id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: mapUser(result.rows[0]) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post(
  '/',
  [protect, authorize('Super Admin', 'Admin'), [body('firstName').not().isEmpty(), body('lastName').not().isEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 }), body('role').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(req.body.password, salt);
      const inserted = await query(
        `INSERT INTO users (username, email, password, first_name, last_name, role, department, phone, is_active, permissions)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [
          req.body.username || req.body.email,
          req.body.email,
          password,
          req.body.firstName,
          req.body.lastName,
          req.body.role,
          req.body.department || null,
          req.body.phone || null,
          req.body.isActive !== false,
          req.body.permissions || [],
        ]
      );
      res.status(201).json({ success: true, data: mapUser(inserted.rows[0]) });
    } catch (err) {
      if (err.code === '23505') return res.status(400).json({ success: false, error: 'User already exists' });
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

router.put('/:id', protect, authorize('Super Admin', 'Admin'), async (req, res) => {
  try {
    const updates = [];
    const values = [];
    let i = 1;
    const fields = { firstName: 'first_name', lastName: 'last_name', email: 'email', username: 'username', role: 'role', department: 'department', phone: 'phone', isActive: 'is_active', permissions: 'permissions' };
    for (const [k, col] of Object.entries(fields)) {
      if (req.body[k] !== undefined) { updates.push(`${col} = $${i++}`); values.push(req.body[k]); }
    }
    if (!updates.length) return res.status(400).json({ success: false, error: 'No fields to update' });
    values.push(req.params.id);
    const updated = await query(`UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`, values);
    if (!updated.rows[0]) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: mapUser(updated.rows[0]) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', protect, authorize('Super Admin', 'Admin'), async (req, res) => {
  try {
    const userResult = await query(`SELECT * FROM users WHERE id = $1`, [req.params.id]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.role === 'Super Admin') return res.status(400).json({ success: false, error: 'Cannot delete Super Admin users' });
    await query(`DELETE FROM users WHERE id = $1`, [req.params.id]);
    res.json({ success: true, data: {} });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
