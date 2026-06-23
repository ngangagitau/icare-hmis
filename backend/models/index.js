const AccountsReceivable = require('./AccountsReceivable');
const Admin = require('./Admin');
const Appointment = require('./Appointment');
const Billing = require('./Billing');
const BloodBank = require('./BloodBank');
const CSSD = require('./CSSD');
const Dashboard = require('./Dashboard');
const Doctor = require('./Doctor');
const Emergency = require('./Emergency');
const Finance = require('./Finance');
const FixedAssets = require('./FixedAssets');
const GeneralLedger = require('./GeneralLedger');
const HR = require('./HR');
const InPatient = require('./InPatient');
const Insurance = require('./Insurance');
const Inventory = require('./Inventory');
const ITModule = require('./ITModule');
const Laboratory = require('./Laboratory');
const MedicalRecord = require('./MedicalRecord');
const Messaging = require('./Messaging');
const Mortuary = require('./Mortuary');
const Nutrition = require('./Nutrition');
const Patient = require('./Patient');
const Pharmacy = require('./Pharmacy');
const Procurement = require('./Procurement');
const Radiology = require('./Radiology');
const SuperAdmin = require('./SuperAdmin');
const Telemedicine = require('./Telemedicine');
const Theatre = require('./Theatre');
const Ticket = require('./Ticket');
const Triage = require('./Triage');
const User = require('./User');

const models = {
  AccountsReceivable,
  Admin,
  Appointment,
  Billing,
  BloodBank,
  CSSD,
  Dashboard,
  Doctor,
  Emergency,
  Finance,
  FixedAssets,
  GeneralLedger,
  HR,
  InPatient,
  Insurance,
  Inventory,
  ITModule,
  Laboratory,
  MedicalRecord,
  Messaging,
  Mortuary,
  Nutrition,
  Patient,
  Pharmacy,
  Procurement,
  Radiology,
  SuperAdmin,
  Telemedicine,
  Theatre,
  Ticket,
  Triage,
  User,
};

const ensureAllTables = async () => {
  for (const model of Object.values(models)) {
    if (typeof model.ensureTable === 'function') {
      await model.ensureTable();
    }
  }
};

module.exports = {
  ...models,
  ensureAllTables,
};
