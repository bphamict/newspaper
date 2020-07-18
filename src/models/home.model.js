const db = require('../utils/db');

module.exports = {
    top3View:function(){
        return db.load(`SELECT featured_image as Image, title as Title FROM post ORDER BY view_count DESC LIMIT 3`);
    },

    catWithSubs:function(){
        return db.load(`SELECT category.name as catName, sub_category.name as subCatName FROM category join sub_category on category.id = sub_category.category_id`);
    },
};