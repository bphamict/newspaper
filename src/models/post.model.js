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
    
}