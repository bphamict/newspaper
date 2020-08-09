const express = require('express');
const db = require('../../utils/db');
const categoriesModel = require('../../models/admin/categories.model');
const subcategoriesModel = require('../../models/admin/subcategories.model');
const postsModel = require('../../models/admin/posts.model');
const config = require('../../configs/default');
const router = express.Router();
const isAdmin = require('../../middlewares/isAdmin.middleware');
const slugify = require('slugify');

router.get('/', isAdmin, async function (req, res) {
  let page = +req.query.page || -1;
  const limit = config.pagination.limit;
  const total = await subcategoriesModel.count();
  const nPages = Math.ceil(total / limit);
  if(page < 1 || page > nPages) {
    page = 1;
  }

  const offset = (page - 1) * limit;
  const list = await subcategoriesModel.page(limit, offset);

  const pageItems = [];
  if(nPages > 5) {
    const isNearEnd = page + 2 > nPages;
    if(!isNearEnd) {
        for(let i = page - 2; i <= page; i++) {
            if(i > 0) {
                pageItems.push({
                    value: i,
                    isActive: i === page
                })
            }
        }

        const numberOfPage = pageItems.length;

        for(let i = page + 1; i <= page + (5 - numberOfPage); i++) {
            pageItems.push({
                value: i,
                isActive: false,
            })
        }
    } else {
        for(let i = page; i <= nPages; i++) {
            pageItems.push({
                value: i,
                isActive: i === page,
            })
        }

        const numberOfPage = pageItems.length;

        for(let i = page - 1; i >=  page - (5 - numberOfPage); i--) {
            pageItems.unshift({
                value: i,
                isActive: false,
            })
        }
    }
  } else {
    for(let i = 1; i <= nPages; i++) {
        pageItems.push({
            value: i,
            isActive: i === page,
        })
    }
  }

  res.render('Admin/Subcategories/list', {
    subcategories: list,
    empty: list.length === 0,
    pageItems,
    prev_value: page - 1,
    next_value: page + 1,
    canGoPrev: page > 1,
    canGoNext: page < nPages,
    offset: (page - 1) * 5 + 1,
    numOfPage: nPages
  });
});

router.get('/add', isAdmin, async function (req, res) {
  const list = await categoriesModel.all();
  res.render('Admin/Subcategories/add', {
    categories: list,
    empty: list.length === 0,
  });
});

router.post('/add', async function (req, res) {
  const entity = {
    category_id: +req.body.category_id,
    name: req.body.name,
    slug: slugify(req.body.name, {
      remove: /[*+~.()'"!=:@|^&${}[\]`;/?,\\<>%]/g,
      lower: true,
      locale: 'vi',
    }),
  };

  await subcategoriesModel.add(entity);
  res.redirect('/admin/subcategories');
});

router.get('/:slug/edit', isAdmin, async function (req, res) {
  const slug = req.params.slug;

  const [row, list] = await Promise.all([
    subcategoriesModel.singleBySlug(slug),
    categoriesModel.all(),
  ]);

  if (!row) {
    res.render('static/404', { layout: false });
  } else {
    res.render('Admin/Subcategories/edit', {
      subcategory: row,
      categories: list,
    });
  }
});

router.post('/update', async function (req, res) {
  const entity = {
    id: req.body.id,
    category_id: req.body.category_id,
    name: req.body.name,
    slug: slugify(req.body.name, {
      remove: /[*+~.()'"!=:@|^&${}[\]`;/?,\\<>%]/g,
      lower: true,
      locale: 'vi',
    }),
  }
  await subcategoriesModel.update(entity);
  return res.redirect('/admin/subcategories');
});

router.post('/delete', async function (req, res) {
  const id = +req.query.sub_category_id || -1;
  const numberOfPost = await postsModel.countPostBySubCategoryID(id);

  if(numberOfPost === 0) {
    await subcategoriesModel.del({ id: id, isDeleted: 1 });
    return res.send({ success: true, message: 'Xóa thành công' });
  }

  res.send({ success: false, message: 'Không thể xóa do vẫn còn bài viết' });
});

router.post('/isAvailable', async (req, res) => {
  let name = req.body.name || '';
  let isEdit = req.body.isEdit || false;
  let id = req.body.id || -1;
  name = slugify(name, {
    remove: /[*+~.()'"!=:@|^&${}[\]`;/?,\\<>%]/g,
    lower: true,
    locale: 'vi',
  });

  const subcategory = isEdit ? await subcategoriesModel.checkIfAvailableAndNotTheSameAsID(name, id) : await subcategoriesModel.singleBySlug(name);

  res.send({ isAvailable: !subcategory });
})

module.exports = router;
