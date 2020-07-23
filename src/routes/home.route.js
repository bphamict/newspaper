const router = require('express').Router();
const homeModel = require('../models/home.model');

router.get('/', async function(req, res){
    const [postsForCarousel, catsWithSubs, top10Newest, top10View] = await Promise.all([
        homeModel.top3ViewLastWeek(),
        homeModel.catWithSubs(),
        homeModel.top10Newest(),
        homeModel.top10View()
    ])

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
        top10Newest,  
        top10View
    });
})

module.exports = router;