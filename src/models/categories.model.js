const db = require('../utils/db');

const USER_TABLE_NAME = 'category';

module.exports = {
    all: function(){
        return db.load(`SELECT * FROM ${USER_TABLE_NAME}`);
    },
    add: function(entity){
        return db.add(USER_TABLE_NAME, entity);
    },
    single: function(id){
        return db.load(`SELECT * FROM ${USER_TABLE_NAME} WHERE id = ${id} `);
    },
    patch: function(entity){
        const condition = {
            id: entity.id
        }
        delete entity.id;
        return db.patch(USER_TABLE_NAME, entity, condition);
    },
    del: function(entity){
        const condition = {
            id: entity.id
        }
        entity.isDeleted = 1;
        delete entity.id;
        return db.patch(USER_TABLE_NAME, entity, condition);
    },

};