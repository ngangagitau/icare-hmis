const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/Radiology');

module.exports = createModuleRouter(Model, 'radiology');

