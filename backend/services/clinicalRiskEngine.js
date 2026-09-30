/**
 * iCare HMIS - Deterministic Clinical Risk Scoring Engine
 * 
 * IMPORTANT MEDICAL SAFETY SPECIFICATION:
 * - Numerical risk scores (0-100) are generated EXCLUSIVELY by deterministic clinical algorithms.
 * - Score levels: LOW (0-39), MODERATE (40-59), HIGH (60-79), CRITICAL (80-100).
 * - All contributing factors are explainable and returned with specific point values.
 * - Do NOT present risk scores as a definitive medical diagnosis.
 */

const { query } = require('../db/pg');

const isUuid = (value) => /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(String(value || ''));

async function resolvePatientId(patientRef) {
  const result = await query(
    isUuid(patientRef)
      ? 'SELECT id FROM patients WHERE id = $1'
      : 'SELECT id FROM patients WHERE patient_id = $1',
    [patientRef]
  );
  if (!result.rows[0]) throw new Error('Patient not found');
  return result.rows[0].id;
}

const RISK_LEVELS = {
  LOW: { label: 'LOW', min: 0, max: 39, color: 'emerald' },
  MODERATE: { label: 'MODERATE', min: 40, max: 59, color: 'amber' },
  HIGH: { label: 'HIGH', min: 60, max: 79, color: 'orange' },
  CRITICAL: { label: 'CRITICAL', min: 80, max: 100, color: 'rose' },
};

function determineRiskLevel(score) {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MODERATE';
  return 'LOW';
}

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Pure calculation function for risk scoring
 */
