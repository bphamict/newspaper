const db = require('../utils/db');

module.exports = {
    top3ViewLastWeek:function(){
        return db.load(`SELECT featured_image as Image, title as Title FROM post WHERE post.updated_at > DATE_ADD(Now(), INTERVAL - 7 DAY) ORDER BY view_count DESC LIMIT 3`);
    },

    catWithSubs:function(){
        return db.load(`SELECT category.name as catName, sub_category.name as subCatName FROM category join sub_category on category.id = sub_category.category_id`);
    },

/*     load3NewestPosts:function(){
        return db.load(`SELECT * FROM post ORDER BY updated_at DESC LIMIT 3`);
    }, */
};