const db = require('../utils/db');
const TBL = 'TAG';

module.exports = {
  all: function () {
    return db.load(`SELECT * FROM TAG WHERE isDeleted != 1`);
  },

  allByTag: function (tagId) {
    return db.load(`
        SELECT *
        FROM TAG join POST_TAG on TAG.id = POST_TAG.tag_id join POST on POST_TAG.post_id = POST.id
        WHERE TAG.id = '${tagId}' AND isDeleted != 1`);
  },

  pageByTag: async function (tagId, limit, offset, isAuthenticated = false) {
    var orderIfAuthenticated = '';
    if (isAuthenticated) {
      orderIfAuthenticated = "FIELD(type, 'PREMIUM', 'FREE'),";
    }
    const rows = await db.load(`
      SELECT p.*, c.name AS category_name, sc.name AS sub_category_name, c.slug AS category_slug, sc.slug AS sub_category_slug
      FROM POST p JOIN CATEGORY c ON p.category_id = c.id JOIN SUB_CATEGORY sc ON p.sub_category_id = sc.id JOIN POST_TAG pt ON p.id = pt.post_id JOIN TAG t on pt.tag_id = t.id
      WHERE pt.tag_id = '${tagId}' AND p.isDeleted != 1 AND (p.status = 'PUBLISHED' OR (p.status = 'APPROVED' AND p.publish_time <= NOW())) ORDER BY ${orderIfAuthenticated} p.publish_time DESC LIMIT ${limit} OFFSET ${offset}`);

    if (rows.length === 0) {
      return null;
    }

    return rows;
  },

  countByTag: function (tagId) {
    return db.load(`
      SELECT COUNT(*) as total
      FROM POST JOIN POST_TAG on POST.id = POST_TAG.post_id
      WHERE POST_TAG.tag_id = '${tagId}' AND POST.isDeleted != 1 AND (POST.status = 'PUBLISHED' OR (POST.status = 'APPROVED' AND POST.publish_time <= NOW()))`);
  },

  loagByTagID: async function (tagID) {
    const rows = await db.load(`
      SELECT * FROM ${TBL} WHERE isDeleted != 1 AND id = '${tagID}'`);

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  },

  loadBySlug: async function (slug) {
    const rows = await db.load(`
      SELECT * FROM ${TBL} WHERE slug = '${slug}' AND isDeleted != 1`);

    if (rows.length === 0) {
      return null;
    }

    return rows[0];
  },

  countBySlug: async function (slug) {
    const rows = await db.load(`
      SELECT COUNT(*) as total
      FROM POST JOIN POST_TAG on POST.id = POST_TAG.post_id JOIN TAG on POST_TAG.tag_id = TAG.id
      WHERE TAG.slug = '${slug}' AND POST.isDeleted != 1 AND (POST.status = 'PUBLISHED' OR (POST.status = 'APPROVED' AND POST.publish_time <= NOW()))`);

    if (rows.length === 0) {
      return null;
    }

    return rows[0].total;
  },
};
