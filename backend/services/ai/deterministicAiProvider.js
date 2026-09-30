/**
 * iCare HMIS - Deterministic Clinical Decision Support Provider
 * 
 * Synthesizes comprehensive, grounded clinical summaries, explanations,
 * and responses strictly using authorized patient clinical facts.
 * Operates safely and deterministically without external network dependencies.
 */

const AIProvider = require('./aiProvider');

class DeterministicAIProvider extends AIProvider {
  async generateClinicalAssistance({ type, patientContext, userQuery }) {
    const {
      patient = {},
      vitalSigns = {},
      medicalHistory = [],
      allergies = [],
      medications = [],
      labResults = [],
      recentEncounters = [],
      riskAssessment = null,
    } = patientContext;

    const patientName = `${patient.firstName || 'Patient'} ${patient.lastName || ''}`.trim();
    const age = patient.age ? `${patient.age} y/o` : 'Age unrecorded';
    const gender = patient.gender || 'unspecified gender';
    const riskScore = riskAssessment?.score ?? 'Not assessed';
    const riskLevel = riskAssessment?.riskLevel ?? 'Not assessed';
    const factors = riskAssessment?.factors || [];

    let text = '';

    switch (type) {
      case 'summary': {
        text = `### Clinical Patient Summary: ${patientName} (${age}, ${gender})

**Current Clinical Status & Risk:**
- **Calculated Risk Score:** ${riskScore}/100 (${riskLevel} RISK)
- **Active Risk Contributing Factors:** ${factors.length > 0 ? factors.map(f => `${f.factor} (+${f.points} pts)`).join(', ') : 'No acute risk factors flagged'}

**Key Recorded Vital Signs:**
- Blood Pressure: ${vitalSigns.systolic ? `${vitalSigns.systolic}/${vitalSigns.diastolic} mmHg` : vitalSigns.bloodPressure || 'Not recorded'}
- Heart Rate: ${vitalSigns.heartRate || vitalSigns.pulse ? `${vitalSigns.heartRate || vitalSigns.pulse} bpm` : 'Not recorded'}
- Oxygen Saturation (SpO2): ${vitalSigns.spO2 || vitalSigns.spo2 ? `${vitalSigns.spO2 || vitalSigns.spo2}%` : 'Not recorded'}
- Temperature: ${vitalSigns.temperature || vitalSigns.temp ? `${vitalSigns.temperature || vitalSigns.temp}°C` : 'Not recorded'}
- Respiratory Rate: ${vitalSigns.respiratoryRate || vitalSigns.rr ? `${vitalSigns.respiratoryRate || vitalSigns.rr}/min` : 'Not recorded'}

**Documented Background & History:**
- **Chronic Conditions / Medical History:** ${Array.isArray(medicalHistory) && medicalHistory.length > 0 ? medicalHistory.join(', ') : 'None documented'}
- **Allergies:** ${Array.isArray(allergies) && allergies.length > 0 ? allergies.join(', ') : 'No known allergies documented'}
- **Current Medications:** ${Array.isArray(medications) && medications.length > 0 ? medications.join(', ') : 'None recorded'}
- **Recorded Encounters:** ${recentEncounters.length} prior clinical visits found in the electronic record.`;
        break;
      }

      case 'explain_risk': {
        text = `### Clinical Risk Score Analysis & Explanation

**Overall Risk Score:** **${riskScore}/100** — **${riskLevel} RISK**

The deterministic risk engine calculated this score based on the following verified clinical facts:

${factors.length > 0 ? factors.map((f, i) => `${i + 1}. **${f.category} — ${f.factor}** (Impact: **+${f.points} pts**)
   - *Rationale:* ${f.detail || 'Clinically significant finding'}
   - *Severity Level:* ${f.severity}`).join('\n\n') : 'No elevated risk factors detected in the record. Baseline patient vitals and history are within normal risk parameters.'}

**Breakdown Category Contributions:**
- Vital Signs Contribution: **${riskAssessment?.breakdown?.vitalSigns ?? 0} pts**
- Age Contribution: **${riskAssessment?.breakdown?.age ?? 0} pts**
- Medical History / Comorbidities: **${riskAssessment?.breakdown?.medicalHistory ?? 0} pts**
- Laboratory Abnormalities: **${riskAssessment?.breakdown?.laboratory ?? 0} pts**

**Clinical Recommendation for Decision Support:**
- ${riskLevel === 'CRITICAL' || riskLevel === 'HIGH' ? 'Immediate clinician review and close vital signs monitoring are strongly advised due to elevated composite risk.' : 'Routine observation according to standard unit protocol.'}`;
        break;
      }

      case 'review_history': {
        text = `### Clinical Encounter & History Review for ${patientName}

**Historical Encounters Summary:**
- Total Encounters Recorded: **${recentEncounters.length}**
${recentEncounters.length > 0 ? recentEncounters.map((enc, idx) => {
  const dateStr = enc.visitDate ? new Date(enc.visitDate).toLocaleDateString() : 'Date unrecorded';
  const diag = Array.isArray(enc.diagnosis) ? enc.diagnosis.join(', ') : (enc.assessment || 'No specific diagnosis recorded');
  return `\n${idx + 1}. **Visit on ${dateStr}**
   - Assessment / Diagnosis: ${diag}
   - Documented Plan: ${enc.treatmentPlan || 'Routine supportive care'}`;
}).join('') : '\n- No previous outpatient/inpatient visits recorded in the system for this patient.'}

**Long-term Comorbidities & Risk Trajectory:**
- Background Conditions: ${Array.isArray(medicalHistory) && medicalHistory.length > 0 ? medicalHistory.join(', ') : 'None documented'}
- Historical Risk Assessments: ${patientContext.previousAssessments?.length || 0} documented risk assessments available.`;
        break;
      }

      case 'abnormal_results': {
        const abnormalVitals = [];
        const bpSys = Number(vitalSigns.systolic || 0);
        const bpDia = Number(vitalSigns.diastolic || 0);
        if (bpSys >= 140 || bpDia >= 90 || (bpSys > 0 && bpSys <= 90)) {
          abnormalVitals.push(`Blood Pressure: ${bpSys}/${bpDia} mmHg (${bpSys >= 180 ? 'CRITICAL' : bpSys >= 160 ? 'STAGE 2 HYPERTENSION' : bpSys <= 90 ? 'HYPOTENSION' : 'ELEVATED'})`);
        }
        const hr = Number(vitalSigns.heartRate || 0);
        if (hr >= 100 || (hr > 0 && hr < 55)) {
          abnormalVitals.push(`Heart Rate: ${hr} bpm (${hr >= 120 ? 'CRITICAL TACHYCARDIA' : hr < 50 ? 'BRADYCARDIA' : 'TACHYCARDIA'})`);
        }
        const spO2 = Number(vitalSigns.spO2 || 0);
        if (spO2 > 0 && spO2 < 95) {
          abnormalVitals.push(`Oxygen Saturation (SpO2): ${spO2}% (${spO2 < 90 ? 'CRITICAL HYPOXEMIA' : 'HYPOXIA'})`);
        }
        const temp = Number(vitalSigns.temperature || 0);
        if (temp >= 37.6 || (temp > 0 && temp < 35.5)) {
          abnormalVitals.push(`Temperature: ${temp}°C (${temp >= 39.0 ? 'HIGH PYREXIA' : temp < 35.0 ? 'HYPOTHERMIA' : 'ELEVATED'})`);
        }

        const abnormalLabs = [];
        for (const lab of labResults) {
          const results = lab.results || {};
          const status = String(lab.status || '').toLowerCase();
          const cr = Number(results.creatinine || 0);
          const glu = Number(results.glucose || 0);
          const hb = Number(results.hemoglobin || 0);
          const k = Number(results.potassium || 0);
          const trop = String(results.troponin || '').toLowerCase();

          if (cr >= 1.5) abnormalLabs.push(`Creatinine: ${cr} mg/dL (Elevated, Ref: 0.6-1.2)`);
          if (glu >= 180 || (glu > 0 && glu <= 65)) abnormalLabs.push(`Glucose: ${glu} mg/dL (${glu <= 65 ? 'Hypoglycemia' : 'Hyperglycemia'}, Ref: 70-140)`);
          if (hb > 0 && hb < 11.0) abnormalLabs.push(`Hemoglobin: ${hb} g/dL (Anemia, Ref: 12-16)`);
          if (k >= 5.5 || (k > 0 && k <= 3.4)) abnormalLabs.push(`Potassium: ${k} mmol/L (Electrolyte Imbalance, Ref: 3.5-5.0)`);
          if (trop === 'positive' || trop === '+') abnormalLabs.push(`Troponin: POSITIVE (Acute Coronary Syndrome marker)`);
          if (status === 'abnormal' && !abnormalLabs.length) abnormalLabs.push(`${lab.test_name || 'Lab Order'}: Marked Abnormal by laboratory`);
        }

        text = `### Review of Abnormal Clinical Findings: ${patientName}

**Abnormal Vital Signs:**
${abnormalVitals.length > 0 ? abnormalVitals.map(v => `- ⚠️ ${v}`).join('\n') : '- ✅ All recorded vital signs fall within standard normal ranges.'}

**Abnormal Laboratory Results:**
${abnormalLabs.length > 0 ? abnormalLabs.map(l => `- 🔬 ${l}`).join('\n') : '- ✅ No flagged abnormal laboratory results in current orders.'}

**Clinical Risk Engine Alerts:**
${riskAssessment?.alerts?.length > 0 ? riskAssessment.alerts.map(a => `- **[${a.severity}]** ${a.title}: ${a.message}`).join('\n') : '- No active critical threshold alerts triggered.'}`;
        break;
      }

      case 'handover': {
        const primaryReason = recentEncounters[0]?.assessment || patient.complaint || 'Outpatient/Inpatient care';
        text = `### Structured SBAR Clinical Handover Summary

**S — Situation:**
- Patient: **${patientName}** (${age}, ${gender})
- Admitting / Chief Concern: ${primaryReason}
- Calculated Clinical Risk: **${riskScore}/100 (${riskLevel})**

**B — Background:**
- Medical History: ${Array.isArray(medicalHistory) && medicalHistory.length > 0 ? medicalHistory.join(', ') : 'No significant chronic conditions documented'}
- Known Allergies: ${Array.isArray(allergies) && allergies.length > 0 ? allergies.join(', ') : 'None documented'}
- Current Regimen: ${Array.isArray(medications) && medications.length > 0 ? medications.join(', ') : 'No home medications recorded'}

**A — Assessment:**
- Current Vitals: BP ${vitalSigns.systolic ? `${vitalSigns.systolic}/${vitalSigns.diastolic}` : 'unrecorded'}, HR ${vitalSigns.heartRate || 'unrecorded'} bpm, SpO2 ${vitalSigns.spO2 || 'unrecorded'}%, Temp ${vitalSigns.temperature || 'unrecorded'}°C.
- Acute Drivers: ${factors.length > 0 ? factors.map(f => f.factor).join('; ') : 'Hemodynamically stable; low immediate risk score.'}

**R — Recommendation:**
- Monitoring Level: ${riskLevel === 'CRITICAL' ? 'Continuous hemodynamic monitoring; immediate clinician review.' : riskLevel === 'HIGH' ? 'Frequent vitals check q2h; review abnormal lab markers.' : 'Routine ward/clinic observation according to care protocol.'}`;
        break;
      }

      case 'query':
      default: {
        const q = String(userQuery || '').toLowerCase();

        if (q.includes('abnormal') || q.includes('lab') || q.includes('result')) {
          text = `Based on ${patientName}'s clinical chart:
- **Vital Signs:** Blood Pressure is ${vitalSigns.systolic ? `${vitalSigns.systolic}/${vitalSigns.diastolic} mmHg` : 'unrecorded'}, Heart Rate is ${vitalSigns.heartRate || 'unrecorded'} bpm, SpO2 is ${vitalSigns.spO2 || 'unrecorded'}%.
- **Lab Results:** ${labResults.length > 0 ? labResults.map(l => `${l.test_name}: ${JSON.stringify(l.results)}`).join('; ') : 'No recent lab results on file.'}
- **Active Alerts:** ${riskAssessment?.alerts?.length ? riskAssessment.alerts.map(a => a.title).join(', ') : 'None active.'}`;
        } else if (q.includes('risk') || q.includes('score') || q.includes('why')) {
          text = `The calculated risk score for ${patientName} is **${riskScore}/100 (${riskLevel})**.
The primary contributing factors are:
${factors.length > 0 ? factors.map(f => `- ${f.factor} (+${f.points} pts) [${f.category}]`).join('\n') : '- All recorded parameters are within baseline normal limits.'}`;
        } else if (q.includes('visit') || q.includes('history') || q.includes('previous')) {
          text = `${patientName} has **${recentEncounters.length}** recorded previous encounters in iCare HMIS.
Background conditions documented: ${Array.isArray(medicalHistory) && medicalHistory.length ? medicalHistory.join(', ') : 'None'}.
Allergies: ${Array.isArray(allergies) && allergies.length ? allergies.join(', ') : 'No known allergies'}.`;
        } else if (q.includes('medication') || q.includes('drug') || q.includes('prescription')) {
          text = `Documented medications for ${patientName}:
${Array.isArray(medications) && medications.length > 0 ? medications.map(m => `- ${m}`).join('\n') : 'No current medications documented on the profile.'}`;
        } else {
          text = `Here is the relevant clinical information from ${patientName}'s record regarding your query:
- **Clinical Risk:** ${riskScore}/100 (${riskLevel})
- **Vitals:** BP ${vitalSigns.systolic ? `${vitalSigns.systolic}/${vitalSigns.diastolic}` : 'N/A'}, HR ${vitalSigns.heartRate || 'N/A'}, SpO2 ${vitalSigns.spO2 || 'N/A'}%
- **Diagnoses / History:** ${Array.isArray(medicalHistory) && medicalHistory.length ? medicalHistory.join(', ') : 'None documented'}
- **Key Factors:** ${factors.length > 0 ? factors.map(f => f.factor).join(', ') : 'Baseline parameters normal'}

Please specify if you would like a detailed handover, risk factor breakdown, or medication review.`;
        }
        break;
      }
    }

    return {
      text,
      model: 'icare-clinical-decision-support-v1',
    };
  }
}

module.exports = DeterministicAIProvider;
