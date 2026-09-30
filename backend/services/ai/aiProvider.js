/**
 * iCare HMIS - AI Provider Interface
 * Base contract for clinical assistant providers.
 */

class AIProvider {
  /**
   * @param {Object} options
   * @param {string} options.type - 'summary' | 'explain_risk' | 'review_history' | 'abnormal_results' | 'handover' | 'query'
   * @param {Object} options.patientContext - Sanitized patient clinical facts
   * @param {string} [options.userQuery] - User prompt / question if type === 'query'
   * @returns {Promise<{ text: string, model: string }>}
   */
  async generateClinicalAssistance({ type, patientContext, userQuery }) {
    throw new Error('Method generateClinicalAssistance() must be implemented by provider');
  }
}

module.exports = AIProvider;
