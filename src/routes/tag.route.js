const router = require('express').Router();
const tagModel = require('../models/tag.model');

router.get('/:id', async function(req, res){
    const list = await tagModel.allByTag(req.params.id);
    console.log(list);

    tagName = list[0].name;
    res.render('post/byTag',{
        tagName: tagName,
        tag: list 
    });
})

module.exports = router;