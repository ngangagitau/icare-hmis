const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/Triage');

module.exports = createModuleRouter(Model, 'triage');

