const db = require('../../utils/db');

const TABLE_NAME = 'category';

module.exports = {
    all: function(){
        return db.load(`SELECT * FROM ${TABLE_NAME}`);
    },
    add: function(entity){
        return db.create(TABLE_NAME, entity);
    },
    single: function(id){
        return db.load(`SELECT * FROM ${TABLE_NAME} WHERE id = ${id} `);
    },
    singleByName: function(name){
        return db.load(`SELECT * FROM ${TABLE_NAME} WHERE name = '${name}' `);
    },
    singleBySlug: function(slug){
        return db.load(`SELECT * FROM ${TABLE_NAME} WHERE slug = '${slug}' `);
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
        return db.update(TABLE_NAME, entity, condition);
    },
    loadAll: async () => {
        const rows = await db.load(`SELECT * FROM ${TABLE_NAME} WHERE isDeleted = 0`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    findByName: async (name) => {
        const rows = await db.load(`SELECT * FROM ${TABLE_NAME} WHERE name = '${name}' AND isDeleted = 0`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    findByID: async (id) => {
        const rows = await db.load(`SELECT * FROM ${TABLE_NAME} WHERE id = ${id} AND isDeleted = 0`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    findBySubCategoryID: async (subCategoryID) => {
        const rows = await db.load(`SELECT C.* FROM ${TABLE_NAME} C JOIN SUB_CATEGORY SC ON C.id = SC.category_id WHERE SC.id = ${subCategoryID} AND C.isDeleted = 0`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    }
};