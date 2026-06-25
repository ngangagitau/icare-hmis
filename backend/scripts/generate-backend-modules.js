const fs = require('fs');
const path = require('path');

const backendDir = path.resolve(__dirname, '..');
const routesDir = path.join(backendDir, 'routes');
const modelsDir = path.join(backendDir, 'models');
const modelsOnly = process.argv.includes('--models-only');

const modules = [
  { model: 'AccountsReceivable', route: 'accountsReceivable', slug: 'accounts-receivable' },
  { model: 'Admin', route: 'admin', slug: 'admin' },
  { model: 'BloodBank', route: 'bloodBank', slug: 'blood-bank' },
  { model: 'CSSD', route: 'cssd', slug: 'cssd' },
  { model: 'Dashboard', route: 'dashboard', slug: 'dashboard' },
  { model: 'Doctor', route: 'doctor', slug: 'doctor' },
  { model: 'Emergency', route: 'emergency', slug: 'emergency' },
  { model: 'FixedAssets', route: 'fixedAssets', slug: 'fixed-assets' },
  { model: 'GeneralLedger', route: 'generalLedger', slug: 'general-ledger' },
  { model: 'HR', route: 'hr', slug: 'hr' },
  { model: 'InPatient', route: 'inpatient', slug: 'inpatient' },
  { model: 'Insurance', route: 'insurance', slug: 'insurance' },
  { model: 'ITModule', route: 'it', slug: 'it' },
  { model: 'Laboratory', route: 'laboratory', slug: 'laboratory' },
  { model: 'Messaging', route: 'messaging', slug: 'messaging' },
  { model: 'Mortuary', route: 'mortuary', slug: 'mortuary' },
  { model: 'Nutrition', route: 'nutrition', slug: 'nutrition' },
  { model: 'Pharmacy', route: 'pharmacy', slug: 'pharmacy' },
  { model: 'Procurement', route: 'procurement', slug: 'procurement' },
  { model: 'Radiology', route: 'radiology', slug: 'radiology' },
  { model: 'SuperAdmin', route: 'superAdmin', slug: 'super-admin' },
  { model: 'Telemedicine', route: 'telemedicine', slug: 'telemedicine' },
  { model: 'Theatre', route: 'theatre', slug: 'theatre' },
  { model: 'Triage', route: 'triage', slug: 'triage' },
];

const commonModelTemplate = (modelName, moduleSlug, customFields = '{}') => `const createModuleModel = require('../lib/genericModuleModel');

module.exports = createModuleModel('${modelName}', ${customFields}, '${moduleSlug}');
`;

const adminModelTemplate = () => `const createModuleModel = require('../lib/genericModuleModel');

module.exports = createModuleModel('Admin', {
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'Please add a valid email'],
  },
  role: {
    type: String,
    default: 'Admin',
    trim: true,
  },
  permissions: [
    {
      module: String,
      actions: [String],
    },
  ],
}, 'admin');
`;

const superAdminModelTemplate = () => `const createModuleModel = require('../lib/genericModuleModel');

module.exports = createModuleModel('SuperAdmin', {
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'Please add a valid email'],
  },
  role: {
    type: String,
    default: 'SuperAdmin',
    trim: true,
  },
  privileges: [String],
  assignedModules: [String],
}, 'super-admin');
`;

const routeTemplate = (moduleSlug) => `const createModuleRouter = require('./genericModuleRoutes');

module.exports = createModuleRouter('${moduleSlug}');
`;

modules.forEach((item) => {
  const modelPath = path.join(modelsDir, `${item.model}.js`);
  const routePath = path.join(routesDir, `${item.route}.js`);

  let modelContent = commonModelTemplate(item.model, item.slug);
  if (item.model === 'Admin') {
    modelContent = adminModelTemplate();
  }
  if (item.model === 'SuperAdmin') {
    modelContent = superAdminModelTemplate();
  }

  fs.writeFileSync(modelPath, modelContent, { encoding: 'utf8' });
  if (!modelsOnly) {
    fs.writeFileSync(routePath, routeTemplate(item.slug), { encoding: 'utf8' });
  }
});

console.log(modelsOnly ? 'Backend model scaffolding created.' : 'Backend module scaffolding created for all stubs.');
