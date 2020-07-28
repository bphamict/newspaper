const db = require('../utils/db');
const { hasAccent } = require('../utils/str-utils');

const TBL = 'POST';

module.exports = {
    loadAll: async () => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    add: (postObj) => {
        return db.create(TBL, postObj);
    },
    loadByUserID: async (userID) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE author = ${userID} AND isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    loadByPostID: async (postID) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE id = ${postID} AND isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    update: async (postObj) => {
        const condition = {
            id: postObj.postID
        };
        delete postObj.postID;

        return db.update(TBL, postObj, condition);
    },
    loadByCategoryID: async (categoryID) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE category_id = ${categoryID} AND isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        };

        return rows;
    },
    loadBySubCategoryID: async (subCategoryID) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE sub_category_id = ${subCategoryID} AND isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    loadByPostIDWithCategoryAndSubCategoryName: async (postID) => {
        const rows = await db.load(`SELECT P.*, C.name AS category_name, SC.name AS sub_category_name FROM ${TBL} P JOIN CATEGORY C ON P.category_id = C.id JOIN SUB_CATEGORY SC ON P.sub_category_id = SC.id WHERE P.id = ${postID} AND P.isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    loadBySlugWithCategoryAndSubCategoryName: async (slug) => {
        const rows = await db.load(`SELECT P.*, C.name AS category_name, SC.name AS sub_category_name FROM ${TBL} P JOIN CATEGORY C ON P.category_id = C.id JOIN SUB_CATEGORY SC ON P.sub_category_id = SC.id WHERE P.slug = '${slug}' AND P.isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    increaseView: (postID) => {
        return db.updateView(TBL, { id: postID });
    },
    loadRelatedPost: async (postID, subCategoryID) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE sub_category_id = ${subCategoryID} AND id != ${postID} AND isDeleted != 1 ORDER BY created_at DESC LIMIT 0, 10`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    loadPendingPostsByCategory: async (categoryID) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE status = 'PENDING' AND category_id = ${categoryID} AND isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    loadPendingPostByID: async (postID) => {
        const rows = await db.load(`SELECT P.*, C.name AS category_name, SC.name AS sub_category_name FROM ${TBL} P JOIN CATEGORY C ON P.category_id = C.id JOIN SUB_CATEGORY SC ON P.sub_category_id = SC.id WHERE P.status = 'PENDING' AND P.id = ${postID} AND P.isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    searchPosts: async (searchStr, searchBy = 'title', limit, offset, isAuthenticated) => {
        var orderIfAuthenticated = '';
        if(isAuthenticated) {
            orderIfAuthenticated = "FIELD(type, 'PREMIUM', 'FREE'),"
        }

        const rows = await db.load(`SELECT P.*, C.name as category_name, SC.name as sub_cagegory_name FROM ${TBL} P JOIN CATEGORY C ON P.category_id = C.id JOIN SUB_CATEGORY SC ON P.sub_category_id = SC.id WHERE MATCH(${searchBy}) AGAINST ('"${searchStr}"' IN BOOLEAN MODE) AND P.isDeleted != 1 AND (status = 'PUBLISHED' OR (status = 'APPROVED' AND publish_time <= NOW())) ORDER BY ${orderIfAuthenticated} publish_time DESC LIMIT ${offset}, ${limit}`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    getNumberOfSearchPost: async (searchStr, searchBy = 'title') => {
        const rows = await db.load(`SELECT COUNT(*) AS total FROM ${TBL} WHERE MATCH(${searchBy}) AGAINST ('"${searchStr}"' IN BOOLEAN MODE) AND isDeleted != 1 AND (status = 'PUBLISHED' OR (status = 'APPROVED' AND publish_time <= NOW()))`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0].total;
    },
    loadBySlugCategory: async (slug) => {
        const rows = await db.load(`SELECT p.* FROM ${TBL} p join category c ON p.category_id = c.id WHERE c.slug = '${slug}' AND p.isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    loadBySlugCategoryAndSlugSubcategory: async (slugC,slugSc) => {
        const rows = await db.load(`SELECT * FROM ${TBL} p join category c ON p.category_id = c.id join sub_category sc on c.id = sc.category_id WHERE c.slug = '${slugC}' AND sc.slug ='${slugSc}' AND p.isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
}