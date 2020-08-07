const db = require('../utils/db');

module.exports = {
    top3ViewLastWeek: async function(){
        const rows = await db.load(`
        SELECT featured_image as Image, title as Title, slug as Slug, publish_time, view_count
        FROM post
        WHERE isDeleted != 1
        AND (status = 'PUBLISHED' OR (status = 'APPROVED' AND publish_time <= NOW())) 
        AND publish_time > DATE_ADD(
            (SELECT publish_time
             FROM post 
             ORDER BY post.publish_time
             DESC LIMIT 1)
        , INTERVAL - 7 DAY) ORDER BY view_count DESC LIMIT 3`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },

    catWithSubs: async function(){
        const rows = await db.load(`
            SELECT c.id as Id, c.name as catName, sub_category.name as subCatName
            FROM (SELECT c.*
                  FROM category c LEFT JOIN post p ON c.id = p.category_id
                  GROUP BY c.id
                  ORDER BY sum(p.view_count) DESC, c.id ASC
                  LIMIT 10) c join sub_category on c.id = sub_category.category_id
        `);

        if(rows.length === 0) {
            return null;
        }
        return rows;
    },
    
    top10Newest: async function(){
        const rows = await db.load(`SELECT p.*, c.name AS category_name, sc.name AS sub_category_name FROM post p JOIN category c ON p.category_id = c.id JOIN sub_category sc ON p.sub_category_id = sc.id WHERE sc.isDeleted != 1 AND c.isDeleted != 1 AND p.isDeleted != 1 AND (p.status = 'PUBLISHED' OR (p.status = 'APPROVED' AND p.publish_time <= NOW())) ORDER BY p.publish_time DESC LIMIT 10`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },

    top10View: async function(){
        const rows = await db.load(`SELECT p.*, c.name AS category_name, sc.name AS sub_category_name FROM post p JOIN category c ON p.category_id = c.id JOIN sub_category sc ON p.sub_category_id = sc.id WHERE sc.isDeleted != 1 AND c.isDeleted != 1 AND p.isDeleted != 1 AND (p.status = 'PUBLISHED' OR (p.status = 'APPROVED' AND p.publish_time <= NOW())) ORDER BY p.view_count DESC LIMIT 10`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },

    postsOrderByCat: async function(){
        // return db.load(`SELECT post.id as Id,
		// post.category_id as CatId,
		// post.featured_image as Image, 
		// post.title as Title, 
		// post.summary as Summary,
        // post.slug as Slug,
        // post.updated_at as Date,
        // (row_number() over (PARTITION BY post.category_id ORDER BY post.category_id DESC)) AS CatRank FROM post`);
        const rows = await db.load(`
            select p.*, sc.name as sub_category_name
            from sub_category sc JOIN post p ON sc.id = p.sub_category_id
            where p.id = (select p2.id
                          from post p2
                          where p2.isDeleted != 1 AND (p2.status = 'PUBLISHED' OR (p2.status = 'APPROVED' AND p2.publish_time < now())) AND p2.sub_category_id = sc.id
                          order by publish_time DESC
                          limit 1)
        `);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },

    categories:function(){
        return db.load(`SELECT * FROM category`);
    }
};