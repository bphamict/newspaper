const express = require('express');
const db = require('../../utils/db');
const postsModel = require('../../models/admin/posts.model');
const router = express.Router();
const isAdmin = require('../../middlewares/isAdmin.middleware');

router.get('/', isAdmin, async function (req, res) {
  const page = +req.query.page || 1;
  if (page < 0) page = 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const list = await postsModel.page(limit, offset);

  const total = await postsModel.count();
  const nPages = Math.ceil(total / limit);

  const page_items = [];
  for (let i = 1; i <= nPages; i++) {
    const item = {
      value: i,
      isActive: i === page,
    };
    page_items.push(item);
  }

  res.render('Admin/Posts/list', {
    posts: list,
    empty: list.length === 0,
    page_items,
    prev_value: page - 1,
    next_value: page + 1,
    can_go_prev: page > 1,
    can_go_next: page < nPages,
  });
});

router.get('/detail', isAdmin, async function (req, res) {
  const id = +req.query.id || -1;
  const row = await postsModel.single(id);
  if (row.length === 0) {
    res.send('Invalid parameter.');
  }
  const post = row[0];
  console.log(post);
  res.render('Admin/Posts/detail', { post });
});

router.post('/search', isAdmin, async function (req, res) {
  const title = req.body.name;
  const page = +req.query.page || 1;
  if (page < 0) page = 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const list = await postsModel.pageByTitle(title,limit,offset);

  const total = await postsModel.count();
  const nPages = Math.ceil(total / limit);

  const page_items = [];
  for (let i = 1; i <= nPages; i++) {
    const item = {
      value: i,
      isActive: i === page,
    };
    page_items.push(item);
  }

  res.render('Admin/Posts/result', { 
    posts: list,
    empty: list.length === 0,
    page_items,
    prev_value: page - 1,
    next_value: page + 1,
    can_go_prev: page > 1,
    can_go_next: page < nPages,
   });
});


router.get('/edit', isAdmin, async function (req, res) {
  const id = +req.query.id || -1;
  const row = await postsModel.single(id);
  if (row.length === 0) {
    res.send('Invalid parameter.');
  }
  const post = row[0];
  console.log(post);
  res.render('Admin/Posts/edit', { post });
});

module.exports = router;
