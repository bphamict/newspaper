const db = require('../utils/db');

const TBL = 'CATEGORY';

module.exports = {
    loadAll: async () => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE isDeleted = 0`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    findByName: async (name) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE name = '${name}' AND isDeleted = 0`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    findByID: async (id) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE id = ${id} AND isDeleted = 0`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    add: (categoryObj) => {
        return db.create(TBL, categoryObj);
    }
}