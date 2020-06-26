const db = require('../../utils/db');

const TABLE_NAME = 'post';

module.exports = {
    all: function(id){
        return db.load(`SELECT * FROM ${TABLE_NAME}`);
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
    }

};