const dotenv = require('dotenv');
const { Pool } = require('pg');
const { savePatientRiskAssessment } = require('../services/clinicalRiskEngine');

dotenv.config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  console.log('🌱 Starting Intelligence Features Data Seeding...');
  const client = await pool.connect();

  try {
    // 1. Get or create a doctor/admin user for creation logs
    const userRes = await client.query(`SELECT id FROM users WHERE role IN ('doctor', 'super-admin') LIMIT 1`);
    const doctorId = userRes.rows[0]?.id;

    // 2. Ensure test patients P003 (Critical elderly), P004 (Moderate), P005 (Low risk)
    const extraPatients = [
      {
        patientId: 'P003',
        firstName: 'Robert',
        lastName: 'Mwangi',
        dob: '1948-06-12', // 78 yrs old
        gender: 'Male',
        phone: '+254711223344',
        bloodType: 'B+',
      },
      {
        patientId: 'P004',
        firstName: 'Grace',
        lastName: 'Achieng',
        dob: '1962-11-04', // 63 yrs old
        gender: 'Female',
        phone: '+254722334455',
        bloodType: 'O+',
      },
      {
        patientId: 'P005',
        firstName: 'Daniel',
        lastName: 'Kiprono',
        dob: '1998-04-20', // 28 yrs old
        gender: 'Male',
        phone: '+254733445566',
        bloodType: 'A+',
      },
    ];

    for (const p of extraPatients) {
      await client.query(
        `INSERT INTO patients (patient_id, first_name, last_name, date_of_birth, gender, phone, blood_type, status, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'Active', $8)
         ON CONFLICT (patient_id) DO UPDATE
         SET first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name`,
        [p.patientId, p.firstName, p.lastName, p.dob, p.gender, p.phone, p.bloodType, doctorId]
      );
    }
    console.log('✓ Patients P003, P004, P005 ensured');

    // Retrieve all patients with internal UUID
    const pts = await client.query(`SELECT id, patient_id, first_name, last_name FROM patients`);
    const ptMap = {};
    for (const row of pts.rows) {
      ptMap[row.patient_id] = row;
    }

    // 3. Insert realistic medical records with vital signs, diagnosis (JSONB) & labs
    // P003: Critical - severe hypertension, hypoxia, tachycardia, tachypnea, fever, COPD
    if (ptMap['P003']) {
      await client.query(
        `INSERT INTO medical_records (patient_id, visit_date, vital_signs, assessment, diagnosis, lab_results, created_by)
         VALUES ($1, NOW(), $2, $3, $4, $5, $6)`,
        [
          ptMap['P003'].id,
          JSON.stringify({
            bloodPressure: '195/115',
            heartRate: 128,
            temperature: 39.2,
            oxygenSaturation: 87,
            respiratoryRate: 29
          }),
          'Patient presents in acute respiratory distress, cyanotic lips, bilateral wheezing.',
          JSON.stringify([
            'Acute exacerbation of COPD',
            'Hypertensive crisis',
            'Severe Sepsis secondary to pneumonia'
          ]),
          JSON.stringify({
            potassium: 6.2,
            lactate: 4.8,
            whiteBloodCellCount: 18.5,
            hemoglobin: 8.2
          }),
          doctorId
        ]
      );
    }

    // P001: Alice Johnson - High risk (Fever, Tachycardia, Diabetic Ketoacidosis concern)
    if (ptMap['P001']) {
      await client.query(
        `INSERT INTO medical_records (patient_id, visit_date, vital_signs, assessment, diagnosis, lab_results, created_by)
         VALUES ($1, NOW(), $2, $3, $4, $5, $6)`,
        [
          ptMap['P001'].id,
          JSON.stringify({
            bloodPressure: '155/98',
            heartRate: 112,
            temperature: 38.7,
            oxygenSaturation: 93,
            respiratoryRate: 23
          }),
          'Patient febrile, lethargic with persistent vomiting and polyuria.',
          JSON.stringify([
            'Type 2 Diabetes Mellitus with uncontrolled hyperglycemia',
            'Acute Pyelonephritis'
          ]),
          JSON.stringify({
            bloodGlucose: 19.8,
            creatinine: 180,
            whiteBloodCellCount: 14.2
          }),
          doctorId
        ]
      );
    }

    // P004: Grace Achieng - Moderate risk (Hypertension, moderate tachycardia)
    if (ptMap['P004']) {
      await client.query(
        `INSERT INTO medical_records (patient_id, visit_date, vital_signs, assessment, diagnosis, lab_results, created_by)
         VALUES ($1, NOW(), $2, $3, $4, $5, $6)`,
        [
          ptMap['P004'].id,
          JSON.stringify({
            bloodPressure: '148/92',
            heartRate: 98,
            temperature: 37.4,
            oxygenSaturation: 95,
            respiratoryRate: 19
          }),
          'Routine review for essential hypertension and osteoarthritis.',
          JSON.stringify([
            'Hypertension Stage 2',
            'Osteoarthritis'
          ]),
          JSON.stringify({
            creatinine: 95,
            cholesterol: 5.8
          }),
          doctorId
        ]
      );
    }

    // P005: Daniel Kiprono - Low risk (Young, stable vitals)
    if (ptMap['P005']) {
      await client.query(
        `INSERT INTO medical_records (patient_id, visit_date, vital_signs, assessment, diagnosis, lab_results, created_by)
         VALUES ($1, NOW(), $2, $3, $4, $5, $6)`,
        [
          ptMap['P005'].id,
          JSON.stringify({
            bloodPressure: '118/78',
            heartRate: 72,
            temperature: 36.8,
            oxygenSaturation: 99,
            respiratoryRate: 16
          }),
          'Mild tension headache after prolonged screen time. Clear neurological exam.',
          JSON.stringify(['Tension-type headache']),
          JSON.stringify({}),
          doctorId
        ]
      );
    }
    console.log('✓ Medical records with vital signs & lab results populated');

    // 4. Run risk evaluations & persist assessments + clinical alerts
    for (const pid of ['P003', 'P001', 'P004', 'P005']) {
      if (ptMap[pid]) {
        const assessment = await savePatientRiskAssessment(ptMap[pid].id, doctorId);
        console.log(`  ✓ Assessed ${pid} (${ptMap[pid].first_name}): Score ${assessment.score}/100 [${assessment.riskLevel}]`);
      }
    }

    // 5. Populate Active Queue Entries across OPD, Triage, Doctor, Lab, Pharmacy
    // Clear existing Waiting queue entries to avoid clutter
    await client.query(`DELETE FROM queue_entries WHERE status = 'Waiting'`);

    const sampleQueue = [
      {
        patient: ptMap['P003'],
        department: 'doctor',
        priority: 'Emergency',
        complaint: 'Severe shortness of breath, high fever, chest tightness',
        service: 'Emergency Medical Care',
        waitOffsetMinutes: 15,
      },
      {
        patient: ptMap['P001'],
        department: 'triage',
        priority: 'Urgent',
        complaint: 'High fever, dizziness, elevated glucose',
        service: 'Triage Evaluation',
        waitOffsetMinutes: 35, // 35 mins (warning wait)
      },
      {
        patient: ptMap['P004'],
        department: 'opd',
        priority: 'Normal',
        complaint: 'Routine blood pressure review & prescription refill',
        service: 'Outpatient Consultation',
        waitOffsetMinutes: 55, // 55 mins (long wait in OPD)
      },
      {
        patient: ptMap['P005'],
        department: 'pharmacy',
        priority: 'Normal',
        complaint: 'Pain relief prescription collection',
        service: 'Pharmacy Dispensing',
        waitOffsetMinutes: 22,
      },
      {
        patient: ptMap['P002'],
        department: 'lab',
        priority: 'Normal',
        complaint: 'Routine lipid panel check',
        service: 'Phlebotomy & Sample Collection',
        waitOffsetMinutes: 45, // 45 mins (long wait in Lab)
      },
    ];

    let ticketNum = 100;
    for (const q of sampleQueue) {
      if (!q.patient) continue;
      ticketNum++;
      const ticket = `${q.department.toUpperCase().substring(0, 3)}-${ticketNum}`;
      await client.query(
        `INSERT INTO queue_entries (
           ticket_number, patient_id, patient_display_id, patient_name,
           department, priority, status, complaint, service_name,
           queued_at, created_by
         )
         VALUES ($1, $2, $3, $4, $5, $6, 'Waiting', $7, $8, NOW() - ($9 || ' minutes')::INTERVAL, $10)`,
        [
          ticket,
          q.patient.id,
          q.patient.patient_id,
          `${q.patient.first_name} ${q.patient.last_name}`,
          q.department,
          q.priority,
          q.complaint,
          q.service,
          q.waitOffsetMinutes.toString(),
          doctorId,
        ]
      );
    }
    console.log('✓ Active Queue Entries inserted across departments');

    console.log('\n🎉 Intelligence Seeding Complete!');
  } catch (err) {
    console.error('Error seeding intelligence data:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
