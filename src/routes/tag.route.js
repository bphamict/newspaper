const router = require('express').Router();
const tagModel = require('../models/tag.model');
const configs = require('../configs/default');
const moment = require('moment');
const postTagModel = require('../models/post-tag.model');
moment.locale('vi');

router.get('/:slug', async function(req, res){
    const slug = req.params.slug || '';
    const tag = await tagModel.loadBySlug(slug);
    if(!tag) {
        return res.render('post/error');
    }

    let page = +req.query.page || 1;
    const limit = configs.pagination.limit;
    const total = await tagModel.countBySlug(slug);
    const nPages = Math.ceil(total / limit);
    if(page < 0 || page > nPages) {
        page = 1;
    }
    
    const offset = (page - 1) * limit;
    const [l, post_tags] = await Promise.all([
        tagModel.pageByTag(tag.id, configs.pagination.limit, offset, req.isAuthenticated()),
        postTagModel.loadAllWithName()
    ])

    l.forEach((item) => {
        item.publish_time = moment(item.publish_time).format('LLL');
    })

    const pageItems = [];
    if(nPages > 5) {
        const isNearEnd = page + 2 > nPages;
        if(!isNearEnd) {
            for(let i = page - 2; i <= page; i++) {
                if(i > 0) {
                    pageItems.push({
                        value: i,
                        isActive: i === page
                    })
                }
            }

            const numberOfPage = pageItems.length;

            for(let i = page + 1; i <= page + (5 - numberOfPage); i++) {
                pageItems.push({
                    value: i,
                    isActive: false,
                })
            }
        } else {
            for(let i = page; i <= nPages; i++) {
                pageItems.push({
                    value: i,
                    isActive: i === page,
                })
            }

            const numberOfPage = pageItems.length;

            for(let i = page - 1; i >=  page - (5 - numberOfPage); i--) {
                pageItems.unshift({
                    value: i,
                    isActive: false,
                })
            }
        }
    } else {
        for(let i = 1; i <= nPages; i++) {
            pageItems.push({
                value: i,
                isActive: i === page,
            })
        }
    }

    res.render('post/byTag',{
        tagName: tag.name,
        posts: l,
        pageItems,
        post_tags,
        prev_value: page - 1,
        next_value: page + 1,
        can_go_prev: page > 1,
        can_go_next: page < nPages,
        numOfPage: nPages
    });
})

module.exports = router;