const db = require('../utils/db');

const TBL = 'POST';

module.exports = {
  loadAll: async () => {
    const rows = await db.load(`SELECT * FROM ${TBL} WHERE isDeleted != 1`);

    if (rows.length === 0) {
      return null;
    }

    return rows;
  },
  add: (postObj) => {
    return db.create(TBL, postObj);
  },
  loadByUserID: async (userID) => {
    const rows = await db.load(
      `SELECT * FROM ${TBL} WHERE author = ${userID} AND isDeleted != 1`,
    );

    if (rows.length === 0) {
      return null;
    }

    return rows;
  },
  loadByPostID: async (postID) => {
    const rows = await db.load(
      `SELECT * FROM ${TBL} WHERE id = ${postID} AND isDeleted != 1`,
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  },
  update: async (postObj) => {
    const condition = {
      id: postObj.postID,
    };
    delete postObj.postID;

    return db.update(TBL, postObj, condition);
  },
  loadByCategoryID: async (categoryID) => {
    const rows = await db.load(
      `SELECT * FROM ${TBL} WHERE category_id = ${categoryID} AND isDeleted != 1`,
    );

    if (rows.length === 0) {
      return null;
    }

    return rows;
  },
  loadBySubCategoryID: async (subCategoryID) => {
    const rows = await db.load(
      `SELECT * FROM ${TBL} WHERE sub_category_id = ${subCategoryID} AND isDeleted != 1`,
    );

    if (rows.length === 0) {
      return null;
    }

    return rows;
  },
  loadByPostIDWithCategoryAndSubCategoryName: async (postID) => {
    const rows = await db.load(`
        SELECT P.*, C.name AS category_name, SC.name AS sub_category_name
        FROM ${TBL} P JOIN CATEGORY C ON P.category_id = C.id JOIN SUB_CATEGORY SC ON P.sub_category_id = SC.id
        WHERE P.id = ${postID} AND P.isDeleted != 1`);

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  },
  loadBySlugWithCategoryAndSubCategoryName: async (slug) => {
    const rows = await db.load(`
        SELECT P.*, C.name AS category_name, C.slug AS category_slug, SC.name AS sub_category_name, SC.slug as sub_category_slug
        FROM ${TBL} P JOIN CATEGORY C ON P.category_id = C.id JOIN SUB_CATEGORY SC ON P.sub_category_id = SC.id
        WHERE P.slug = '${slug}' AND P.isDeleted != 1`);

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  },
  increaseView: (postID) => {
    return db.updateView(TBL, { id: postID });
  },
  loadRelatedPost: async (postID, subCategoryID) => {
    const rows = await db.load(`
      SELECT *
      FROM ${TBL}
      WHERE sub_category_id = ${subCategoryID} AND id != ${postID} AND isDeleted != 1 AND status = 'PUBLISHED'
      ORDER BY created_at DESC LIMIT 0, 10`);

    if (rows.length === 0) {
      return null;
    }

    return rows;
  },
  loadPendingPostsByCategory: async (categoryID) => {
    const rows = await db.load(
      `SELECT * FROM ${TBL} WHERE status = 'PENDING' AND category_id = ${categoryID} AND isDeleted != 1`,
    );

    if (rows.length === 0) {
      return null;
    }

    return rows;
  },
  loadPendingPostByID: async (postID) => {
    const rows = await db.load(`
      SELECT P.*, C.name AS category_name, SC.name AS sub_category_name
      FROM ${TBL} P JOIN CATEGORY C ON P.category_id = C.id JOIN SUB_CATEGORY SC ON P.sub_category_id = SC.id
      WHERE P.status = 'PENDING' AND P.id = ${postID} AND P.isDeleted != 1`);

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  },
  searchPosts: async (
    searchStr,
    searchBy = 'title',
    limit,
    offset,
    isAuthenticated,
  ) => {
    var orderIfAuthenticated = '';
    if (isAuthenticated) {
      orderIfAuthenticated = "FIELD(type, 'PREMIUM', 'FREE'),";
    }

    const rows = await db.load(`
      SELECT P.*, C.name as category_name, C.slug as category_slug, SC.name as sub_category_name, SC.slug as sub_category_slug
      FROM ${TBL} P JOIN CATEGORY C ON P.category_id = C.id JOIN SUB_CATEGORY SC ON P.sub_category_id = SC.id
      WHERE MATCH(${searchBy}) AGAINST ('"${searchStr}"' IN BOOLEAN MODE) AND P.isDeleted != 1 AND status = 'PUBLISHED'
      ORDER BY ${orderIfAuthenticated} publish_time DESC LIMIT ${offset}, ${limit}`);

    if (rows.length === 0) {
      return null;
    }

    return rows;
  },
  getNumberOfSearchPost: async (searchStr, searchBy = 'title') => {
    const rows = await db.load(`
      SELECT COUNT(*) AS total
      FROM ${TBL}
      WHERE MATCH(${searchBy}) AGAINST ('"${searchStr}"' IN BOOLEAN MODE) AND isDeleted != 1 AND status = 'PUBLISHED'`);

    if (rows.length === 0) {
      return null;
    }

    return rows[0].total;
  },
  // loadBySlugCategoryAndSlugSubcategory: async (slugC,slugSc) => {
  //     const rows = await db.load(`SELECT * FROM ${TBL} p join category c ON p.category_id = c.id join SUB_CATEGORY sc on c.id = sc.category_id WHERE c.slug = '${slugC}' AND sc.slug ='${slugSc}' AND p.isDeleted != 1`);

  //     if(rows.length === 0) {
  //         return null;
  //     }

  //     return rows;
  // },
  pageBySlugCategory: async (slug, limit, offset, isAuthenticated) => {
    var orderIfAuthenticated = '';
    if (isAuthenticated) {
      orderIfAuthenticated = "FIELD(type, 'PREMIUM', 'FREE'),";
    }

    const rows = await db.load(`
        SELECT p.*, c.name as category_name, c.slug as category_slug, sc.name as sub_category_name, sc.slug as sub_category_slug
        FROM ${TBL} p join CATEGORY c ON p.category_id = c.id JOIN SUB_CATEGORY sc ON p.sub_category_id = sc.id
        WHERE p.isDeleted != 1 AND c.slug = '${slug}' AND p.status = 'PUBLISHED'
        ORDER BY ${orderIfAuthenticated} p.publish_time DESC limit ${limit} offset ${offset}`);

    if (rows.length === 0) {
      return null;
    }

    return rows;
  },
  // pageBySlugCategoryAndSlugSubcategory: async (slugC, slugSc, limit, offset) => {
  //     const rows = await db.load(`SELECT p.* FROM ${TBL} p, category c, SUB_CATEGORY sc WHERE p.category_id = sc.category_id AND p.sub_category_id = sc.id AND sc.category_id = c.id AND c.slug = '${slugC}' AND sc.slug = '${slugSc}' AND (status = 'PUBLISHED' OR (status = 'APPROVED' AND publish_time <= NOW())) ORDER BY p.created_at DESC limit ${limit} offset ${offset} `);

  //     if(rows.length === 0) {
  //         return null;
  //     }

  //     return rows;
  // },
  countBySlugCategory: async (slug) => {
    const row = await db.load(`
        SELECT count(*) as total
        FROM ${TBL} p join CATEGORY c ON p.category_id = c.id
        WHERE p.isDeleted != 1 AND c.slug = '${slug}' AND p.status = 'PUBLISHED'`);

    if (row.length === 0) {
      return 0;
    }

    return row[0].total;
  },
  // countBySlugCategorySlugSub_category: async (slugC, slugSc) => {
  //     const row = await db.load(`SELECT count(*) as total FROM ${TBL} p, category c, SUB_CATEGORY sc WHERE p.category_id = sc.category_id AND p.sub_category_id = sc.id AND sc.category_id = c.id AND c.slug = '${slugC}' AND sc.slug = '${slugSc}' AND (status = 'PUBLISHED' OR (status = 'APPROVED' AND publish_time <= NOW()))`);

  //     if(row.length === 0) {
  //         return 0;
  //     }

  //     return row[0].total;
  // },
  pageBySlugSubCategory: async (slug, limit, offset, isAuthenticated) => {
    var orderIfAuthenticated = '';
    if (isAuthenticated) {
      orderIfAuthenticated = "FIELD(type, 'PREMIUM', 'FREE'),";
    }

    const rows = await db.load(`
      SELECT p.*, c.name as category_name, c.slug as category_slug, sc.name as sub_category_name, sc.slug as sub_category_slug
      FROM ${TBL} p join CATEGORY c ON p.category_id = c.id JOIN SUB_CATEGORY sc ON p.sub_category_id = sc.id
      WHERE p.isDeleted != 1 AND sc.slug = '${slug}' AND p.status = 'PUBLISHED'
      ORDER BY ${orderIfAuthenticated} p.publish_time DESC limit ${limit} offset ${offset}`);

    if (rows.length === 0) {
      return null;
    }

    return rows;
  },
  countBySlugSubCategory: async (slug) => {
    const row = await db.load(`
      SELECT count(*) as total
      FROM ${TBL} p join SUB_CATEGORY sc ON p.sub_category_id = sc.id
      WHERE p.isDeleted != 1 AND sc.slug = '${slug}' AND p.status = 'PUBLISHED'`);

    if (row.length === 0) {
      return 0;
    }

    return row[0].total;
  },
};
