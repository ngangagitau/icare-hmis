const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/Doctor');

module.exports = createModuleRouter(Model, 'doctor');

