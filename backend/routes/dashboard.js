const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/Dashboard');

module.exports = createModuleRouter(Model, 'dashboard');

