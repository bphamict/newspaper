const express = require('express');
const db = require('../../utils/db');
const tagsModel = require('../../models/admin/tags.model');
const config = require('../../configs/default');
const router = express.Router();
const isAdmin = require('../../middlewares/isAdmin.middleware');
const slugify = require('slugify');
const postsModel = require('../../models/admin/posts.model');

router.get('/', isAdmin, async function (req, res) {
  let page = +req.query.page || -1;
  const total = await tagsModel.count();
  const limit = config.pagination.limit;
  const nPages = Math.ceil(total / limit);
  if(page < 1 || page > nPages) {
    page = 1;
  }

  const offset = (page - 1) * limit;
  const list = await tagsModel.page(limit, offset);

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

  res.render('Admin/Tags/list', {
    tags: list,
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
  res.render('Admin/Tags/add');
});

router.post('/add', async function (req, res) {
  const entity = {
    name: req.body.name,
    slug: slugify(req.body.name, {
      remove: /[*+~.()'"!=:@|^&${}[\]`;/?,\\<>%]/g,
      lower: true,
      locale: 'vi',
    }),
  };

  await tagsModel.add(entity);
  res.redirect('/admin/tags');
});

router.get('/:slug/edit', isAdmin, async function (req, res) {
  const slug = req.params.slug;
  const row = await tagsModel.singleBySlug(slug);
  if (row.length === 0) {
    res.render('static/404', { layout: false });
  } else {
    res.render('Admin/Tags/edit', { tag: row });
  }
});

router.post('/update', async function (req, res) {
  const entity = req.body;
  entity.slug = slugify(req.body.name, {
    remove: /[*+~.()'"!=:@|^&${}[\]`;/?,\\<>%]/g,
    lower: true,
    locale: 'vi',
  });
  await tagsModel.update(entity);
  res.redirect('/admin/tags');
});

router.post('/delete', async function (req, res) {
  const id = req.query.tag_id || -1;
  const numberOfPost = await postsModel.countPostByTagID(id);

  if(numberOfPost === 0) {
    await tagsModel.del({ id, isDeleted: 1 });
    return res.send({ success: true, message: 'Xóa thành công' })
  }

  res.send({ success: false, message: 'Không thể xóa do vẫn còn bài viết' })
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

  const tag = isEdit ? await tagsModel.checkIfAvailableAndNotTheSameAsID(name, id) : await tagsModel.singleBySlug(name);
  console.log(tag);

  res.send({ isAvailable: !tag });
})

module.exports = router;
