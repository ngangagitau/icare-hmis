const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../db/pg');
const { protect } = require('../middleware/auth');
const { LAB_TEMPLATES, findTemplate, flattenResults } = require('../lib/labCatalog');

const router = express.Router();

const STATUSES = ['Pending', 'Sample Received', 'Processing', 'Completed'];
const PAYMENT_STATUSES = ['Pending', 'Cleared', 'Unpaid', 'Insurance'];

const isUuid = (value) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    String(value || '')
  );

async function resolvePatientId(patientRef) {
  const result = await query(
    isUuid(patientRef) ? `SELECT id FROM patients WHERE id = $1` : `SELECT id FROM patients WHERE patient_id = $1`,
    [patientRef]
  );
  return result.rows[0]?.id || null;
}

const mapLabOrder = (row) => ({
  _id: row.id,
  id: row.id,
  testId: row.order_number,
  orderNumber: row.order_number,
  patientId: row.patient_id,
  patientName: row.patient_name,
  patientDisplayId: row.patient_display_id,
  queueEntryId: row.queue_entry_id,
  testName: row.test_name,
  testCode: row.test_code,
  specimen: row.specimen_type,
  specimenType: row.specimen_type,
  sampleType: row.specimen_type,
  orderDate: row.order_date,
  status: row.status,
  results: row.results,
  notes: row.notes,
  orderedBy: row.requested_by_name || row.requested_by,
  analyzedBy: row.analyzed_by_name || row.analyzed_by,
  collectorName: row.collected_by_name,
  collectionTime: row.collected_at,
  paymentStatus: row.payment_status || 'Cleared',
  resultStatus: row.result_status,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const ORDER_SELECT = `
  SELECT
    lo.*,
    pa.patient_id AS patient_display_id,
    CONCAT(pa.first_name, ' ', pa.last_name) AS patient_name,
    CONCAT(req.first_name, ' ', req.last_name) AS requested_by_name,
    CONCAT(col.first_name, ' ', col.last_name) AS collected_by_name,
    CONCAT(an.first_name, ' ', an.last_name) AS analyzed_by_name
  FROM laboratory_orders lo
  LEFT JOIN patients pa ON pa.id = lo.patient_id
  LEFT JOIN users req ON req.id = lo.requested_by
  LEFT JOIN users col ON col.id = lo.collected_by
  LEFT JOIN users an ON an.id = lo.analyzed_by
`;

async function getOrderById(id) {
  const result = await query(`${ORDER_SELECT} WHERE lo.id = $1`, [id]);
  return result.rows[0] || null;
}

async function generateOrderNumber() {
  const today = new Date();
  const prefix = `LAB${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const result = await query(
    `SELECT COUNT(*)::int AS count FROM laboratory_orders WHERE order_number LIKE $1`,
    [`${prefix}-%`]
  );
  return `${prefix}-${String((result.rows[0]?.count || 0) + 1).padStart(4, '0')}`;
}

router.get('/templates', protect, (_req, res) => {
  res.json({ success: true, count: LAB_TEMPLATES.length, data: LAB_TEMPLATES });
});

router.get('/stats', protect, async (_req, res) => {
  try {
    const totalRes = await query(`SELECT COUNT(*)::int AS count FROM laboratory_orders`);
    const pendingRes = await query(`SELECT COUNT(*)::int AS count FROM laboratory_orders WHERE status = 'Pending'`);
    const collectedRes = await query(`SELECT COUNT(*)::int AS count FROM laboratory_orders WHERE status = 'Sample Received'`);
    const processingRes = await query(`SELECT COUNT(*)::int AS count FROM laboratory_orders WHERE status = 'Processing'`);
    const completedRes = await query(`SELECT COUNT(*)::int AS count FROM laboratory_orders WHERE status = 'Completed'`);
    const unpaidRes = await query(`SELECT COUNT(*)::int AS count FROM laboratory_orders WHERE payment_status = 'Unpaid'`);
    const todayRes = await query(`SELECT COUNT(*)::int AS count FROM laboratory_orders WHERE order_date = CURRENT_DATE`);

    res.json({
      success: true,
      data: {
        total: totalRes.rows[0]?.count || 0,
        pending: pendingRes.rows[0]?.count || 0,
        collected: collectedRes.rows[0]?.count || 0,
        processing: processingRes.rows[0]?.count || 0,
        completed: completedRes.rows[0]?.count || 0,
        unpaid: unpaidRes.rows[0]?.count || 0,
        today: todayRes.rows[0]?.count || 0,
      },
    });
  } catch (err) {
    console.error('Laboratory stats error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const params = [];
    const where = [];

    if (req.query.status) {
      params.push(String(req.query.status));
      where.push(`lo.status = $${params.length}`);
    }
    if (req.query.patient || req.query.patientId) {
      const patientRef = String(req.query.patient || req.query.patientId);
      if (isUuid(patientRef)) {
        params.push(patientRef);
        where.push(`lo.patient_id = $${params.length}`);
      } else {
        params.push(patientRef);
        where.push(`pa.patient_id = $${params.length}`);
      }
    }
    if (req.query.queueEntryId) {
      params.push(String(req.query.queueEntryId));
      where.push(`lo.queue_entry_id = $${params.length}`);
    }
    if (req.query.search) {
      params.push(`%${req.query.search}%`);
      where.push(
        `(lo.order_number ILIKE $${params.length} OR lo.test_name ILIKE $${params.length} OR CONCAT(pa.first_name, ' ', pa.last_name) ILIKE $${params.length} OR pa.patient_id ILIKE $${params.length})`
      );
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const totalResult = await query(
      `SELECT COUNT(*)::int AS total FROM laboratory_orders lo LEFT JOIN patients pa ON pa.id = lo.patient_id ${whereClause}`,
      params
    );
    const total = totalResult.rows[0]?.total || 0;

    const itemsResult = await query(
      `${ORDER_SELECT} ${whereClause} ORDER BY lo.created_at DESC OFFSET $${params.length + 1} LIMIT $${params.length + 2}`,
      [...params, startIndex, limit]
    );

    res.json({
      success: true,
      count: itemsResult.rows.length,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit) || 1,
        totalTests: total,
        totalRecords: total,
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      data: itemsResult.rows.map(mapLabOrder),
    });
  } catch (err) {
    console.error('Laboratory list error:', err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid order id' });
    const row = await getOrderById(req.params.id);
    if (!row) return res.status(404).json({ success: false, error: 'Lab order not found' });
    res.json({ success: true, data: mapLabOrder(row) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.post(
  '/',
  protect,
  [body('patientId', 'patientId is required').not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    try {
      const patientId = await resolvePatientId(req.body.patientId);
      if (!patientId) return res.status(404).json({ success: false, error: 'Patient not found' });

      const incoming = Array.isArray(req.body.tests) && req.body.tests.length
        ? req.body.tests
        : [{ testName: req.body.testName, testCode: req.body.testCode, specimenType: req.body.specimenType || req.body.specimen }];

      const tests = incoming
        .map((t) => {
          const template = findTemplate(t.testCode || t.testName || t.code || t.name);
          const testName = t.testName || t.name || template?.name;
          if (!testName) return null;
          return {
            testName,
            testCode: t.testCode || t.code || template?.code || null,
            specimenType: t.specimenType || t.specimen || template?.specimenType || null,
          };
        })
        .filter(Boolean);

      if (!tests.length) {
        return res.status(400).json({ success: false, error: 'At least one laboratory test is required' });
      }

      // Resolve price catalog or default 800 KES per test
      const { billClinicalOrder } = require('../lib/clinicalBillingBridge');

      const created = [];
      for (const test of tests) {
        const orderNumber = await generateOrderNumber();
        const inserted = await query(
          `
          INSERT INTO laboratory_orders (
            order_number, patient_id, queue_entry_id, test_name, test_code, specimen_type,
            order_date, requested_by, status, notes, payment_status, created_by
          ) VALUES ($1,$2,$3,$4,$5,$6,CURRENT_DATE,$7,'Pending',$8,'Awaiting Cashier Payment',$7)
          RETURNING id
          `,
          [
            orderNumber,
            patientId,
            req.body.queueEntryId || null,
            test.testName,
            test.testCode,
            test.specimenType,
            req.user.id,
            req.body.notes || null,
          ]
        );
        const orderId = inserted.rows[0].id;

        // Auto-bill: create/append invoice and set correct payment_status
        const billingResult = await billClinicalOrder({
          patientId,
          department: 'Laboratory',
          orderId,
          orderNumber,
          items: [{ description: test.testName, quantity: 1, unitPrice: 800, amount: 800 }],
          notes: req.body.notes || '',
          createdBy: req.user.id,
        });

        if (billingResult) {
          // Update the order payment_status to what bridge determined (cash vs insurance)
          await query(
            `UPDATE laboratory_orders SET payment_status = $1 WHERE id = $2`,
            [billingResult.clinicalPaymentStatus, orderId]
          );
        }

        created.push(await getOrderById(orderId));
      }

      const mapped = created.map(mapLabOrder);
      res.status(201).json({ success: true, count: mapped.length, data: mapped.length === 1 ? mapped[0] : mapped });
    } catch (err) {
      console.error('Laboratory create error:', err);
      res.status(500).json({
        success: false,
        error: process.env.NODE_ENV === 'development' ? err.message : 'Server error',
      });
    }
  }
);

router.patch('/:id/status', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid order id' });
    const status = String(req.body.status || '');
    if (!STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }
    const existing = await getOrderById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Lab order not found' });

    await query(`UPDATE laboratory_orders SET status = $1, updated_at = NOW() WHERE id = $2`, [status, req.params.id]);
    res.json({ success: true, data: mapLabOrder(await getOrderById(req.params.id)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.patch('/:id/collect', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid order id' });
    const existing = await getOrderById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Lab order not found' });

    if (existing.payment_status === 'Awaiting Cashier Payment' && !req.body.emergencyOverride) {
      return res.status(402).json({
        success: false,
        error: 'Payment required: Patient must complete payment at Cashier Desk before specimen collection.',
      });
    }
    if (existing.payment_status === 'Awaiting Insurance Approval' && !req.body.emergencyOverride) {
      return res.status(402).json({
        success: false,
        error: 'Insurance pre-authorization required: Cashier must approve claim before specimen collection.',
      });
    }

    const condition = req.body?.specimenCondition;
    const additionalNotes = req.body?.notes;
    let newNotes = existing.notes || '';
    if (condition) newNotes = newNotes ? `${newNotes} | Specimen: ${condition}` : `Specimen: ${condition}`;
    if (additionalNotes) newNotes = newNotes ? `${newNotes} | ${additionalNotes}` : additionalNotes;

    await query(
      `
      UPDATE laboratory_orders
      SET status = 'Sample Received', collected_at = NOW(), collected_by = $1, notes = $2, updated_at = NOW()
      WHERE id = $3
      `,
      [req.user.id, newNotes, req.params.id]
    );
    res.json({ success: true, data: mapLabOrder(await getOrderById(req.params.id)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.patch('/:id/payment', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid order id' });
    const paymentStatus = String(req.body.paymentStatus || '');
    if (!PAYMENT_STATUSES.includes(paymentStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid payment status' });
    }
    const existing = await getOrderById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Lab order not found' });
    await query(
      `UPDATE laboratory_orders SET payment_status = $1, updated_at = NOW() WHERE id = $2`,
      [paymentStatus, req.params.id]
    );
    res.json({ success: true, data: mapLabOrder(await getOrderById(req.params.id)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id/results', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid order id' });
    const existing = await getOrderById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Lab order not found' });
    if (existing.payment_status === 'Unpaid') {
      return res.status(400).json({ success: false, error: 'Cannot result an unpaid lab order' });
    }

    const publish = Boolean(req.body.publish);
    const comments = req.body.comments || req.body.notes || '';
    const parameters = Array.isArray(req.body.parameters) ? req.body.parameters : [];
    const results = parameters.length ? flattenResults(parameters, comments) : req.body.results || {};
    if (comments && !results.comments) results.comments = comments;

    const status = publish ? 'Completed' : existing.status === 'Pending' ? 'Processing' : existing.status === 'Sample Received' ? 'Processing' : existing.status;
    const resultStatus = publish ? 'Final' : 'Draft';

    await query(
      `
      UPDATE laboratory_orders
      SET results = $1,
          notes = $2,
          status = $3,
          result_status = $4,
          analyzed_by = $5,
          resulted_at = CASE WHEN $6 THEN NOW() ELSE resulted_at END,
          updated_at = NOW()
      WHERE id = $7
      `,
      [JSON.stringify(results), comments || existing.notes, status, resultStatus, req.user.id, publish, req.params.id]
    );

    res.json({ success: true, data: mapLabOrder(await getOrderById(req.params.id)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    if (!isUuid(req.params.id)) return res.status(400).json({ success: false, error: 'Invalid order id' });
    const existing = await getOrderById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: 'Lab order not found' });

    const updates = [];
    const values = [];
    let i = 1;
    const fields = {
      testName: 'test_name',
      testCode: 'test_code',
      specimenType: 'specimen_type',
      specimen: 'specimen_type',
      status: 'status',
      notes: 'notes',
      results: 'results',
      paymentStatus: 'payment_status',
    };
    for (const [key, column] of Object.entries(fields)) {
      if (req.body[key] !== undefined) {
        updates.push(`${column} = $${i++}`);
        values.push(key === 'results' ? JSON.stringify(req.body[key]) : req.body[key]);
      }
    }
    if (updates.length === 0) {
      return res.json({ success: true, data: mapLabOrder(existing) });
    }
    values.push(req.params.id);
    await query(
      `UPDATE laboratory_orders SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${i}`,
      values
    );
    res.json({ success: true, data: mapLabOrder(await getOrderById(req.params.id)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

module.exports = router;
