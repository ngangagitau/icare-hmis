const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { BaseModel } = require('../db/BaseModel');
const { query } = require('../db/pg');

const isHashedPassword = (value = '') => /^\$2[aby]\$/.test(String(value));

class UserPostgres extends BaseModel {
  static get tableName() {
    return 'users';
  }

  static get columns() {
    return {
      ...BaseModel.columns,
      username: 'username',
      email: 'email',
      password: 'password',
      first_name: 'first_name',
      last_name: 'last_name',
      role: 'role',
      department: 'department',
      phone: 'phone',
      is_active: 'is_active',
      permissions: 'permissions',
    };
  }

  static get tableDefinition() {
    return {
      id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
      username: 'VARCHAR(255) UNIQUE NOT NULL',
      email: 'VARCHAR(255) UNIQUE NOT NULL',
      password: 'VARCHAR(255) NOT NULL',
      first_name: 'VARCHAR(255)',
      last_name: 'VARCHAR(255)',
      role: "VARCHAR(50) DEFAULT 'user'",
      department: 'VARCHAR(255)',
      phone: 'VARCHAR(20)',
      is_active: 'BOOLEAN DEFAULT true',
      permissions: "JSONB DEFAULT '[]'",
      created_at: 'TIMESTAMPTZ DEFAULT NOW()',
      updated_at: 'TIMESTAMPTZ DEFAULT NOW()',
    };
  }

  static getSelectSQL(includePassword = false) {
    const columns = Object.values(this.columns).filter(
      (column) => includePassword || column !== 'password'
    );
    return columns.join(', ');
  }

  static async findByEmail(email) {
    return this.findOne({ email }).select('+password');
  }

  static async create(data = {}) {
    const user = new this({
      username: data.username || data.email,
      email: data.email,
      password: data.password,
      first_name: data.firstName || data.first_name || null,
      last_name: data.lastName || data.last_name || null,
      role: data.role || 'user',
      department: data.department || null,
      phone: data.phone || null,
      is_active: data.isActive ?? data.is_active ?? true,
      permissions: data.permissions || [],
    });

    return user.save();
  }

  static _prepareUpdateData(data = {}) {
    const prepared = {};

    if (data.name && !data.first_name && !data.last_name) {
      const [firstName = '', ...rest] = String(data.name).trim().split(/\s+/);
      prepared.first_name = firstName || null;
      prepared.last_name = rest.join(' ') || null;
    }

    const mappings = {
      username: 'username',
      email: 'email',
      password: 'password',
      firstName: 'first_name',
      lastName: 'last_name',
      first_name: 'first_name',
      last_name: 'last_name',
      role: 'role',
      department: 'department',
      phone: 'phone',
      isActive: 'is_active',
      is_active: 'is_active',
      permissions: 'permissions',
    };

    for (const [key, value] of Object.entries(data)) {
      if (value === undefined || key === 'name') continue;
      const mappedKey = mappings[key] || key;
      prepared[mappedKey] = value;
    }

    return prepared;
  }

  async save() {
    const data = {
      username: this.username || this.email,
      email: this.email,
      password: this.password,
      first_name: this.first_name || null,
      last_name: this.last_name || null,
      role: this.role || 'user',
      department: this.department || null,
      phone: this.phone || null,
      is_active: this.is_active ?? true,
      permissions: this.permissions || [],
    };

    if (data.password && !isHashedPassword(data.password)) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
      this.password = data.password;
    }

    if (this.id) {
      const columns = Object.keys(data);
      const values = columns.map((column) => data[column]);
      const setClause = columns.map((column, index) => `${column} = $${index + 1}`).join(', ');
      values.push(this.id);
      const result = await query(
        `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
        values
      );
      Object.assign(this, result.rows[0]);
      return this;
    }

    Object.assign(this, data);
    return super.save();
  }

  async matchPassword(enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
  }

  getSignedJwtToken() {
    return jwt.sign({ id: this.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: process.env.JWT_EXPIRE || '24h',
    });
  }
}

module.exports = UserPostgres;
