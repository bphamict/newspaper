const db = require('../../utils/db');

const TABLE_NAME = 'post';

module.exports = {
    all: function(id){
        return db.load(`SELECT * FROM ${TABLE_NAME} `);
    },
    single: function(id){
        return db.load(`SELECT * FROM ${TABLE_NAME} WHERE id = ${id} `);
    },
    update: function(entity){
        const condition = {
            id: entity.id
        }
        delete entity.id;
        return db.update(TABLE_NAME, entity, condition);
    },
    del: function(entity){
        const condition = {
            id: entity.id
        }
        delete entity.id;
        return db.del(TABLE_NAME, entity, condition);
    },
    page: function(limit, offset){
        return db.load(`SELECT * FROM ${TABLE_NAME} ORDER BY created_at DESC limit ${limit} offset ${offset}`);
    },
    pageByTitle: function(title, limit, offset){
        return db.load(`SELECT * FROM ${TABLE_NAME} WHERE title like '%${title}%' ORDER BY created_at DESC limit ${limit} offset ${offset}`);
    },
    count: async () => {
        const row = await db.load(`SELECT count(*) as total FROM ${TABLE_NAME}`);
        return row[0].total;
    },

};