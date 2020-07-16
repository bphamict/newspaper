const db = require('../../utils/db');

const TABLE_NAME = 'sub_category';

module.exports = {
    all: function(){
        return db.load(`SELECT * FROM ${TABLE_NAME}`);
    },
    add: function(entity){
        return db.create(TABLE_NAME, entity);
    },
    single: function(id, category_id){
        return db.load(`SELECT * FROM ${TABLE_NAME} WHERE id = ${id} and category_id = ${category_id}`);
    },
    update: function(entity){
        const condition = {
            id: entity.id,
            category_id: entity.category_id
        }
        delete entity.id;
        return db.update(TABLE_NAME, entity, condition);
    },
    del: function(entity){
        const condition = {
            id: entity.id,
            category_id: entity.category_id

        }
        delete entity.id;
        delete entity.category_id;
        return db.update(TABLE_NAME, entity, condition);
    },
    loadByParentCategory: async (parentID) => {
        const rows = await db.load(`SELECT SUB_CAT.* FROM ${TABLE_NAME} SUB_CAT JOIN category CAT ON SUB_CAT.category_id = CAT.id WHERE CAT.id = '${parentID}' AND SUB_CAT.isDeleted = 0`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },
};