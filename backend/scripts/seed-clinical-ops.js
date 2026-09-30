const dotenv = require('dotenv');
const { query } = require('../db/pg');

dotenv.config();

async function seedClinicalOps() {
  console.log('🏥 Starting clinical ops data seed for Billing, Lab, Radiology, and Pharmacy...');

  // 1. Get or create staff users
  const adminRes = await query(`SELECT id FROM users WHERE role = 'super-admin' LIMIT 1`);
  const adminId = adminRes.rows[0]?.id || null;

  // 2. Ensure Patients exist
  const patientsData = [
    { pid: 'P-1001', first: 'Jane', last: 'Wanjiku', dob: '1988-04-12', gender: 'Female', phone: '+254711223344', insurance: { provider: 'SHA', memberNumber: 'SHA-8834921', status: 'Active' } },
    { pid: 'P-1002', first: 'John', last: 'Kamau', dob: '1975-09-20', gender: 'Male', phone: '+254722334455', insurance: null },
    { pid: 'P-1003', first: 'Grace', last: 'Muthoni', dob: '1992-11-05', gender: 'Female', phone: '+254733445566', insurance: { provider: 'Jubilee', memberNumber: 'JUB-55421', status: 'Active' } },
    { pid: 'P-1004', first: 'Samuel', last: 'Otieno', dob: '1983-01-30', gender: 'Male', phone: '+254744556677', insurance: { provider: 'AAR', memberNumber: 'AAR-99382', status: 'Active' } },
    { pid: 'P-1005', first: 'Mary', last: 'Achieng', dob: '1996-06-18', gender: 'Female', phone: '+254755667788', insurance: null },
    { pid: 'P-1006', first: 'Peter', last: 'Odhiambo', dob: '1968-12-14', gender: 'Male', phone: '+254766778899', insurance: { provider: 'Madison', memberNumber: 'MAD-34190', status: 'Active' } },
    { pid: 'P-1007', first: 'Faith', last: 'Wambui', dob: '2001-08-25', gender: 'Female', phone: '+254777889900', insurance: { provider: 'SHA', memberNumber: 'SHA-7729103', status: 'Active' } },
  ];

  const patientMap = {};
  for (const p of patientsData) {
    const existing = await query(`SELECT id FROM patients WHERE patient_id = $1`, [p.pid]);
    if (existing.rows[0]) {
      patientMap[p.pid] = existing.rows[0].id;
      await query(`UPDATE patients SET insurance = $1 WHERE id = $2`, [p.insurance ? JSON.stringify(p.insurance) : null, existing.rows[0].id]);
    } else {
      const ins = await query(
        `INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, insurance, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'Active', $8) RETURNING id`,
        [p.pid, p.first, p.last, p.dob, p.gender, p.phone, p.insurance ? JSON.stringify(p.insurance) : null, adminId]
      );
      patientMap[p.pid] = ins.rows[0].id;
    }
  }
  console.log(`✓ Patients seeded / verified (${Object.keys(patientMap).length} patients)`);

  // 3. Seed Pharmacy Inventory
  const medicines = [
    { name: 'Amoxicillin 500mg Capsules', code: 'MED-001', cat: 'Antibiotics', type: 'Medication', qty: 1200, reorder: 300, price: 25.00, batch: 'AMX-2026-A', expiry: '2027-08-31' },
    { name: 'Paracetamol 500mg Tablets', code: 'MED-002', cat: 'Analgesics', type: 'Medication', qty: 3500, reorder: 500, price: 5.00, batch: 'PCM-2026-04', expiry: '2028-01-15' },
    { name: 'Metformin 500mg Tablets', code: 'MED-003', cat: 'Antidiabetics', type: 'Medication', qty: 140, reorder: 300, price: 15.00, batch: 'MET-2025-11', expiry: '2026-12-10' },
    { name: 'Amlodipine 5mg Tablets', code: 'MED-004', cat: 'Antihypertensives', type: 'Medication', qty: 45, reorder: 200, price: 20.00, batch: 'AML-2026-02', expiry: '2027-04-20' },
    { name: 'Omeprazole 20mg Capsules', code: 'MED-005', cat: 'Gastrointestinal', type: 'Medication', qty: 650, reorder: 200, price: 30.00, batch: 'OMP-2025-09', expiry: '2026-10-30' },
    { name: 'Ceftriaxone 1g Injection', code: 'MED-006', cat: 'Antibiotics', type: 'Injectable', qty: 180, reorder: 100, price: 450.00, batch: 'CFT-2026-03', expiry: '2027-11-20' },
    { name: 'Salbutamol Inhaler 100mcg', code: 'MED-007', cat: 'Respiratory', type: 'Inhaler', qty: 12, reorder: 50, price: 550.00, batch: 'SLB-2025-05', expiry: '2026-10-15' },
    { name: 'Diclofenac Sodium 50mg Tablets', code: 'MED-008', cat: 'NSAIDs', type: 'Medication', qty: 800, reorder: 200, price: 12.00, batch: 'DIC-2026-07', expiry: '2027-09-01' },
    { name: 'Ciprofloxacin 500mg Tablets', code: 'MED-009', cat: 'Antibiotics', type: 'Medication', qty: 450, reorder: 150, price: 40.00, batch: 'CIP-2026-01', expiry: '2027-06-30' },
    { name: 'Insulin Glargine 100 IU/ml', code: 'MED-010', cat: 'Antidiabetics', type: 'Cold Chain', qty: 25, reorder: 40, price: 1800.00, batch: 'INS-2025-12', expiry: '2026-11-05' },
    { name: 'Normal Saline 0.9% 500ml IV', code: 'MED-011', cat: 'IV Fluids', type: 'Infusion', qty: 400, reorder: 150, price: 200.00, batch: 'NS-2026-06', expiry: '2028-05-30' },
    { name: 'Oral Rehydration Salts (ORS)', code: 'MED-012', cat: 'Electrolytes', type: 'Sachet', qty: 900, reorder: 200, price: 35.00, batch: 'ORS-2026-02', expiry: '2027-12-31' },
  ];

  for (const m of medicines) {
    const existing = await query(`SELECT id FROM inventory WHERE item_code = $1`, [m.code]);
    if (!existing.rows[0]) {
      await query(
        `INSERT INTO inventory (item_name, item_code, item_type, category, quantity_in_stock, reorder_level, reorder_quantity, unit_price, total_value, batch_number, expiry_date, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Active', $12)`,
        [m.name, m.code, m.type, m.cat, m.qty, m.reorder, m.reorder * 2, m.price, m.qty * m.price, m.batch, m.expiry, adminId]
      );
    }
  }
  console.log(`✓ Pharmacy inventory items verified`);

  // 4. Seed Prescriptions
  const rxCount = await query(`SELECT count(*)::int AS count FROM prescriptions`);
  if ((rxCount.rows[0]?.count || 0) === 0) {
    const prescriptions = [
      {
        pid: 'P-1001',
        rxNumber: 'RX20260930-0001',
        status: 'Pending',
        items: [
          { drug: 'Amoxicillin 500mg Capsules', dosage: '500mg', frequency: 'Three times daily (TDS)', duration: '7 days', quantity: 21, instructions: 'Take after meals' },
          { drug: 'Paracetamol 500mg Tablets', dosage: '1g', frequency: 'Three times daily PRN', duration: '5 days', quantity: 15, instructions: 'For fever or pain' },
        ],
        notes: 'Upper respiratory tract infection. Monitor for penicillin sensitivity.',
      },
      {
        pid: 'P-1002',
        rxNumber: 'RX20260930-0002',
        status: 'Ready',
        items: [
          { drug: 'Metformin 500mg Tablets', dosage: '500mg', frequency: 'Twice daily with meals', duration: '30 days', quantity: 60, instructions: 'Strict compliance required' },
          { drug: 'Amlodipine 5mg Tablets', dosage: '5mg', frequency: 'Once daily morning', duration: '30 days', quantity: 30, instructions: 'Monitor BP daily' },
        ],
        notes: 'Routine hypertension and diabetes management refilling.',
      },
      {
        pid: 'P-1003',
        rxNumber: 'RX20260930-0003',
        status: 'Dispensed',
        items: [
          { drug: 'Omeprazole 20mg Capsules', dosage: '20mg', frequency: 'Once daily before breakfast', duration: '14 days', quantity: 14, instructions: 'Take 30 mins before food' },
        ],
        notes: 'Suspected gastritis / peptic ulcer symptoms.',
      },
    ];

    for (const r of prescriptions) {
      if (patientMap[r.pid]) {
        await query(
          `INSERT INTO prescriptions (prescription_number, patient_id, doctor_id, items, notes, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW() - interval '2 hours')`,
          [r.rxNumber, patientMap[r.pid], adminId, JSON.stringify(r.items), r.notes, r.status]
        );
      }
    }
    console.log(`✓ Prescriptions seeded`);
  }

  // 5. Seed Laboratory Orders
  const labCount = await query(`SELECT count(*)::int AS count FROM laboratory_orders`);
  if ((labCount.rows[0]?.count || 0) === 0) {
    const labOrders = [
      {
        pid: 'P-1001',
        orderNum: 'LAB20260930-0001',
        testName: 'Complete Blood Count (CBC)',
        testCode: 'CBC',
        specimen: 'Whole Blood (EDTA)',
        status: 'Completed',
        payStatus: 'Cleared',
        results: {
          parameters: [
            { key: 'wbc', label: 'WBC (White Blood Cells)', value: '11.8', ref: '4.0 - 11.0', flag: 'High' },
            { key: 'rbc', label: 'RBC (Red Blood Cells)', value: '4.6', ref: '3.8 - 5.2', flag: 'Normal' },
            { key: 'hb', label: 'Hemoglobin (Hb)', value: '13.5', ref: '12.0 - 16.0', flag: 'Normal' },
            { key: 'plt', label: 'Platelets', value: '280', ref: '150 - 450', flag: 'Normal' },
          ],
          comments: 'Mild leukocytosis consistent with recent acute upper respiratory infection.',
          publish: true,
        },
      },
      {
        pid: 'P-1002',
        orderNum: 'LAB20260930-0002',
        testName: 'Fasting Blood Sugar & HbA1c',
        testCode: 'FBS',
        specimen: 'Fluoride Plasma',
        status: 'Processing',
        payStatus: 'Cleared',
        results: {},
      },
      {
        pid: 'P-1004',
        orderNum: 'LAB20260930-0003',
        testName: 'Lipid Profile',
        testCode: 'LIPID',
        specimen: 'Serum (SST Gel)',
        status: 'Sample Received',
        payStatus: 'Cleared',
        results: {},
      },
      {
        pid: 'P-1005',
        orderNum: 'LAB20260930-0004',
        testName: 'Urinalysis (Routine)',
        testCode: 'URINE',
        specimen: 'Clean Catch Midstream Urine',
        status: 'Pending',
        payStatus: 'Unpaid',
        results: {},
      },
    ];

    for (const l of labOrders) {
      if (patientMap[l.pid]) {
        await query(
          `INSERT INTO laboratory_orders (
            order_number, patient_id, test_name, test_code, specimen_type, order_date, requested_by, status, results, payment_status, created_by
          ) VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7, $8, $9, $6)`,
          [l.orderNum, patientMap[l.pid], l.testName, l.testCode, l.specimen, adminId, l.status, JSON.stringify(l.results), l.payStatus]
        );
      }
    }
    console.log(`✓ Laboratory orders seeded`);
  }

  // 6. Seed Radiology Orders
  const radCount = await query(`SELECT count(*)::int AS count FROM radiology_orders`);
  if ((radCount.rows[0]?.count || 0) === 0) {
    const radOrders = [
      {
        pid: 'P-1001',
        orderNum: 'RAD20260930-0001',
        modality: 'X-Ray',
        imagingType: 'Chest X-Ray PA & Lateral',
        status: 'Completed',
        results: {
          urgency: 'Routine',
          bodyPart: 'Chest',
          technique: 'PA and lateral upright projections of the chest.',
          clinicalIndication: 'Cough, mild chest discomfort for 4 days.',
          findings: 'Lungs are clear with no focal consolidation, pleural effusion, or pneumothorax. Cardiothoracic ratio is normal (<0.5). Mediastinum and hilar contours are unremarkable. Bony thorax and soft tissues intact.',
          impression: 'No acute cardiopulmonary disease. Normal study.',
          recommendations: 'Symptomatic medical management.',
          radiologistName: 'Dr. Sarah Wambui, MD (Consultant Radiologist)',
          paymentStatus: 'Cleared',
          paymentAmount: 2500,
          paymentMethod: 'SHA Insurance',
          images: [
            'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
          ],
        },
      },
      {
        pid: 'P-1003',
        orderNum: 'RAD20260930-0002',
        modality: 'Ultrasound',
        imagingType: 'Abdominal Ultrasound',
        status: 'In Progress',
        results: {
          urgency: 'Urgent',
          bodyPart: 'Abdomen & Pelvis',
          clinicalIndication: 'Right upper quadrant abdominal pain, dyspepsia.',
          technicianName: 'Technician Evans Mwangi',
          paymentStatus: 'Cleared',
          paymentAmount: 4500,
          paymentMethod: 'Jubilee Insurance',
        },
      },
      {
        pid: 'P-1004',
        orderNum: 'RAD20260930-0003',
        modality: 'CT Scan',
        imagingType: 'CT Head (Non-Contrast)',
        status: 'Pending',
        results: {
          urgency: 'STAT',
          bodyPart: 'Head / Brain',
          clinicalIndication: 'Severe persistent headache, rule out intracranial bleed.',
          paymentStatus: 'Cleared',
          paymentAmount: 14000,
          paymentMethod: 'AAR Insurance',
        },
      },
      {
        pid: 'P-1005',
        orderNum: 'RAD20260930-0004',
        modality: 'MRI',
        imagingType: 'MRI Lumbar Spine',
        status: 'Pending',
        results: {
          urgency: 'Routine',
          bodyPart: 'Lumbar Spine',
          clinicalIndication: 'Chronic lower back pain with right radiculopathy.',
          paymentStatus: 'Unpaid',
          paymentAmount: 28000,
          paymentMethod: 'Cash',
        },
      },
    ];

    for (const r of radOrders) {
      if (patientMap[r.pid]) {
        await query(
          `INSERT INTO radiology_orders (
            order_number, patient_id, imaging_type, modality, order_date, requested_by, status, results, radiologist_notes, created_by
          ) VALUES ($1, $2, $3, $4, CURRENT_DATE, $5, $6, $7, $8, $5)`,
          [r.orderNum, patientMap[r.pid], r.imagingType, r.modality, adminId, r.status, JSON.stringify(r.results), r.results.findings || null]
        );
      }
    }
    console.log(`✓ Radiology orders seeded`);
  }

  // 7. Seed Billing Invoices & Receipts
  const billCount = await query(`SELECT count(*)::int AS count FROM billing`);
  if ((billCount.rows[0]?.count || 0) === 0) {
    const bills = [
      {
        pid: 'P-1001',
        invNum: 'INV20260930-0001',
        date: new Date().toISOString().slice(0, 10),
        items: [
          { description: 'General Consultation - Medical Officer', category: 'Consultation', quantity: 1, unitPrice: 1500, amount: 1500 },
          { description: 'Complete Blood Count (CBC)', category: 'Laboratory', quantity: 1, unitPrice: 1200, amount: 1200 },
          { description: 'Chest X-Ray PA View', category: 'Radiology', quantity: 1, unitPrice: 2500, amount: 2500 },
          { description: 'Amoxicillin 500mg Caps x21', category: 'Pharmacy', quantity: 1, unitPrice: 525, amount: 525 },
        ],
        total: 5725,
        paid: 5725,
        balance: 0,
        status: 'Paid',
        method: 'Insurance',
        claim: {
          provider: 'SHA',
          memberNumber: 'SHA-8834921',
          preAuthCode: 'AUTH-SHA-2026-9921',
          claimNumber: 'CLM-20260930-01',
          amountClaimed: 5725,
          status: 'Approved',
        },
        history: [
          { receiptNumber: 'RCT20260930-0001', amount: 5725, method: 'Insurance', reference: 'AUTH-SHA-2026-9921', date: new Date().toISOString(), cashierName: 'Cashier Mary W.' },
        ],
      },
      {
        pid: 'P-1002',
        invNum: 'INV20260930-0002',
        date: new Date().toISOString().slice(0, 10),
        items: [
          { description: 'Physician Follow-up Consultation', category: 'Consultation', quantity: 1, unitPrice: 2000, amount: 2000 },
          { description: 'Fasting Blood Sugar Test', category: 'Laboratory', quantity: 1, unitPrice: 800, amount: 800 },
          { description: 'HbA1c Glycated Hemoglobin', category: 'Laboratory', quantity: 1, unitPrice: 2200, amount: 2200 },
          { description: 'Metformin 500mg x60', category: 'Pharmacy', quantity: 1, unitPrice: 900, amount: 900 },
        ],
        total: 5900,
        paid: 3000,
        balance: 2900,
        status: 'Partial',
        method: 'M-Pesa',
        claim: null,
        history: [
          { receiptNumber: 'RCT20260930-0002', amount: 3000, method: 'M-Pesa', reference: 'QKR983HX12', date: new Date().toISOString(), cashierName: 'Cashier John D.' },
        ],
      },
      {
        pid: 'P-1004',
        invNum: 'INV20260930-0003',
        date: new Date().toISOString().slice(0, 10),
        items: [
          { description: 'Emergency Room Triage & Assessment', category: 'Procedure', quantity: 1, unitPrice: 3500, amount: 3500 },
          { description: 'CT Scan Head (Non-Contrast)', category: 'Radiology', quantity: 1, unitPrice: 14000, amount: 14000 },
          { description: 'Lipid Profile Screen', category: 'Laboratory', quantity: 1, unitPrice: 2800, amount: 2800 },
        ],
        total: 20300,
        paid: 0,
        balance: 20300,
        status: 'Pending',
        method: 'Insurance',
        claim: {
          provider: 'AAR Health',
          memberNumber: 'AAR-99382',
          preAuthCode: 'AAR-PRE-8842',
          claimNumber: 'CLM-20260930-02',
          amountClaimed: 20300,
          status: 'Submitted',
        },
        history: [],
      },
      {
        pid: 'P-1005',
        invNum: 'INV20260930-0004',
        date: new Date().toISOString().slice(0, 10),
        items: [
          { description: 'Orthopedic Specialist Consultation', category: 'Consultation', quantity: 1, unitPrice: 3000, amount: 3000 },
          { description: 'Urinalysis Routine', category: 'Laboratory', quantity: 1, unitPrice: 600, amount: 600 },
          { description: 'MRI Lumbar Spine Scan', category: 'Radiology', quantity: 1, unitPrice: 28000, amount: 28000 },
        ],
        total: 31600,
        paid: 3000,
        balance: 28600,
        status: 'Partial',
        method: 'Cash',
        claim: null,
        history: [
          { receiptNumber: 'RCT20260930-0003', amount: 3000, method: 'Cash', reference: 'CASH-REC-101', date: new Date().toISOString(), cashierName: 'Cashier Mary W.' },
        ],
      },
      {
        pid: 'P-1006',
        invNum: 'INV20260930-0005',
        date: new Date().toISOString().slice(0, 10),
        items: [
          { description: 'Cardiology Consultation', category: 'Consultation', quantity: 1, unitPrice: 4000, amount: 4000 },
          { description: 'Echocardiogram 2D Doppler', category: 'Radiology', quantity: 1, unitPrice: 8500, amount: 8500 },
        ],
        total: 12500,
        paid: 12500,
        balance: 0,
        status: 'Paid',
        method: 'Credit Card',
        claim: null,
        history: [
          { receiptNumber: 'RCT20260930-0004', amount: 12500, method: 'Credit Card', reference: 'VISA-AUTH-9941', date: new Date().toISOString(), cashierName: 'Cashier John D.' },
        ],
      },
    ];

    for (const b of bills) {
      if (patientMap[b.pid]) {
        await query(
          `INSERT INTO billing (
            patient_id, invoice_number, invoice_date, amount_due, items, payment_method,
            payment_status, payment_history, insurance_claim, balance, created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            patientMap[b.pid],
            b.invNum,
            b.date,
            b.total,
            JSON.stringify(b.items),
            b.method,
            b.status,
            JSON.stringify(b.history),
            b.claim ? JSON.stringify(b.claim) : null,
            b.balance,
            adminId,
          ]
        );
      }
    }
    console.log(`✓ Billing invoices and receipts seeded`);
  }

  console.log('🎉 Clinical ops seed complete!');
}

seedClinicalOps()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed error:', err);
    process.exit(1);
  });
