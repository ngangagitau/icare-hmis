const { flagValue, flattenResults, findTemplate } = require('../lib/labCatalog');

describe('lab catalog', () => {
  test('flags values outside a numeric reference range', () => {
    expect(flagValue(18.2, '4.5-11.0')).toBe('H');
    expect(flagValue(3.0, '4.5-11.0')).toBe('L');
    expect(flagValue(7.1, '4.5-11.0')).toBe('N');
  });

  test('flattens parameters for clinical risk scoring', () => {
    const results = flattenResults(
      [
        { key: 'creatinine', value: '2.5', ref: '0.6-1.3' },
        { key: 'glucose', value: '260', ref: '70-110' },
      ],
      'Marked derangement'
    );

    expect(results.creatinine).toBe(2.5);
    expect(results.glucose).toBe(260);
    expect(results.bloodGlucose).toBe(260);
    expect(results.abnormal).toBe(true);
    expect(results.comments).toBe('Marked derangement');
  });

  test('resolves templates by code or name', () => {
    expect(findTemplate('CBC').code).toBe('CBC');
    expect(findTemplate('Liver Function Tests (LFTs)').code).toBe('LFT');
  });
});
