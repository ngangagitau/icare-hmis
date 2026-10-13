/**
 * Frontend Triage AI Engine
 * Mirrors the backend clinical rules for real-time preview in the Triage module.
 */

export type AlertLevel = 'warning' | 'critical';

export interface AlertItem {
  vital: string;
  value: string;
  label: string;
  level: AlertLevel;
  recommendation: string;
}

export type Severity = 'NORMAL' | 'URGENT' | 'CRITICAL';
export type QueuePriority = 'Normal' | 'Urgent' | 'Emergency';

export interface TriageAssessment {
  severity: Severity;
  queuePriority: QueuePriority;
  alerts: AlertItem[];
  summary: string;
  recommendations: string[];
}

export interface VitalsInput {
  sys?: number | string;
  dia?: number | string;
  hr?: number | string;
  temp?: number | string;
  spo2?: number | string;
  rr?: number | string;
  pain?: number | string;
  bgl?: number | string;
  gcs?: number | string;
}

const n = (x: string | number | undefined): number | null => {
  if (x === undefined || x === null || x === '') return null;
  const v = Number(x);
  return isNaN(v) ? null : v;
};

export function analyseVitals(v: VitalsInput): TriageAssessment {
  const alerts: AlertItem[] = [];

  const sys  = n(v.sys);
  const dia  = n(v.dia);
  const hr   = n(v.hr);
  const temp = n(v.temp);
  const spo2 = n(v.spo2);
  const rr   = n(v.rr);
  const pain = n(v.pain);
  const bgl  = n(v.bgl);
  const gcs  = n(v.gcs);

  // ── Blood Pressure ─────────────────────────────────────────────────────
  if (sys !== null && dia !== null) {
    if (sys >= 180 || dia >= 120) {
      alerts.push({
        vital: 'Blood Pressure', value: `${sys}/${dia} mmHg`,
        label: 'Hypertensive Crisis', level: 'critical',
        recommendation: 'Lay patient flat. Recheck BP x2 in 5 min. Initiate antihypertensive protocol. STAT ECG. Watch for end-organ damage.',
      });
    } else if (sys >= 160 || dia >= 100) {
      alerts.push({
        vital: 'Blood Pressure', value: `${sys}/${dia} mmHg`,
        label: 'Severe Hypertension', level: 'critical',
        recommendation: 'Urgent BP recheck. Antihypertensive per protocol. Close monitoring.',
      });
    } else if (sys >= 140 || dia >= 90) {
      alerts.push({
        vital: 'Blood Pressure', value: `${sys}/${dia} mmHg`,
        label: 'Elevated BP (Stage II)', level: 'warning',
        recommendation: 'Monitor BP q15 min. Assess for symptoms.',
      });
    }
    if (sys < 90) {
      alerts.push({
        vital: 'Blood Pressure', value: `${sys}/${dia} mmHg`,
        label: 'Hypotension / Shock Risk', level: 'critical',
        recommendation: 'Supine position, legs elevated. IV access. Fluid resuscitation. Assess for signs of shock.',
      });
    }
  }

  // ── Heart Rate ─────────────────────────────────────────────────────────
  if (hr !== null) {
    if (hr > 130) {
      alerts.push({ vital: 'Heart Rate', value: `${hr} bpm`, label: 'Severe Tachycardia', level: 'critical',
        recommendation: 'STAT ECG. Assess haemodynamic compromise. Continuous cardiac monitoring.' });
    } else if (hr > 100) {
      alerts.push({ vital: 'Heart Rate', value: `${hr} bpm`, label: 'Tachycardia', level: 'warning',
        recommendation: 'Identify cause. ECG if sustained. Monitor trend.' });
    } else if (hr < 40) {
      alerts.push({ vital: 'Heart Rate', value: `${hr} bpm`, label: 'Severe Bradycardia', level: 'critical',
        recommendation: 'Cardiac monitor now. Prepare for pacing. Identify cause.' });
    } else if (hr < 50) {
      alerts.push({ vital: 'Heart Rate', value: `${hr} bpm`, label: 'Bradycardia', level: 'warning',
        recommendation: '12-lead ECG. Monitor. Review medications.' });
    }
  }

  // ── SpO2 ───────────────────────────────────────────────────────────────
  if (spo2 !== null) {
    if (spo2 < 90) {
      alerts.push({ vital: 'SpO₂', value: `${spo2}%`, label: 'Severe Hypoxia', level: 'critical',
        recommendation: 'High-flow O₂ via non-rebreather mask 15L/min. Assess airway. Prepare for intubation.' });
    } else if (spo2 < 94) {
      alerts.push({ vital: 'SpO₂', value: `${spo2}%`, label: 'Hypoxia', level: 'critical',
        recommendation: 'Supplemental O₂. Target SpO₂ ≥ 94%. Continuous monitoring.' });
    } else if (spo2 < 97) {
      alerts.push({ vital: 'SpO₂', value: `${spo2}%`, label: 'Low-Normal SpO₂', level: 'warning',
        recommendation: 'Monitor SpO₂ trend. Low-flow O₂ if symptomatic.' });
    }
  }

  // ── Temperature ────────────────────────────────────────────────────────
  if (temp !== null) {
    if (temp > 39.5) {
      alerts.push({ vital: 'Temperature', value: `${temp}°C`, label: 'High Fever', level: 'critical',
        recommendation: 'Antipyretic now. Blood cultures x2. Tepid sponging. IV hydration.' });
    } else if (temp >= 38.0) {
      alerts.push({ vital: 'Temperature', value: `${temp}°C`, label: 'Febrile', level: 'warning',
        recommendation: 'Antipyretic, hydration. Monitor q1h. Assess for infection source.' });
    } else if (temp < 35.0) {
      alerts.push({ vital: 'Temperature', value: `${temp}°C`, label: 'Hypothermia', level: 'critical',
        recommendation: 'Active rewarming. Warm IV fluids. Cardiac monitoring.' });
    } else if (temp < 36.0) {
      alerts.push({ vital: 'Temperature', value: `${temp}°C`, label: 'Subnormal Temperature', level: 'warning',
        recommendation: 'Warming measures. Monitor. Early sepsis screening.' });
    }
  }

  // ── Respiratory Rate ───────────────────────────────────────────────────
  if (rr !== null) {
    if (rr > 30) {
      alerts.push({ vital: 'Respiratory Rate', value: `${rr}/min`, label: 'Severe Tachypnoea', level: 'critical',
        recommendation: 'Assess work of breathing. Apply O₂. Chest auscultation. Prepare for escalation.' });
    } else if (rr > 20) {
      alerts.push({ vital: 'Respiratory Rate', value: `${rr}/min`, label: 'Tachypnoea', level: 'warning',
        recommendation: 'Assess cause. Monitor SpO₂. Chest examination.' });
    } else if (rr < 8) {
      alerts.push({ vital: 'Respiratory Rate', value: `${rr}/min`, label: 'Bradypnoea / Resp. Depression', level: 'critical',
        recommendation: 'Airway assessment. Consider naloxone if opioid cause. Bag-valve-mask ready.' });
    } else if (rr < 12) {
      alerts.push({ vital: 'Respiratory Rate', value: `${rr}/min`, label: 'Slow Respiratory Rate', level: 'warning',
        recommendation: 'Monitor closely. Assess cause. Ensure airway patent.' });
    }
  }

  // ── Pain ───────────────────────────────────────────────────────────────
  if (pain !== null) {
    if (pain >= 8) {
      alerts.push({ vital: 'Pain Score', value: `${pain}/10`, label: 'Severe Pain', level: 'critical',
        recommendation: 'Multimodal analgesia per protocol. Reassess q30 min. Investigate cause urgently.' });
    } else if (pain >= 5) {
      alerts.push({ vital: 'Pain Score', value: `${pain}/10`, label: 'Moderate-Severe Pain', level: 'warning',
        recommendation: 'Oral/IM analgesia. Reassess in 1 hour. Identify pain source.' });
    }
  }

  // ── Blood Glucose ──────────────────────────────────────────────────────
  if (bgl !== null) {
    if (bgl < 3.0) {
      alerts.push({ vital: 'Blood Glucose', value: `${bgl} mmol/L`, label: 'Hypoglycaemia', level: 'critical',
        recommendation: 'Oral glucose if conscious. IV dextrose 50% if IV access. Recheck BGL in 15 min.' });
    } else if (bgl > 20.0) {
      alerts.push({ vital: 'Blood Glucose', value: `${bgl} mmol/L`, label: 'Severe Hyperglycaemia', level: 'critical',
        recommendation: 'Assess for DKA. Urinalysis for ketones. IV access. Insulin protocol.' });
    } else if (bgl > 11.1) {
      alerts.push({ vital: 'Blood Glucose', value: `${bgl} mmol/L`, label: 'Hyperglycaemia', level: 'warning',
        recommendation: 'Monitor BGL q2h. Physician review for insulin adjustment.' });
    }
  }

  // ── GCS ────────────────────────────────────────────────────────────────
  if (gcs !== null) {
    if (gcs <= 8) {
      alerts.push({ vital: 'GCS', value: `${gcs}/15`, label: 'Severely Altered Consciousness', level: 'critical',
        recommendation: 'Airway protection — consider intubation. Physician at bedside. Head CT stat.' });
    } else if (gcs <= 12) {
      alerts.push({ vital: 'GCS', value: `${gcs}/15`, label: 'Altered Consciousness', level: 'critical',
        recommendation: 'Neurological assessment. Frequent monitoring. Urgent physician review.' });
    } else if (gcs <= 14) {
      alerts.push({ vital: 'GCS', value: `${gcs}/15`, label: 'Mild Confusion', level: 'warning',
        recommendation: 'Monitor GCS q30 min. Neurological exam. Investigate cause.' });
    }
  }

  // ── Severity ───────────────────────────────────────────────────────────
  const hasCritical = alerts.some((a) => a.level === 'critical');
  const hasWarning  = alerts.some((a) => a.level === 'warning');

  let severity: Severity       = 'NORMAL';
  let queuePriority: QueuePriority = 'Normal';

  if (hasCritical) {
    severity      = 'CRITICAL';
    queuePriority = 'Emergency';
  } else if (hasWarning) {
    severity      = 'URGENT';
    queuePriority = 'Urgent';
  }

  let summary = 'Vitals within normal range. No immediate interventions required.';
  if (hasCritical) {
    const names = alerts.filter((a) => a.level === 'critical').map((a) => a.label).join(', ');
    summary = `⚠ CRITICAL: ${names} detected. Patient will be AUTOMATICALLY ESCALATED to top of Doctor's Queue.`;
  } else if (hasWarning) {
    const names = alerts.map((a) => a.label).join(', ');
    summary = `⚡ URGENT: ${names} detected. Expedited physician review recommended.`;
  }

  return {
    severity,
    queuePriority,
    alerts,
    summary,
    recommendations: alerts.map((a) => `[${a.vital}] ${a.recommendation}`),
  };
}
