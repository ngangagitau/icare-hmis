const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/HR');

module.exports = createModuleRouter(Model, 'hr');

