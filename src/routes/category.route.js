const router = require('express').Router();
const categoryModel = require('../models/category.model');

router.get('/', async function(req, res){
    const list = await categoryModel.all();
    console.log(list);
    res.render('post/byCat',{
        category: list      
    });
})

module.exports = router;