const express = require('express');
const db = require('../../utils/db');
const categoriesModel = require('../../models/admin/categories.model');
const subcategoriesModel = require('../../models/admin/subcategories.model');
const router = express.Router();
const isAdmin = require('../../middlewares/isAdmin.middleware');
const slugify = require('slugify');

router.get('/', isAdmin, async function (req, res) {
  const page = +req.query.page || 1;
  if(page < 0) page = 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const list = await subcategoriesModel.page(limit,offset);

  const total = await subcategoriesModel.count();
  const nPages = Math.ceil(total/limit);
  
  const page_items = [];
  for(let i = 1; i<=nPages; i++){
    const item = {
      value: i,
      isActive: i === page
    }
    page_items.push(item);
  }

  console.log(list);
  res.render('Admin/Subcategories/list', {
    subcategories: list,
    empty: list.length === 0,
    page_items,
    prev_value: page - 1,
    next_value: page + 1,
    can_go_prev: page > 1,
    can_go_next: page < nPages,
  });
});

router.get('/add', isAdmin, async function (req, res) {
  const list = await categoriesModel.all();
  console.log(list);
  res.render('Admin/Subcategories/add', {
    categories: list,
    empty: list.length === 0,
  });
});

router.post('/add', async function (req, res) {
  const row = await categoriesModel.singleByName(req.body.nameCtg);
  const list = row[0];

  const entity = {
    category_id: list.id,
    name: req.body.name,
    isDeleted: req.body.isDeleted,
    slug: slugify(req.body.name, {
      remove: /[*+~.()'"!=:@|^&${}[\]`;/?,\\<>%]/g,
      lower: true,
      locale: 'vi',
    }),
  };

  await subcategoriesModel.add(entity);
  res.render('Admin/Subcategories/add');
});

router.get('/:slug/edit/:id', isAdmin, async function (req, res) {
  const id = req.params.id;
  const row = await subcategoriesModel.single(id);
  const list = await categoriesModel.all();
  const obj = row[0];

  if (row.length === 0) {
    res.send('Invalid parameter.');
  }

  console.log(obj);
  res.render('Admin/Subcategories/edit', {
    subcategory: obj,
    categories: list,
  });
});

router.post('/update', async function (req, res) {
  const row = await categoriesModel.singleByName(req.body.nameCtg);
  const list = row[0];
  if (row.length !== 0) {
    const entity = {
      id: req.body.id,
      category_id: list.id,
      name: req.body.name,
      slug: slugify(req.body.name, {
        remove: /[*+~.()'"!=:@|^&${}[\]`;/?,\\<>%]/g,
        lower: true,
        locale: 'vi',
      }),
      isDeleted: req.body.isDeleted,
    };
    console.log(entity);
    await subcategoriesModel.update(entity);
    res.redirect('/Admin/subcategories');
  }
});

router.post('/delete', async function (req, res) {
  const entity = {
    id: req.body.id,
    isDeleted: 1,
  };
  console.log(entity);
  await subcategoriesModel.del(entity);
  res.redirect('/Admin/subcategories');
});

module.exports = router;
