/**
 * Triage AI Engine — Clinical Rules & Alert Engine
 * Evaluates patient vitals and returns a severity assessment,
 * flagged abnormal readings, and AI clinical recommendations.
 */

'use strict';

/**
 * @typedef {Object} VitalsInput
 * @property {number} [sys]    Systolic BP (mmHg)
 * @property {number} [dia]    Diastolic BP (mmHg)
 * @property {number} [hr]     Heart Rate (bpm)
 * @property {number} [temp]   Temperature (°C)
 * @property {number} [spo2]   Oxygen Saturation (%)
 * @property {number} [rr]     Respiratory Rate (/min)
 * @property {number} [pain]   Pain Score (0–10)
 * @property {number} [bgl]    Blood Glucose Level (mmol/L)
 * @property {number} [gcs]    Glasgow Coma Scale (3–15)
 */

/**
 * @typedef {Object} AlertItem
 * @property {string} vital     - Vital name
 * @property {string} value     - Formatted value with unit
 * @property {string} label     - Short descriptor (e.g. "Hypertensive Crisis")
 * @property {'warning'|'critical'} level
 * @property {string} recommendation - Clinical action text
 */

/**
 * @typedef {Object} TriageAssessment
 * @property {'NORMAL'|'URGENT'|'CRITICAL'} severity
 * @property {'Normal'|'Urgent'|'Emergency'} queuePriority
 * @property {AlertItem[]} alerts
 * @property {string} summary         - One-line AI summary
 * @property {string[]} recommendations - Ordered clinical actions
 */

/**
 * @param {VitalsInput} v
 * @returns {TriageAssessment}
 */
