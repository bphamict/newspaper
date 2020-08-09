const db = require('../utils/db');

const TBL = 'ROLE';

module.exports = {
    loadAll: async () => {
        const rows = await db.load(`SELECT * FROM ${TBL}`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    }
}