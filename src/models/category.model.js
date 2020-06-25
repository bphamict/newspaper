const db = require('../utils/db');

module.exports = {
    all:function(){
        return db.load(`SELECT category.name as catName FROM category`);
    },
};