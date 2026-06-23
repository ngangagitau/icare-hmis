const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/GeneralLedger');

module.exports = createModuleRouter(Model, 'general-ledger');

