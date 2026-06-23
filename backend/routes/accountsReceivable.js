const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/AccountsReceivable');

module.exports = createModuleRouter(Model, 'accounts-receivable');

