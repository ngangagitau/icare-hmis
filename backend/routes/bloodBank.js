const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/BloodBank');

module.exports = createModuleRouter(Model, 'blood-bank');

