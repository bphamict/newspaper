const router = require('express').Router();
const tagModel = require('../models/tag.model');
const configs = require('../configs/default');

router.get('/:id', async function(req, res){
    // const list = await tagModel.allByTag(req.params.id);
    // console.log(list);

    // tagName = list[0].name;

    const page = +req.query.page || 1;
    if(page < 0) page = 1;
    const offset = (page - 1) * configs.pagination.limit;
    const l = await tagModel.pageByTag(req.params.id, configs.pagination.limit, offset);

    tagName = l[0].name;

    const total = await tagModel.countByTag(req.params.id);
    const nPages = Math.ceil(total[0].total / configs.pagination.limit);

    const page_items = [];
    for(let i = 1; i <= nPages; i++){
        const item = {
            value: i
        }
        page_items.push(item);
    }

    console.log(nPages);

    res.render('post/byTag',{
        tagName: tagName,
        tag: l,
        page_items: page_items
    });
})

module.exports = router;