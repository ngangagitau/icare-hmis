const mongoose = require('mongoose');

const createModuleModel = (modelName, schemaDefinition = {}, collectionName) => {
  const baseDefinition = {
    code: {
      type: String,
      required: [true, 'Code is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  };

  const schema = new mongoose.Schema(
    {
      ...baseDefinition,
      ...schemaDefinition,
    },
    {
      timestamps: true,
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
    }
  );

  schema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
  });

  if (!mongoose.models[modelName]) {
    mongoose.model(modelName, schema, collectionName);
  }

  return mongoose.models[modelName];
};

module.exports = createModuleModel;
