const db = require('../../utils/db');

const TABLE_NAME = 'CATEGORY';

module.exports = {
    all: function(){
        return db.load(`SELECT * FROM ${TABLE_NAME} WHERE isDeleted != 1`);
    },
    add: function(entity){
        return db.create(TABLE_NAME, entity);
    },
    single: function(id){
        return db.load(`SELECT * FROM ${TABLE_NAME} WHERE id = ${id} AND isDeleted != 1`);
    },
    singleByName: async function(name){
        const rows = await db.load(`SELECT * FROM ${TABLE_NAME} WHERE name = '${name}' AND isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    singleBySlug: async function(slug){
        const rows = await db.load(`SELECT * FROM ${TABLE_NAME} WHERE slug = '${slug}' AND isDeleted != 1`);
        
        if(rows.length === 0) {
            return null;
        }

        return rows;
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
    },
    loadVacantCategories: async (userID = -1) => {
        const rows = await db.load(`SELECT * FROM ${TABLE_NAME} WHERE (user_id IS NULL OR user_id = ${userID}) AND isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    deleteUser: (entity) => {
        const condition = {
            user_id: entity.userID,
        }
        return db.update(TABLE_NAME, { user_id: null }, condition);
    },
    loadByUserID: async (userID) => {
        const rows = await db.load(`SELECT * FROM ${TABLE_NAME} WHERE user_id = ${userID} AND isDeleted = 0`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    page: async function(limit, offset){
        const rows = await db.load(`SELECT C.*, U.full_name, U.email FROM ${TABLE_NAME} C LEFT JOIN USER U ON C.user_id = U.id WHERE C.isDeleted = 0 limit ${limit} offset ${offset}`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    count: async () => {
        const row = await db.load(`SELECT count(*) as total FROM ${TABLE_NAME} WHERE isDeleted != 1`);

        if(row.length === 0) {
            return 0;
        }

        return row[0].total;
    },
    checkIfAvailableAndNotTheSameAsID: async (slug, categoryID) => {
        const rows = await db.load(`SELECT * FROM ${TABLE_NAME} WHERE slug = '${slug}' AND id != ${categoryID} AND isDeleted != 1`);
        
        if(rows.length === 0) {
            return null;
        }

        return rows;
    }
};