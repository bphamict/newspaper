const router = require('express').Router();
const categoryModel = require('../models/category.model');
const configs = require('../configs/default');

router.get('/:id', async function(req, res){
    const page = +req.query.page || 1;
    if(page < 0) page = 1;
    const offset = (page - 1) * configs.pagination.limit;

    const [l, total, subCats] = await Promise.all([
        categoryModel.pageByCat(req.params.id, configs.pagination.limit, offset),
        categoryModel.countByCat(req.params.id),
        categoryModel.subCats(req.params.id)
    ])

    catName = l[0].name;

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

    res.render('post/byCat',{
        catName,
        cat: l,
        subCats,
        page_items,
        prev_value: page - 1,
        next_value: page + 1,
        can_go_prev: page > 1,
        can_go_next: page < nPages,
    });
})

module.exports = router;