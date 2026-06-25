const { BaseModel } = require('../db/BaseModel');

const toSlug = (value = '') =>
  String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

const createModuleModel = (modelName, fieldDefinition = {}, moduleSlugOverride) => {
  const moduleSlug = moduleSlugOverride || toSlug(modelName);

  return class GenericModuleModel extends BaseModel {
    static get modelName() {
      return modelName;
    }

    static get moduleSlug() {
      return moduleSlug;
    }

    static get tableName() {
      return 'module_items';
    }

    static get columns() {
      return {
        ...BaseModel.columns,
        moduleSlug: 'module_slug',
        code: 'code',
        name: 'name',
        description: 'description',
        status: 'status',
        payload: 'payload',
        createdBy: 'created_by',
      };
    }

    static get schemaDefinition() {
      return fieldDefinition;
    }

    static find(queryObj = {}) {
      return super.find({ moduleSlug: this.moduleSlug, ...queryObj });
    }

    static findOne(queryObj = {}) {
      return super.findOne({ moduleSlug: this.moduleSlug, ...queryObj });
    }

    static async countDocuments(queryObj = {}) {
      return super.countDocuments({ moduleSlug: this.moduleSlug, ...queryObj });
    }

    static async create(data = {}) {
      const doc = new this(data);
      return doc.save();
    }

    async save() {
      this.moduleSlug = this.constructor.moduleSlug;
      if (this.payload === undefined) {
        this.payload = {};
      }
      return super.save();
    }
  };
};

module.exports = createModuleModel;
