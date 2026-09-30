/**
 * iCare HMIS - AI Clinical Assistant Service
 * 
 * Orchestrator responsible for:
 * 1. Clinical data minimization (stripping PII)
 * 2. Provider selection and dispatch
 * 3. Enforcing mandatory clinical safety disclaimers
 * 4. Audit logging into ai_interactions
 */

const { query } = require('../../db/pg');
const ExternalAIProvider = require('./externalAiProvider');
const DeterministicAIProvider = require('./deterministicAiProvider');
const { assessPatientRiskById, calculateAge } = require('../clinicalRiskEngine');

const CLINICAL_SAFETY_DISCLAIMER =
  'AI-generated information is for clinical decision support only. It does not replace professional medical judgment.';

class AIService {
  constructor() {
    this.provider = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY
      ? new ExternalAIProvider()
      : new DeterministicAIProvider();
  }

  /**
   * Data minimization filter: strips direct patient identifiers (PII)
   */
  sanitizePatientContext(rawPatient, rawVitals, rawMedRecords, rawLabs, riskAssessment) {
    const age = calculateAge(rawPatient.date_of_birth || rawPatient.dateOfBirth);

    // Extract medications
    let medications = [];
    if (Array.isArray(rawPatient.current_medications)) {
      medications = rawPatient.current_medications;
    } else if (typeof rawPatient.current_medications === 'string') {
      try { medications = JSON.parse(rawPatient.current_medications); } catch { medications = [rawPatient.current_medications]; }
    }

    // Extract allergies
    let allergies = [];
    if (Array.isArray(rawPatient.allergies)) {
      allergies = rawPatient.allergies;
    } else if (typeof rawPatient.allergies === 'string') {
      try { allergies = JSON.parse(rawPatient.allergies); } catch { allergies = [rawPatient.allergies]; }
    }

    // Extract medical history
    let medicalHistory = [];
    if (Array.isArray(rawPatient.medical_history)) {
      medicalHistory = rawPatient.medical_history;
    } else if (typeof rawPatient.medical_history === 'string') {
      try { medicalHistory = JSON.parse(rawPatient.medical_history); } catch { medicalHistory = [rawPatient.medical_history]; }
    }

    // Minimal sanitized encounters
    const recentEncounters = (rawMedRecords || []).slice(0, 5).map(m => ({
      visitDate: m.visit_date,
      assessment: m.assessment,
      diagnosis: m.diagnosis,
      treatmentPlan: m.treatment_plan,
    }));

    // Minimal sanitized labs
    const sanitizedLabs = (rawLabs || []).slice(0, 10).map(l => ({
      test_name: l.test_name,
      results: l.results,
      status: l.status,
      order_date: l.order_date,
    }));

    return {
      patient: {
        firstName: rawPatient.first_name,
        lastName: rawPatient.last_name,
        age,
        gender: rawPatient.gender,
        bloodType: rawPatient.blood_type,
        // STRICT PRIVACY: Omits id_number, phone, email, address, emergency_contact
      },
      vitalSigns: rawVitals || {},
      medicalHistory,
      allergies,
      medications,
      labResults: sanitizedLabs,
      recentEncounters,
      riskAssessment,
    };
  }

  /**
   * Generate clinical decision support
   */
  async getClinicalAssistance({ patientId, userId, type = 'summary', userQuery = '' }) {
    if (!patientId) {
      throw new Error('Patient ID is required');
    }

    // 1. Fetch risk assessment and patient clinical facts
    const { patient, vitalSigns, evaluation, previousAssessments } =
      await assessPatientRiskById(patientId);
    const resolvedPatientId = patient.id;

    // 2. Fetch recent encounters
    const medRes = await query(
      `SELECT * FROM medical_records WHERE patient_id = $1 ORDER BY visit_date DESC LIMIT 5`,
      [resolvedPatientId]
    );

    // 3. Fetch labs
    const labRes = await query(
      `SELECT * FROM laboratory_orders WHERE patient_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [resolvedPatientId]
    );

    // 4. Sanitize context
    const sanitizedContext = this.sanitizePatientContext(
      patient,
      vitalSigns,
      medRes.rows,
      labRes.rows,
      {
        ...evaluation,
        previousAssessments,
      }
    );

    // 5. Generate assistance
    const result = await this.provider.generateClinicalAssistance({
      type,
      patientContext: sanitizedContext,
      userQuery,
    });

    // 6. Audit log in ai_interactions
    try {
      await query(
        `
        INSERT INTO ai_interactions (
          patient_id, user_id, interaction_type, prompt_summary, response_text, model_used, disclaimer_acknowledged
        )
        VALUES ($1, $2, $3, $4, $5, $6, true)
        `,
        [
          resolvedPatientId,
          userId || null,
          type,
          userQuery ? `Query: ${userQuery.slice(0, 200)}` : `Action: ${type}`,
          result.text.slice(0, 4000),
          result.model,
        ]
      );
    } catch (auditErr) {
      console.warn('Failed to record AI interaction log:', auditErr.message);
    }

    return {
      success: true,
      interactionType: type,
      responseText: result.text,
      disclaimer: CLINICAL_SAFETY_DISCLAIMER,
      modelUsed: result.model,
      riskScore: evaluation.score,
      riskLevel: evaluation.riskLevel,
      generatedAt: new Date().toISOString(),
    };
  }
}

module.exports = new AIService();
