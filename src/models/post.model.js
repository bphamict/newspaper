const db = require('../utils/db');

const TBL = 'POST';

module.exports = {
    loadAll: async () => {
        const rows = await db.load(`SELECT * FROM ${TBL}`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    add: (postObj) => {
        return db.create(TBL, postObj);
    },
    loadByUserID: async (userID) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE author = ${userID}`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    loadByPostID: async (postID) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE id = ${postID}`);

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
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE category_id = ${categoryID}`);

        if(rows.length === 0) {
            return null;
        };

        return rows;
    },
    loadBySubCategoryID: async (subCategoryID) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE sub_category_id = ${subCategoryID}`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    loadByPostIDWithCategoryAndSubCategoryName: async (postID) => {
        const rows = await db.load(`SELECT P.*, C.name AS category_name, SC.name AS sub_category_name FROM ${TBL} P JOIN CATEGORY C ON P.category_id = C.id JOIN SUB_CATEGORY SC ON P.sub_category_id = SC.id WHERE P.id = ${postID}`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    loadBySlugWithCategoryAndSubCategoryName: async (slug) => {
        const rows = await db.load(`SELECT P.*, C.name AS category_name, SC.name AS sub_category_name FROM ${TBL} P JOIN CATEGORY C ON P.category_id = C.id JOIN SUB_CATEGORY SC ON P.sub_category_id = SC.id WHERE P.slug = '${slug}'`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    increaseView: (postID) => {
        return db.updateView(TBL, { id: postID });
    },
    loadRelatedPost: async (postID, subCategoryID) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE sub_category_id = ${subCategoryID} AND id != ${postID} ORDER BY created_at DESC LIMIT 0, 10`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    loadPendingPostsByCategory: async (categoryID) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE status = 'PENDING' AND category_id = ${categoryID}`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    loadPendingPostByID: async (postID) => {
        const rows = await db.load(`SELECT P.*, C.name AS category_name, SC.name AS sub_category_name FROM ${TBL} P JOIN CATEGORY C ON P.category_id = C.id JOIN SUB_CATEGORY SC ON P.sub_category_id = SC.id WHERE P.status = 'PENDING' AND P.id = ${postID}`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    }
}