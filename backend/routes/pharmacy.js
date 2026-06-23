const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/Pharmacy');

module.exports = createModuleRouter(Model, 'pharmacy');

