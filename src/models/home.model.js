const db = require('../utils/db');

module.exports = {
    top3ViewLastWeek:function(){
        return db.load(`SELECT featured_image as Image, title as Title FROM post WHERE post.updated_at > DATE_ADD(Now(), INTERVAL - 7 DAY) ORDER BY view_count DESC LIMIT 3`);
    },

    catWithSubs:function(){
        return db.load(`SELECT category.name as catName, sub_category.name as subCatName FROM category join sub_category on category.id = sub_category.category_id`);
    },

    top10Newest:function(){
        return db.load(`SELECT id as Id, title as Title FROM post ORDER BY updated_at DESC LIMIT 10`);
    },

    top10View:function(){
        return db.load(`SELECT id as Id, title as Title FROM post ORDER BY view_count DESC LIMIT 10`);
    },

    top3NewByCat:function(){

    }
};