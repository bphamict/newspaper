const db = require('../utils/db');

module.exports = {
    top3ViewLastWeek:function(){
        return db.load(`SELECT featured_image as Image, title as Title, slug as Slug FROM post WHERE post.updated_at > DATE_ADD(Now(), INTERVAL - 7 DAY) ORDER BY view_count DESC LIMIT 3`);
    },

    catWithSubs: async function(){
        const rows = await db.load(`SELECT category.id as Id ,category.name as catName, sub_category.name as subCatName FROM category join sub_category on category.id = sub_category.category_id`);
        
        if(rows.length === 0) {
            return null;
        }
        return rows;
    },
    
    top10Newest:function(){
        return db.load(`SELECT id as Id, title as Title, slug as Slug, updated_at as Date FROM post ORDER BY updated_at DESC LIMIT 10`);
    },

    top10View:function(){
        return db.load(`SELECT id as Id, title as Title, slug as Slug, updated_at as Date FROM post ORDER BY view_count DESC LIMIT 10`);
    },

    postsOrderByCat:function(){
        return db.load(`SELECT post.id as Id,
		post.category_id as CatId,
		post.featured_image as Image, 
		post.title as Title, 
		post.summary as Summary,
        post.slug as Slug,
        post.updated_at as Date,
		(row_number() over (PARTITION BY post.category_id ORDER BY post.category_id DESC)) AS CatRank FROM post`);
    },

    categories:function(){
        return db.load(`SELECT * FROM category`);
    }
};