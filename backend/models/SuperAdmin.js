const createModuleModel = require('../lib/genericModuleModel');

module.exports = createModuleModel('SuperAdmin', {
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please add a valid email'],
  },
  role: {
    type: String,
    default: 'SuperAdmin',
    trim: true,
  },
  privileges: [String],
  assignedModules: [String],
}, 'super-admin');
