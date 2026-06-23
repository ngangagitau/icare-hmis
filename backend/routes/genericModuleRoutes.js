const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../db/pg');
const { protect, checkPermission } = require('../middleware/auth');

module.exports = (modelOrSlug, moduleSlugMaybe) => {
  const moduleSlug = moduleSlugMaybe || modelOrSlug;
  const router = express.Router();
  const isUuid = (value) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
      String(value || '')
    );

  const validateItem = [
    body('code', 'Code is required').not().isEmpty(),
    body('name', 'Name is required').not().isEmpty(),
  ];

  // @desc    Get all items
  // @route   GET /
  // @access  Private
  router.get('/', protect, checkPermission(moduleSlug, 'read'), async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 25;
      const startIndex = (page - 1) * limit;
      const where = [`module_slug = $1`];
      const params = [moduleSlug];

      if (req.query.status) {
        params.push(req.query.status);
        where.push(`status = $${params.length}`);
      }

      if (req.query.search) {
        params.push(`%${req.query.search}%`);
        where.push(`(name ILIKE $${params.length} OR code ILIKE $${params.length} OR description ILIKE $${params.length})`);
      }

      const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const totalResult = await query(`SELECT COUNT(*)::int AS total FROM module_items ${whereClause}`, params);
      const total = totalResult.rows[0]?.total || 0;

      const itemsResult = await query(
        `
        SELECT *
        FROM module_items
        ${whereClause}
        ORDER BY created_at DESC
        OFFSET $${params.length + 1}
        LIMIT $${params.length + 2}
        `,
        [...params, startIndex, limit]
      );

      res.json({
        success: true,
        count: itemsResult.rows.length,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNext: page * limit < total,
          hasPrev: page > 1,
        },
        data: itemsResult.rows.map((row) => ({
          _id: row.id,
          code: row.code,
          name: row.name,
          description: row.description,
          status: row.status,
          payload: row.payload,
          moduleSlug: row.module_slug,
          createdBy: row.created_by,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        })),
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // @desc    Get a single item
  // @route   GET /:id
  // @access  Private
  router.get('/:id', protect, checkPermission(moduleSlug, 'read'), async (req, res) => {
    try {
      if (!isUuid(req.params.id)) {
        return res.status(400).json({ success: false, error: 'Invalid item id' });
      }
      const result = await query(
        `SELECT * FROM module_items WHERE id = $1 AND module_slug = $2`,
        [req.params.id, moduleSlug]
      );
      const item = result.rows[0];

      if (!item) {
        return res.status(404).json({ success: false, error: 'Item not found' });
      }

      res.json({
        success: true,
        data: {
          _id: item.id,
          code: item.code,
          name: item.name,
          description: item.description,
          status: item.status,
          payload: item.payload,
          moduleSlug: item.module_slug,
          createdBy: item.created_by,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        },
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // @desc    Create an item
  // @route   POST /
  // @access  Private
  router.post('/', protect, checkPermission(moduleSlug, 'create'), validateItem, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const existing = await query(
        `SELECT id FROM module_items WHERE module_slug = $1 AND code = $2`,
        [moduleSlug, req.body.code]
      );
      if (existing.rows[0]) {
        return res.status(400).json({ success: false, error: 'Code already exists' });
      }

      const inserted = await query(
        `
        INSERT INTO module_items (module_slug, code, name, description, status, payload, created_by)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *
        `,
        [
          moduleSlug,
          req.body.code,
          req.body.name,
          req.body.description || null,
          req.body.status || 'Active',
          req.body.payload || {},
          req.user.id,
        ]
      );

      const item = inserted.rows[0];
      res.status(201).json({
        success: true,
        data: {
          _id: item.id,
          code: item.code,
          name: item.name,
          description: item.description,
          status: item.status,
          payload: item.payload,
          moduleSlug: item.module_slug,
          createdBy: item.created_by,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        },
      });
    } catch (err) {
      console.error(err.message);
      if (err.code === '23505') {
        return res.status(400).json({ success: false, error: 'Duplicate code detected' });
      }
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // @desc    Update an item
  // @route   PUT /:id
  // @access  Private
  router.put('/:id', protect, checkPermission(moduleSlug, 'update'), async (req, res) => {
    try {
      if (!isUuid(req.params.id)) {
        return res.status(400).json({ success: false, error: 'Invalid item id' });
      }
      const existing = await query(
        `SELECT * FROM module_items WHERE id = $1 AND module_slug = $2`,
        [req.params.id, moduleSlug]
      );
      if (!existing.rows[0]) {
        return res.status(404).json({ success: false, error: 'Item not found' });
      }

      const updates = [];
      const values = [];
      let i = 1;
      if (req.body.code !== undefined) { updates.push(`code = $${i++}`); values.push(req.body.code); }
      if (req.body.name !== undefined) { updates.push(`name = $${i++}`); values.push(req.body.name); }
      if (req.body.description !== undefined) { updates.push(`description = $${i++}`); values.push(req.body.description); }
      if (req.body.status !== undefined) { updates.push(`status = $${i++}`); values.push(req.body.status); }
      if (req.body.payload !== undefined) { updates.push(`payload = $${i++}`); values.push(req.body.payload); }

      if (updates.length === 0) {
        return res.json({ success: true, data: existing.rows[0] });
      }

      values.push(req.params.id, moduleSlug);
      const updated = await query(
        `
        UPDATE module_items
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $${i++} AND module_slug = $${i}
        RETURNING *
        `,
        values
      );
      const item = updated.rows[0];

      res.json({
        success: true,
        data: {
          _id: item.id,
          code: item.code,
          name: item.name,
          description: item.description,
          status: item.status,
          payload: item.payload,
          moduleSlug: item.module_slug,
          createdBy: item.created_by,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        },
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  // @desc    Delete an item
  // @route   DELETE /:id
  // @access  Private
  router.delete('/:id', protect, checkPermission(moduleSlug, 'delete'), async (req, res) => {
    try {
      if (!isUuid(req.params.id)) {
        return res.status(400).json({ success: false, error: 'Invalid item id' });
      }
      const deleted = await query(
        `DELETE FROM module_items WHERE id = $1 AND module_slug = $2 RETURNING id`,
        [req.params.id, moduleSlug]
      );
      if (!deleted.rows[0]) {
        return res.status(404).json({ success: false, error: 'Item not found' });
      }

      res.json({ success: true, data: 'Item removed' });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ success: false, error: 'Server error' });
    }
  });

  return router;
};
