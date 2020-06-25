const express = require('express');
const db = require('../../utils/db');
const categoriesModel = require('../../models/admin/categories.model');
const subcategoriesModel = require('../../models/admin/subcategories.model');
const router = express.Router();
const isAdmin = require('../../middlewares/isAdmin.middleware');

router.get('/', isAdmin, async function (req, res) {
    const list = await subcategoriesModel.all();
    res.render('Admin/Subcategories/list', {subcategories: list, empty: list.length === 0});
});

router.get('/add', isAdmin, async function (req, res) {
    const list = await categoriesModel.all();
    res.render('Admin/Subcategories/add', {categories: list, empty: list.length === 0});
});

router.post('/add', async function (req, res) {
    const row = await categoriesModel.singleByName(req.body.nameCtg);
    const list = row[0];

    const entity = {
        category_id: list.id,
        name: req.body.name,
        isDeleted: req.body.isDeleted,
    }
    
    await subcategoriesModel.add(entity);
    res.render('Admin/Subcategories/add');
});

router.get('/edit', isAdmin, async function (req, res) {
    const id = +req.query.id || -1;
    //const category_id = +req.query.category_id || -1;
    const row = await subcategoriesModel.single(id);
    if(row.length === 0){
        res.send('Invalid parameter.');
    }
    const obj = row[0];

    console.log(obj);
    const list = await categoriesModel.all();
    res.render('Admin/Subcategories/edit', {subcategory: obj, categories: list});
});

router.post('/update', async function (req, res) {
    const row = await categoriesModel.singleByName(req.body.nameCtg);
    const list = row[0];
    if(row.length !== 0){
        const entity = {
            id: req.body.id,
            category_id: list.id,
            name: req.body.name,
            isDeleted: req.body.isDeleted,
        }
        console.log(entity);
        await subcategoriesModel.update(entity);
        res.redirect('/Admin/subcategories');
    }
    
});

router.post('/delete', async function (req, res) {
    const entity = {
        id: req.body.id,
        isDeleted: 1,
    }
    console.log(entity);
    await subcategoriesModel.del(entity);
    res.redirect('/Admin/subcategories');
});

module.exports = router;

