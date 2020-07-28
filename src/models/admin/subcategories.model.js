const db = require('../../utils/db');

const TABLE_NAME = 'sub_category';

module.exports = {
    all: function(){
        return db.load(`SELECT s.id, s.name, s.category_id, c.name as category_name, s.slug, s.isDeleted  FROM category  c JOIN ${TABLE_NAME} s on c.id=s.category_id`);
    },
    add: function(entity){
        return db.create(TABLE_NAME, entity);
    },
    single: function(id){
        return db.load(`SELECT s.id, s.name, s.category_id, c.name as category_name, s.isDeleted  FROM category  c JOIN ${TABLE_NAME} s on c.id=s.category_id WHERE s.id = ${id}`);
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
            id: entity.id,
        }
        delete entity.id;
        return db.update(TABLE_NAME, entity, condition);
    },
    page: function(limit, offset){
        return db.load(`SELECT * FROM ${TABLE_NAME} limit ${limit} offset ${offset}`);
    },
    count: async () => {
        const row = await db.load(`SELECT count(*) as total FROM ${TABLE_NAME}`);
        return row[0].total;
    },

};