const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../db/pg');
const { protect, checkPermission } = require('../middleware/auth');
const Finance = require('../models/Finance');

const router = express.Router();

// Helper function to map database records
const mapFinanceRecord = (row) => ({
  _id: row.id,
  financeId: row.finance_id || row.id,
  type: row.type,
  data: row.data || {},
  status: row.status,
  createdBy: row.created_by,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// ===== BILLING ENDPOINTS =====

// Get all bills
router.get('/billing', protect, checkPermission('finance', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;

    const where = ['type = $1'];
    const params = ['Billing'];

    if (req.query.patient) {
      params.push(req.query.patient);
      where.push(`data->>'patient' = $${params.length}`);
    }
    if (req.query.billType) {
      params.push(req.query.billType);
      where.push(`data->>'billType' = $${params.length}`);
    }
    if (req.query.paymentStatus) {
      params.push(req.query.paymentStatus);
      where.push(`data->>'paymentStatus' = $${params.length}`);
    }

    const whereClause = where.join(' AND ');
    const total = await query(
      `SELECT COUNT(*)::int AS total FROM finance WHERE ${whereClause}`,
      params
    );

    const rows = await query(
      `SELECT * FROM finance WHERE ${whereClause} ORDER BY created_at DESC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, offset, limit]
    );

    const t = total.rows[0]?.total || 0;
    res.json({
      success: true,
      count: rows.rows.length,
      pagination: { currentPage: page, totalPages: Math.ceil(t / limit), totalRecords: t, hasNext: page * limit < t, hasPrev: page > 1 },
      data: rows.rows.map(mapFinanceRecord),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', details: err.message });
  }
});

// Create billing record
router.post(
  '/billing',
  [
    protect,
    checkPermission('finance', 'create'),
    body('billId').notEmpty().withMessage('Bill ID is required'),
    body('patient').notEmpty().withMessage('Patient is required'),
    body('total').isNumeric().withMessage('Total must be numeric'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const total = Number(req.body.total || 0);
      const amountPaid = Number(req.body.amountPaid || 0);
      const balance = req.body.balance !== undefined ? Number(req.body.balance) : Math.max(total - amountPaid, 0);

      const financeId = `BILL-${Date.now()}`;
      const billData = {
        billId: req.body.billId,
        billType: req.body.billType || 'Cash',
        patient: req.body.patient,
        appointment: req.body.appointment || null,
        billDate: req.body.billDate || new Date().toISOString(),
        dueDate: req.body.dueDate || null,
        items: req.body.items || [],
        subtotal: Number(req.body.subtotal || total),
        discount: Number(req.body.discount || 0),
        tax: Number(req.body.tax || 0),
        total,
        amountPaid,
        balance,
        paymentMethod: req.body.paymentMethod || null,
        paymentStatus: req.body.paymentStatus || (balance > 0 ? 'Pending' : 'Paid'),
        insuranceInfo: req.body.insuranceInfo || {},
        paymentHistory: req.body.paymentHistory || [],
        notes: req.body.notes || '',
      };

      const inserted = await query(
        `INSERT INTO finance (finance_id, type, data, status, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
        [financeId, 'Billing', JSON.stringify(billData), 'Active', req.user.id]
      );

      res.status(201).json({ success: true, data: mapFinanceRecord(inserted.rows[0]) });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to create billing record', details: err.message });
    }
  }
);

// Update billing record
router.put('/billing/:id', protect, checkPermission('finance', 'update'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM finance WHERE id = $1 AND type = 'Billing'`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Billing record not found' });

    const updatedData = { ...result.rows[0].data, ...req.body };

    const updated = await query(
      `UPDATE finance SET data = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [JSON.stringify(updatedData), req.params.id]
    );

    res.json({ success: true, data: mapFinanceRecord(updated.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update billing record', details: err.message });
  }
});

// ===== CASH OFFICE ENDPOINTS =====

router.get('/cash-office', protect, checkPermission('finance', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;

    const total = await query(`SELECT COUNT(*)::int AS total FROM finance WHERE type = 'CashOffice'`);
    const rows = await query(
      `SELECT * FROM finance WHERE type = 'CashOffice' ORDER BY created_at DESC OFFSET $1 LIMIT $2`,
      [offset, limit]
    );

    const t = total.rows[0]?.total || 0;
    res.json({
      success: true,
      count: rows.rows.length,
      pagination: { currentPage: page, totalPages: Math.ceil(t / limit), totalRecords: t, hasNext: page * limit < t, hasPrev: page > 1 },
      data: rows.rows.map(mapFinanceRecord),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', details: err.message });
  }
});

router.post(
  '/cash-office',
  [protect, checkPermission('finance', 'create')],
  async (req, res) => {
    try {
      const financeId = `CASH-${Date.now()}`;
      const cashData = {
        receiptId: req.body.receiptId || financeId,
        date: req.body.date || new Date().toISOString(),
        type: req.body.type || 'Receipt',
        amount: Number(req.body.amount || 0),
        paymentMethod: req.body.paymentMethod || 'Cash',
        reference: req.body.reference || '',
        relatedBill: req.body.relatedBill || null,
        cashier: req.user.id,
        notes: req.body.notes || '',
      };

      const inserted = await query(
        `INSERT INTO finance (finance_id, type, data, status, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
        [financeId, 'CashOffice', JSON.stringify(cashData), 'Active', req.user.id]
      );

      res.status(201).json({ success: true, data: mapFinanceRecord(inserted.rows[0]) });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to create cash office record', details: err.message });
    }
  }
);

// ===== INSURANCE MANAGEMENT ENDPOINTS =====

router.get('/insurance', protect, checkPermission('finance', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;

    const where = ['type = $1'];
    const params = ['Insurance'];

    if (req.query.provider) {
      params.push(req.query.provider);
      where.push(`data->>'provider' = $${params.length}`);
    }
    if (req.query.claimStatus) {
      params.push(req.query.claimStatus);
      where.push(`data->>'claimStatus' = $${params.length}`);
    }

    const whereClause = where.join(' AND ');
    const total = await query(
      `SELECT COUNT(*)::int AS total FROM finance WHERE ${whereClause}`,
      params
    );

    const rows = await query(
      `SELECT * FROM finance WHERE ${whereClause} ORDER BY created_at DESC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, offset, limit]
    );

    const t = total.rows[0]?.total || 0;
    res.json({
      success: true,
      count: rows.rows.length,
      pagination: { currentPage: page, totalPages: Math.ceil(t / limit), totalRecords: t, hasNext: page * limit < t, hasPrev: page > 1 },
      data: rows.rows.map(mapFinanceRecord),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', details: err.message });
  }
});

router.post(
  '/insurance',
  [protect, checkPermission('finance', 'create')],
  async (req, res) => {
    try {
      const financeId = `INS-${Date.now()}`;
      const insuranceData = {
        provider: req.body.provider || '',
        preAuthId: req.body.preAuthId || '',
        patient: req.body.patient || null,
        claimNumber: req.body.claimNumber || '',
        claimStatus: req.body.claimStatus || 'Draft',
        claimAmount: Number(req.body.claimAmount || 0),
        approvedAmount: Number(req.body.approvedAmount || 0),
        serviceDate: req.body.serviceDate || null,
        submissionDate: req.body.submissionDate || null,
        authorizationNumber: req.body.authorizationNumber || '',
        authorizationLimit: Number(req.body.authorizationLimit || 0),
        coinsurancePercentage: Number(req.body.coinsurancePercentage || 0),
        copayAmount: Number(req.body.copayAmount || 0),
        deductible: Number(req.body.deductible || 0),
        reconciliationStatus: req.body.reconciliationStatus || 'Pending',
        notes: req.body.notes || '',
      };

      const inserted = await query(
        `INSERT INTO finance (finance_id, type, data, status, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
        [financeId, 'Insurance', JSON.stringify(insuranceData), 'Active', req.user.id]
      );

      res.status(201).json({ success: true, data: mapFinanceRecord(inserted.rows[0]) });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to create insurance record', details: err.message });
    }
  }
);

// ===== ACCOUNTS RECEIVABLE ENDPOINTS =====

router.get('/accounts-receivable', protect, checkPermission('finance', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;

    const where = ['type = $1'];
    const params = ['AccountsReceivable'];

    if (req.query.ageCategory) {
      params.push(req.query.ageCategory);
      where.push(`data->>'ageCategory' = $${params.length}`);
    }

    const whereClause = where.join(' AND ');
    const total = await query(
      `SELECT COUNT(*)::int AS total FROM finance WHERE ${whereClause}`,
      params
    );

    const rows = await query(
      `SELECT * FROM finance WHERE ${whereClause} ORDER BY created_at DESC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, offset, limit]
    );

    const t = total.rows[0]?.total || 0;
    res.json({
      success: true,
      count: rows.rows.length,
      pagination: { currentPage: page, totalPages: Math.ceil(t / limit), totalRecords: t, hasNext: page * limit < t, hasPrev: page > 1 },
      data: rows.rows.map(mapFinanceRecord),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', details: err.message });
  }
});

router.post(
  '/accounts-receivable',
  [protect, checkPermission('finance', 'create')],
  async (req, res) => {
    try {
      const financeId = `AR-${Date.now()}`;
      const arData = {
        debtorId: req.body.debtorId || financeId,
        patient: req.body.patient || null,
        outstandingBalance: Number(req.body.outstandingBalance || 0),
        invoiceDate: req.body.invoiceDate || null,
        dueDate: req.body.dueDate || null,
        daysPastDue: Number(req.body.daysPastDue || 0),
        ageCategory: req.body.ageCategory || 'Current',
        followUpStatus: req.body.followUpStatus || 'Not Contacted',
        followUpDate: req.body.followUpDate || null,
        collectionStatus: req.body.collectionStatus || 'Active',
      };

      const inserted = await query(
        `INSERT INTO finance (finance_id, type, data, status, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
        [financeId, 'AccountsReceivable', JSON.stringify(arData), 'Active', req.user.id]
      );

      res.status(201).json({ success: true, data: mapFinanceRecord(inserted.rows[0]) });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to create AR record', details: err.message });
    }
  }
);

// ===== GENERAL LEDGER ENDPOINTS =====

router.get('/general-ledger', protect, checkPermission('finance', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;

    const where = ['type = $1'];
    const params = ['GeneralLedger'];

    if (req.query.accountType) {
      params.push(req.query.accountType);
      where.push(`data->>'accountType' = $${params.length}`);
    }

    const whereClause = where.join(' AND ');
    const total = await query(
      `SELECT COUNT(*)::int AS total FROM finance WHERE ${whereClause}`,
      params
    );

    const rows = await query(
      `SELECT * FROM finance WHERE ${whereClause} ORDER BY created_at DESC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, offset, limit]
    );

    const t = total.rows[0]?.total || 0;
    res.json({
      success: true,
      count: rows.rows.length,
      pagination: { currentPage: page, totalPages: Math.ceil(t / limit), totalRecords: t, hasNext: page * limit < t, hasPrev: page > 1 },
      data: rows.rows.map(mapFinanceRecord),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', details: err.message });
  }
});

router.post(
  '/general-ledger',
  [protect, checkPermission('finance', 'create')],
  async (req, res) => {
    try {
      const financeId = `GL-${req.body.accountCode || Date.now()}`;
      const glData = {
        accountCode: req.body.accountCode || '',
        accountName: req.body.accountName || '',
        accountType: req.body.accountType || 'Asset',
        accountSubtype: req.body.accountSubtype || '',
        openingBalance: Number(req.body.openingBalance || 0),
        debit: Number(req.body.debit || 0),
        credit: Number(req.body.credit || 0),
        balance: Number(req.body.balance || 0),
        journalEntries: req.body.journalEntries || [],
      };

      const inserted = await query(
        `INSERT INTO finance (finance_id, type, data, status, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
        [financeId, 'GeneralLedger', JSON.stringify(glData), 'Active', req.user.id]
      );

      res.status(201).json({ success: true, data: mapFinanceRecord(inserted.rows[0]) });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to create GL record', details: err.message });
    }
  }
);

// ===== ASSET MANAGEMENT ENDPOINTS =====

router.get('/assets', protect, checkPermission('finance', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;

    const where = ['type = $1'];
    const params = ['Asset'];

    if (req.query.status) {
      params.push(req.query.status);
      where.push(`data->>'status' = $${params.length}`);
    }

    const whereClause = where.join(' AND ');
    const total = await query(
      `SELECT COUNT(*)::int AS total FROM finance WHERE ${whereClause}`,
      params
    );

    const rows = await query(
      `SELECT * FROM finance WHERE ${whereClause} ORDER BY created_at DESC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, offset, limit]
    );

    const t = total.rows[0]?.total || 0;
    res.json({
      success: true,
      count: rows.rows.length,
      pagination: { currentPage: page, totalPages: Math.ceil(t / limit), totalRecords: t, hasNext: page * limit < t, hasPrev: page > 1 },
      data: rows.rows.map(mapFinanceRecord),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', details: err.message });
  }
});

router.post(
  '/assets',
  [protect, checkPermission('finance', 'create')],
  async (req, res) => {
    try {
      const financeId = `ASSET-${Date.now()}`;
      const assetData = {
        assetId: req.body.assetId || financeId,
        assetName: req.body.assetName || '',
        category: req.body.category || '',
        location: req.body.location || '',
        purchaseDate: req.body.purchaseDate || null,
        purchasePrice: Number(req.body.purchasePrice || 0),
        depreciation: req.body.depreciation || { method: 'Straight-line', rate: 0, accumulatedDepreciation: 0 },
        bookValue: Number(req.body.bookValue || req.body.purchasePrice || 0),
        maintenanceSchedules: req.body.maintenanceSchedules || [],
        salvageValue: Number(req.body.salvageValue || 0),
        usefulLife: Number(req.body.usefulLife || 0),
        status: req.body.status || 'Active',
      };

      const inserted = await query(
        `INSERT INTO finance (finance_id, type, data, status, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
        [financeId, 'Asset', JSON.stringify(assetData), 'Active', req.user.id]
      );

      res.status(201).json({ success: true, data: mapFinanceRecord(inserted.rows[0]) });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to create asset', details: err.message });
    }
  }
);

// ===== ACCOUNTS PAYABLE ENDPOINTS =====

router.get('/accounts-payable', protect, checkPermission('finance', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;

    const where = ['type = $1'];
    const params = ['AccountsPayable'];

    if (req.query.paymentStatus) {
      params.push(req.query.paymentStatus);
      where.push(`data->>'paymentStatus' = $${params.length}`);
    }

    const whereClause = where.join(' AND ');
    const total = await query(
      `SELECT COUNT(*)::int AS total FROM finance WHERE ${whereClause}`,
      params
    );

    const rows = await query(
      `SELECT * FROM finance WHERE ${whereClause} ORDER BY created_at DESC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, offset, limit]
    );

    const t = total.rows[0]?.total || 0;
    res.json({
      success: true,
      count: rows.rows.length,
      pagination: { currentPage: page, totalPages: Math.ceil(t / limit), totalRecords: t, hasNext: page * limit < t, hasPrev: page > 1 },
      data: rows.rows.map(mapFinanceRecord),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', details: err.message });
  }
});

router.post(
  '/accounts-payable',
  [protect, checkPermission('finance', 'create')],
  async (req, res) => {
    try {
      const financeId = `AP-${Date.now()}`;
      const apData = {
        invoiceNumber: req.body.invoiceNumber || financeId,
        supplier: req.body.supplier || '',
        invoiceDate: req.body.invoiceDate || null,
        dueDate: req.body.dueDate || null,
        purchaseOrder: req.body.purchaseOrder || '',
        items: req.body.items || [],
        amount: Number(req.body.amount || 0),
        amountPaid: Number(req.body.amountPaid || 0),
        balance: Number(req.body.balance || (req.body.amount - req.body.amountPaid) || 0),
        paymentStatus: req.body.paymentStatus || 'Pending',
        paymentHistory: req.body.paymentHistory || [],
        reconciliationStatus: req.body.reconciliationStatus || 'Pending',
      };

      const inserted = await query(
        `INSERT INTO finance (finance_id, type, data, status, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
        [financeId, 'AccountsPayable', JSON.stringify(apData), 'Active', req.user.id]
      );

      res.status(201).json({ success: true, data: mapFinanceRecord(inserted.rows[0]) });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to create AP record', details: err.message });
    }
  }
);

// ===== BUDGET MANAGEMENT ENDPOINTS =====

router.get('/budgets', protect, checkPermission('finance', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;

    const where = ['type = $1'];
    const params = ['Budget'];

    if (req.query.department) {
      params.push(req.query.department);
      where.push(`data->>'department' = $${params.length}`);
    }
    if (req.query.budgetYear) {
      params.push(req.query.budgetYear);
      where.push(`data->>'budgetYear' = $${params.length}`);
    }

    const whereClause = where.join(' AND ');
    const total = await query(
      `SELECT COUNT(*)::int AS total FROM finance WHERE ${whereClause}`,
      params
    );

    const rows = await query(
      `SELECT * FROM finance WHERE ${whereClause} ORDER BY created_at DESC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, offset, limit]
    );

    const t = total.rows[0]?.total || 0;
    res.json({
      success: true,
      count: rows.rows.length,
      pagination: { currentPage: page, totalPages: Math.ceil(t / limit), totalRecords: t, hasNext: page * limit < t, hasPrev: page > 1 },
      data: rows.rows.map(mapFinanceRecord),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', details: err.message });
  }
});

router.post(
  '/budgets',
  [protect, checkPermission('finance', 'create')],
  async (req, res) => {
    try {
      const financeId = `BUDGET-${Date.now()}`;
      const budgetData = {
        budgetYear: Number(req.body.budgetYear || new Date().getFullYear()),
        department: req.body.department || '',
        budgetCategory: req.body.budgetCategory || '',
        allocatedAmount: Number(req.body.allocatedAmount || 0),
        utilizedAmount: Number(req.body.utilizedAmount || 0),
        variance: Number(req.body.variance || 0),
        variancePercentage: Number(req.body.variancePercentage || 0),
        status: req.body.status || 'Draft',
        monthlyBreakdown: req.body.monthlyBreakdown || [],
        notes: req.body.notes || '',
      };

      const inserted = await query(
        `INSERT INTO finance (finance_id, type, data, status, created_by, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *`,
        [financeId, 'Budget', JSON.stringify(budgetData), 'Active', req.user.id]
      );

      res.status(201).json({ success: true, data: mapFinanceRecord(inserted.rows[0]) });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Failed to create budget', details: err.message });
    }
  }
);

// ===== GENERAL FINANCE ENDPOINTS =====

// Get all finance records
router.get('/', protect, checkPermission('finance', 'read'), async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;

    const where = [];
    const params = [];

    if (req.query.type) {
      params.push(req.query.type);
      where.push(`type = $${params.length}`);
    }
    if (req.query.status) {
      params.push(req.query.status);
      where.push(`status = $${params.length}`);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = await query(`SELECT COUNT(*)::int AS total FROM finance ${whereClause}`, params);
    const rows = await query(
      `SELECT * FROM finance ${whereClause} ORDER BY created_at DESC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, offset, limit]
    );

    const t = total.rows[0]?.total || 0;
    res.json({
      success: true,
      count: rows.rows.length,
      pagination: { currentPage: page, totalPages: Math.ceil(t / limit), totalRecords: t, hasNext: page * limit < t, hasPrev: page > 1 },
      data: rows.rows.map(mapFinanceRecord),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', details: err.message });
  }
});

// Get single finance record
router.get('/:id', protect, checkPermission('finance', 'read'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM finance WHERE id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Record not found' });
    res.json({ success: true, data: mapFinanceRecord(result.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', details: err.message });
  }
});

// Update generic finance record
router.put('/:id', protect, checkPermission('finance', 'update'), async (req, res) => {
  try {
    const result = await query(`SELECT * FROM finance WHERE id = $1`, [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ success: false, error: 'Record not found' });

    const updatedData = { ...result.rows[0].data, ...req.body };
    const updated = await query(
      `UPDATE finance SET data = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [JSON.stringify(updatedData), req.params.id]
    );

    res.json({ success: true, data: mapFinanceRecord(updated.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update record', details: err.message });
  }
});

// Delete finance record (soft delete)
router.delete('/:id', protect, checkPermission('finance', 'delete'), async (req, res) => {
  try {
    const updated = await query(
      `UPDATE finance SET status = 'Archived', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    if (!updated.rows[0]) return res.status(404).json({ success: false, error: 'Record not found' });
    res.json({ success: true, message: 'Record archived successfully', data: mapFinanceRecord(updated.rows[0]) });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete record', details: err.message });
  }
});

// ===== REPORTING ENDPOINTS =====

// Get financial summary dashboard
router.get('/reports/summary', protect, checkPermission('finance', 'read'), async (req, res) => {
  try {
    const billingTotal = await query(
      `SELECT COALESCE(SUM((data->>'total')::numeric), 0) as total FROM finance WHERE type = 'Billing'`
    );
    const collectionsTotal = await query(
      `SELECT COALESCE(SUM((data->>'amountPaid')::numeric), 0) as total FROM finance WHERE type = 'Billing'`
    );
    const outstandingAR = await query(
      `SELECT COALESCE(SUM((data->>'outstandingBalance')::numeric), 0) as total FROM finance WHERE type = 'AccountsReceivable'`
    );
    const accountsPayable = await query(
      `SELECT COALESCE(SUM((data->>'balance')::numeric), 0) as total FROM finance WHERE type = 'AccountsPayable'`
    );

    res.json({
      success: true,
      summary: {
        totalBillings: billingTotal.rows[0]?.total || 0,
        totalCollections: collectionsTotal.rows[0]?.total || 0,
        outstandingReceivables: outstandingAR.rows[0]?.total || 0,
        accountsPayable: accountsPayable.rows[0]?.total || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server error', details: err.message });
  }
});

module.exports = router;
