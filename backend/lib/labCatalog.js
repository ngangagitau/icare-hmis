const LAB_TEMPLATES = [
  {
    code: 'CBC',
    name: 'Complete Blood Count (CBC)',
    specimenType: 'EDTA Blood',
    parameters: [
      { key: 'wbc', label: 'WBC (×10³/µL)', ref: '4.5-11.0' },
      { key: 'rbc', label: 'RBC (×10⁶/µL)', ref: '4.5-5.5' },
      { key: 'hemoglobin', label: 'Hemoglobin (g/dL)', ref: '13.5-17.5' },
      { key: 'hematocrit', label: 'Hematocrit (%)', ref: '40-54' },
      { key: 'platelets', label: 'Platelets (×10³/µL)', ref: '150-400' },
      { key: 'mcv', label: 'MCV (fL)', ref: '80-100' },
      { key: 'mch', label: 'MCH (pg)', ref: '27-33' },
      { key: 'mchc', label: 'MCHC (g/dL)', ref: '32-36' },
      { key: 'neutrophils', label: 'Neutrophils (%)', ref: '40-70' },
      { key: 'lymphocytes', label: 'Lymphocytes (%)', ref: '20-40' },
    ],
  },
  {
    code: 'LFT',
    name: 'Liver Function Tests (LFTs)',
    specimenType: 'Serum',
    parameters: [
      { key: 'alt', label: 'ALT (U/L)', ref: '7-56' },
      { key: 'ast', label: 'AST (U/L)', ref: '10-40' },
      { key: 'alp', label: 'ALP (U/L)', ref: '44-147' },
      { key: 'bilirubinTotal', label: 'Bilirubin Total (mg/dL)', ref: '0.1-1.2' },
      { key: 'bilirubinDirect', label: 'Bilirubin Direct (mg/dL)', ref: '0.0-0.3' },
      { key: 'albumin', label: 'Albumin (g/dL)', ref: '3.5-5.0' },
      { key: 'totalProtein', label: 'Total Protein (g/dL)', ref: '6.0-8.3' },
    ],
  },
  {
    code: 'RFT',
    name: 'Renal Function Tests (Creatinine/Urea)',
    specimenType: 'Serum',
    parameters: [
      { key: 'urea', label: 'Urea (mg/dL)', ref: '7-20' },
      { key: 'creatinine', label: 'Creatinine (mg/dL)', ref: '0.6-1.3' },
      { key: 'sodium', label: 'Sodium (mmol/L)', ref: '135-145' },
      { key: 'potassium', label: 'Potassium (mmol/L)', ref: '3.5-5.0' },
      { key: 'chloride', label: 'Chloride (mmol/L)', ref: '96-106' },
    ],
  },
  {
    code: 'ELECTROLYTES',
    name: 'Serum Electrolytes (K+, Na+)',
    specimenType: 'Serum',
    parameters: [
      { key: 'sodium', label: 'Sodium (mmol/L)', ref: '135-145' },
      { key: 'potassium', label: 'Potassium (mmol/L)', ref: '3.5-5.0' },
      { key: 'chloride', label: 'Chloride (mmol/L)', ref: '96-106' },
      { key: 'bicarbonate', label: 'Bicarbonate (mmol/L)', ref: '22-29' },
    ],
  },
  {
    code: 'UA',
    name: 'Urinalysis',
    specimenType: 'Urine',
    parameters: [
      { key: 'ph', label: 'pH', ref: '4.5-8.0' },
      { key: 'specificGravity', label: 'Specific Gravity', ref: '1.005-1.030' },
      { key: 'protein', label: 'Protein', ref: 'Negative' },
      { key: 'glucose', label: 'Glucose', ref: 'Negative' },
      { key: 'ketones', label: 'Ketones', ref: 'Negative' },
      { key: 'blood', label: 'Blood', ref: 'Negative' },
      { key: 'wbc', label: 'WBC', ref: '0-5' },
      { key: 'rbc', label: 'RBC', ref: '0-3' },
    ],
  },
  {
    code: 'LIPID',
    name: 'Lipid Profile',
    specimenType: 'Serum',
    parameters: [
      { key: 'totalCholesterol', label: 'Total Cholesterol (mg/dL)', ref: '<200' },
      { key: 'hdl', label: 'HDL (mg/dL)', ref: '>40' },
      { key: 'ldl', label: 'LDL (mg/dL)', ref: '<100' },
      { key: 'triglycerides', label: 'Triglycerides (mg/dL)', ref: '<150' },
    ],
  },
  {
    code: 'GLU',
    name: 'Blood Sugar',
    specimenType: 'Fluoride Blood',
    parameters: [{ key: 'glucose', label: 'Blood Glucose (mg/dL)', ref: '70-110' }],
  },
];

function findTemplate(codeOrName) {
  const needle = String(codeOrName || '').trim().toLowerCase();
  return (
    LAB_TEMPLATES.find((t) => t.code.toLowerCase() === needle) ||
    LAB_TEMPLATES.find((t) => t.name.toLowerCase() === needle) ||
    LAB_TEMPLATES.find((t) => t.name.toLowerCase().includes(needle)) ||
    null
  );
}

function flagValue(value, ref) {
  if (value === undefined || value === null || value === '') return null;
  const text = String(value).trim().toLowerCase();
  const refText = String(ref || '').trim().toLowerCase();
  if (refText === 'negative') {
    return text === 'negative' || text === 'neg' || text === '0' ? 'N' : 'A';
  }
  const range = String(ref || '').match(/([\d.]+)\s*-\s*([\d.]+)/);
  const n = Number(value);
  if (range && Number.isFinite(n)) {
    if (n < Number(range[1])) return 'L';
    if (n > Number(range[2])) return 'H';
    return 'N';
  }
  const lt = String(ref || '').match(/<\s*([\d.]+)/);
  if (lt && Number.isFinite(n)) return n < Number(lt[1]) ? 'N' : 'H';
  const gt = String(ref || '').match(/>\s*([\d.]+)/);
  if (gt && Number.isFinite(n)) return n > Number(gt[1]) ? 'N' : 'L';
  return null;
}

function flattenResults(parameters = [], comments = '') {
  const rows = parameters.map((p) => {
    const flag = p.flag || flagValue(p.value, p.ref);
    return { ...p, flag };
  });
  const results = {
    comments,
    parameters: rows,
    abnormal: rows.some((p) => p.flag && p.flag !== 'N'),
  };
  for (const p of rows) {
    if (!p.key) continue;
    const num = Number(p.value);
    results[p.key] = p.value !== '' && Number.isFinite(num) ? num : p.value;
  }
  if (results.glucose !== undefined && results.bloodGlucose === undefined) {
    results.bloodGlucose = results.glucose;
  }
  return results;
}

module.exports = {
  LAB_TEMPLATES,
  findTemplate,
  flagValue,
  flattenResults,
};
