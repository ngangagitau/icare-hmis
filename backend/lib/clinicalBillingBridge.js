const { query } = require('../db/pg');

async function generateInvoiceNumber() {
  const today = new Date();
  const prefix = `INV${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
  const result = await query(
    `SELECT COUNT(*)::int AS count FROM billing WHERE invoice_number LIKE $1`,
    [`${prefix}-%`]
  );
  return `${prefix}-${String((result.rows[0]?.count || 0) + 1).padStart(4, '0')}`;
}

/**
 * Creates or appends an invoice in billing when a clinical service/item is ordered.
 * Determines whether patient is Cash/M-Pesa or Insurance and sets initial payment_status accordingly.
 */
async function billClinicalOrder({
  patientId,
  department, // 'Laboratory' | 'Radiology' | 'Pharmacy' | 'Doctor' | 'Consultation'
  orderId,
  orderNumber,
  items = [], // [{ description, quantity, unitPrice, amount }]
  notes = '',
  createdBy,
}) {
  try {
    // 1. Fetch patient profile to check insurance status
    const pResult = await query(`SELECT id, first_name, last_name, insurance FROM patients WHERE id = $1`, [patientId]);
    const patient = pResult.rows[0];
    if (!patient) return null;

    const insurance = typeof patient.insurance === 'object' && patient.insurance !== null ? patient.insurance : null;
    const hasActiveInsurance = insurance && insurance.provider && (insurance.status === 'Active' || !insurance.status);

    const paymentMethod = hasActiveInsurance ? 'Insurance' : 'Cash';
    // If Cash/M-Pesa -> 'Awaiting Cashier Payment'; If Insurance -> 'Awaiting Insurance Approval'
    const clinicalPaymentStatus = hasActiveInsurance ? 'Awaiting Insurance Approval' : 'Awaiting Cashier Payment';
    const billingPaymentStatus = hasActiveInsurance ? 'Pending Approval' : 'Pending';

    let totalAmount = 0;
    const normalizedItems = items.map((it) => {
      const qty = Number(it.quantity || 1);
      const price = Number(it.unitPrice || it.rate || it.price || 0);
      const lineTotal = Number(it.amount || qty * price);
      totalAmount += lineTotal;
      return {
        description: it.description || it.name || it.testName || it.drug || `${department} Service`,
        quantity: qty,
        unitPrice: price,
        amount: lineTotal,
        department,
        orderId,
        orderNumber,
      };
    });

    if (totalAmount <= 0) {
      totalAmount = 500; // standard default charge if not set
      if (normalizedItems.length === 0) {
        normalizedItems.push({
          description: `${department} - ${orderNumber}`,
          quantity: 1,
          unitPrice: 500,
          amount: 500,
          department,
          orderId,
          orderNumber,
        });
      }
    }

    // 2. Check if patient has an existing open/pending unpaid invoice today
    const existingBillRes = await query(
      `SELECT * FROM billing
       WHERE patient_id = $1
         AND payment_status IN ('Pending', 'Pending Approval', 'Partial')
         AND invoice_date = CURRENT_DATE
       ORDER BY created_at DESC LIMIT 1`,
      [patientId]
    );

    let invoiceId;
    let invoiceNumber;

    const linkedEntry = {
      department,
      orderId,
      orderNumber,
      amount: totalAmount,
      status: clinicalPaymentStatus,
      date: new Date().toISOString(),
    };

    if (existingBillRes.rows.length > 0) {
      const existing = existingBillRes.rows[0];
      invoiceId = existing.id;
      invoiceNumber = existing.invoice_number;

      const currentItems = Array.isArray(existing.items) ? existing.items : [];
      const currentLinked = Array.isArray(existing.linked_orders) ? existing.linked_orders : [];

      const newItems = [...currentItems, ...normalizedItems];
      const newLinked = [...currentLinked, linkedEntry];

      const newTotal = Number(existing.amount_due || 0) + totalAmount;
      const newBalance = Number(existing.balance || 0) + totalAmount;

      await query(
        `UPDATE billing SET
          items = $1,
          linked_orders = $2,
          amount_due = $3,
          balance = $4,
          updated_at = NOW()
         WHERE id = $5`,
        [JSON.stringify(newItems), JSON.stringify(newLinked), newTotal, newBalance, invoiceId]
      );
    } else {
      invoiceNumber = await generateInvoiceNumber();
      const claim = hasActiveInsurance
        ? {
            provider: insurance.provider,
            memberNumber: insurance.memberNumber || '',
            status: 'Pending Approval',
            amountClaimed: totalAmount,
            requestedAt: new Date().toISOString(),
          }
        : null;

      const insertRes = await query(
        `INSERT INTO billing (
          patient_id, invoice_number, invoice_date, amount_due, items,
          payment_method, payment_status, balance, insurance_claim, linked_orders, created_by
        ) VALUES ($1,$2,CURRENT_DATE,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING id`,
        [
          patientId,
          invoiceNumber,
          totalAmount,
          JSON.stringify(normalizedItems),
          paymentMethod,
          billingPaymentStatus,
          totalAmount,
          claim ? JSON.stringify(claim) : null,
          JSON.stringify([linkedEntry]),
          createdBy || null,
        ]
      );
      invoiceId = insertRes.rows[0].id;
    }

    return {
      invoiceId,
      invoiceNumber,
      paymentMethod,
      clinicalPaymentStatus,
      billingPaymentStatus,
      hasActiveInsurance,
      totalAmount,
    };
  } catch (err) {
    console.error('Error in billClinicalOrder:', err);
    return null;
  }
}

/**
 * Called when an invoice is paid or insurance is approved.
 * Automatically synchronizes linked laboratory orders, radiology scans, and pharmacy prescriptions to 'Cleared'.
 */
async function clearLinkedClinicalOrders(billingId, clearedByUserId, approvalDetails = null) {
  try {
    const billRes = await query(`SELECT * FROM billing WHERE id = $1`, [billingId]);
    const bill = billRes.rows[0];
    if (!bill) return;

    const linked = Array.isArray(bill.linked_orders) ? bill.linked_orders : [];
    const updatedLinked = [];

    for (const item of linked) {
      if (item.department === 'Laboratory' && item.orderId) {
        await query(
          `UPDATE laboratory_orders
           SET payment_status = 'Cleared', updated_at = NOW()
           WHERE id = $1`,
          [item.orderId]
        );
      } else if (item.department === 'Radiology' && item.orderId) {
        await query(
          `UPDATE radiology_orders
           SET payment_status = 'Cleared',
               results = jsonb_set(COALESCE(results, '{}'::jsonb), '{paymentStatus}', '"Cleared"'),
               updated_at = NOW()
           WHERE id = $1`,
          [item.orderId]
        );
      } else if (item.department === 'Pharmacy' && item.orderId) {
        await query(
          `UPDATE prescriptions
           SET payment_status = 'Cleared', updated_at = NOW()
           WHERE id = $1`,
          [item.orderId]
        );
      }
      updatedLinked.push({ ...item, status: 'Cleared', clearedAt: new Date().toISOString() });
    }

    // Also scan items array if any item has orderId
    const items = Array.isArray(bill.items) ? bill.items : [];
    for (const it of items) {
      if (it.department === 'Laboratory' && it.orderId) {
        await query(`UPDATE laboratory_orders SET payment_status = 'Cleared' WHERE id = $1`, [it.orderId]);
      } else if (it.department === 'Radiology' && it.orderId) {
        await query(
          `UPDATE radiology_orders SET payment_status = 'Cleared', results = jsonb_set(COALESCE(results, '{}'::jsonb), '{paymentStatus}', '"Cleared"') WHERE id = $1`,
          [it.orderId]
        );
      } else if (it.department === 'Pharmacy' && it.orderId) {
        await query(`UPDATE prescriptions SET payment_status = 'Cleared' WHERE id = $1`, [it.orderId]);
      }
    }

    // Update billing with cleared status
    await query(
      `UPDATE billing SET
        linked_orders = $1,
        updated_at = NOW()
       WHERE id = $2`,
      [JSON.stringify(updatedLinked), billingId]
    );

    console.log(`✓ Synchronized and cleared clinical orders linked to invoice ${bill.invoice_number}`);
  } catch (err) {
    console.error('Error clearing linked clinical orders:', err);
  }
}

module.exports = {
  billClinicalOrder,
  clearLinkedClinicalOrders,
};
