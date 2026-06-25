const { BaseModel } = require('../db/BaseModel');

class Finance extends BaseModel {
  static get tableName() {
    return 'finance';
  }

  static get columns() {
    return {
      ...BaseModel.columns,
      financeId: 'finance_id',
      type: 'type',
      data: 'data',
      status: 'status',
      createdBy: 'created_by',
    };
  }

  static get tableDefinition() {
    return {
      id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
      finance_id: 'VARCHAR(100) UNIQUE NOT NULL',
      type: 'VARCHAR(100) NOT NULL',
      data: "JSONB DEFAULT '{}'::jsonb",
      status: "VARCHAR(50) DEFAULT 'Active'",
      created_by: 'UUID REFERENCES users(id)',
      created_at: 'TIMESTAMPTZ DEFAULT NOW()',
      updated_at: 'TIMESTAMPTZ DEFAULT NOW()',
    };
  }
}

module.exports = Finance;
