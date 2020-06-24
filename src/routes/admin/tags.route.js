const express = require('express');
const db = require('../../utils/db');
const tagsModel = require('../../models/admin/tags.model');
const router = express.Router();
const isAdmin = require('../../middlewares/isAdmin.middleware');

router.get('/', isAdmin, async function (req, res) {
    const list = await tagsModel.all();
    res.render('Admin/Tags/list', {tags: list, empty: list.length === 0});
});

router.get('/add', isAdmin, function (req, res) {
    res.render('Admin/Tags/add');
});

router.post('/add', async function (req, res) {
    await tagsModel.add(req.body);
    res.render('Admin/Tags/add');
});

router.get('/edit', isAdmin, async function (req, res) {
    const id = +req.query.id || -1;
    const row = await tagsModel.single(id);
    if(row.length === 0){
        res.send('Invalid parameter.');
    }
    const tag = row[0];
    res.render('Admin/Tags/edit', {tag});
});

router.post('/update', async function (req, res) {
    const entity = {
        id: req.body.id,
        name: req.body.name,
        isDeleted: req.body.isDeleted
    }
    await tagsModel.update(entity);
    res.redirect('/Admin/Tags');
});

router.post('/delete', async function (req, res) {
    const entity = {
        id: req.body.id,
        name: req.body.name,
        isDeleted: 1
    }
    await tagsModel.del(entity);
    res.redirect('/Admin/Tags');
});

module.exports = router;

