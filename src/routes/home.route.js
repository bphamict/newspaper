const router = require('express').Router();
const homeModel = require('../models/home.model');
const moment = require('moment');
const { catWithSubs } = require('../models/home.model');
moment.locale('vi');

router.get('/', async function(req, res){

    //Top 10 category??
    const [postsForCarousel, catsWithSubs, top10Newest, top10View, postsOrderByCat] = await Promise.all([
        homeModel.top3ViewLastWeek(),
        homeModel.catWithSubs(),
        homeModel.top10Newest(),
        homeModel.top10View(),
        homeModel.postsOrderByCat(),
    ])
    
    for(let i = 0; i < 10; i++) {
        top10View[i].publish_time = moment(top10View[i].publish_time).format('LLL');
        top10Newest[i].publish_time = moment(top10Newest[i].publish_time).format('LLL');
    }

    const first = postsForCarousel[0];
    const rest = [];
    postsForCarousel.forEach(element => {
        if(element === first){
            return;
        }
        rest.push({
            Image: element.Image,
            Title: element.Title,
            Slug: element.Slug,
        })
    });

    name = catsWithSubs[0].catName;
    ID = catsWithSubs[0].Id;
    slug = catsWithSubs[0].catSlug;
    subs = [];
    cats = [];
    posts = [];

    catsWithSubs.forEach(element => {
        if(element.catName === name)
        {
            subs.push({ subCatValue: element.subCatName, subCatSlug: element.subCatSlug});   
        }
        else
        {
            cats.push({
                id: ID,
                catName: name,
                catSlug: slug,
                subCatName: subs,
                posts
            })

            name = element.catName;
            ID = element.Id;
            slug = element.catSlug;
            subs = [];
            subs.push({ subCatValue: element.subCatName, subCatSlug: element.subCatSlug });
        }
        
    })
    cats.push({
        id: ID,
        catName: name,
        catSlug: slug,
        subCatName: subs,
        posts
    })

    cId = cats[0].id;

    for(let i = 0; i < cats.length; i++)
    {
        postsOrderByCat.forEach(element => {
            if(element.category_id === cats[i].id)
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
    });
})

module.exports = router;