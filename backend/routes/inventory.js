const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../db/pg');
const { protect, checkPermission } = require('../middleware/auth');

const router = express.Router();

const mapItem = (row) => ({
  _id: row.id,
  itemId: row.item_code,
  name: row.item_name,
  category: row.category,
  itemType: row.item_type,
  currentStock: Number(row.quantity_in_stock || 0),
  reorderPoint: Number(row.reorder_level || 0),
  reorderQuantity: Number(row.reorder_quantity || 0),
  unitCost: Number(row.unit_price || 0),
  totalValue: Number(row.total_value || 0),
  batchNumber: row.batch_number,
  expiryDate: row.expiry_date,
  status: row.status,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

router.get('/', protect, checkPermission('inventory', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];
    if (req.query.category) { params.push(req.query.category); where.push(`category = $${params.length}`); }
    if (req.query.status) { params.push(req.query.status); where.push(`status = $${params.length}`); }
    if (req.query.search) { params.push(`%${req.query.search}%`); where.push(`(item_name ILIKE $${params.length} OR item_code ILIKE $${params.length})`); }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = await query(`SELECT COUNT(*)::int AS total FROM inventory ${whereClause}`, params);
    const rows = await query(
      `SELECT * FROM inventory ${whereClause} ORDER BY item_name ASC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, offset, limit]
    );
    const t = total.rows[0]?.total || 0;
    res.json({
      success: true,
      count: rows.rows.length,
      pagination: { currentPage: page, totalPages: Math.ceil(t / limit), totalItems: t, hasNext: page * limit < t, hasPrev: page > 1 },
      data: rows.rows.map(mapItem),
    });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/:id', protect, checkPermission('inventory', 'read'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM inventory WHERE id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Inventory item not found' });
    res.json({ success: true, data: mapItem(result.rows[0]) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post(
  '/',
  [protect, checkPermission('inventory', 'create'), [body('itemId').not().isEmpty(), body('name').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const qty = Number(req.body.currentStock || 0);
      const unitCost = Number(req.body.unitCost || 0);
      const inserted = await query(
        `INSERT INTO inventory (
          item_name, item_code, item_type, category, supplier, location, quantity_in_stock, reorder_level, reorder_quantity,
          unit_price, total_value, expiry_date, batch_number, status, created_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
        [
          req.body.name,
          req.body.itemId,
          req.body.itemType || null,
          req.body.category || null,
          req.body.supplier || null,
          req.body.location || null,
          qty,
          req.body.reorderPoint || req.body.minimumStock || 0,
          req.body.reorderQuantity || 0,
          unitCost,
          qty * unitCost,
          req.body.expiryDate || null,
          req.body.batchNumber || null,
          req.body.status || 'Active',
          req.user.id,
        ]
      );
      res.status(201).json({ success: true, data: mapItem(inserted.rows[0]) });
    } catch (err) {
      if (err.code === '23505') return res.status(400).json({ success: false, error: 'Item ID already exists' });
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

router.put('/:id', protect, checkPermission('inventory', 'update'), async (req, res) => {
  try {
    const updates = [];
    const values = [];
    let i = 1;
    const fields = { itemId: 'item_code', name: 'item_name', itemType: 'item_type', category: 'category', currentStock: 'quantity_in_stock', reorderPoint: 'reorder_level', reorderQuantity: 'reorder_quantity', unitCost: 'unit_price', expiryDate: 'expiry_date', batchNumber: 'batch_number', status: 'status' };
    for (const [k, col] of Object.entries(fields)) {
      if (req.body[k] !== undefined) { updates.push(`${col} = $${i++}`); values.push(req.body[k]); }
    }
    if (!updates.length) return res.status(400).json({ success: false, error: 'No fields to update' });
    values.push(req.params.id);
    const updated = await query(`UPDATE inventory SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`, values);
    if (!updated.rows[0]) return res.status(404).json({ success: false, error: 'Inventory item not found' });
    res.json({ success: true, data: mapItem(updated.rows[0]) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', protect, checkPermission('inventory', 'delete'), async (req, res) => {
  try {
    const deleted = await query(`DELETE FROM inventory WHERE id = $1 RETURNING id`, [req.params.id]);
    if (!deleted.rows[0]) return res.status(404).json({ success: false, error: 'Inventory item not found' });
    res.json({ success: true, data: {} });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
