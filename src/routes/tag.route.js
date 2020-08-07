const router = require('express').Router();
const tagModel = require('../models/tag.model');
const configs = require('../configs/default');
const moment = require('moment');
const postTagModel = require('../models/post-tag.model');
moment.locale('vi');

router.get('/:slug', async function(req, res){
    const tag = await tagModel.loadBySlug(req.params.slug);
    if(!tag) {
        return res.redirect('/');
    }

    const page = +req.query.page || 1;
    if(page < 0) page = 1;
    const offset = (page - 1) * configs.pagination.limit;

    const [l, total, post_tags] = await Promise.all([
        tagModel.pageByTag(tag.id, configs.pagination.limit, offset),
        tagModel.countBySlug(req.params.slug),
        postTagModel.loadAllWithName()
    ])

    l.forEach((item) => {
        item.publish_time = moment(item.publish_time).format('LLL');
    })

    const nPages = Math.ceil(total / configs.pagination.limit);

    const page_items = [];
    for(let i = 1; i <= nPages; i++){
        if(i === page - 1 || i === page || i === page + 1)
        {
            const item = {
                value: i,
                isActive: i === page
            }
            page_items.push(item);
        }
    }

    res.render('post/byTag',{
        tagName: tag.name,
        posts: l,
        page_items,
        post_tags,
        prev_value: page - 1,
        next_value: page + 1,
        can_go_prev: page > 1,
        can_go_next: page < nPages,
    });
})

module.exports = router;