const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/Admin');

module.exports = createModuleRouter(Model, 'admin');

