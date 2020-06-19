const express = require('express');
const db = require('../utils/db');
const categoriesModel = require('../models/categories.model');
const router = express.Router();

router.get('/', async function (req, res) {
    const list = await categoriesModel.all();
    res.render('Admin/Categories/list', {categories: list, empty: list.length === 0});
});

router.get('/add', function (req, res) {
    res.render('Admin/Categories/add');
});

router.post('/add', async function (req, res) {
    await categoriesModel.add(req.body);
    res.render('Admin/Categories/add');
});

router.get('/edit', async function (req, res) {
    const id = +req.query.id || -1;
    const row = await categoriesModel.single(id);
    if(row.length === 0){
        res.send('Invalid parameter.');
    }
    const category = row[0];
    res.render('Admin/Categories/edit', {category});
});

router.post('/update', async function (req, res) {
    await categoriesModel.patch(req.body);
    res.redirect('/Admin/categories');
});

router.post('/delete', async function (req, res) {
    await categoriesModel.del(req.body);
    res.redirect('/Admin/categories');
});

module.exports = router;

