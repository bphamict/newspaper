const db = require('../utils/db');

module.exports = {
  top3ViewLastWeek: async function () {
    const rows = await db.load(`
        SELECT featured_image as Image, title as Title, slug as Slug, publish_time, view_count
        FROM POST
        WHERE isDeleted != 1
            AND status = 'PUBLISHED'
            AND publish_time > DATE_ADD((
                SELECT publish_time
                FROM POST
                ORDER BY publish_time
                DESC LIMIT 1)
                , INTERVAL - 7 DAY)
        ORDER BY view_count DESC LIMIT 3`);

    if (rows.length === 0) {
      return null;
    }

    return rows;
  },

  catWithSubs: async function () {
    const rows = await db.load(`
            SELECT c.id as Id, c.name as catName, c.slug as catSlug, SUB_CATEGORY.name as subCatName, SUB_CATEGORY.slug as subCatSlug
            FROM (SELECT c.*
                  FROM CATEGORY c LEFT JOIN (SELECT * FROM POST WHERE isDeleted != 1 AND status = 'PUBLISHED') p ON c.id = p.category_id
                  WHERE c.isDeleted != 1
                  GROUP BY c.id
                  ORDER BY sum(p.view_count) DESC, c.id ASC
                  LIMIT 10) c left join SUB_CATEGORY on c.id = SUB_CATEGORY.category_id
            WHERE c.isDeleted != 1
        `);

    if (rows.length === 0) {
      return null;
    }
    return rows;
  },

  top10Newest: async function () {
    const rows = await db.load(`
        SELECT p.*, c.name AS category_name, c.slug AS category_slug, sc.name AS sub_category_name, sc.slug AS sub_category_slug
        FROM POST p JOIN CATEGORY c ON p.category_id = c.id JOIN SUB_CATEGORY sc ON p.sub_category_id = sc.id
        WHERE sc.isDeleted != 1 AND c.isDeleted != 1 AND p.isDeleted != 1 AND p.status = 'PUBLISHED'
        ORDER BY p.publish_time DESC LIMIT 10`);

    if (rows.length === 0) {
      return null;
    }

    return rows;
  },

  top10View: async function () {
    const rows = await db.load(`
        SELECT p.*, c.name AS category_name, c.slug AS category_slug, sc.name AS sub_category_name, sc.slug AS sub_category_slug
        FROM POST p JOIN CATEGORY c ON p.category_id = c.id JOIN SUB_CATEGORY sc ON p.sub_category_id = sc.id
        WHERE sc.isDeleted != 1 AND c.isDeleted != 1 AND p.isDeleted != 1 AND p.status = 'PUBLISHED'
        ORDER BY p.view_count DESC LIMIT 10`);

    if (rows.length === 0) {
      return null;
    }

    return rows;
  },

  postsOrderByCat: async function () {
    // return db.load(`SELECT post.id as Id,
    // post.category_id as CatId,
    // post.featured_image as Image,
    // post.title as Title,
    // post.summary as Summary,
    // post.slug as Slug,
    // post.updated_at as Date,
    // (row_number() over (PARTITION BY post.category_id ORDER BY post.category_id DESC)) AS CatRank FROM POST`);
    const rows = await db.load(`
            select p.*, sc.name as sub_category_name, sc.slug as sub_category_slug
            from SUB_CATEGORY sc JOIN POST p ON sc.id = p.sub_category_id
            where p.id = (select p2.id
                          from POST p2
                          where p2.isDeleted != 1 AND p2.status = 'PUBLISHED' AND p2.sub_category_id = sc.id
                          order by publish_time DESC
                          limit 1)
        `);

    if (rows.length === 0) {
      return null;
    }

    return rows;
  },
};
