const db = require('../utils/db');

module.exports = {
    all: async function(){
        const rows = await db.load(`SELECT * FROM category`);
        
        if(rows.length === 0) {
            return null;
        }

        return rows;
    },

    pageByCat:function(catId, limit, offset){
        return db.load(`SELECT * FROM post JOIN category ON post.category_id = category.id WHERE category.id = '${catId}' LIMIT ${limit} OFFSET ${offset}`);
    },

    countByCat:function(catId){
        return db.load(`SELECT COUNT(*) as total FROM post JOIN category ON post.category_id = category.id WHERE category.id = '${catId}'`);
    },

    subCats:function(catId){
        return db.load(`SELECT * FROM sub_category WHERE sub_category.category_id = '${catId}'`)
    }
};