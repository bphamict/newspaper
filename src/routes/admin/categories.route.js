const express = require('express');
const categoriesModel = require('../../models/admin/categories.model');
const postsModel = require('../../models/admin/posts.model');
const subcategoriesModel = require('../../models/admin/subcategories.model');
const config = require('../../configs/default');
const router = express.Router();
const isAdmin = require('../../middlewares/isAdmin.middleware');
const slugify = require('slugify');

router.get('/', isAdmin, async function (req, res) {
  let page = +req.query.page || -1;
  const limit = config.pagination.limit;
  const total = await categoriesModel.count();
  const nPages = Math.ceil(total / limit);
  if(page < 1 || page > nPages) {
    page = 1;
  }

  const offset = (page - 1) * limit;
  const list = await categoriesModel.page(limit, offset);

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

  res.render('Admin/Categories/list', {
    categories: list,
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
  res.redirect('/admin/categories');
});

router.get('/:slug/edit', isAdmin, async function (req, res) {
  const slug = req.params.slug;
  const row = await categoriesModel.singleBySlug(slug);
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
  res.redirect('/admin/categories');
});

router.post('/delete', async function (req, res) {
  const id = +req.query.category_id || -1;
  const [numberOfPost, numberOfSubCategory] = await Promise.all([postsModel.countPostByCategoryID(id), subcategoriesModel.getNumberOfSubCatByCatID(id)]);

  if(numberOfPost === 0 && numberOfSubCategory === 0) {
    await categoriesModel.del({ id: id, isDeleted: 1, user_id: null });
    return res.send({ success: true, message: 'Xóa thành công' });
  }

  res.send({ success: false, message: 'Không thể xóa do vẫn còn bài viết hoặc do vẫn còn danh mục con' });
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

  const category = isEdit ? await categoriesModel.checkIfAvailableAndNotTheSameAsID(name, id) : await categoriesModel.singleBySlug(name);
  console.log(category);

  res.send({ isAvailable: !category });
});

module.exports = router;
