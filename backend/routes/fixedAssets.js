const createModuleRouter = require('./genericModuleRoutes');
const Model = require('../models/FixedAssets');

module.exports = createModuleRouter(Model, 'fixed-assets');

