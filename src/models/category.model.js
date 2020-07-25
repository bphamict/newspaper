const db = require('../utils/db');

module.exports = {
    all:function(){
        return db.load(`SELECT category.name as CatName, sub_category.name as SubCatName FROM category JOIN sub_category on category.id = sub_category.category_id`);
    },

    pageByCat:function(catId, limit, offset){
        return db.load(`SELECT * FROM post JOIN category ON post.category_id = category.id WHERE category.id = ${catId} LIMIT ${limit} OFFSET ${offset}`);
    },

    countByCat:function(catId){
        return db.load(`SELECT COUNT(*) as total FROM post JOIN category ON post.category_id = category.id WHERE category.id = '${catId}'`);
    },

    subCats:function(catId){
        return db.load(`SELECT * FROM sub_category WHERE sub_category.category_id = '${catId}'`)
    }
};