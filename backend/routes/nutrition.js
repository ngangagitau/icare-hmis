const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/Nutrition');

module.exports = createModuleRouter(Model, 'nutrition');

