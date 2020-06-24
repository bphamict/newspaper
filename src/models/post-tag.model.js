const db = require('../utils/db');

const TBL = 'POST_TAG';

module.exports = {
    add: (post_tag_obj) => {
        return db.create(TBL, post_tag_obj);
    },
    loadByPostID: async (postID) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE post_id = ${postID}`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    deleteByPostID: (postID) => {
        const condition = {
            post_id: postID,
        };

        return db.delete(TBL, condition);
    }
}