function evaluatePatientRisk({
  patient = {},
  vitalSigns = {},
  medicalHistory = [],
  labResults = [],
  previousAssessments = [],
}) {
  const factors = [];
  const generatedAlerts = [];
  let vitalsPoints = 0;

  // --- 1. Vital Signs Evaluation (Cap: 45 pts) ---
  const bpSystolic = Number(vitalSigns.systolic || vitalSigns.bp_systolic || (typeof vitalSigns.bloodPressure === 'string' && vitalSigns.bloodPressure.split('/')[0]) || 0);
  const bpDiastolic = Number(vitalSigns.diastolic || vitalSigns.bp_diastolic || (typeof vitalSigns.bloodPressure === 'string' && vitalSigns.bloodPressure.split('/')[1]) || 0);
  const heartRate = Number(vitalSigns.heartRate || vitalSigns.heart_rate || vitalSigns.pulse || 0);
  const spO2 = Number(vitalSigns.spO2 || vitalSigns.oxygen_saturation || vitalSigns.spo2 || 0);
  const temperature = Number(vitalSigns.temperature || vitalSigns.temp || 0);
  const respiratoryRate = Number(vitalSigns.respiratoryRate || vitalSigns.respiratory_rate || vitalSigns.rr || 0);

  // Blood Pressure
  if (bpSystolic >= 180 || bpDiastolic >= 110 || (bpSystolic > 0 && bpSystolic <= 90) || (bpDiastolic > 0 && bpDiastolic <= 50)) {
    const isHypotension = bpSystolic <= 90 || bpDiastolic <= 50;
    const pts = isHypotension ? 22 : 25;
    vitalsPoints += pts;
    factors.push({
      category: 'Blood Pressure',
      factor: isHypotension ? `Severe Hypotension (${bpSystolic}/${bpDiastolic} mmHg)` : `Hypertensive Crisis (${bpSystolic}/${bpDiastolic} mmHg)`,
      points: pts,
      severity: 'CRITICAL',
      detail: isHypotension ? 'Blood pressure critically low' : 'Severely elevated blood pressure poses acute cardiovascular risk',
    });
    generatedAlerts.push({
      type: 'CRITICAL_VITALS',
      severity: 'CRITICAL',
      title: isHypotension ? 'Critical Hypotension Detected' : 'Hypertensive Crisis Alert',
      message: `Patient BP is ${bpSystolic}/${bpDiastolic} mmHg. Immediate clinician evaluation advised.`,
    });
  } else if (bpSystolic >= 160 || bpDiastolic >= 100) {
    vitalsPoints += 18;
    factors.push({
      category: 'Blood Pressure',
      factor: `Stage 2 Hypertension (${bpSystolic}/${bpDiastolic} mmHg)`,
      points: 18,
      severity: 'HIGH',
      detail: 'Markedly elevated blood pressure',
    });
  } else if (bpSystolic >= 140 || bpDiastolic >= 90) {
    vitalsPoints += 10;
    factors.push({
      category: 'Blood Pressure',
      factor: `Stage 1 Hypertension (${bpSystolic}/${bpDiastolic} mmHg)`,
      points: 10,
      severity: 'MODERATE',
      detail: 'Elevated blood pressure',
    });
  } else if (bpSystolic >= 125 || bpDiastolic >= 82) {
    vitalsPoints += 4;
    factors.push({
      category: 'Blood Pressure',
      factor: `Pre-hypertensive BP (${bpSystolic}/${bpDiastolic} mmHg)`,
      points: 4,
      severity: 'LOW',
      detail: 'Slightly above optimal blood pressure',
    });
  }

  // Heart Rate
  if (heartRate > 0) {
    if (heartRate >= 130 || heartRate < 45) {
      vitalsPoints += 15;
      factors.push({
        category: 'Heart Rate',
        factor: heartRate >= 130 ? `Severe Tachycardia (${heartRate} bpm)` : `Severe Bradycardia (${heartRate} bpm)`,
        points: 15,
        severity: 'CRITICAL',
        detail: 'Hemodynamically unstable heart rate',
      });
      generatedAlerts.push({
        type: 'CRITICAL_VITALS',
        severity: 'CRITICAL',
        title: 'Critical Heart Rate',
        message: `Heart rate recorded at ${heartRate} bpm. Requires immediate clinical review.`,
      });
    } else if (heartRate >= 110 || heartRate < 52) {
      vitalsPoints += 10;
      factors.push({
        category: 'Heart Rate',
        factor: heartRate >= 110 ? `Marked Tachycardia (${heartRate} bpm)` : `Marked Bradycardia (${heartRate} bpm)`,
        points: 10,
        severity: 'HIGH',
        detail: 'Elevated or depressed resting heart rate',
      });
    } else if (heartRate >= 100 || (heartRate > 0 && heartRate < 58)) {
      vitalsPoints += 5;
      factors.push({
        category: 'Heart Rate',
        factor: `Borderline Heart Rate (${heartRate} bpm)`,
        points: 5,
        severity: 'MODERATE',
        detail: 'Mild heart rate elevation or reduction',
      });
    }
  }

  // Oxygen Saturation (SpO2)
  if (spO2 > 0) {
    if (spO2 < 90) {
      vitalsPoints += 18;
      factors.push({
        category: 'Oxygen Saturation',
        factor: `Severe Hypoxemia (SpO2 ${spO2}%)`,
        points: 18,
        severity: 'CRITICAL',
        detail: 'Oxygen saturation critically depressed below 90%',
      });
      generatedAlerts.push({
        type: 'CRITICAL_VITALS',
        severity: 'CRITICAL',
        title: 'Severe Hypoxemia Alert',
        message: `Patient SpO2 is ${spO2}%. Oxygen therapy and respiratory evaluation needed.`,
      });
    } else if (spO2 <= 93) {
      vitalsPoints += 10;
      factors.push({
        category: 'Oxygen Saturation',
        factor: `Moderate Hypoxia (SpO2 ${spO2}%)`,
        points: 10,
        severity: 'HIGH',
        detail: 'Oxygen saturation between 90-93%',
      });
    } else if (spO2 === 94) {
      vitalsPoints += 4;
      factors.push({
        category: 'Oxygen Saturation',
        factor: `Borderline Oxygen Saturation (SpO2 ${spO2}%)`,
        points: 4,
        severity: 'MODERATE',
        detail: 'Oxygen saturation borderline normal',
      });
    }
  }

  // Temperature
  if (temperature > 0) {
    if (temperature >= 39.5 || temperature < 35.0) {
      vitalsPoints += 10;
      factors.push({
        category: 'Temperature',
        factor: temperature >= 39.5 ? `High Pyrexia (${temperature}°C)` : `Hypothermia (${temperature}°C)`,
        points: 10,
        severity: 'CRITICAL',
        detail: temperature >= 39.5 ? 'High fever indicating severe infection or sepsis risk' : 'Severe hypothermia',
      });
      generatedAlerts.push({
        type: 'CRITICAL_VITALS',
        severity: 'HIGH',
        title: 'Abnormal Core Temperature',
        message: `Recorded temperature is ${temperature}°C.`,
      });
    } else if (temperature >= 38.3 || temperature < 35.8) {
      vitalsPoints += 6;
      factors.push({
        category: 'Temperature',
        factor: `Fever / Elevated Temp (${temperature}°C)`,
        points: 6,
        severity: 'MODERATE',
        detail: 'Significant temperature elevation',
      });
    } else if (temperature >= 37.6) {
      vitalsPoints += 3;
      factors.push({
        category: 'Temperature',
        factor: `Low-grade Pyrexia (${temperature}°C)`,
        points: 3,
        severity: 'LOW',
        detail: 'Sub-febrile temperature elevation',
      });
    }
  }

  // Respiratory Rate
  if (respiratoryRate > 0) {
    if (respiratoryRate >= 30 || respiratoryRate <= 8) {
      vitalsPoints += 12;
      factors.push({
        category: 'Respiratory Rate',
        factor: `Severe Tachypnea/Bradypnea (${respiratoryRate}/min)`,
        points: 12,
        severity: 'CRITICAL',
        detail: 'Critical respiratory distress threshold',
      });
      generatedAlerts.push({
        type: 'CRITICAL_VITALS',
        severity: 'CRITICAL',
        title: 'Critical Respiratory Rate',
        message: `Respiratory rate recorded at ${respiratoryRate}/min.`,
      });
    } else if (respiratoryRate >= 24 || respiratoryRate <= 10) {
      vitalsPoints += 7;
      factors.push({
        category: 'Respiratory Rate',
        factor: `Tachypnea (${respiratoryRate}/min)`,
        points: 7,
        severity: 'HIGH',
        detail: 'Elevated work of breathing',
      });
    } else if (respiratoryRate >= 21) {
      vitalsPoints += 3;
      factors.push({
        category: 'Respiratory Rate',
        factor: `Mild Tachypnea (${respiratoryRate}/min)`,
        points: 3,
        severity: 'LOW',
        detail: 'Slightly elevated respiratory rate',
      });
    }
  }

  // Cap vitals points at 45
  vitalsPoints = Math.min(45, vitalsPoints);

  // --- 2. Age Factor (Cap: 15 pts) ---
  let agePoints = 0;
  const age = calculateAge(patient.date_of_birth || patient.dateOfBirth);
  if (age !== null) {
    if (age >= 80) {
      agePoints = 15;
      factors.push({
        category: 'Age Factor',
        factor: `Advanced Age (${age} yrs)`,
        points: 15,
        severity: 'HIGH',
        detail: 'Patient age >= 80 increases clinical frailty and complication risk',
      });
    } else if (age >= 70) {
      agePoints = 12;
      factors.push({
        category: 'Age Factor',
        factor: `Senior Age (${age} yrs)`,
        points: 12,
        severity: 'MODERATE',
        detail: 'Patient age 70-79',
      });
    } else if (age >= 60) {
      agePoints = 8;
      factors.push({
        category: 'Age Factor',
        factor: `Age (${age} yrs)`,
        points: 8,
        severity: 'LOW',
        detail: 'Patient age 60-69',
      });
    } else if (age < 1) {
      agePoints = 12;
      factors.push({
        category: 'Age Factor',
        factor: `Infant (< 1 yr)`,
        points: 12,
        severity: 'HIGH',
        detail: 'Neonatal/infant vulnerability',
      });
    }
  }

  // --- 3. Medical History & Comorbidities (Cap: 20 pts) ---
  let comorbidityPoints = 0;
  const historyItems = [];
  if (Array.isArray(medicalHistory)) {
    historyItems.push(...medicalHistory);
  } else if (typeof medicalHistory === 'string') {
    try {
      const parsed = JSON.parse(medicalHistory);
      if (Array.isArray(parsed)) historyItems.push(...parsed);
      else historyItems.push(medicalHistory);
    } catch {
      historyItems.push(medicalHistory);
    }
  } else if (medicalHistory && typeof medicalHistory === 'object') {
    historyItems.push(...Object.values(medicalHistory));
  }

  const historyStr = historyItems.map(x => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(' ').toLowerCase();

  const highRiskKeywords = [
    { key: 'heart failure', name: 'Congestive Heart Failure', pts: 10 },
    { key: 'stroke', name: 'Cerebrovascular Accident / Stroke', pts: 10 },
    { key: 'kidney failure', name: 'Chronic Kidney Disease / Renal Failure', pts: 10 },
    { key: 'renal failure', name: 'Chronic Kidney Disease / Renal Failure', pts: 10 },
    { key: 'copd', name: 'Chronic Obstructive Pulmonary Disease', pts: 8 },
    { key: 'malignancy', name: 'Active Malignancy / Cancer', pts: 8 },
    { key: 'cancer', name: 'Active Malignancy / Cancer', pts: 8 },
  ];

  const modRiskKeywords = [
    { key: 'hypertension', name: 'Hypertension', pts: 6 },
    { key: 'diabetes', name: 'Diabetes Mellitus', pts: 6 },
    { key: 'asthma', name: 'Bronchial Asthma', pts: 5 },
    { key: 'infarction', name: 'Previous Myocardial Infarction', pts: 7 },
    { key: 'cad', name: 'Coronary Artery Disease', pts: 7 },
  ];

  const notedConditions = new Set();

  for (const item of highRiskKeywords) {
    if (historyStr.includes(item.key) && !notedConditions.has(item.name)) {
      notedConditions.add(item.name);
      comorbidityPoints += item.pts;
      factors.push({
        category: 'Medical History',
        factor: item.name,
        points: item.pts,
        severity: 'HIGH',
        detail: 'Documented major chronic condition',
      });
    }
  }

  for (const item of modRiskKeywords) {
    if (historyStr.includes(item.key) && !notedConditions.has(item.name)) {
      notedConditions.add(item.name);
      comorbidityPoints += item.pts;
      factors.push({
        category: 'Medical History',
        factor: item.name,
        points: item.pts,
        severity: 'MODERATE',
        detail: 'Documented comorbidity',
      });
    }
  }

  comorbidityPoints = Math.min(20, comorbidityPoints);

  // --- 4. Laboratory Abnormalities (Cap: 20 pts) ---
  let labPoints = 0;
  for (const lab of labResults) {
    const results = lab.results || {};
    const status = String(lab.status || '').toLowerCase();

    // Check specific quantitative values
    const creatinine = Number(results.creatinine || 0);
    const glucose = Number(results.glucose || results.bloodGlucose || 0);
    const wbc = Number(results.wbc || results.whiteBloodCells || 0);
    const hemoglobin = Number(results.hemoglobin || results.hb || 0);
    const potassium = Number(results.potassium || 0);
    const troponin = String(results.troponin || '').toLowerCase();

    if (creatinine >= 2.2) {
      labPoints += 12;
      factors.push({
        category: 'Laboratory Results',
        factor: `Elevated Serum Creatinine (${creatinine} mg/dL)`,
        points: 12,
        severity: 'CRITICAL',
        detail: 'Acute or chronic kidney injury risk',
      });
      generatedAlerts.push({
        type: 'ABNORMAL_LAB',
        severity: 'CRITICAL',
        title: 'Critical Creatinine Level',
        message: `Serum Creatinine is ${creatinine} mg/dL. Renal review advised.`,
      });
    } else if (creatinine >= 1.5) {
      labPoints += 6;
      factors.push({
        category: 'Laboratory Results',
        factor: `Borderline Creatinine (${creatinine} mg/dL)`,
        points: 6,
        severity: 'MODERATE',
        detail: 'Mild renal impairment marker',
      });
    }

    if (glucose >= 250 || (glucose > 0 && glucose <= 60)) {
      const isHypo = glucose <= 60;
      labPoints += 10;
      factors.push({
        category: 'Laboratory Results',
        factor: isHypo ? `Severe Hypoglycemia (${glucose} mg/dL)` : `Severe Hyperglycemia (${glucose} mg/dL)`,
        points: 10,
        severity: 'CRITICAL',
        detail: isHypo ? 'Acute hypoglycemia crisis risk' : 'Severe blood glucose dysregulation',
      });
      generatedAlerts.push({
        type: 'ABNORMAL_LAB',
        severity: 'CRITICAL',
        title: isHypo ? 'Severe Hypoglycemia Alert' : 'Severe Hyperglycemia Alert',
        message: `Blood glucose is ${glucose} mg/dL. Immediate glycemic management indicated.`,
      });
    } else if (glucose >= 180) {
      labPoints += 6;
      factors.push({
        category: 'Laboratory Results',
        factor: `Elevated Glucose (${glucose} mg/dL)`,
        points: 6,
        severity: 'HIGH',
        detail: 'Marked hyperglycemia',
      });
    }

    if (wbc >= 16.0 || (wbc > 0 && wbc <= 3.0)) {
      labPoints += 10;
      factors.push({
        category: 'Laboratory Results',
        factor: wbc >= 16.0 ? `Leukocytosis (${wbc} x10^9/L)` : `Leukopenia (${wbc} x10^9/L)`,
        points: 10,
        severity: 'HIGH',
        detail: 'Severe infection or bone marrow suppression indicator',
      });
    }

    if (hemoglobin > 0 && hemoglobin < 8.0) {
      labPoints += 10;
      factors.push({
        category: 'Laboratory Results',
        factor: `Severe Anemia (Hb ${hemoglobin} g/dL)`,
        points: 10,
        severity: 'CRITICAL',
        detail: 'Critical oxygen carrying deficit',
      });
      generatedAlerts.push({
        type: 'ABNORMAL_LAB',
        severity: 'HIGH',
        title: 'Severe Anemia Detected',
        message: `Hemoglobin is ${hemoglobin} g/dL. Blood transfusion evaluation may be warranted.`,
      });
    }

    if (potassium >= 6.0 || (potassium > 0 && potassium <= 3.0)) {
      labPoints += 12;
      factors.push({
        category: 'Laboratory Results',
        factor: potassium >= 6.0 ? `Hyperkalemia (${potassium} mmol/L)` : `Hypokalemia (${potassium} mmol/L)`,
        points: 12,
        severity: 'CRITICAL',
        detail: 'Cardiac arrhythmia risk',
      });
      generatedAlerts.push({
        type: 'ABNORMAL_LAB',
        severity: 'CRITICAL',
        title: 'Critical Electrolyte Imbalance',
        message: `Potassium level is ${potassium} mmol/L. Urgent ECG and stabilization required.`,
      });
    }

    if (troponin === 'positive' || troponin === '+' || troponin === 'high') {
      labPoints += 15;
      factors.push({
        category: 'Laboratory Results',
        factor: 'Cardiac Troponin Positive',
        points: 15,
        severity: 'CRITICAL',
        detail: 'Myocardial necrosis marker',
      });
      generatedAlerts.push({
        type: 'ABNORMAL_LAB',
        severity: 'CRITICAL',
        title: 'Positive Cardiac Biomarker',
        message: 'Cardiac troponin is positive. Acute Coronary Syndrome protocol advised.',
      });
    } else if (results.status === 'Abnormal' || status === 'abnormal') {
      labPoints += 6;
      factors.push({
        category: 'Laboratory Results',
        factor: `Abnormal Lab: ${lab.test_name || 'Panel Result'}`,
        points: 6,
        severity: 'MODERATE',
        detail: 'Documented laboratory test outside normal reference interval',
      });
    }
  }

  labPoints = Math.min(20, labPoints);

  // --- 5. Total Score Calculation ---
  const totalScore = Math.min(100, Math.max(0, vitalsPoints + agePoints + comorbidityPoints + labPoints));
  const riskLevel = determineRiskLevel(totalScore);

  // --- 6. Historical Trend Analysis ---
  let trend = 'Stable';
  let scoreDelta = 0;
  if (previousAssessments.length > 0) {
    const lastAssessment = previousAssessments[0];
    const previousScore = Number(lastAssessment.score || 0);
    scoreDelta = totalScore - previousScore;

    if (scoreDelta > 5) {
      trend = 'Increasing';
    } else if (scoreDelta < -5) {
      trend = 'Decreasing';
    } else {
      trend = 'Stable';
    }

    // Rapid deterioration alert
    if (scoreDelta >= 15) {
      generatedAlerts.push({
        type: 'RAPID_DETERIORATION',
        severity: 'CRITICAL',
        title: 'Rapid Clinical Deterioration Alert',
        message: `Patient risk score surged by +${scoreDelta} points (from ${previousScore} to ${totalScore}). Immediate bedside review advised.`,
      });
    }
  }

  // High score alert
  if (totalScore >= 80) {
    generatedAlerts.push({
      type: 'HIGH_RISK_SCORE',
      severity: 'CRITICAL',
      title: 'Critical Patient Risk Score',
      message: `Overall risk score is ${totalScore}/100 (CRITICAL). Continuous monitoring indicated.`,
    });
  } else if (totalScore >= 60) {
    generatedAlerts.push({
      type: 'HIGH_RISK_SCORE',
      severity: 'HIGH',
      title: 'High Patient Risk Score',
      message: `Overall risk score is ${totalScore}/100 (HIGH). Closer observation recommended.`,
    });
  }

  return {
    score: totalScore,
    riskLevel,
    factors,
    breakdown: {
      vitalSigns: vitalsPoints,
      age: agePoints,
      medicalHistory: comorbidityPoints,
      laboratory: labPoints,
      total: totalScore,
    },
    trend,
    scoreDelta,
    alerts: generatedAlerts,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Fetch patient data from PostgreSQL and perform an assessment
 */
async function assessPatientRiskById(patientId, assessedByUserId = null) {
  const resolvedPatientId = await resolvePatientId(patientId);
  // 1. Fetch patient
  const patientRes = await query(`SELECT * FROM patients WHERE id = $1`, [resolvedPatientId]);
  if (!patientRes.rows[0]) {
    throw new Error('Patient not found');
  }
  const patient = patientRes.rows[0];

  // 2. Fetch latest medical record with vitals
  const medRes = await query(
    `SELECT * FROM medical_records WHERE patient_id = $1 ORDER BY visit_date DESC, created_at DESC LIMIT 5`,
    [resolvedPatientId]
  );
  const latestMed = medRes.rows[0] || {};
  const vitalSigns = latestMed.vital_signs || {};

  // 3. Also check triage_nursing if available
  const triageRes = await query(
    `SELECT * FROM triage_nursing WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 1`,
    [resolvedPatientId]
  );
  const latestTriage = triageRes.rows[0];
  if (latestTriage && latestTriage.vital_signs) {
    // Merge triage vitals if newer or missing in medical record
    Object.assign(vitalSigns, latestTriage.vital_signs);
  }

  // 4. Fetch lab results from laboratory_orders and recent medical records
  const labRes = await query(
    `SELECT * FROM laboratory_orders WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 10`,
    [resolvedPatientId]
  );
  const labResults = [...labRes.rows];
  for (const m of medRes.rows) {
    if (m.lab_results && typeof m.lab_results === 'object') {
      labResults.push({ results: m.lab_results, status: 'Completed' });
    }
  }

  // 5. Build combined medical history from patient record and encounter diagnoses
  const combinedHistory = [];
  if (patient.medical_history) {
    if (Array.isArray(patient.medical_history)) combinedHistory.push(...patient.medical_history);
    else combinedHistory.push(patient.medical_history);
  }
  for (const m of medRes.rows) {
    if (m.diagnosis) {
      if (Array.isArray(m.diagnosis)) combinedHistory.push(...m.diagnosis);
      else combinedHistory.push(m.diagnosis);
    }
  }

  // 6. Fetch previous risk assessments
  const prevAssessRes = await query(
    `SELECT * FROM patient_risk_assessments WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 10`,
    [resolvedPatientId]
  );
  const previousAssessments = prevAssessRes.rows;

  // 7. Execute deterministic evaluation
  const evaluation = evaluatePatientRisk({
    patient,
    vitalSigns,
    medicalHistory: combinedHistory,
    labResults,
    previousAssessments,
  });

  return {
    patient,
    vitalSigns,
    evaluation,
    previousAssessments,
  };
}

/**
 * Save assessment and sync clinical alerts into database
 */
async function savePatientRiskAssessment(patientId, assessedByUserId = null) {
  const resolvedPatientId = await resolvePatientId(patientId);
  const { patient, evaluation } = await assessPatientRiskById(resolvedPatientId, assessedByUserId);

  // Insert into patient_risk_assessments
  const insertAssessment = await query(
    `
    INSERT INTO patient_risk_assessments (
      patient_id, score, risk_level, factors, clinical_summary, assessed_by, calculation_source
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'deterministic_engine')
    RETURNING *
    `,
    [
      resolvedPatientId,
      evaluation.score,
      evaluation.riskLevel,
      JSON.stringify(evaluation.factors),
      `Risk Score: ${evaluation.score}/100 (${evaluation.riskLevel}). Factors: ${evaluation.factors.map(f => f.factor).join('; ')}`,
      assessedByUserId,
    ]
  );

  // Sync clinical alerts (avoid duplicates if active alert of same type exists recently)
  for (const alert of evaluation.alerts) {
    const existing = await query(
      `
      SELECT id FROM clinical_alerts 
      WHERE patient_id = $1 AND alert_type = $2 AND status = 'Active' AND created_at > NOW() - INTERVAL '12 hours'
      LIMIT 1
      `,
      [resolvedPatientId, alert.type]
    );

    if (!existing.rows[0]) {
      await query(
        `
        INSERT INTO clinical_alerts (
          patient_id, alert_type, severity, title, message, metadata, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, 'Active')
        `,
        [
          resolvedPatientId,
          alert.type,
          alert.severity,
          alert.title,
          alert.message,
          JSON.stringify({ score: evaluation.score, riskLevel: evaluation.riskLevel }),
        ]
      );
    }
  }

  // Update active queue entry for this patient with the calculated risk score
  await query(
    `
    UPDATE queue_entries 
    SET risk_score = $1, risk_level = $2
    WHERE patient_id = $3 AND status IN ('Waiting', 'In Progress')
    `,
    [evaluation.score, evaluation.riskLevel, resolvedPatientId]
  );

  return {
    assessment: insertAssessment.rows[0],
    evaluation,
  };
}

module.exports = {
  RISK_LEVELS,
  determineRiskLevel,
  calculateAge,
  evaluatePatientRisk,
  assessPatientRiskById,
  savePatientRiskAssessment,
  resolvePatientId,
};