function analyseVitals(v) {
  const alerts = [];

  const n = (x) => (x !== undefined && x !== null && !isNaN(Number(x)) ? Number(x) : null);

  const sys  = n(v.sys);
  const dia  = n(v.dia);
  const hr   = n(v.hr);
  const temp = n(v.temp);
  const spo2 = n(v.spo2);
  const rr   = n(v.rr);
  const pain = n(v.pain);
  const bgl  = n(v.bgl);
  const gcs  = n(v.gcs);

  // ── Blood Pressure ────────────────────────────────────────────────────────
  if (sys !== null && dia !== null) {
    if (sys >= 180 || dia >= 120) {
      alerts.push({
        vital: 'Blood Pressure',
        value: `${sys}/${dia} mmHg`,
        label: 'Hypertensive Crisis',
        level: 'critical',
        recommendation: 'STAT: Lay patient flat, recheck BP x2 in 5 min. Initiate antihypertensive protocol, obtain 12-lead ECG. Watch for end-organ damage signs (headache, visual changes, chest pain, confusion).',
      });
    } else if (sys >= 160 || dia >= 100) {
      alerts.push({
        vital: 'Blood Pressure',
        value: `${sys}/${dia} mmHg`,
        label: 'Severe Hypertension',
        level: 'critical',
        recommendation: 'Urgent BP recheck, assess for symptoms. Consider antihypertensive medication per protocol. Monitor closely.',
      });
    } else if (sys >= 140 || dia >= 90) {
      alerts.push({
        vital: 'Blood Pressure',
        value: `${sys}/${dia} mmHg`,
        label: 'Elevated BP (Stage II)',
        level: 'warning',
        recommendation: 'Monitor BP q15 min. Assess lifestyle factors. Consider outpatient follow-up if no acute symptoms.',
      });
    }

    // Hypotension
    if (sys < 90) {
      alerts.push({
        vital: 'Blood Pressure',
        value: `${sys}/${dia} mmHg`,
        label: 'Hypotension / Shock Risk',
        level: 'critical',
        recommendation: 'STAT: Position supine with legs elevated. Establish IV access immediately. Assess for signs of shock (cold extremities, altered consciousness, tachycardia). Fluid resuscitation pending physician review.',
      });
    }
  }

  // ── Heart Rate ────────────────────────────────────────────────────────────
  if (hr !== null) {
    if (hr > 130) {
      alerts.push({
        vital: 'Heart Rate',
        value: `${hr} bpm`,
        label: 'Severe Tachycardia',
        level: 'critical',
        recommendation: 'STAT ECG required. Assess for haemodynamic compromise. Identify cause (pain, fever, dehydration, arrhythmia). Continuous cardiac monitoring.',
      });
    } else if (hr > 100) {
      alerts.push({
        vital: 'Heart Rate',
        value: `${hr} bpm`,
        label: 'Tachycardia',
        level: 'warning',
        recommendation: 'Investigate cause: pain, fever, dehydration, anxiety. ECG if sustained or symptomatic. Monitor trend.',
      });
    } else if (hr < 40) {
      alerts.push({
        vital: 'Heart Rate',
        value: `${hr} bpm`,
        label: 'Severe Bradycardia',
        level: 'critical',
        recommendation: 'STAT: Apply cardiac monitor. Assess haemodynamic stability. Prepare for possible pacing. Identify drug cause (beta-blockers, digoxin) or cardiac origin.',
      });
    } else if (hr < 50) {
      alerts.push({
        vital: 'Heart Rate',
        value: `${hr} bpm`,
        label: 'Bradycardia',
        level: 'warning',
        recommendation: 'Monitor closely. 12-lead ECG. Assess for symptoms (dizziness, near-syncope). Review current medications.',
      });
    }
  }

  // ── Oxygen Saturation ─────────────────────────────────────────────────────
  if (spo2 !== null) {
    if (spo2 < 90) {
      alerts.push({
        vital: 'SpO₂',
        value: `${spo2}%`,
        label: 'Severe Hypoxia',
        level: 'critical',
        recommendation: 'STAT: Apply high-flow O₂ via non-rebreather mask (15 L/min). Assess airway patency. Consider positioning (semi-recumbent). Prepare for possible intubation. Continuous pulse oximetry.',
      });
    } else if (spo2 < 94) {
      alerts.push({
        vital: 'SpO₂',
        value: `${spo2}%`,
        label: 'Hypoxia',
        level: 'critical',
        recommendation: 'Apply supplemental O₂ via nasal cannula or face mask. Target SpO₂ ≥ 94%. Assess respiratory effort. Monitor continuously.',
      });
    } else if (spo2 < 97) {
      alerts.push({
        vital: 'SpO₂',
        value: `${spo2}%`,
        label: 'Low-Normal SpO₂',
        level: 'warning',
        recommendation: 'Monitor SpO₂ trend. Consider low-flow O₂ if symptomatic. Assess respiratory function.',
      });
    }
  }

  // ── Temperature ───────────────────────────────────────────────────────────
  if (temp !== null) {
    if (temp > 39.5) {
      alerts.push({
        vital: 'Temperature',
        value: `${temp}°C`,
        label: 'High Fever',
        level: 'critical',
        recommendation: 'STAT: Antipyretic medication (paracetamol/ibuprofen per weight). Tepid sponging. Blood cultures x2 before antibiotics. Check malaria smear if endemic area. IV access for hydration.',
      });
    } else if (temp >= 38.0) {
      alerts.push({
        vital: 'Temperature',
        value: `${temp}°C`,
        label: 'Febrile',
        level: 'warning',
        recommendation: 'Administer antipyretic, ensure adequate hydration. Monitor temperature q1h. Assess for source of infection.',
      });
    } else if (temp < 35.0) {
      alerts.push({
        vital: 'Temperature',
        value: `${temp}°C`,
        label: 'Hypothermia',
        level: 'critical',
        recommendation: 'STAT: Active rewarming measures (blankets, warm IV fluids). Continuous temperature monitoring. Assess for causative factors (exposure, sepsis). Cardiac monitoring (hypothermia can cause arrhythmias).',
      });
    } else if (temp < 36.0) {
      alerts.push({
        vital: 'Temperature',
        value: `${temp}°C`,
        label: 'Subnormal Temperature',
        level: 'warning',
        recommendation: 'Warming measures. Monitor closely. Consider early sepsis screening.',
      });
    }
  }

  // ── Respiratory Rate ──────────────────────────────────────────────────────
  if (rr !== null) {
    if (rr > 30) {
      alerts.push({
        vital: 'Respiratory Rate',
        value: `${rr}/min`,
        label: 'Severe Tachypnoea',
        level: 'critical',
        recommendation: 'STAT: Assess work of breathing (accessory muscle use, tripod position). Apply O₂. Chest auscultation immediately. Potential respiratory failure — prepare for escalation.',
      });
    } else if (rr > 20) {
      alerts.push({
        vital: 'Respiratory Rate',
        value: `${rr}/min`,
        label: 'Tachypnoea',
        level: 'warning',
        recommendation: 'Assess cause (pain, anxiety, respiratory pathology). Monitor oxygen saturation. Chest examination.',
      });
    } else if (rr < 8) {
      alerts.push({
        vital: 'Respiratory Rate',
        value: `${rr}/min`,
        label: 'Bradypnoea / Respiratory Depression',
        level: 'critical',
        recommendation: 'STAT: Airway assessment. Consider opioid reversal (naloxone) if applicable. Prepare bag-valve-mask ventilation. Continuous monitoring.',
      });
    } else if (rr < 12) {
      alerts.push({
        vital: 'Respiratory Rate',
        value: `${rr}/min`,
        label: 'Slow Respiratory Rate',
        level: 'warning',
        recommendation: 'Monitor closely. Assess cause (medications, CNS). Ensure airway is patent.',
      });
    }
  }

  // ── Pain Score ────────────────────────────────────────────────────────────
  if (pain !== null) {
    if (pain >= 8) {
      alerts.push({
        vital: 'Pain Score',
        value: `${pain}/10`,
        label: 'Severe Pain',
        level: 'critical',
        recommendation: 'Initiate multimodal analgesia per protocol. Reassess pain q30 min. Consider IV analgesia for rapid relief. Investigate underlying cause urgently.',
      });
    } else if (pain >= 5) {
      alerts.push({
        vital: 'Pain Score',
        value: `${pain}/10`,
        label: 'Moderate-Severe Pain',
        level: 'warning',
        recommendation: 'Oral/IM analgesia. Reassess in 1 hour. Identify pain source.',
      });
    }
  }

  // ── Blood Glucose ─────────────────────────────────────────────────────────
  if (bgl !== null) {
    if (bgl < 3.0) {
      alerts.push({
        vital: 'Blood Glucose',
        value: `${bgl} mmol/L`,
        label: 'Hypoglycaemia',
        level: 'critical',
        recommendation: 'STAT: Oral glucose if conscious and swallowing intact. IV dextrose 50% (50mL) if IV access established. Reassess BGL in 15 min. Identify cause.',
      });
    } else if (bgl > 20.0) {
      alerts.push({
        vital: 'Blood Glucose',
        value: `${bgl} mmol/L`,
        label: 'Severe Hyperglycaemia',
        level: 'critical',
        recommendation: 'STAT: Assess for DKA (fruity breath, vomiting, abdominal pain). Urinalysis for ketones. IV access. Insulin protocol per physician order. Monitor electrolytes.',
      });
    } else if (bgl > 11.1) {
      alerts.push({
        vital: 'Blood Glucose',
        value: `${bgl} mmol/L`,
        label: 'Hyperglycaemia',
        level: 'warning',
        recommendation: 'Monitor BGL q2h. Assess diabetes management. Physician review for adjustment of insulin/oral hypoglycaemic regimen.',
      });
    }
  }

  // ── GCS ───────────────────────────────────────────────────────────────────
  if (gcs !== null) {
    if (gcs <= 8) {
      alerts.push({
        vital: 'GCS',
        value: `${gcs}/15`,
        label: 'Severely Altered Consciousness',
        level: 'critical',
        recommendation: 'STAT: Airway protection — consider intubation (GCS ≤ 8). Neurological emergency. Physician at bedside immediately. Head CT stat. Assess for reversible causes (glucose, opioids, toxins).',
      });
    } else if (gcs <= 12) {
      alerts.push({
        vital: 'GCS',
        value: `${gcs}/15`,
        label: 'Altered Consciousness',
        level: 'critical',
        recommendation: 'Neurological assessment. Frequent monitoring. Physician review urgently. Screen for reversible causes.',
      });
    } else if (gcs <= 14) {
      alerts.push({
        vital: 'GCS',
        value: `${gcs}/15`,
        label: 'Mild Confusion',
        level: 'warning',
        recommendation: 'Monitor GCS every 30 min. Neurological examination. Investigate cause.',
      });
    }
  }

  // ── Determine Severity ────────────────────────────────────────────────────
  const hasCritical = alerts.some((a) => a.level === 'critical');
  const hasWarning  = alerts.some((a) => a.level === 'warning');

  let severity     = 'NORMAL';
  let queuePriority = 'Normal';

  if (hasCritical) {
    severity      = 'CRITICAL';
    queuePriority = 'Emergency';
  } else if (hasWarning) {
    severity      = 'URGENT';
    queuePriority = 'Urgent';
  }

  // ── Summary & Recommendations ─────────────────────────────────────────────
  let summary = 'Vitals within normal range. No immediate interventions required.';
  if (hasCritical) {
    const critNames = alerts.filter((a) => a.level === 'critical').map((a) => a.label).join(', ');
    summary = `⚠ CRITICAL: ${critNames} detected. Patient requires IMMEDIATE physician attention and has been automatically escalated to top of queue.`;
  } else if (hasWarning) {
    const warnNames = alerts.map((a) => a.label).join(', ');
    summary = `⚡ URGENT: ${warnNames} detected. Expedited physician review recommended.`;
  }

  const recommendations = alerts.map((a) => `[${a.vital}] ${a.recommendation}`);
  if (recommendations.length === 0) {
    recommendations.push('Continue routine monitoring per triage protocol.');
  }

  return {
    severity,
    queuePriority,
    alerts,
    summary,
    recommendations,
  };
}

