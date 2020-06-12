const { v4 } = require('uuid');
const _ = require('lodash');
const db = require('../utils/db');

const USER_TABLE_NAME = 'USER';

function sanitizeEntity(rows) {
  const omitAttrs = ['password'];
  if (_.isArray(rows)) {
    return _.map(rows, (e) => _.omit(e, omitAttrs));
  } else if (_.isObject(rows)) {
    return _.omit(rows, omitAttrs);
  }
  return rows;
}

module.exports = {
  find: async function () {
    const rows = await db.load(`select * from ${USER_TABLE_NAME}`);
    return sanitizeEntity(rows);
  },
  findById: async function (id) {
    const rows = await db.load(
      `select * from ${USER_TABLE_NAME} where id = ${id}`,
    );

    if (rows.length === 0) {
      return null;
    }

    return sanitizeEntity(rows[0]);
  },
  findByEmail: async function (email) {
    const rows = await db.load(
      `select * from ${USER_TABLE_NAME} where email = '${email}'`,
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  },
  findOrCreate: async function (entity) {
    let rows = await db.load(
      `select * from ${USER_TABLE_NAME} where social_id = ${entity.id}`,
    );

    if (rows.length === 0) {
      const uuid = v4();
      entity = {
        dob: '2020-1-1',
        username: uuid,
        email: _.get(entity, '_json.email', `${uuid}@facebook.com`),
        full_name: entity.displayName,
        social_id: entity.id,
        provider: entity.provider,
        confirmed: true,
      };
      await db.create(USER_TABLE_NAME, entity);
      rows = await db.load(
        `select * from ${USER_TABLE_NAME} where social_id = ${entity.social_id}`,
      );
    }

    return sanitizeEntity(rows[0]);
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
