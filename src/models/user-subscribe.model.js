const db = require('../utils/db');

const TBL = 'USER_SUBCRIBE';

module.exports = {
    add: (entity) => {
        return db.create(TBL, entity);
    },
    loadByID: async (userID) => {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE user_id = ${userID}`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },
    update: (entity) => {
        const condition = {
            user_id: entity.userID,
        }
        delete entity.userID;
        return db.update(TBL, entity, condition);
    },
    delete: (userID) => {
        const condition = {
            user_id: userID,
        }
        return db.delete(TBL, condition);
    }
}