const aiService = require('../services/ai/aiService');
const DeterministicAIProvider = require('../services/ai/deterministicAiProvider');

describe('AI Service Layer', () => {
  test('sanitizes PII from patient context', () => {
    const rawPatient = {
      id: 'uuid-123',
      patient_id: 'P001',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      id_number: '12345678',
      address: '123 Main St',
      date_of_birth: '1980-01-01',
      gender: 'Male',
      blood_type: 'O+',
    };

    const sanitized = aiService.sanitizePatientContext(rawPatient, {}, [], [], {});

    expect(sanitized.patient.phone).toBeUndefined();
    expect(sanitized.patient.email).toBeUndefined();
    expect(sanitized.patient.id_number).toBeUndefined();
    expect(sanitized.patient.address).toBeUndefined();
    expect(sanitized.patient.gender).toBe('Male');
    expect(sanitized.patient.age).toBeGreaterThan(0);
    expect(sanitized.patient.bloodType).toBe('O+');
  });

  test('deterministic provider synthesizes clinical decision support grounded in patient facts', async () => {
    const provider = new DeterministicAIProvider();
    const context = {
      patient: { firstName: 'Alice', lastName: 'Johnson', age: 40, gender: 'Female' },
      riskAssessment: { score: 75, riskLevel: 'HIGH', factors: [{ factor: 'Hypertension', points: 10 }] },
      medicalHistory: ['Hypertension', 'Diabetes'],
      vitalSigns: { systolic: 160, diastolic: 100, heartRate: 105, spO2: 94 },
    };

    const result = await provider.generateClinicalAssistance({
      type: 'summary',
      patientContext: context,
    });

    expect(result).toBeDefined();
    expect(result.text).toContain('Alice Johnson');
    expect(result.text).toContain('75/100');
    expect(result.text).toContain('HIGH RISK');
    expect(result.text).toContain('160/100 mmHg');
    expect(result.model).toBe('icare-clinical-decision-support-v1');
  });

  test('explains risk factors clearly in explain_risk mode', async () => {
    const provider = new DeterministicAIProvider();
    const context = {
      patient: { firstName: 'Robert', lastName: 'Mwangi', age: 78, gender: 'Male' },
      riskAssessment: {
        score: 85,
        riskLevel: 'CRITICAL',
        factors: [
          { factor: 'Severe Tachypnea (32/min)', points: 12, severity: 'CRITICAL', detail: 'Critical respiratory distress' },
          { factor: 'Hypoxia (SpO2 88%)', points: 14, severity: 'CRITICAL', detail: 'Severe hypoxia' },
        ],
      },
      vitalSigns: { spO2: 88, respiratoryRate: 32 },
    };

    const result = await provider.generateClinicalAssistance({
      type: 'explain_risk',
      patientContext: context,
    });

    expect(result.text).toContain('85/100');
    expect(result.text).toContain('CRITICAL RISK');
    expect(result.text).toContain('Severe Tachypnea');
    expect(result.text).toContain('Hypoxia');
  });
});
