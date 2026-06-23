const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/Insurance');

module.exports = createModuleRouter(Model, 'insurance');

