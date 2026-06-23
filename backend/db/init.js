const { query } = require('./pg');
const { ensureAllTables } = require('../models');

const initializeDatabase = async () => {
  await query('CREATE EXTENSION IF NOT EXISTS pgcrypto;');
  await ensureAllTables();
};

module.exports = {
  initializeDatabase,
};
