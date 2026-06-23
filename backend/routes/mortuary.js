const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/Mortuary');

module.exports = createModuleRouter(Model, 'mortuary');

