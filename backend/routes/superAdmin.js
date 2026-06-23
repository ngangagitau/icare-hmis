const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/SuperAdmin');

module.exports = createModuleRouter(Model, 'super-admin');

