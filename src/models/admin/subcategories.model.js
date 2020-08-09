const db = require('../../utils/db');

const TABLE_NAME = 'sub_category';

module.exports = {
    all: function(){
        return db.load(`SELECT s.id, s.name, s.category_id, c.name as category_name, s.slug, s.isDeleted  FROM category  c JOIN ${TABLE_NAME} s on c.id=s.category_id WHERE s.isDeleted != 1`);
    },
    add: function(entity){
        return db.create(TABLE_NAME, entity);
    },
    single: function(id){
        return db.load(`SELECT s.id, s.name, s.category_id, c.name as category_name, s.isDeleted  FROM category  c JOIN ${TABLE_NAME} s on c.id=s.category_id WHERE s.id = ${id} AND s.isDeleted != 1`);
    },
    singleBySlug: async function(slug){
        const rows = await db.load(`SELECT s.id, s.name, s.category_id, c.name as category_name, s.isDeleted  FROM category  c JOIN ${TABLE_NAME} s on c.id=s.category_id WHERE s.slug = '${slug}' AND s.isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
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
    loadByParentCategory: async (parentID) => {
        const rows = await db.load(`SELECT SUB_CAT.* FROM ${TABLE_NAME} SUB_CAT JOIN category CAT ON SUB_CAT.category_id = CAT.id WHERE CAT.id = '${parentID}' AND SUB_CAT.isDeleted = 0`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    page: function(limit, offset){
        return db.load(`SELECT s.id, s.name, s.category_id, c.name as category_name, s.slug  FROM category  c JOIN ${TABLE_NAME} s on c.id = s.category_id WHERE s.isDeleted != 1 limit ${limit} offset ${offset}`);
    },
    count: async () => {
        const row = await db.load(`SELECT count(*) as total FROM ${TABLE_NAME} WHERE isDeleted != 1`);
        
        if(row.length === 0) {
            return 0;
        }

        return row[0].total;
    },
    checkIfAvailableAndNotTheSameAsID: async (slug, subcategoryID) => {
        const rows = await db.load(`SELECT * FROM ${TABLE_NAME} WHERE slug = '${slug}' AND id != ${subcategoryID} AND isDeleted != 1`);
        
        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    getNumberOfSubCatByCatID: async (categoryID) => {
        const rows = await db.load(`SELECT COUNT(*) as total FROM ${TABLE_NAME} SUB_CAT JOIN category CAT ON SUB_CAT.category_id = CAT.id WHERE CAT.id = '${categoryID}' AND SUB_CAT.isDeleted = 0`);

        if(rows.length === 0) {
            return 0;
        }

        return rows[0].total;
    }
};