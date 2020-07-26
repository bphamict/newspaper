const express = require('express');
const db = require('../../utils/db');
const postsModel = require('../../models/admin/posts.model');
const router = express.Router();
const isAdmin = require('../../middlewares/isAdmin.middleware');

router.get('/', isAdmin, async function (req, res) {
    const list = await postsModel.all();
    res.render('Admin/Posts/list', {posts: list, empty: list.length === 0});
});

router.get('/detail', isAdmin, async function (req, res) {
    const id = +req.query.id || -1;
    const row = await postsModel.single(id);
    if(row.length === 0){
        res.send('Invalid parameter.');
    }
    const post = row[0];
    console.log(post);
    res.render('Admin/Posts/detail', {post});
    
});
router.get('/edit', isAdmin, async function (req, res) {
    const id = +req.query.id || -1;
    const row = await postsModel.single(id);
    if(row.length === 0){
        res.send('Invalid parameter.');
    }
    const post = row[0];
    console.log(post);
    res.render('Admin/Posts/edit', {post});
    
});

router.post('/update_status', async function (req, res) {
    const entity = {
        id: req.body.id,
        featured_image: req.body.featured_image,
        type: req.body.type,
        status: req.body.status,
        title: req.body.title,
        summary: req.body.summary,
        content: req.body.content,
        view_count: req.body.view_count,
        author: req.body.author,
        category_id: req.body.category_id,
        sub_category_id: req.body.sub_category_id,
        created_at: req.body.created_at,
        updated_at: req.body.updated_at
    }
    
    await postsModel.update(entity);
    res.redirect('/Admin/categories');
});

module.exports = router;