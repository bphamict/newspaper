const db = require('../utils/db');

const TBL = 'SUB_CATEGORY';
const CAT_TBL = 'CATEGORY';

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
    loadByParentCategory: async (parentName) => {
        const rows = await db.load(`SELECT SUB_CAT.* FROM ${TBL} SUB_CAT JOIN ${CAT_TBL} CAT ON SUB_CAT.category_id = CAT.id WHERE CAT.name = '${parentName}' AND SUB_CAT.isDeleted = 0`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
    add: (subCatObj) => {
        return db.create(TBL, subCatObj);
    }
}