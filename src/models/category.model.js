const db = require('../utils/db');

module.exports = {
    all:function(){
        return db.load(`SELECT category.name as CatName, sub_category.name as SubCatName FROM category JOIN sub_category on category.id = sub_category.category_id`);
    },
};