const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/Emergency');

module.exports = createModuleRouter(Model, 'emergency');

