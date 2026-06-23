const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../db/pg');
const { protect, checkPermission } = require('../middleware/auth');

const router = express.Router();

const mapBill = (row) => ({
  _id: row.id,
  billId: row.invoice_number,
  patient: row.patient_id,
  billDate: row.invoice_date,
  items: row.items || [],
  total: Number(row.amount_due || 0),
  amountPaid: Number((row.amount_due || 0) - (row.balance || 0)),
  balance: Number(row.balance || 0),
  paymentStatus: row.payment_status,
  paymentMethod: row.payment_method,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

router.get('/', protect, checkPermission('billing', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];
    if (req.query.patient) { params.push(req.query.patient); where.push(`patient_id = $${params.length}`); }
    if (req.query.paymentStatus) { params.push(req.query.paymentStatus); where.push(`payment_status = $${params.length}`); }
    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = await query(`SELECT COUNT(*)::int AS total FROM billing ${whereClause}`, params);
    const rows = await query(
      `SELECT * FROM billing ${whereClause} ORDER BY invoice_date DESC NULLS LAST, created_at DESC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, offset, limit]
    );
    const t = total.rows[0]?.total || 0;
    res.json({
      success: true,
      count: rows.rows.length,
      pagination: { currentPage: page, totalPages: Math.ceil(t / limit), totalBills: t, hasNext: page * limit < t, hasPrev: page > 1 },
      data: rows.rows.map(mapBill),
    });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/:id', protect, checkPermission('billing', 'read'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM billing WHERE id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Billing record not found' });
    res.json({ success: true, data: mapBill(result.rows[0]) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post(
  '/',
  [protect, checkPermission('billing', 'create'), [body('billId').not().isEmpty(), body('patient').not().isEmpty(), body('total').isNumeric()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });
    try {
      const total = Number(req.body.total || 0);
      const amountPaid = Number(req.body.amountPaid || 0);
      const balance = req.body.balance !== undefined ? Number(req.body.balance) : Math.max(total - amountPaid, 0);
      const inserted = await query(
        `INSERT INTO billing (patient_id, invoice_number, invoice_date, amount_due, items, payment_method, payment_status, payment_history, balance, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
        [
          req.body.patient,
          req.body.billId,
          req.body.billDate || new Date().toISOString().slice(0, 10),
          total,
          req.body.items || [],
          req.body.paymentMethod || null,
          req.body.paymentStatus || (balance > 0 ? 'Pending' : 'Paid'),
          req.body.paymentHistory || [],
          balance,
          req.user.id,
        ]
      );
      res.status(201).json({ success: true, data: mapBill(inserted.rows[0]) });
    } catch (err) {
      if (err.code === '23505') return res.status(400).json({ success: false, error: 'Bill ID already exists' });
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

router.put('/:id', protect, checkPermission('billing', 'update'), async (req, res) => {
  try {
    const updates = [];
    const values = [];
    let i = 1;
    const fields = {
      patient: 'patient_id',
      billId: 'invoice_number',
      billDate: 'invoice_date',
      total: 'amount_due',
      items: 'items',
      paymentMethod: 'payment_method',
      paymentStatus: 'payment_status',
      paymentHistory: 'payment_history',
      balance: 'balance',
    };
    for (const [k, col] of Object.entries(fields)) {
      if (req.body[k] !== undefined) { updates.push(`${col} = $${i++}`); values.push(req.body[k]); }
    }
    if (!updates.length) return res.status(400).json({ success: false, error: 'No fields to update' });
    values.push(req.params.id);
    const updated = await query(`UPDATE billing SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i} RETURNING *`, values);
    if (!updated.rows[0]) return res.status(404).json({ success: false, error: 'Billing record not found' });
    res.json({ success: true, data: mapBill(updated.rows[0]) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post('/:id/payment', protect, checkPermission('billing', 'update'), async (req, res) => {
  try {
    const amount = Number(req.body.amount || 0);
    if (amount <= 0) return res.status(400).json({ success: false, error: 'Invalid payment amount' });
    const billResult = await query(`SELECT * FROM billing WHERE id = $1`, [req.params.id]);
    const bill = billResult.rows[0];
    if (!bill) return res.status(404).json({ success: false, error: 'Billing record not found' });
    const history = Array.isArray(bill.payment_history) ? bill.payment_history : [];
    history.push({ amount, method: req.body.method || 'Cash', date: new Date().toISOString(), by: req.user.id });
    const newBalance = Math.max(Number(bill.balance || 0) - amount, 0);
    const paymentStatus = newBalance === 0 ? 'Paid' : 'Partial';
    const updated = await query(
      `UPDATE billing SET payment_history = $1, balance = $2, payment_status = $3, updated_at = NOW() WHERE id = $4 RETURNING *`,
      [history, newBalance, paymentStatus, req.params.id]
    );
    res.json({ success: true, data: mapBill(updated.rows[0]) });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.delete('/:id', protect, checkPermission('billing', 'delete'), async (req, res) => {
  try {
    const deleted = await query(`DELETE FROM billing WHERE id = $1 RETURNING id`, [req.params.id]);
    if (!deleted.rows[0]) return res.status(404).json({ success: false, error: 'Billing record not found' });
    res.json({ success: true, data: {} });
  } catch {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
