const router = require('express').Router();
const homeModel = require('../models/home.model');

router.get('/', async function(req, res){
    const [postsForCarousel, catsWithSubs, top10Newest, top10View, postsOrderByCat, categories] = await Promise.all([
        homeModel.top3ViewLastWeek(),
        homeModel.catWithSubs(),
        homeModel.top10Newest(),
        homeModel.top10View(),
        homeModel.postsOrderByCat(),
        homeModel.categories()
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

    console.log(catsWithSubs);

    name = catsWithSubs[0].catName;
    ID = catsWithSubs[0].Id; 
    subs = [];
    cats = [];
    posts = [];

    catsWithSubs.forEach(element => {
        if(element.catName === name)
        {
            subs.push(element.subCatName);   
        }
        else
        {
            cats.push({
                id: ID,
                catName: name,
                subCatName: subs,
                posts
            })

            name = element.catName;
            ID = element.Id;
            subs = [];
            subs.push(element.subCatName);
        }
        
    })
    cats.push({
        id: ID,
        catName: name,
        subCatName: subs,
        posts
    })

    cId = cats[0].id;

    for(let i = 0; i < cats.length; i++)
    {
        postsOrderByCat.forEach(element => {
            if(element.CatId === cats[i].id)
            {
                posts.push(element);
            }
        })
        cats[i].posts = posts;
        posts = [];
    }

    res.render('home',{
        first: first,
        post: rest,
        cats: cats,
        top10Newest,  
        top10View,
        categories
    });
})

module.exports = router;