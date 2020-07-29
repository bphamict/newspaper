const express = require('express');
const db = require('../../utils/db');
const tagsModel = require('../../models/admin/tags.model');
const config = require('../../configs/default');
const router = express.Router();
const isAdmin = require('../../middlewares/isAdmin.middleware');
const slugify = require('slugify');

router.get('/', isAdmin, async function (req, res) {
  const page = +req.query.page || 1;
  if(page < 0) page = 1;
  const limit = config.pagination.limit;
  const offset = (page - 1) * limit;

  const list = await tagsModel.page(limit,offset);

  const total = await tagsModel.count();
  const nPages = Math.ceil(total/limit);
  
  const page_items = [];
  for(let i = 1; i<=nPages; i++){
    const item = {
      value: i,
      isActive: i === page
    }
    page_items.push(item);
  }

  res.render('Admin/Tags/list', { 
    tags: list, 
    empty: list.length === 0,
    page_items,
    prev_value: page - 1,
    next_value: page + 1,
    can_go_prev: page > 1,
    can_go_next: page < nPages,
   });
});

router.get('/add', isAdmin, function (req, res) {
  res.render('Admin/Tags/add');
});

router.post('/add', async function (req, res) {
  const entity = req.body;
  entity.slug = slugify(req.body.name, {
    remove: /[*+~.()'"!=:@|^&${}[\]`;/?,\\<>%]/g,
    lower: true,
    locale: 'vi',
  });
  await tagsModel.add(entity);
  res.render('Admin/Tags/add');
});

router.get('/:slug/edit', isAdmin, async function (req, res) {
  const slug = req.params.slug;
  const row = await tagsModel.singleBySlug(slug);
  if (row.length === 0) {
    res.send('Invalid parameter.');
  }
  const tag = row[0];
  res.render('Admin/Tags/edit', { tag });
});

router.post('/update', async function (req, res) {
  const entity = req.body;
  entity.slug = slugify(req.body.name, {
    remove: /[*+~.()'"!=:@|^&${}[\]`;/?,\\<>%]/g,
    lower: true,
    locale: 'vi',
  });
  await tagsModel.update(entity);
  res.redirect('/Admin/Tags');
});

router.post('/delete', async function (req, res) {
  const entity = req.body;
  entity.isDeleted = 1;
  entity.slug = slugify(req.body.name, {
    remove: /[*+~.()'"!=:@|^&${}[\]`;/?,\\<>%]/g,
    lower: true,
    locale: 'vi',
  });
  await tagsModel.del(entity);
  res.redirect('/Admin/Tags');
});

module.exports = router;
