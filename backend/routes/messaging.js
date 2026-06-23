const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/Messaging');

module.exports = createModuleRouter(Model, 'messaging');

