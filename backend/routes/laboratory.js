const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/Laboratory');

module.exports = createModuleRouter(Model, 'laboratory');

