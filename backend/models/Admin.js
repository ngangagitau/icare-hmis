const createModuleModel = require('../lib/genericModuleModel');

module.exports = createModuleModel('Admin', {
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please add a valid email'],
  },
  role: {
    type: String,
    default: 'Admin',
    trim: true,
  },
  permissions: [
    {
      module: String,
      actions: [String],
    },
  ],
}, 'admin');
