const express = require('express');
const db = require('../utils/db');
const tagsModel = require('../models/tags.model');
const router = express.Router();

router.get('/', async function (req, res) {
    const list = await tagsModel.all();
    res.render('Admin/Tags/list', {tags: list, empty: list.length === 0});
});

router.get('/add', function (req, res) {
    res.render('Admin/Tags/add');
});

router.post('/add', async function (req, res) {
    await tagsModel.add(req.body);
    res.render('Admin/Tags/add');
});

router.get('/edit', async function (req, res) {
    const id = +req.query.id || -1;
    const row = await tagsModel.single(id);
    if(row.length === 0){
        res.send('Invalid parameter.');
    }
    const tag = row[0];
    res.render('Admin/Tags/edit', {tag});
});

router.post('/update', async function (req, res) {
    await tagsModel.patch(req.body);
    res.redirect('/Admin/Tags');
});

router.post('/delete', async function (req, res) {
    await tagsModel.del(req.body);
    res.redirect('/Admin/Tags');
});

module.exports = router;

