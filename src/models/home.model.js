const db = require('../utils/db');

module.exports = {
    all:function(){
        return db.load(`SELECT featured_image as Image, title as Title FROM post ORDER BY view_count DESC LIMIT 3`);
    },
};