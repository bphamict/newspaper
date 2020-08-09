const router = require('express').Router();
const configs = require('../configs/default');
const postTagModel = require('../models/post-tag.model');
const postModel = require('../models/post.model');
const categoryModel = require('../models/category.model');

router.get('/:slug', async function(req, res){
    let page = +req.query.page || -1;
    const slug = req.params.slug || '';
    const category = await categoryModel.loadBySlug(slug);

    if(!category) {
        return res.render('post/error');
    }

    const limit = configs.pagination.limit;
    const total = await postModel.countBySlugCategory(slug);
    const numOfPage = Math.ceil(total / limit);
    if(page < 1 || page > numOfPage) {
        page = 1;
    }

    const offset = (page - 1) * limit;
    const [ posts, post_tags ]= await Promise.all([postModel.pageBySlugCategory(slug, limit, offset, req.isAuthenticated()), postTagModel.loadAllWithName()]);

    const pageItems = [];
    if(numOfPage > 5) {
        const isNearEnd = page + 2 > numOfPage;
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
            for(let i = page; i <= numOfPage; i++) {
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
        for(let i = 1; i <= numOfPage; i++) {
            pageItems.push({
                value: i,
                isActive: i === page,
            })
        }
    }

    res.render('post/byCat',{
        pageName: category.name,
        posts,
        post_tags,
        pageItems,
        prev_value: page - 1,
        next_value: page + 1,
        can_go_prev: page > 1,
        can_go_next: page < numOfPage,
        numOfPage
    });
})

module.exports = router;