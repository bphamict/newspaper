const db = require('../utils/db');

const TBL = 'POST_TAG';

module.exports = {
    add: (post_tag_obj) => {
        return db.create(TBL, post_tag_obj);
    }
}