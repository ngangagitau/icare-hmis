const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/Theatre');

module.exports = createModuleRouter(Model, 'theatre');

