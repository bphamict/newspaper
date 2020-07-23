const router = require('express').Router();
const tagModel = require('../models/tag.model');
const configs = require('../configs/default');

router.get('/:id', async function(req, res){
    const page = +req.query.page || 1;
    if(page < 0) page = 1;
    const offset = (page - 1) * configs.pagination.limit;

    const [l, total] = await Promise.all([
        tagModel.pageByTag(req.params.id, configs.pagination.limit, offset),
        tagModel.countByTag(req.params.id)
    ])

    tagName = l[0].name;

    const nPages = Math.ceil(total[0].total / configs.pagination.limit);

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
        tagName,
        tag: l,
        page_items,
        prev_value: page - 1,
        next_value: page + 1,
        can_go_prev: page > 1,
        can_go_next: page < nPages,
    });
})

module.exports = router;