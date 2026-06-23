const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/Telemedicine');

module.exports = createModuleRouter(Model, 'telemedicine');

