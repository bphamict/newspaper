const express = require('express');
const db = require('../../utils/db');
const categoriesModel = require('../../models/admin/categories.model');
const config = require('../../configs/default');
const router = express.Router();
const isAdmin = require('../../middlewares/isAdmin.middleware');
const slugify = require('slugify');

router.get('/', isAdmin, async function (req, res) {
  const page = +req.query.page || 1;
  if (page < 0) page = 1;
  const limit = config.pagination.limit;
  const offset = (page - 1) * limit;

  const [list, total] = await Promise.all([
    categoriesModel.page(limit, offset),
    categoriesModel.count(),
  ]);

  const nPages = Math.ceil(total / limit);

  const page_items = [];
  for (let i = 1; i <= nPages; i++) {
    const item = {
      value: i,
      isActive: i === page,
    };
    page_items.push(item);
  }

  //console.log(list);
  res.render('Admin/Categories/list', {
    categories: list,
    empty: list.length === 0,
    page_items,
    prev_value: page - 1,
    next_value: page + 1,
    can_go_prev: page > 1,
    can_go_next: page < nPages,
  });
});

router.get('/add', isAdmin, function (req, res) {
  res.render('Admin/Categories/add');
});

router.post('/add', async function (req, res) {
  const entity = req.body;
  entity.slug = slugify(req.body.name, {
    remove: /[*+~.()'"!=:@|^&${}[\]`;/?,\\<>%]/g,
    lower: true,
    locale: 'vi',
  });

  await categoriesModel.add(entity);
  res.render('Admin/Categories/add');
});

router.get('/:slug/edit', isAdmin, async function (req, res) {
  const slug = req.params.slug;
  const row = await categoriesModel.singleBySlug(slug);
  console.log(row);
  if (row.length === 0) {
    res.render('static/404', { layout: false });
  } else {
    res.render('Admin/Categories/edit', { category: row[0] });
  }
});

router.post('/update', async function (req, res) {
  const entity = req.body;
  entity.slug = slugify(req.body.name, {
    remove: /[*+~.()'"!=:@|^&${}[\]`;/?,\\<>%]/g,
    lower: true,
    locale: 'vi',
  });

  await categoriesModel.update(entity);
  res.redirect('/Admin/categories');
});

router.post('/delete', async function (req, res) {
  const entity = req.body;
  entity.isDeleted = 1;
  entity.slug = slugify(req.body.name, {
    remove: /[*+~.()'"!=:@|^&${}[\]`;/?,\\<>%]/g,
    lower: true,
    locale: 'vi',
  });
  //console.log(entity);
  await categoriesModel.del(entity);
  res.redirect('/Admin/categories');
});

module.exports = router;
