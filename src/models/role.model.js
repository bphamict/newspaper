const db = require('../utils/db');

const TBL = 'ROLE';

module.exports = {
    loadAll: async () => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE id != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    }
}