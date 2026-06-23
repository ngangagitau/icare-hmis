const { query } = require('./pg');
const { v4: uuidv4 } = require('uuid');

const toSnakeCase = (value) =>
  value.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const toCamelCase = (value) =>
  value.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

const normalizeColumns = (data = {}, columns) => {
  const normalized = {};
  for (const [key, value] of Object.entries(data || {})) {
    if (value === undefined) continue;
    const columnName = columns[key] || toSnakeCase(key);
    normalized[columnName] = value;
  }
  return normalized;
};

const buildCondition = (queryObject, columns, paramStartIndex = 1) => {
  const conditions = [];
  const params = [];
  let index = paramStartIndex;

  const addParam = (sql, value) => {
    conditions.push(sql.replace('$', `$${index}`));
    params.push(value);
    index += 1;
  };

  for (const [key, value] of Object.entries(queryObject || {})) {
    if (key === '$or' && Array.isArray(value)) {
      const orConditions = [];
      for (const item of value) {
        const { clause, params: subParams, nextIndex } = buildCondition(item, columns, index);
        orConditions.push(`(${clause})`);
        params.push(...subParams);
        index = nextIndex;
      }
      conditions.push(`(${orConditions.join(' OR ')})`);
      continue;
    }

    const column = columns[key] || toSnakeCase(key);

    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof RegExp)) {
      if ('$in' in value) {
        const placeholders = value.$in.map(() => `$${index++}`);
        params.push(...value.$in);
        conditions.push(`${column} IN (${placeholders.join(', ')})`);
        continue;
      }
      if ('$gte' in value) {
        addParam(`${column} >= $`, value.$gte);
      }
      if ('$lte' in value) {
        addParam(`${column} <= $`, value.$lte);
      }
      if ('$lt' in value) {
        addParam(`${column} < $`, value.$lt);
      }
      if ('$gt' in value) {
        addParam(`${column} > $`, value.$gt);
      }
      if ('$regex' in value) {
        addParam(`${column} ILIKE $`, `%${value.$regex}%`);
      }
      continue;
    }

    if (value instanceof RegExp) {
      addParam(`${column} ILIKE $`, `%${value.source}%`);
      continue;
    }

    addParam(`${column} = $`, value);
  }

  return {
    clause: conditions.length > 0 ? conditions.join(' AND ') : 'TRUE',
    params,
    nextIndex: index,
  };
};

class ModelQuery {
  constructor(Model, query = {}, options = {}) {
    this.Model = Model;
    this.query = query || {};
    this.sortOptions = options.sort || null;
    this.skipCount = options.skip || 0;
    this.limitCount = options.limit || null;
    this.populates = [];
    this.selectFields = null;
    this.excludeFields = [];
    this.includePassword = false;
    this.isSingle = options.isSingle || false;
    this.updateData = options.updateData || null;
    this.newDocument = options.newDocument || false;
  }

  populate(path, fields) {
    this.populates.push({ path, fields });
    return this;
  }

  sort(sortOptions) {
    this.sortOptions = sortOptions;
    return this;
  }

  skip(amount) {
    this.skipCount = amount;
    return this;
  }

  limit(amount) {
    this.limitCount = amount;
    return this;
  }

  select(selection) {
    if (typeof selection === 'string') {
      if (selection.startsWith('-')) {
        this.excludeFields.push(selection.slice(1));
      }
      if (selection.startsWith('+')) {
        this.includePassword = selection === '+password';
      }
    }
    return this;
  }

  async exec() {
    if (this.updateData) {
      return this._executeUpdate();
    }

    const { clause, params } = buildCondition(this.query, this.Model.columns);
    const selectClause = this.Model.getSelectSQL(this.includePassword);
    let sql = `SELECT ${selectClause} FROM ${this.Model.tableName} WHERE ${clause}`;

    if (this.sortOptions) {
      const sortParts = Object.entries(this.sortOptions).map(([field, direction]) => {
        const column = this.Model.columns[field] || toSnakeCase(field);
        return `${column} ${direction === -1 ? 'DESC' : 'ASC'}`;
      });
      if (sortParts.length) {
        sql += ` ORDER BY ${sortParts.join(', ')}`;
      }
    }

    if (this.limitCount !== null) {
      sql += ` LIMIT ${this.limitCount}`;
    }
    if (this.skipCount) {
      sql += ` OFFSET ${this.skipCount}`;
    }

    const result = await query(sql, params);
    const rows = result.rows.map((row) => this.Model._fromRow(row));
    const populated = await this.Model._populateResult(rows, this.populates);

    const normalized = populated.map((item) => {
      if (!this.includePassword) {
        delete item.password;
      }
      this.excludeFields.forEach((field) => delete item[field]);
      return item;
    });

    if (this.isSingle) {
      return normalized[0] || null;
    }
    return normalized;
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  async _executeUpdate() {
    const id = this.query.id;
    if (!id) {
      throw new Error('findByIdAndUpdate requires an id');
    }
    const updateData = this.Model._prepareUpdateData(this.updateData);
    updateData.updatedAt = new Date().toISOString();

    const setClauses = [];
    const values = [];
    let index = 1;
    for (const [key, value] of Object.entries(updateData)) {
      const column = this.Model.columns[key] || toSnakeCase(key);
      setClauses.push(`${column} = $${index}`);
      values.push(value);
      index += 1;
    }
    values.push(id);

    const sql = `UPDATE ${this.Model.tableName} SET ${setClauses.join(', ')} WHERE id = $${index}`;
    await query(sql, values);

    const updated = await this.Model.findById(id).populateMany(this.populates).exec();
    if (this.newDocument) {
      return updated;
    }
    return updated;
  }
}

class BaseModel {
  constructor(data = {}) {
    Object.assign(this, data);
  }

