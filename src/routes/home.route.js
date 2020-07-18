const router = require('express').Router();
const homeModel = require('../models/home.model');

router.get('/', async function(req, res){
    const list = await homeModel.all();
    console.log(list);

    res.render('home',{
        post: list      
    });
})

module.exports = router;