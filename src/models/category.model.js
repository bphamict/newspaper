const db = require('../utils/db');

module.exports = {
    all: async function(){
        const rows = await db.load(`SELECT * FROM CATEGORY WHERE isDeleted != 1`);
        
        if(rows.length === 0) {
            return null;
        }

        return rows;
    },

    pageByCat: async function(catSlug, limit, offset){
        const rows = await db.load(`SELECT * FROM post JOIN CATEGORY ON post.category_id = CATEGORY.id WHERE post.isDeleted != 1 AND CATEGORY.isDeleted != 1 AND CATEGORY.slug = '${catSlug}' LIMIT ${limit} OFFSET ${offset}`);

        if(rows.length === 0) {
             return null;
        }

        return rows;
    },

    countByCat: async function(catSlug){
        const row = await db.load(`SELECT COUNT(*) as total FROM post JOIN CATEGORY ON post.category_id = CATEGORY.id WHERE post.isDeleted != 1 AND CATEGORY.slug = '${catSlug}'`);

        if(row.length === 0) {
            return 0;
        }

        return row[0].total;
    },

    subCats: async function(catSlug){
        const rows = await db.load(`SELECT sub_category.* FROM sub_category JOIN CATEGORY ON sub_category.category_id = CATEGORY.id WHERE CATEGORY.slug = '${catSlug}' AND sub_category.isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },

    loadBySlug: async function(catSlug) {
        const rows = await db.load(`SELECT * FROM CATEGORY WHERE isDeleted != 1 AND slug = '${catSlug}' `);
        
        if(rows.length === 0) {
            return null;
        }

        return rows;
    }
};