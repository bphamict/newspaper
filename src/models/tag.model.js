const db = require('../utils/db');
const TBL = 'tag'

module.exports = {
    all:function(){
        return db.load(`SELECT * FROM tag`);
    },

    allByTag:function(tagId){
        return db.load(`SELECT * FROM tag join post_tag on tag.id = post_tag.tag_id join post on post_tag.post_id = post.id WHERE tag.id = '${tagId}'`)
    },

    pageByTag: async function(tagId, limit, offset, isAuthenticated = false){
        var orderIfAuthenticated = '';
        if(isAuthenticated) {
            orderIfAuthenticated = "FIELD(type, 'PREMIUM', 'FREE'),"
        }
        const rows = await db.load(`SELECT p.*, C.name AS category_name, SC.name AS sub_category_name FROM post p JOIN category c ON p.category_id = c.id JOIN sub_category sc ON p.sub_category_id = sc.id JOIN post_tag pt ON p.id = pt.post_id JOIN tag t on pt.tag_id = t.id WHERE pt.tag_id = '${tagId}' AND p.isDeleted != 1 AND (p.status = 'PUBLISHED' OR (p.status = 'APPROVED' AND p.publish_time <= NOW())) ORDER BY ${orderIfAuthenticated} p.publish_time DESC LIMIT ${limit} OFFSET ${offset}`);

        if(rows.length === 0) {
            return null;
        }

        return rows;
    },

    countByTag:function(tagId){
        return db.load(`SELECT COUNT(*) as total FROM post JOIN post_tag on post.id = post_tag.post_id WHERE post_tag.tag_id = '${tagId}' AND post.isDeleted != 1 AND (post.status = 'PUBLISHED' OR (post.status = 'APPROVED' AND post.publish_time <= NOW()))`);
    },

    loagByTagID: async function(tagID) {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE isDeleted != 1 AND id = '${tagID}'`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },

    loadBySlug: async function(slug) {
        const rows = await db.load(`SELECT * FROM ${TBL} WHERE slug = '${slug}' AND isDeleted != 1`);

        if(rows.length === 0) {
            return null;
        }

        return rows[0];
    },

    countBySlug: async function(slug) {
        const rows = await db.load(`SELECT COUNT(*) as total FROM post JOIN post_tag on post.id = post_tag.post_id JOIN tag on post_tag.tag_id = tag.id WHERE tag.slug = '${slug}' AND post.isDeleted != 1 AND (post.status = 'PUBLISHED' OR (post.status = 'APPROVED' AND post.publish_time <= NOW()))`);
        
        if(rows.length === 0) {
            return null;
        }

        return rows[0].total;
    },
};