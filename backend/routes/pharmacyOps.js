const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool, query } = require('../db/pg');
const { protect, checkPermission } = require('../middleware/auth');

const router = express.Router();

const num = (v) => Number(v || 0);

async function generateSaleNumber() {
  const d = new Date();
  const prefix = `OTC${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const r = await query(`SELECT COUNT(*)::int AS count FROM otc_sales WHERE sale_number LIKE $1`, [`${prefix}-%`]);
  return `${prefix}-${String((r.rows[0]?.count || 0) + 1).padStart(4, '0')}`;
}

router.get('/otc-sales', protect, checkPermission('pharmacy', 'read'), async (req, res) => {
  try {
    const sales = await query(`SELECT * FROM otc_sales ORDER BY sale_date DESC LIMIT 200`);
    const items = await query(
      `SELECT osi.* FROM otc_sale_items osi
       WHERE sale_id = ANY($1::uuid[])`,
      [sales.rows.map((s) => s.id)]
    );
    const grouped = new Map();
    for (const i of items.rows) {
      if (!grouped.has(i.sale_id)) grouped.set(i.sale_id, []);
      grouped.get(i.sale_id).push(i);
    }
    res.json({
      success: true,
      data: sales.rows.map((s) => ({
        _id: s.id,
        saleNumber: s.sale_number,
        saleDate: s.sale_date,
        customerName: s.customer_name,
        customerPhone: s.customer_phone,
        paymentMethod: s.payment_method,
        subtotal: num(s.subtotal),
        discount: num(s.discount),
        tax: num(s.tax),
        totalAmount: num(s.total_amount),
        notes: s.notes,
        items: (grouped.get(s.id) || []).map((i) => ({
          inventoryId: i.inventory_id,
          itemCode: i.item_code,
          itemName: i.item_name,
          quantity: num(i.quantity),
          unitPrice: num(i.unit_price),
          lineTotal: num(i.line_total),
        })),
      })),
    });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post(
  '/otc-sales',
  protect,
  checkPermission('pharmacy', 'create'),
  [
    body('paymentMethod').not().isEmpty(),
    body('items').isArray({ min: 1 }),
    body('items.*.inventoryId').not().isEmpty(),
    body('items.*.quantity').isFloat({ gt: 0 }),
    body('items.*.unitPrice').isFloat({ gt: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const saleNumber = await generateSaleNumber();

      let subtotal = 0;
      const normalizedItems = [];

      for (const item of req.body.items) {
        const inv = await client.query(`SELECT * FROM inventory WHERE id = $1 FOR UPDATE`, [item.inventoryId]);
        const row = inv.rows[0];
        if (!row) throw new Error(`Inventory item not found: ${item.inventoryId}`);
        const qty = num(item.quantity);
        const unitPrice = num(item.unitPrice);
        if (num(row.quantity_in_stock) < qty) {
          throw new Error(`Insufficient stock for ${row.item_name}`);
        }
        const lineTotal = qty * unitPrice;
        subtotal += lineTotal;
        normalizedItems.push({ row, qty, unitPrice, lineTotal });
      }

      const discount = num(req.body.discount);
      const tax = num(req.body.tax);
      const totalAmount = subtotal - discount + tax;

      const saleInsert = await client.query(
        `INSERT INTO otc_sales (
          sale_number, customer_name, customer_phone, payment_method, subtotal, discount, tax, total_amount, notes, created_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *`,
        [
          saleNumber,
          req.body.customerName || null,
          req.body.customerPhone || null,
          req.body.paymentMethod,
          subtotal,
          discount,
          tax,
          totalAmount,
          req.body.notes || null,
          req.user.id,
        ]
      );
      const sale = saleInsert.rows[0];

      for (const item of normalizedItems) {
        await client.query(
          `INSERT INTO otc_sale_items (sale_id, inventory_id, item_code, item_name, quantity, unit_price, line_total)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [sale.id, item.row.id, item.row.item_code, item.row.item_name, item.qty, item.unitPrice, item.lineTotal]
        );

        const before = num(item.row.quantity_in_stock);
        const after = before - item.qty;
        await client.query(
          `UPDATE inventory
           SET quantity_in_stock = $1, total_value = $2, updated_at = NOW()
           WHERE id = $3`,
          [after, after * num(item.row.unit_price), item.row.id]
        );
        await client.query(
          `INSERT INTO stock_movements (
            inventory_id, movement_type, quantity, unit_cost, reason, reference_type, reference_id, balance_before, balance_after, created_by
          ) VALUES ($1,'ISSUE',$2,$3,$4,'OTC_SALE',$5,$6,$7,$8)`,
          [item.row.id, item.qty, item.unitPrice, 'OTC sale', sale.id, before, after, req.user.id]
        );
      }

      await client.query('COMMIT');
      res.status(201).json({ success: true, data: { _id: sale.id, saleNumber: sale.sale_number } });
    } catch (err) {
      await client.query('ROLLBACK');
      res.status(400).json({ success: false, error: err.message || 'Failed to create OTC sale' });
    } finally {
      client.release();
    }
  }
);

