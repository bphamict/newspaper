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
    }
}