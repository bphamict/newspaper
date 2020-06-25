const express = require('express');
const db = require('../../utils/db');
const categoriesModel = require('../../models/admin/categories.model');
const router = express.Router();
const isAdmin = require('../../middlewares/isAdmin.middleware');

router.get('/', isAdmin, async function (req, res) {
    const list = await categoriesModel.all();
    console.log(list);
    res.render('Admin/Categories/list', {categories: list, empty: list.length === 0});
});

router.get('/add', isAdmin, function (req, res) {
    res.render('Admin/Categories/add');
});

router.post('/add', async function (req, res) {
    await categoriesModel.add(req.body);
    res.render('Admin/Categories/add');
});

router.get('/edit', isAdmin, async function (req, res) {
    const id = +req.query.id || -1;
    const row = await categoriesModel.single(id);
    if(row.length === 0){
        res.send('Invalid parameter.');
    }
    const category = row[0];
    console.log(category);
    res.render('Admin/Categories/edit', {category});
});

router.post('/update', async function (req, res) {
    const entity = {
        id: req.body.id,
        name: req.body.name,
        isDeleted: req.body.isDeleted,
    }
    
    await categoriesModel.update(entity);
    res.redirect('/Admin/categories');
});

router.post('/delete', async function (req, res) {
    const entity = {
        id: req.body.id,
        name: req.body.name,
        isDeleted: 1,
    }
    console.log(entity);
    await categoriesModel.del(entity);
    res.redirect('/Admin/categories');
});

module.exports = router;

