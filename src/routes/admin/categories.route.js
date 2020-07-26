const express = require('express');
const db = require('../../utils/db');
const categoriesModel = require('../../models/admin/categories.model');
const router = express.Router();
const isAdmin = require('../../middlewares/isAdmin.middleware');
const slugify = require('slugify');

router.get('/', isAdmin, async function (req, res) {
  const list = await categoriesModel.all();
  console.log(list);
  res.render('Admin/Categories/list', {
    categories: list,
    empty: list.length === 0,
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
    locale: 'vi'
  });

  await categoriesModel.add(entity);
  res.render('Admin/Categories/add');
});

router.get('/:slug/edit', isAdmin, async function (req, res) {
  const slug = req.params.slug;
  const row = await categoriesModel.singleBySlug(slug);
  if (row.length === 0) {
    res.send('Invalid parameter.');
  }
  const category = row[0];
  console.log(category);
  res.render('Admin/Categories/edit', { category });
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
    locale: 'vi'
  });
  console.log(entity);
  await categoriesModel.del(entity);
  res.redirect('/Admin/categories');
});

module.exports = router;
