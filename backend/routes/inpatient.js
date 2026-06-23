const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/InPatient');

module.exports = createModuleRouter(Model, 'inpatient');

