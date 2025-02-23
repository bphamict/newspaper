const db = require('../../utils/db');

const TABLE_NAME = 'POST';

module.exports = {
    all: function(id){
        return db.load(`SELECT * FROM ${TABLE_NAME} WHERE isDeleted != 1`);
    },
    single: function(id){
        return db.load(`SELECT * FROM ${TABLE_NAME} WHERE id = ${id} AND isDeleted != 1`);
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
    loadByPostIDWithCategoryAndSubCategoryName: async (postID) => {
        const rows = await db.load(`SELECT P.*, C.name AS category_name, SC.name AS sub_category_name FROM ${TABLE_NAME} P JOIN CATEGORY C ON P.category_id = C.id JOIN SUB_CATEGORY SC ON P.sub_category_id = SC.id WHERE P.id = ${postID} AND P.isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    loadByPostID: async (postID) => {
        const rows = await db.load(`SELECT * FROM ${TABLE_NAME} WHERE id = ${postID} AND isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    page: function(limit, offset){
        return db.load(`SELECT * FROM ${TABLE_NAME} WHERE isDeleted != 1 ORDER BY created_at DESC limit ${limit} offset ${offset}`);
    },
    pageByTitle: function(title, limit, offset){
        return db.load(`SELECT * FROM ${TABLE_NAME} WHERE isDeleted != 1 AND title like '%${title}%' ORDER BY created_at DESC limit ${limit} offset ${offset}`);
    },
    count: async () => {
        const row = await db.load(`SELECT count(*) as total FROM ${TABLE_NAME} WHERE isDeleted != 1`);
        return row[0].total;
    },
    deleteByPostID: async(postID) => {
        return db.update(TABLE_NAME, { isDeleted: 1 }, { id: postID });
    },
    allNewToOld: async (limit, offset) => {
        const rows = await db.load(`SELECT * FROM ${TABLE_NAME} WHERE isDeleted != 1 ORDER BY id DESC LIMIT ${offset}, ${limit}`);
        
        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    getTotal: async () => {
        const rows = await db.load(`SELECT COUNT(*) AS total FROM ${TABLE_NAME} WHERE isDeleted != 1 ORDER BY id DESC`);
        
        if(rows.length === 0) {
            return null;
        }

        return rows[0].total;
    },
    countPostByCategoryID: async (categoryID) => {
        const rows = await db.load(`SELECT COUNT(*) AS total FROM ${TABLE_NAME} WHERE isDeleted != 1 AND category_id = ${categoryID}`);

        if(rows.length === 0) {
            return 0;
        }

        return rows[0].total;
    },
    countPostBySubCategoryID: async (subCategoryID) => {
        const rows = await db.load(`SELECT COUNT(*) AS total FROM ${TABLE_NAME} WHERE isDeleted != 1 AND sub_category_id = ${subCategoryID}`);

        if(rows.length === 0) {
            return 0;
        }

        return rows[0].total;
    },
    countPostByTagID: async (tagID) => {
        const rows = await db.load(`SELECT COUNT(*) AS total FROM ${TABLE_NAME} p JOIN post_tag pt ON p.id = pt.post_id WHERE p.isDeleted != 1 AND pt.tag_id = ${tagID}`);

        if(rows.length === 0) {
            return 0;
        }

        return rows[0].total;
    }
};