const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/CSSD');

module.exports = createModuleRouter(Model, 'cssd');

