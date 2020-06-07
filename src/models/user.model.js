const db = require('../utils/db');

const USER_TABLE_NAME = 'USER';

module.exports = {
  find: function () {
    return db.load(`select * from ${USER_TABLE_NAME}`);
  },
  findById: function (id) {
    return db.load(`select * from ${USER_TABLE_NAME} where id = ${id}`);
  },
  findByUserName: async function (username) {
    const rows = await db.load(
      `select * from ${USER_TABLE_NAME} where username = '${username}'`,
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
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
