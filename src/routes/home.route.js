const router = require('express').Router();
const homeModel = require('../models/home.model');

router.get('/', async function(req, res){
    const list = await homeModel.all();

    const first = list[0];
    const rest = [];
    list.forEach(element => {
        if(element === first){
            return;
        }
        rest.push({
            Image: element.Image,
            Title: element.Title,
        })
    });

    res.render('home',{
        first: first,
        post: rest      
    });
})

module.exports = router;