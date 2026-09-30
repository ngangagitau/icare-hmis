const { evaluatePatientRisk, determineRiskLevel } = require('../services/clinicalRiskEngine');

describe('clinical risk engine', () => {
  test('classifies a normal patient as low risk', () => {
    const result = evaluatePatientRisk({
      patient: { date_of_birth: '1990-01-01' },
      vitalSigns: { systolic: 120, diastolic: 80, heartRate: 72, spO2: 98, temperature: 36.8, respiratoryRate: 16 },
      medicalHistory: [],
      labResults: [],
    });

    expect(result.score).toBe(0);
    expect(result.riskLevel).toBe('LOW');
    expect(determineRiskLevel(result.score)).toBe('LOW');
  });

  test('returns explainable points that sum to the score', () => {
    const result = evaluatePatientRisk({
      patient: { date_of_birth: '1940-01-01' },
      vitalSigns: { systolic: 185, diastolic: 115, heartRate: 135, spO2: 89, temperature: 39.6, respiratoryRate: 32 },
      medicalHistory: ['heart failure', 'diabetes'],
      labResults: [{ results: { troponin: 'positive', creatinine: 2.5 } }],
    });

    expect(result.riskLevel).toBe('CRITICAL');
    expect(result.factors.reduce((sum, factor) => sum + factor.points, 0)).toBeGreaterThanOrEqual(result.score);
    expect(result.breakdown.total).toBe(result.score);
    expect(result.alerts.some((alert) => alert.type === 'CRITICAL_VITALS')).toBe(true);
  });

  test('detects rapid deterioration from a previous assessment', () => {
    const result = evaluatePatientRisk({
      patient: { date_of_birth: '1980-01-01' },
      vitalSigns: { systolic: 185, diastolic: 115 },
      previousAssessments: [{ score: 10 }],
    });

    expect(result.trend).toBe('Increasing');
    expect(result.scoreDelta).toBeGreaterThanOrEqual(15);
    expect(result.alerts.some((alert) => alert.type === 'RAPID_DETERIORATION')).toBe(true);
  });
});