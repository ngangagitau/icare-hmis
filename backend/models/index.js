const { createTables } = require('../db/seedDatabase');
const Finance = require('./Finance');
const UserPostgres = require('./UserPostgres');

const ensureAllTables = async () => {
  await createTables();
};

module.exports = {
  Finance,
  UserPostgres,
  ensureAllTables,
};
