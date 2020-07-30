const db = require('../utils/db');

const TBL = 'SUB_CATEGORY';
const CAT_TBL = 'CATEGORY';

module.exports = {
    loadAll: async () => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE isDeleted = 0`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    findByName: async (name) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE name = '${name}' AND isDeleted = 0`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    findByID: async (id) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE id = ${id} AND isDeleted = 0`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    loadByParentCategory: async (parentName) => {
        const rows = await db.load(`SELECT SUB_CAT.* FROM ${TBL} SUB_CAT JOIN ${CAT_TBL} CAT ON SUB_CAT.category_id = CAT.id WHERE CAT.name = '${parentName}' AND SUB_CAT.isDeleted = 0`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    add: (subCatObj) => {
        return db.create(TBL, subCatObj);
    },
    findByPostID: async (postID) => {
        const rows = await db.load(`SELECT SC.* FROM ${TBL} SC JOIN POST P ON SC.id = P.sub_category_id WHERE P.id = ${postID} AND SC.isDeleted = 0`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    allBySlugCategory: (slug) => {
        return db.load(`SELECT c.id AS idCtg, sc.* FROM ${TBL} sc JOIN category c on sc.category_id = c.id WHERE c.slug ='${slug}'`);
    },
    
    findNameCgBySlug: (slug) => {
        return db.load(`SELECT * FROM ${CAT_TBL} WHERE slug ='${slug}'`);
        
    },
    findSlugCatBySlugSub_Cat: async (slug) => {
        const row = await db.load(`SELECT c.slug FROM ${TBL} sc JOIN ${CAT_TBL} c on sc.category_id=c.id WHERE sc.slug = '${slug}'`);
        return row[0];
    },
    findNameSubCategoryBySlug: async (slug) => {
        const row = await db.load(`SELECT name FROM ${TBL} WHERE slug ='${slug}'`);
        return row[0];
    },
    
}