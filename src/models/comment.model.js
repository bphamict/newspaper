const db = require('../utils/db');

const TBL = 'COMMENT';

module.exports = {
    loadNCommentsFromPost: async (postID, offset, limit) => {
        const rows = await db.load(`SELECT C.*, U.full_name FROM ${TBL} C JOIN USER U ON C.user_id = U.id WHERE C.post_id = ${postID} ORDER BY C.id DESC LIMIT ${offset}, ${limit}`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    add: (commentObj) => {
        return db.create(TBL, commentObj);
    },
    loadByCommentID: async (commentID) => {
        const rows = await db.load(`SELECT C.*, U.full_name FROM ${TBL} C JOIN USER U ON C.user_id = U.id WHERE C.id = ${commentID}`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    }
}