  static get tableName() {
    throw new Error('tableName must be defined on the model');
  }

  static get columns() {
    return {
      id: 'id',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };
  }

  static get relations() {
    return {};
  }

  static get tableDefinition() {
    return {
      id: 'UUID PRIMARY KEY DEFAULT gen_random_uuid()',
      created_at: 'TIMESTAMPTZ DEFAULT NOW()',
      updated_at: 'TIMESTAMPTZ DEFAULT NOW()',
    };
  }

  static getSelectSQL(includePassword = false) {
    const columns = Object.values(this.columns);
    return columns.join(', ');
  }

  static _fromRow(row) {
    const data = {};
    for (const [key, column] of Object.entries(this.columns)) {
      if (row.hasOwnProperty(column)) {
        data[key] = row[column];
      }
    }
    return new this(data);
  }

  static async _populateResult(rows, populates = []) {
    if (!populates || populates.length === 0) return rows;
    
    const relations = this.relations || {};
    const result = [...rows];
    
    for (const populate of populates) {
      const relation = relations[populate.path];
      if (!relation) continue;
      
      const ids = result.map(r => r[populate.path]).filter(Boolean);
      if (ids.length === 0) continue;
      
      const sql = `SELECT * FROM ${relation.model.tableName} WHERE id = ANY($1)`;
      const dbResult = await query(sql, [ids]);
      const relatedMap = {};
      
      for (const row of dbResult.rows) {
        const obj = relation.model._fromRow(row);
        relatedMap[obj.id] = obj;
      }
      
      for (const item of result) {
        if (item[populate.path]) {
          item[populate.path] = relatedMap[item[populate.path]] || null;
        }
      }
    }
    
    return result;
  }

  static _prepareUpdateData(data = {}) {
    const prepared = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        const column = this.columns[key] || toSnakeCase(key);
        prepared[key] = value;
      }
    }
    return prepared;
  }

  static find(queryObj = {}) {
    return new ModelQuery(this, queryObj);
  }

  static findOne(queryObj = {}) {
    const mq = new ModelQuery(this, queryObj, { isSingle: true });
    return mq;
  }

  static findById(id) {
    return new ModelQuery(this, { id }, { isSingle: true });
  }

  static findByIdAndUpdate(id, data) {
    return new ModelQuery(this, { id }, { updateData: data, newDocument: true });
  }

  static async findByIdAndDelete(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE id = $1`;
    await query(sql, [id]);
    return { acknowledged: true, deletedCount: 1 };
  }

  static async countDocuments(queryObj = {}) {
    const { clause, params } = buildCondition(queryObj, this.columns);
    const sql = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE ${clause}`;
    const result = await query(sql, params);
    return parseInt(result.rows[0].count, 10);
  }

  static async aggregate(pipeline = []) {
    // Basic aggregation support - can be enhanced
    return [];
  }

  static async ensureTable() {
    const definition = this.tableDefinition;
    const columns = [];
    
    for (const [key, sqlDef] of Object.entries(definition)) {
      columns.push(`${key} ${sqlDef}`);
    }
    
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        ${columns.join(', ')}
      );
    `;
    
    try {
      await query(sql);
      console.log(`✓ Table ${this.tableName} created or already exists`);
    } catch (err) {
      console.error(`✗ Error creating table ${this.tableName}:`, err.message);
    }
  }

  async save() {
    const data = { ...this };
    delete data.id;
    
    const normalized = normalizeColumns(data, this.constructor.columns);
    normalized.created_at = new Date().toISOString();
    normalized.updated_at = new Date().toISOString();
    
    const columns = Object.keys(normalized);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(normalized);
    
    const sql = `
      INSERT INTO ${this.constructor.tableName} (${columns.join(', ')})
      VALUES (${placeholders})
      RETURNING *;
    `;
    
    const result = await query(sql, values);
    const row = result.rows[0];
    
    for (const [key, column] of Object.entries(this.constructor.columns)) {
      this[key] = row[column];
    }
    
    return this;
  }

  async remove() {
    const sql = `DELETE FROM ${this.constructor.tableName} WHERE id = $1`;
    await query(sql, [this.id]);
    return { acknowledged: true };
  }

  toJSON() {
    return { ...this };
  }
module.exports = { BaseModel, ModelQuery };
