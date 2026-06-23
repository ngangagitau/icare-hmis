const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/Procurement');

module.exports = createModuleRouter(Model, 'procurement');

