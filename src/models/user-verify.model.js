const db = require('../utils/db');

const USER_TABLE_NAME = 'USER_VERIFY';

module.exports = {
  findOne: async function ({ code, type }) {
    const rows = await db.load(
      `select * from ${USER_TABLE_NAME} where code = '${code}' and type = '${type}'`,
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  },
  deleteByCode: function (code) {
    return db.delete(USER_TABLE_NAME, { code });
  },
  create: function (entity) {
    return db.create(USER_TABLE_NAME, entity);
  },
  update: function (entity) {
    const condition = {
      id: entity.id,
    };
    delete entity.id;
    return db.update(USER_TABLE_NAME, entity, condition);
  },
  delete: function (id) {
    const condition = { id };
    return db.delete(USER_TABLE_NAME, condition);
  },
};
