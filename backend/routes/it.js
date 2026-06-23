const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/ITModule');

module.exports = createModuleRouter(Model, 'it');

