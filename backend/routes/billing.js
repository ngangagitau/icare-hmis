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
  if (!patientRef) return null;
  const ref = String(patientRef).trim();
  const result = await query(
    isUuid(ref)
      ? `SELECT id FROM patients WHERE id = $1`
      : `SELECT id FROM patients WHERE patient_id = $1`,
    [ref]
  );
  return result.rows[0]?.id || null;
}

async function generateInvoiceNumber() {
  const today = new Date();
  const prefix = `INV${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const result = await query(
    `SELECT COUNT(*)::int AS count FROM billing WHERE invoice_number LIKE $1`,
    [`${prefix}-%`]
  );
  return `${prefix}-${String((result.rows[0]?.count || 0) + 1).padStart(4, '0')}`;
}

async function generateReceiptNumber() {
  const today = new Date();
  const prefix = `RCT${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const result = await query(
    `SELECT COUNT(*)::int AS count FROM billing WHERE payment_history::text LIKE $1`,
    [`%${prefix}-%`]
  );
  return `${prefix}-${String((result.rows[0]?.count || 0) + 1).padStart(4, '0')}`;
}

const mapBill = (row) => {
  const items = Array.isArray(row.items) ? row.items : [];
  const paymentHistory = Array.isArray(row.payment_history) ? row.payment_history : [];
  const insuranceClaim = typeof row.insurance_claim === 'object' && row.insurance_claim !== null ? row.insurance_claim : null;

  const total = Number(row.amount_due || 0);
  const balance = Number(row.balance !== null && row.balance !== undefined ? row.balance : total);
  const amountPaid = Math.max(total - balance, 0);

  return {
    _id: row.id,
    id: row.id,
    billId: row.invoice_number,
    invoiceNumber: row.invoice_number,
    patient: row.patient_id,
    patientId: row.patient_id,
    patientName: row.patient_name || 'Walk-in / Private',
    patientDisplayId: row.patient_display_id || (row.patient_id ? String(row.patient_id).slice(0, 8) : 'WALK-IN'),
    patientPhone: row.patient_phone || '',
    patientInsurance: row.patient_insurance || null,
    billDate: row.invoice_date,
    invoiceDate: row.invoice_date,
    items,
    subtotal: total,
    total,
    totalAmount: total,
    amountPaid,
    balance,
    paymentStatus: row.payment_status || (balance <= 0 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Pending'),
    paymentMethod: row.payment_method || (insuranceClaim ? 'Insurance' : 'Cash'),
    paymentHistory,
    insuranceClaim,
    insuranceApproval: typeof row.insurance_approval === 'object' && row.insurance_approval !== null ? row.insurance_approval : null,
    linkedOrders: Array.isArray(row.linked_orders) ? row.linked_orders : [],
    scheme: insuranceClaim?.provider || row.payment_method || 'Cash',
    createdBy: row.created_by,
    createdByName: row.created_by_name || 'Cashier',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const BILLING_SELECT = `
  SELECT
    b.*,
    pa.patient_id AS patient_display_id,
    CONCAT(pa.first_name, ' ', pa.last_name) AS patient_name,
    pa.phone AS patient_phone,
    pa.insurance AS patient_insurance,
    CONCAT(u.first_name, ' ', u.last_name) AS created_by_name
  FROM billing b
  LEFT JOIN patients pa ON pa.id = b.patient_id
  LEFT JOIN users u ON u.id = b.created_by
`;

// GET /api/billing/stats - Summary statistics for Cashier & Billing Dashboard
router.get('/stats', protect, async (_req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const totalBillsRes = await query(`SELECT COUNT(*)::int AS count FROM billing`);
    const pendingBillsRes = await query(
      `SELECT COUNT(*)::int AS count, COALESCE(SUM(balance), 0)::numeric AS amount FROM billing WHERE balance > 0 AND payment_status != 'Cancelled'`
    );
    const paidTodayRes = await query(
      `SELECT COALESCE(SUM(amount_due - balance), 0)::numeric AS amount, COUNT(*)::int AS count FROM billing WHERE invoice_date = $1 OR created_at::date = $1`,
      [today]
    );

    // Calculate collections by method from payment history
    const allBills = await query(`SELECT payment_history FROM billing WHERE payment_history IS NOT NULL`);
    const methodTotals = { Cash: 0, 'M-Pesa': 0, Card: 0, Insurance: 0, 'Bank Transfer': 0 };
    let todayCollections = 0;

    for (const row of allBills.rows) {
      if (Array.isArray(row.payment_history)) {
        for (const p of row.payment_history) {
          const amt = Number(p.amount || 0);
          const method = p.method || 'Cash';
          if (methodTotals[method] !== undefined) {
            methodTotals[method] += amt;
          } else {
            methodTotals[method] = (methodTotals[method] || 0) + amt;
          }
          if (p.date && p.date.startsWith(today)) {
            todayCollections += amt;
          }
        }
      }
    }

    const pendingCashRes = await query(
      `SELECT COUNT(*)::int AS count, COALESCE(SUM(balance), 0)::numeric AS amount 
       FROM billing 
       WHERE balance > 0 
         AND payment_status IN ('Pending', 'Partial') 
         AND payment_method != 'Insurance'`
    );
    const pendingInsuranceRes = await query(
      `SELECT COUNT(*)::int AS count, COALESCE(SUM(amount_due), 0)::numeric AS amount 
       FROM billing 
       WHERE payment_status IN ('Pending Approval', 'Pending') 
         AND (payment_method = 'Insurance' OR insurance_claim IS NOT NULL)`
    );

    res.json({
      success: true,
      data: {
        totalBills: totalBillsRes.rows[0]?.count || 0,
        pendingCount: pendingBillsRes.rows[0]?.count || 0,
        pendingAmount: Number(pendingBillsRes.rows[0]?.amount || 0),
        pendingCashCount: pendingCashRes.rows[0]?.count || 0,
        pendingCashAmount: Number(pendingCashRes.rows[0]?.amount || 0),
        pendingInsuranceCount: pendingInsuranceRes.rows[0]?.count || 0,
        pendingInsuranceAmount: Number(pendingInsuranceRes.rows[0]?.amount || 0),
        todayCollections: todayCollections || Number(paidTodayRes.rows[0]?.amount || 0),
        todayInvoicesCount: paidTodayRes.rows[0]?.count || 0,
        byMethod: methodTotals,
      },
    });
  } catch (err) {
    console.error('Billing stats error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/billing/receipts - All receipts generated
router.get('/receipts', protect, async (req, res) => {
  try {
    const rows = await query(`
      ${BILLING_SELECT}
      WHERE b.payment_history IS NOT NULL AND jsonb_array_length(CASE WHEN jsonb_typeof(b.payment_history) = 'array' THEN b.payment_history ELSE '[]'::jsonb END) > 0
      ORDER BY b.updated_at DESC
      LIMIT 100
    `);

    const receipts = [];
    for (const b of rows.rows) {
      const history = Array.isArray(b.payment_history) ? b.payment_history : [];
      history.forEach((p, idx) => {
        receipts.push({
          id: p.receiptNumber || `RCT-${String(b.invoice_number || '').replace('INV-', '')}-${idx + 1}`,
          receiptNumber: p.receiptNumber || `RCT-${String(b.invoice_number || '').replace('INV-', '')}-${idx + 1}`,
          billId: b.id,
          invoiceNumber: b.invoice_number,
          patientId: b.patient_id,
          patientName: b.patient_name || 'Walk-in / Private',
          patientDisplayId: b.patient_display_id || 'WALK-IN',
          patientPhone: b.patient_phone,
          amount: Number(p.amount || 0),
          method: p.method || 'Cash',
          reference: p.reference || p.ref || 'Direct Cashier',
          cashier: p.cashierName || b.created_by_name || 'Cashier Desk',
          date: p.date || b.updated_at || b.created_at,
          notes: p.notes || '',
        });
      });
    }

    receipts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({
      success: true,
      count: receipts.length,
      data: receipts,
    });
  } catch (err) {
    console.error('Receipts list error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/billing - List bills
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const offset = (page - 1) * limit;
    const where = [];
    const params = [];

    if (req.query.patient || req.query.patientId) {
      const pRef = String(req.query.patient || req.query.patientId);
      if (isUuid(pRef)) {
        params.push(pRef);
        where.push(`b.patient_id = $${params.length}`);
      } else {
        params.push(pRef);
        where.push(`pa.patient_id = $${params.length}`);
      }
    }

    if (req.query.status && req.query.status !== 'All') {
      params.push(req.query.status);
      where.push(`b.payment_status ILIKE $${params.length}`);
    } else if (req.query.paymentStatus && req.query.paymentStatus !== 'All') {
      params.push(req.query.paymentStatus);
      where.push(`b.payment_status ILIKE $${params.length}`);
    }

    if (req.query.scheme && req.query.scheme !== 'All') {
      params.push(`%${req.query.scheme}%`);
      where.push(`(b.payment_method ILIKE $${params.length} OR b.insurance_claim->>'provider' ILIKE $${params.length})`);
    }

    if (req.query.startDate) {
      params.push(req.query.startDate);
      where.push(`b.invoice_date >= $${params.length}`);
    }

    if (req.query.endDate) {
      params.push(req.query.endDate);
      where.push(`b.invoice_date <= $${params.length}`);
    }

    if (req.query.search) {
      params.push(`%${req.query.search}%`);
      where.push(
        `(b.invoice_number ILIKE $${params.length} OR CONCAT(pa.first_name, ' ', pa.last_name) ILIKE $${params.length} OR pa.patient_id ILIKE $${params.length} OR pa.phone ILIKE $${params.length})`
      );
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const totalResult = await query(
      `SELECT COUNT(*)::int AS total FROM billing b LEFT JOIN patients pa ON pa.id = b.patient_id ${whereClause}`,
      params
    );
    const total = totalResult.rows[0]?.total || 0;

    const rows = await query(
      `${BILLING_SELECT} ${whereClause} ORDER BY b.invoice_date DESC NULLS LAST, b.created_at DESC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, offset, limit]
    );

    res.json({
      success: true,
      count: rows.rows.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
        totalBills: total,
        totalRecords: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      data: rows.rows.map(mapBill),
    });
  } catch (err) {
    console.error('Billing fetch error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// GET /api/billing/:id - Single bill details
router.get('/:id', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid invoice ID' });
    const result = await query(`${BILLING_SELECT} WHERE b.id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Billing record not found' });
    res.json({ success: true, data: mapBill(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/billing - Create invoice
router.post(
  '/',
  protect,
  [
    body('patientId').optional(),
    body('patient').optional(),
  ],
  async (req, res) => {
    try {
      const patientRef = req.body.patientId || req.body.patient;
      const patientId = await resolvePatientId(patientRef);

      const invoiceNumber = req.body.invoiceNumber || req.body.billId || (await generateInvoiceNumber());
      const invoiceDate = req.body.invoiceDate || req.body.billDate || new Date().toISOString().slice(0, 10);
      const items = Array.isArray(req.body.items) ? req.body.items : [];

      let computedTotal = 0;
      items.forEach((item) => {
        const qty = Number(item.quantity || 1);
        const rate = Number(item.unitPrice || item.rate || item.amount || 0);
        item.amount = qty * rate;
        computedTotal += item.amount;
      });

      const total = Number(req.body.totalAmount || req.body.total || computedTotal);
      const amountPaid = Number(req.body.amountPaid || 0);
      const balance = req.body.balance !== undefined ? Number(req.body.balance) : Math.max(total - amountPaid, 0);
      const paymentStatus = req.body.paymentStatus || (balance <= 0 ? 'Paid' : amountPaid > 0 ? 'Partial' : 'Pending');
      const paymentMethod = req.body.paymentMethod || 'Cash';

      const initialHistory = [];
      if (amountPaid > 0) {
        const receiptNo = await generateReceiptNumber();
        initialHistory.push({
          receiptNumber: receiptNo,
          amount: amountPaid,
          method: paymentMethod,
          reference: req.body.reference || req.body.ref || 'Initial Payment',
          date: new Date().toISOString(),
          by: req.user.id,
          cashierName: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Cashier Desk',
        });
      }

      const insuranceClaim = req.body.insuranceClaim || null;

      const inserted = await query(
        `INSERT INTO billing (
          patient_id, invoice_number, invoice_date, amount_due, items, payment_method,
          payment_status, payment_history, insurance_claim, balance, created_by
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
        [
          patientId,
          invoiceNumber,
          invoiceDate,
          total,
          JSON.stringify(items),
          paymentMethod,
          paymentStatus,
          JSON.stringify(initialHistory),
          insuranceClaim ? JSON.stringify(insuranceClaim) : null,
          balance,
          req.user.id,
        ]
      );

      const billRow = await query(`${BILLING_SELECT} WHERE b.id = $1`, [inserted.rows[0].id]);
      res.status(201).json({ success: true, data: mapBill(billRow.rows[0]) });
    } catch (err) {
      console.error('Billing create error:', err);
      if (err.code === '23505') {
        return res.status(400).json({ success: false, error: 'Invoice number already exists' });
      }
      res.status(500).json({ success: false, error: 'Server error' });
    }
  }
);

// POST /api/billing/:id/payment - Process payment & issue receipt
router.post('/:id/payment', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid invoice ID' });

    const amount = Number(req.body.amount || 0);
    if (amount <= 0) return res.status(400).json({ success: false, error: 'Invalid payment amount' });

    const billResult = await query(`SELECT * FROM billing WHERE id = $1`, [req.params.id]);
    const bill = billResult.rows[0];
    if (!bill) return res.status(404).json({ success: false, error: 'Invoice not found' });

    const history = Array.isArray(bill.payment_history) ? bill.payment_history : [];
    const receiptNumber = req.body.receiptNumber || (await generateReceiptNumber());

    const paymentRecord = {
      receiptNumber,
      amount,
      method: req.body.paymentMethod || req.body.method || 'Cash',
      reference: req.body.reference || req.body.ref || 'CASH-' + Date.now().toString().slice(-6),
      notes: req.body.notes || '',
      date: new Date().toISOString(),
      by: req.user.id,
      cashierName: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Cashier',
    };

    history.push(paymentRecord);

    const currentBalance = Number(bill.balance !== null ? bill.balance : bill.amount_due);
    const newBalance = Math.max(currentBalance - amount, 0);
    const newStatus = newBalance <= 0 ? 'Paid' : 'Partial';

    await query(
      `UPDATE billing SET
        payment_history = $1,
        balance = $2,
        payment_status = $3,
        payment_method = COALESCE($4, payment_method),
        updated_at = NOW()
       WHERE id = $5`,
      [
        JSON.stringify(history),
        newBalance,
        newStatus,
        req.body.paymentMethod || null,
        req.params.id,
      ]
    );

    // Clear linked clinical orders when fully paid
    if (newBalance <= 0) {
      const { clearLinkedClinicalOrders } = require('../lib/clinicalBillingBridge');
      await clearLinkedClinicalOrders(req.params.id, req.user.id);
    }

    const updated = await query(`${BILLING_SELECT} WHERE b.id = $1`, [req.params.id]);
    res.json({
      success: true,
      message: 'Payment recorded successfully',
      receipt: paymentRecord,
      data: mapBill(updated.rows[0]),
    });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/billing/:id/split-payment - Process multiple payment modes simultaneously
router.post('/:id/split-payment', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid invoice ID' });

    const payments = Array.isArray(req.body.payments) ? req.body.payments : [];
    if (!payments.length) return res.status(400).json({ success: false, error: 'No payments specified' });

    const billResult = await query(`SELECT * FROM billing WHERE id = $1`, [req.params.id]);
    const bill = billResult.rows[0];
    if (!bill) return res.status(404).json({ success: false, error: 'Invoice not found' });

    const history = Array.isArray(bill.payment_history) ? bill.payment_history : [];
    let totalSplitPaid = 0;
    const newReceipts = [];

    for (const p of payments) {
      const pAmt = Number(p.amount || 0);
      if (pAmt > 0) {
        totalSplitPaid += pAmt;
        const rct = await generateReceiptNumber();
        const entry = {
          receiptNumber: rct,
          amount: pAmt,
          method: p.method || 'Cash',
          reference: p.reference || 'SPLIT-' + Date.now().toString().slice(-6),
          notes: p.notes || 'Split Payment',
          date: new Date().toISOString(),
          by: req.user.id,
          cashierName: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Cashier',
        };
        history.push(entry);
        newReceipts.push(entry);
      }
    }

    const currentBalance = Number(bill.balance !== null ? bill.balance : bill.amount_due);
    const newBalance = Math.max(currentBalance - totalSplitPaid, 0);
    const newStatus = newBalance <= 0 ? 'Paid' : 'Partial';

    await query(
      `UPDATE billing SET
        payment_history = $1,
        balance = $2,
        payment_status = $3,
        updated_at = NOW()
       WHERE id = $4`,
      [JSON.stringify(history), newBalance, newStatus, req.params.id]
    );

    // Clear linked clinical orders when fully paid
    if (newBalance <= 0) {
      const { clearLinkedClinicalOrders } = require('../lib/clinicalBillingBridge');
      await clearLinkedClinicalOrders(req.params.id, req.user.id);
    }

    const updated = await query(`${BILLING_SELECT} WHERE b.id = $1`, [req.params.id]);
    res.json({
      success: true,
      message: 'Split payments recorded successfully',
      receipts: newReceipts,
      data: mapBill(updated.rows[0]),
    });
  } catch (err) {
    console.error('Split payment error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/billing/:id/claim - Attach or update insurance claim details
router.post('/:id/claim', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid invoice ID' });

    const status = req.body.status || 'Submitted';
    const claim = {
      provider: req.body.provider || 'SHA',
      memberNumber: req.body.memberNumber || '',
      policyNumber: req.body.policyNumber || '',
      preAuthCode: req.body.preAuthCode || '',
      claimNumber: req.body.claimNumber || `CLM-${Date.now().toString().slice(-6)}`,
      amountClaimed: Number(req.body.amountClaimed || 0),
      copayAmount: Number(req.body.copayAmount || 0),
      status,
      submissionDate: new Date().toISOString(),
      notes: req.body.notes || '',
    };

    const newPaymentStatus = status === 'Approved' ? 'Approved' : undefined;

    await query(
      `UPDATE billing SET
        insurance_claim = $1,
        payment_method = 'Insurance',
        ${newPaymentStatus ? `payment_status = '${newPaymentStatus}',` : ''}
        updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(claim), req.params.id]
    );

    if (status === 'Approved') {
      const { clearLinkedClinicalOrders } = require('../lib/clinicalBillingBridge');
      await clearLinkedClinicalOrders(req.params.id, req.user.id);
    }

    const updated = await query(`${BILLING_SELECT} WHERE b.id = $1`, [req.params.id]);
    res.json({ success: true, message: 'Insurance claim updated', data: mapBill(updated.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// POST /api/billing/:id/approve-insurance - Cashier pre-authorization and approval of insurance
router.post('/:id/approve-insurance', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid invoice ID' });

    const billResult = await query(`SELECT * FROM billing WHERE id = $1`, [req.params.id]);
    const bill = billResult.rows[0];
    if (!bill) return res.status(404).json({ success: false, error: 'Invoice not found' });

    const preAuthCode = req.body.preAuthCode || req.body.authCode || `AUTH-${Date.now().toString().slice(-6)}`;
    const cashierName = `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Cashier';
    const notes = req.body.notes || 'Insurance pre-authorization approved by cashier';

    const approvalRecord = {
      preAuthCode,
      approvedBy: req.user.id,
      cashierName,
      approvalDate: new Date().toISOString(),
      notes,
    };

    const existingClaim = typeof bill.insurance_claim === 'object' && bill.insurance_claim !== null ? bill.insurance_claim : {};
    const updatedClaim = {
      ...existingClaim,
      preAuthCode,
      status: 'Approved',
      approvedAt: new Date().toISOString(),
      approvedBy: req.user.id,
    };

    // If there is copay, balance becomes copay, else 0
    const copayAmount = Number(req.body.copayAmount !== undefined ? req.body.copayAmount : existingClaim.copayAmount || 0);
    const newBalance = copayAmount > 0 ? copayAmount : 0;
    const newPaymentStatus = newBalance > 0 ? 'Partial' : 'Approved';

    await query(
      `UPDATE billing SET
        insurance_approval = $1,
        insurance_claim = $2,
        payment_status = $3,
        balance = $4,
        payment_method = 'Insurance',
        updated_at = NOW()
       WHERE id = $5`,
      [
        JSON.stringify(approvalRecord),
        JSON.stringify(updatedClaim),
        newPaymentStatus,
        newBalance,
        req.params.id,
      ]
    );

    // Synchronize and clear all clinical orders (Lab, Radiology, Pharmacy) linked to this bill
    const { clearLinkedClinicalOrders } = require('../lib/clinicalBillingBridge');
    await clearLinkedClinicalOrders(req.params.id, req.user.id, approvalRecord);

    const updated = await query(`${BILLING_SELECT} WHERE b.id = $1`, [req.params.id]);
    res.json({
      success: true,
      message: 'Insurance authorization approved successfully and clinical orders cleared',
      approval: approvalRecord,
      data: mapBill(updated.rows[0]),
    });
  } catch (err) {
    console.error('Insurance approval error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// PUT /api/billing/:id - Update invoice
router.put('/:id', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid invoice ID' });

    const updates = [];
    const values = [];
    let i = 1;

    if (req.body.items !== undefined) {
      updates.push(`items = $${i++}`);
      values.push(JSON.stringify(req.body.items));
    }
    if (req.body.total !== undefined || req.body.amountDue !== undefined) {
      updates.push(`amount_due = $${i++}`);
      values.push(Number(req.body.total || req.body.amountDue));
    }
    if (req.body.balance !== undefined) {
      updates.push(`balance = $${i++}`);
      values.push(Number(req.body.balance));
    }
    if (req.body.paymentStatus !== undefined) {
      updates.push(`payment_status = $${i++}`);
      values.push(req.body.paymentStatus);
    }
    if (req.body.paymentMethod !== undefined) {
      updates.push(`payment_method = $${i++}`);
      values.push(req.body.paymentMethod);
    }
    if (req.body.insuranceClaim !== undefined) {
      updates.push(`insurance_claim = $${i++}`);
      values.push(JSON.stringify(req.body.insuranceClaim));
    }

    if (!updates.length) return res.status(400).json({ success: false, error: 'No fields to update' });

    values.push(req.params.id);
    await query(`UPDATE billing SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i}`, values);

    const updated = await query(`${BILLING_SELECT} WHERE b.id = $1`, [req.params.id]);
    if (!updated.rows[0]) return res.status(404).json({ success: false, error: 'Billing record not found' });
    res.json({ success: true, data: mapBill(updated.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// DELETE /api/billing/:id - Void or delete invoice
router.delete('/:id', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid invoice ID' });
    const deleted = await query(`DELETE FROM billing WHERE id = $1 RETURNING id`, [req.params.id]);
    if (!deleted.rows[0]) return res.status(404).json({ success: false, error: 'Billing record not found' });
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
