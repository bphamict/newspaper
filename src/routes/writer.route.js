const router = require('express').Router();
const multer  = require('multer');
const config = require('../configs/default');
const storage = multer.diskStorage(config.multerImagePost);
const upload = multer({storage:storage});
const subCategoryModel = require('../models/sub-category.model');
const tagsModel = require('../models/admin/tags.model');
const postModel = require('../models/post.model');
const postTagModel = require('../models/post-tag.model');
const fs = require('fs');
const isWriter = require('../middlewares/isWriter.middleware');
const slugify = require('slugify');

router.get('/post/add', isWriter, async (req, res) => {
    try {
        const [subCategories, tags] = await Promise.all([subCategoryModel.loadAll(), tagsModel.loadAll()]);
        res.render('writer/add-post', { subCategories, tags });
    } catch(e) {
        console.log(e);
    }
})

router.post('/post/add', isWriter, upload.single('featured_image'), async (req, res) => {
    try {
        let tags = req.body.tag;
        delete req.body.tag;
        req.body.sub_category_id = parseInt(req.body.sub_category_id);
        const sub_category = await subCategoryModel.findByID(req.body.sub_category_id);
        req.body.category_id = sub_category.category_id;
        req.body.type = 'FREE';
        req.body.author = req.user.id;
        req.body.featured_image = req.file.filename;
        req.body.slug = slugify(req.body.title.replace(/[*+~.()'"!=:@|^&${}[\]`;/?,\\<>%]/g, ''), { locale: 'vi' });
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
        res.redirect('/writer/post/add');
    } catch(e) {
        console.log(e);
        res.redirect('/');
    }
})

router.post('/image', isWriter, upload.single('file'), (req, res) => {
    res.json({ location: `/public/images/post/${req.file.filename}` });
})

router.get('/post/list', isWriter, async (req, res) => {
    const posts = await postModel.loadByUserID(req.user.id);
    res.render('writer/list-post', { posts });
})

router.get('/post/edit', isWriter, async (req, res) => {
    let postID = +req.query.id || 1;
    postID = parseInt(postID);
    const [post, subCategories, tags, post_tags] = await Promise.all([postModel.loadByPostID(postID), subCategoryModel.loadAll(), tagsModel.loadAll(), postTagModel.loadByPostID(postID)]);
    res.render('writer/edit-post', { post, subCategories, tags, post_tags })
})

router.post('/post/edit', isWriter, upload.single('featured_image'), async (req, res) => {
    let postID = +req.query.id || 1;
    postID = parseInt(postID);
    req.body.postID = postID;

    if(req.file) {
        req.body.featured_image = req.file.filename;

        const post = await postModel.loadByPostID(postID);
        fs.unlink(`public/images/post/${post.featured_image}`, err => {
            if(err) {
                throw err;
            }
        });
    }

    req.body.sub_category_id = parseInt(req.body.sub_category_id);
    const sub_category = await subCategoryModel.findByID(req.body.sub_category_id);
    req.body.category_id = sub_category.category_id;
    let tags = req.body.tag;
    delete req.body.tag;

    await Promise.all([postModel.update(req.body), postTagModel.deleteByPostID(postID)])
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

    res.redirect('/writer/post/list');
})

module.exports = router;