const db = require('../utils/db');

module.exports = {
    all:function(){
        return db.load(`SELECT * FROM tag`);
    },

    allByTag:function(tagId){
        return db.load(`SELECT * FROM tag join post_tag on tag.id = post_tag.tag_id join post on post_tag.post_id = post.id WHERE tag.id = '${tagId}'`)
    },

    pageByTag:function(tagId, limit, offset){
        return db.load(`SELECT * FROM post JOIN post_tag ON post.id = post_tag.post_id JOIN tag on post_tag.tag_id = tag.id WHERE post_tag.tag_id = '${tagId}' LIMIT ${limit} OFFSET ${offset}`);
    },

    countByTag:function(tagId){
        return db.load(`SELECT COUNT(*) as total FROM post JOIN post_tag on post.id = post_tag.post_id WHERE post_tag.tag_id = '${tagId}'`);
    }
};