const router = require('express').Router();
const homeModel = require('../models/home.model');

router.get('/', async function(req, res){
    const postsForCarousel = await homeModel.top3ViewLastWeek();

    const first = postsForCarousel[0];
    const rest = [];
    postsForCarousel.forEach(element => {
        if(element === first){
            return;
        }
        rest.push({
            Image: element.Image,
            Title: element.Title,
        })
    });
    
    const catsWithSubs = await homeModel.catWithSubs();

    name = catsWithSubs[0].catName;
    subs = [];
    cats = [];
    catsWithSubs.forEach(element => {
        if(element.catName === name)
        {
            subs.push(element.subCatName);
        }
        else
        {
            cats.push({
                catName: name,
                subCatName: subs,
            })

            name = element.catName;
            subs = [];
            subs.push(element.subCatName);
        }
    })
    cats.push({
        catName: name,
        subCatName: subs,
    })

    console.log(cats);

    res.render('home',{
        first: first,
        post: rest,
        cats: cats,  
    });
})

module.exports = router;