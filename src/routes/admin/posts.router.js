const express = require('express');
const db = require('../../utils/db');
const multer  = require('multer');
const config = require('../../configs/default');
const postsModel = require('../../models/admin/posts.model');
const postTagModel = require('../../models/post-tag.model');
const subCategoryModel = require('../../models/sub-category.model');
const tagsModel = require('../../models/admin/tags.model');
const router = express.Router();
const isAdmin = require('../../middlewares/isAdmin.middleware');
const moment = require('moment');
const storage = multer.diskStorage(config.multerImagePost);
const upload = multer({storage:storage});
const fs = require('fs');
const slugify = require('slugify');
const postModel = require('../../models/post.model');
const { convertToPDF } = require('../../utils/toPdf');
moment.locale('vi');

router.get('/', isAdmin, async function (req, res) {
    var page = +req.query.page || 1;
    const offset = (page - 1) * 9;
    const [list, total] = await Promise.all([postsModel.allNewToOld(9, offset), postsModel.getTotal()]);

    const numOfPage = Math.ceil(total / 10);
    if(page < 1 || page > numOfPage) {
        page = 1;
    }

    const pageItems = [];
    if(numOfPage > 5) {
        const isNearEnd = page + 2 > numOfPage;
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
            for(let i = page; i <= numOfPage; i++) {
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
        for(let i = 1; i <= numOfPage; i++) {
            pageItems.push({
                value: i,
                isActive: i === page,
            })
        }
    }
    res.render('Admin/Posts/list', {
        posts: list,
        empty: list.length === 0,
        canGoPrev: page > 1,
        canGoNext: page < numOfPage,
        pageItems,
        numOfPage
    });
});

router.get('/detail', isAdmin, async function (req, res) {
    const id = +req.query.id || -1;
    const [post, postTags]= await Promise.all([postsModel.loadByPostIDWithCategoryAndSubCategoryName(id), postTagModel.loadByPostIDWithName(id)]);
    if(!post) {
        return res.redirect('/admin/posts');
    }

    if(post.publish_time) {
        if(post.status === 'APPROVED' && moment().isSameOrAfter(post.publish_time)) {
            post.isPublished = true;
        } else {
            post.isPublished = false;
        }
    }

    res.render('Admin/Posts/detail', {post, postTags});
    
});

router.get('/edit', isAdmin, async function (req, res) {
    const id = +req.query.id || -1;
    const [post, subCategories, tags, post_tags] = await Promise.all([postsModel.loadByPostID(id), subCategoryModel.loadAll(), tagsModel.loadAll(), postTagModel.loadByPostID(id)]);
    res.render('writer/edit-post', { post, subCategories, tags, post_tags }) 
});

router.get('/update_status', isAdmin, async (req, res) => {
    const id = +req.query.id || -1;
    const post = await postsModel.loadByPostID(id);

    if(!post || post.status !== 'PENDING') {
        return res.redirect('/admin/posts');
    }

    res.render('Admin/Posts/update_status', { post });
})

router.post('/update_status', isAdmin, async function (req, res) {
    const id = +req.query.id || -1;
    const post = await postsModel.loadByPostIDWithCategoryAndSubCategoryName(id);
    req.body.id = id;
    req.body.status = req.body.status === 'ĐÃ XUẤT BẢN' ? 'PUBLISHED' : 'PENDING';
    req.body.publish_time = moment().format('YYYY-MM-DD HH:mm:00');

    if(req.body.type === 'PREMIUM' && req.body.type !== post.type) {
        const postTags = await postTagModel.loadByPostIDWithName(id);
        let tags = [];
        postTags.forEach(tag => {
            tags.push(tag.name);
        })

        convertToPDF && convertToPDF(post, tags);
    }
    await postsModel.update(req.body);
    res.redirect('/admin/posts');
});

router.post('/edit', isAdmin, upload.single('featured_image'), async (req, res) => {
    let postID = +req.query.id || 1;
    req.body.id = postID;

    if(req.file) {
        req.body.featured_image = req.file.filename;

        const post = await postsModel.loadByPostID(postID);
        fs.unlink(`public/images/post/${post.featured_image}`, err => {
            if(err) {
                throw err;
            }
        });
    }

    req.body.sub_category_id = parseInt(req.body.sub_category_id);
    const sub_category = await subCategoryModel.findByID(req.body.sub_category_id);
    req.body.category_id = sub_category.category_id;
    req.body.status = 'PENDING';
    req.body.editor_note = null;
    req.body.publish_time = null;
    let tags = req.body.tag;
    delete req.body.tag;

    await Promise.all([postsModel.update(req.body), postTagModel.deleteByPostID(postID)])
    tags = tags.split(' | ');
    tags.forEach(async tagName => {
        let tag = await tagsModel.findByName(tagName);
        if(tag) {
            await postTagModel.add({
                post_id: parseInt(postID),
                tag_id: parseInt(tag.id)
            });
        }
    });

    const post = await postsModel.loadByPostIDWithCategoryAndSubCategoryName(postID);
    if(post && post.type === 'PREMIUM') {
        convertToPDF && convertToPDF(post, tags);
    }

    res.redirect('/admin/posts');
})

router.post('/delete', isAdmin, async (req, res) => {
    const id = +req.query.id || -1;
    const result = await postsModel.deleteByPostID(id);
    res.send({ success: result.affectedRows === 1 });
})

router.get('/add', isAdmin, async (req, res) => {
    const [subCategories, tags] = await Promise.all([subCategoryModel.loadAll(), tagsModel.loadAll()]);
    if(!subCategories || !tags) {
        return res.redirect('/admin/posts');
    }
    res.render('writer/add-post', { subCategories, tags });
})

router.post('/add', isAdmin, upload.single('featured_image'), async (req, res) => {
    let tags = req.body.tag;
    delete req.body.tag;
    req.body.sub_category_id = parseInt(req.body.sub_category_id);
    const sub_category = await subCategoryModel.findByID(req.body.sub_category_id);
    req.body.category_id = sub_category.category_id;
    req.body.type = 'FREE';
    req.body.author = req.user.id;
    req.body.featured_image = req.file.filename;
    req.body.slug = slugify(req.body.title.toLowerCase().replace(/[*+~.()'"!=:@|^&${}[\]`;/?,\\<>%]/g, ''), { locale: 'vi' });
    const result = await postModel.add(req.body);
    const postID = result.insertId;

    tags = tags.split(' | ');
    tags.forEach(async tagName => {
        let tag = await tagsModel.findByName(tagName);
        if(tag) {
            await postTagModel.add({
                post_id: parseInt(postID),
                tag_id: parseInt(tag.id)
            });
        }
    });
    res.redirect('/admin/posts');
})

module.exports = router;
