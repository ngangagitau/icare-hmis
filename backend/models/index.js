const { createTables } = require('../db/seedDatabase');
const UserPostgres = require('./UserPostgres');

const ensureAllTables = async () => {
  await createTables();
};

module.exports = {
  UserPostgres,
  ensureAllTables,
};
