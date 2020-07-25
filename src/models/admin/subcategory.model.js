const db = require('../../utils/db');

const TABLE_NAME = 'sub_category';

module.exports = {
    all: function(){
        return db.load(`SELECT * FROM ${TABLE_NAME}`);
    },
    add: function(entity){
        return db.create(TABLE_NAME, entity);
    },
    single: function(id, category_id){
        return db.load(`SELECT * FROM ${TABLE_NAME} WHERE id = ${id} and category_id = ${category_id}`);
    },
    update: function(entity){
        const condition = {
            id: entity.id,
            category_id: entity.category_id
        }
        delete entity.id;
        return db.update(TABLE_NAME, entity, condition);
    },
    del: function(entity){
        const condition = {
            id: entity.id,
            category_id: entity.category_id

        }
        delete entity.id;
        delete entity.category_id;
        return db.update(TABLE_NAME, entity, condition);
    }

};