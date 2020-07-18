const db = require('../utils/db');

module.exports = {
    all:function(){
        return db.load(`SELECT * FROM tag`);
    },

    allByTag:function(tagId){
        return db.load(`SELECT * FROM tag join post_tag on tag.id = post_tag.tag_id join post on post_tag.post_id = post.id WHERE tag.id = ${tagId}`)
    }
};