/**
 * Seed script: Add demo medical records with vitals and history for risk scoring demo.
 * Run: node backend/scripts/seed-intelligence-demo.js
 */
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const seedMedicalRecords = async () => {
  console.log('🏥 Seeding demo intelligence data...\n');

  // Get existing patients
  const patientsResult = await pool.query(
    `SELECT id, patient_id, first_name, last_name FROM patients ORDER BY patient_id LIMIT 10`
  );
  const patients = patientsResult.rows;
  if (patients.length === 0) {
    console.log('No patients found. Run seed.js first.');
    process.exit(1);
  }
  console.log(`Found ${patients.length} patients.`);

  // Get doctor user for created_by
  const userResult = await pool.query(
    `SELECT id FROM users WHERE role IN ('doctor','super-admin') LIMIT 1`
  );
  const doctorId = userResult.rows[0]?.id;

  for (const patient of patients) {
    // Check existing records
    const existing = await pool.query(
      'SELECT id FROM medical_records WHERE patient_id = $1 LIMIT 1',
      [patient.id]
    );
    if (existing.rowCount > 0) {
      console.log(`  ⚠️  Medical records already exist for ${patient.first_name} — skipping`);
      continue;
    }

    // Create patient-specific data based on patient_id
    let vitalSigns, labResults, assessment, diagnosis;

    if (patient.patient_id === 'P001') {
      // Alice Johnson — HIGH risk: hypertension + tachycardia + diabetes
      vitalSigns = {
        blood_pressure_systolic: 165,
        blood_pressure_diastolic: 105,
        heart_rate: 112,
        respiratory_rate: 22,
        temperature: 38.8,
        spo2: 94,
        gcs: 14,
        weight: 78,
        height: 165
      };
      labResults = {
        hba1c: 9.2,
        blood_glucose: 18.5,
        creatinine: 1.8,
        wbc: 13.2,
        hemoglobin: 9.8
      };
      assessment = 'Poorly controlled hypertension with suspected end-organ involvement. Blood glucose markedly elevated. Requires urgent review.';
      diagnosis = { primary: 'Hypertensive urgency', secondary: ['Type 2 Diabetes Mellitus', 'Chronic Kidney Disease Stage 2'] };
    } else if (patient.patient_id === 'P002') {
      // Michael Brown — MODERATE risk: borderline vitals
      vitalSigns = {
        blood_pressure_systolic: 142,
        blood_pressure_diastolic: 90,
        heart_rate: 95,
        respiratory_rate: 18,
        temperature: 37.4,
        spo2: 97,
        gcs: 15,
        weight: 85,
        height: 180
      };
      labResults = {
        hba1c: 6.8,
        blood_glucose: 8.2,
        creatinine: 1.1,
        wbc: 9.1,
        hemoglobin: 13.2
      };
      assessment = 'Stage 1 hypertension, borderline blood glucose. Monitor closely.';
      diagnosis = { primary: 'Essential hypertension', secondary: ['Pre-diabetes'] };
    } else {
      // Other patients — LOW/MODERATE risk
      vitalSigns = {
        blood_pressure_systolic: 120 + Math.floor(Math.random() * 20),
        blood_pressure_diastolic: 78 + Math.floor(Math.random() * 10),
        heart_rate: 72 + Math.floor(Math.random() * 15),
        respiratory_rate: 16 + Math.floor(Math.random() * 4),
        temperature: 36.5 + Math.random() * 0.8,
        spo2: 97 + Math.floor(Math.random() * 3),
        gcs: 15,
        weight: 65 + Math.floor(Math.random() * 20),
        height: 160 + Math.floor(Math.random() * 20)
      };
      labResults = {
        blood_glucose: 5.0 + Math.random() * 2,
        creatinine: 0.8 + Math.random() * 0.4,
        wbc: 6.0 + Math.random() * 3,
        hemoglobin: 13.0 + Math.random() * 2
      };
      assessment = 'Routine review. Vitals stable.';
      diagnosis = { primary: 'Routine health check' };
    }

    await pool.query(
      `INSERT INTO medical_records
        (patient_id, visit_date, vital_signs, lab_results, assessment, diagnosis, treatment_plan, created_by)
       VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7)`,
      [
        patient.id,
        JSON.stringify(vitalSigns),
        JSON.stringify(labResults),
        assessment,
        JSON.stringify(diagnosis),
        'Follow up in 2 weeks. Medication review scheduled.',
        doctorId
      ]
    );
    console.log(`  ✓ Added medical record for ${patient.first_name} ${patient.last_name} (${patient.patient_id})`);
  }

  // Also seed P003 and P004 if they don't exist
  const newPatients = [
    {
      patientId: 'P003',
      firstName: 'Grace',
      lastName: 'Wanjiku',
      dateOfBirth: '1948-05-10',
      gender: 'Female',
      phone: '+254700000010',
      email: 'grace.wanjiku@email.com',
      bloodType: 'B+',
      vitalSigns: {
        blood_pressure_systolic: 185,
        blood_pressure_diastolic: 115,
        heart_rate: 125,
        respiratory_rate: 26,
        temperature: 39.2,
        spo2: 88,
        gcs: 12
      },
      labResults: {
        blood_glucose: 22.0,
        creatinine: 2.4,
        wbc: 15.8,
        hemoglobin: 8.2,
        hba1c: 11.5
      },
      assessment: 'CRITICAL: Hypertensive emergency with acute decompensation. Reduced consciousness. Immediate intervention required.',
      diagnosis: { primary: 'Hypertensive emergency', secondary: ['Type 2 Diabetes Mellitus', 'Acute Kidney Injury', 'Possible stroke'] }
    },
    {
      patientId: 'P004',
      firstName: 'David',
      lastName: 'Ochieng',
      dateOfBirth: '1995-11-20',
      gender: 'Male',
      phone: '+254700000011',
      email: 'david.ochieng@email.com',
      bloodType: 'O-',
      vitalSigns: {
        blood_pressure_systolic: 118,
        blood_pressure_diastolic: 76,
        heart_rate: 68,
        respiratory_rate: 14,
        temperature: 36.8,
        spo2: 99,
        gcs: 15
      },
      labResults: {
        blood_glucose: 4.8,
        creatinine: 0.9,
        wbc: 7.2,
        hemoglobin: 14.8
      },
      assessment: 'Healthy young adult. No significant findings.',
      diagnosis: { primary: 'Routine check-up' }
    }
  ];

  for (const p of newPatients) {
    const exists = await pool.query('SELECT id FROM patients WHERE patient_id = $1', [p.patientId]);
    if (exists.rowCount > 0) {
      console.log(`  ⚠️  ${p.patientId} already exists`);
      continue;
    }
    const inserted = await pool.query(
      `INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, email, blood_type, status, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'Active',$9) RETURNING id`,
      [p.patientId, p.firstName, p.lastName, p.dateOfBirth, p.gender, p.phone, p.email, p.bloodType, doctorId]
    );
    const newId = inserted.rows[0].id;
    await pool.query(
      `INSERT INTO medical_records (patient_id, visit_date, vital_signs, lab_results, assessment, diagnosis, treatment_plan, created_by)
       VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7)`,
      [newId, JSON.stringify(p.vitalSigns), JSON.stringify(p.labResults), p.assessment, JSON.stringify(p.diagnosis), 'As per clinical judgment.', doctorId]
    );
    console.log(`  ✓ Created ${p.firstName} ${p.lastName} (${p.patientId}) with medical record`);
  }

  console.log('\n✅ Intelligence demo data seeded successfully!');
  await pool.end();
};

seedMedicalRecords().catch((err) => {
  console.error('❌ Error:', err.message);
  pool.end();
  process.exit(1);
});