router.get('/stock/movements', protect, checkPermission('pharmacy', 'read'), async (req, res) => {
  try {
    const params = [];
    let where = '';
    if (req.query.inventoryId) {
      params.push(req.query.inventoryId);
      where = `WHERE sm.inventory_id = $1`;
    }
    const rows = await query(
      `SELECT sm.*, i.item_name, i.item_code
       FROM stock_movements sm
       JOIN inventory i ON i.id = sm.inventory_id
       ${where}
       ORDER BY sm.created_at DESC
       LIMIT 300`,
      params
    );
    res.json({ success: true, data: rows.rows });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post(
  '/stock/movements',
  protect,
  checkPermission('pharmacy', 'update'),
  [
    body('inventoryId').not().isEmpty(),
    body('movementType').isIn(['RECEIVE', 'ADJUSTMENT', 'ISSUE']),
    body('quantity').isFloat({ gt: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const inv = await client.query(`SELECT * FROM inventory WHERE id = $1 FOR UPDATE`, [req.body.inventoryId]);
      const row = inv.rows[0];
      if (!row) throw new Error('Inventory item not found');

      const type = req.body.movementType;
      const qty = num(req.body.quantity);
      const before = num(row.quantity_in_stock);
      let after = before;
      if (type === 'RECEIVE') after = before + qty;
      if (type === 'ISSUE') {
        if (before < qty) throw new Error('Insufficient stock');
        after = before - qty;
      }
      if (type === 'ADJUSTMENT') {
        const direction = req.body.direction === 'DECREASE' ? -1 : 1;
        if (direction < 0 && before < qty) throw new Error('Insufficient stock');
        after = before + direction * qty;
      }

      const unitCost = num(req.body.unitCost || row.unit_price || 0);
      await client.query(
        `UPDATE inventory SET quantity_in_stock = $1, unit_price = $2, total_value = $3, updated_at = NOW() WHERE id = $4`,
        [after, unitCost || row.unit_price, after * (unitCost || num(row.unit_price)), row.id]
      );
      const movementInsert = await client.query(
        `INSERT INTO stock_movements (
          inventory_id, movement_type, quantity, unit_cost, reason, reference_type, reference_id, balance_before, balance_after, created_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *`,
        [
          row.id,
          type,
          qty,
          unitCost || null,
          req.body.reason || null,
          req.body.referenceType || null,
          req.body.referenceId || null,
          before,
          after,
          req.user.id,
        ]
      );
      await client.query('COMMIT');
      res.status(201).json({ success: true, data: movementInsert.rows[0] });
    } catch (err) {
      await client.query('ROLLBACK');
      res.status(400).json({ success: false, error: err.message || 'Failed to save movement' });
    } finally {
      client.release();
    }
  }
);

router.get('/stock/summary', protect, checkPermission('pharmacy', 'read'), async (_req, res) => {
  try {
    const [low, out, total] = await Promise.all([
      query(`SELECT COUNT(*)::int AS count FROM inventory WHERE quantity_in_stock > 0 AND quantity_in_stock <= COALESCE(reorder_level,0)`),
      query(`SELECT COUNT(*)::int AS count FROM inventory WHERE quantity_in_stock <= 0`),
      query(`SELECT COUNT(*)::int AS count FROM inventory`),
    ]);
    res.json({
      success: true,
      data: {
        totalItems: total.rows[0]?.count || 0,
        lowStockItems: low.rows[0]?.count || 0,
        outOfStockItems: out.rows[0]?.count || 0,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
