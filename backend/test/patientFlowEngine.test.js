const { evaluateRecommendedPriority } = require('../services/patientFlowEngine');

describe('patient flow engine', () => {
  const thresholds = { opd: { warning: 45, critical: 60 } };

  test('recommends emergency for critical clinical risk', () => {
    const result = evaluateRecommendedPriority(
      { department: 'opd', waitMinutes: 5, risk_score: 85, priority: 'Normal' },
      thresholds,
    );

    expect(result.recommendedPriority).toBe('Emergency');
    expect(result.isAdjustmentRecommended).toBe(true);
    expect(result.reasons.join(' ')).toMatch(/Critical risk score/);
  });

  test('recommends urgent for a critical wait without silently changing priority', () => {
    const result = evaluateRecommendedPriority(
      { department: 'opd', waitMinutes: 61, risk_score: 0, priority: 'Normal' },
      thresholds,
    );

    expect(result.recommendedPriority).toBe('Urgent');
    expect(result.isAdjustmentRecommended).toBe(true);
    expect(result.currentPriority).toBe('Normal');
  });

  test('preserves an existing emergency priority', () => {
    const result = evaluateRecommendedPriority(
      { department: 'opd', waitMinutes: 0, risk_score: 0, priority: 'Emergency' },
      thresholds,
    );

    expect(result.recommendedPriority).toBe('Emergency');
    expect(result.isAdjustmentRecommended).toBe(false);
  });
});