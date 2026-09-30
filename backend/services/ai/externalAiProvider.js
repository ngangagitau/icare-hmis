/**
 * iCare HMIS - External AI Provider Adapter
 * Extensible integration for Gemini / OpenAI if configured in environment.
 */

const AIProvider = require('./aiProvider');
const DeterministicAIProvider = require('./deterministicAiProvider');

class ExternalAIProvider extends AIProvider {
  constructor() {
    super();
    this.deterministicFallback = new DeterministicAIProvider();
    this.geminiApiKey = process.env.GEMINI_API_KEY || null;
    this.openAiApiKey = process.env.OPENAI_API_KEY || null;
  }

  async generateClinicalAssistance({ type, patientContext, userQuery }) {
    // If no external API key is configured, safely use deterministic clinical synthesizer
    if (!this.geminiApiKey && !this.openAiApiKey) {
      return this.deterministicFallback.generateClinicalAssistance({ type, patientContext, userQuery });
    }

    try {
      if (this.geminiApiKey) {
        // Call Gemini API via standard HTTPS endpoint
        const prompt = this.buildPrompt({ type, patientContext, userQuery });
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: {
              parts: [{
                text: 'You are the iCare Clinical Decision Support Assistant in an electronic hospital management system. You provide concise, grounded clinical decision support based ONLY on the provided patient facts. You NEVER assign numerical risk scores or make definitive final diagnoses. Always maintain professional healthcare tone.'
              }]
            },
            generationConfig: { maxOutputTokens: 1000, temperature: 0.2 },
          }),
        });

        if (!res.ok) {
          throw new Error(`Gemini API error ${res.status}`);
        }

        const data = await res.json();
        const output = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (output) {
          return { text: output.trim(), model: 'gemini-1.5-flash' };
        }
      }

      // Fallback if external generation returns empty
      return this.deterministicFallback.generateClinicalAssistance({ type, patientContext, userQuery });
    } catch (err) {
      console.warn('External AI call failed, falling back to deterministic clinical synthesizer:', err.message);
      return this.deterministicFallback.generateClinicalAssistance({ type, patientContext, userQuery });
    }
  }

  buildPrompt({ type, patientContext, userQuery }) {
    return `Patient Clinical Facts (De-identified):
Age: ${patientContext.patient?.age || 'Unknown'}, Gender: ${patientContext.patient?.gender || 'Unknown'}
Vital Signs: ${JSON.stringify(patientContext.vitalSigns || {})}
Medical History: ${JSON.stringify(patientContext.medicalHistory || [])}
Lab Results: ${JSON.stringify(patientContext.labResults || [])}
Risk Score: ${patientContext.riskAssessment?.score}/100 (${patientContext.riskAssessment?.riskLevel})
Contributing Factors: ${JSON.stringify(patientContext.riskAssessment?.factors || [])}

Task: Provide clinical decision support for action type "${type}".
${userQuery ? `Clinician Query: "${userQuery}"` : ''}
Provide a structured, professional, and clear clinical summary. Do NOT alter the numerical risk score.`;
  }
}

module.exports = ExternalAIProvider;