/**
 * Parse vitals from the medical_records vital_signs JSON object.
 * Supports both the "triage" format and the standard medical record format.
 */
function parseVitalsFromRecord(vitalSigns) {
  if (!vitalSigns) return {};

  const bp = vitalSigns.bloodPressure;
  let sys = null;
  let dia = null;

  if (typeof bp === 'string' && bp.includes('/')) {
    const parts = bp.split('/');
    sys = parseFloat(parts[0]);
    dia = parseFloat(parts[1]);
  } else if (typeof vitalSigns.sys === 'number') {
    sys = vitalSigns.sys;
    dia = vitalSigns.dia;
  }

  return {
    sys:  sys  ?? vitalSigns.sys,
    dia:  dia  ?? vitalSigns.dia,
    hr:   vitalSigns.heartRate     ?? vitalSigns.hr,
    temp: vitalSigns.temperature   ?? vitalSigns.temp,
    spo2: vitalSigns.oxygenSaturation ?? vitalSigns.spo2,
    rr:   vitalSigns.respiratoryRate   ?? vitalSigns.rr,
    pain: vitalSigns.painScore     ?? vitalSigns.pain,
    bgl:  vitalSigns.bloodGlucose  ?? vitalSigns.bgl,
    gcs:  vitalSigns.gcs,
  };
}

module.exports = { analyseVitals, parseVitalsFromRecord };
