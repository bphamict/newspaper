const router = require('express').Router();
const multer  = require('multer');
const config = require('../configs/default');
const storage = multer.diskStorage(config.multerImagePost);
const upload = multer({storage:storage});
const subCategoryModel = require('../models/sub-category.model');
const tagsModel = require('../models/tag.model');
const postModel = require('../models/post.model');
const tagModel = require('../models/tag.model');
const postTagModel = require('../models/post-tag.model');
const fs = require('fs');
const path = require('path');
const appRoot = require('app-root-path');
const rootPath = require('app-root-path');

router.get('/add/post', async (req, res) => {
    try {
        const [subCategories, tags] = await Promise.all([subCategoryModel.loadAll(), tagsModel.loadAll()]);
        res.render('writer/add-post', { subCategories, tags });
    } catch(e) {
        console.log(e);
    }
})

router.post('/add/post', upload.single('featured_image'), async (req, res) => {
    try {
        let tags = req.body.tag;
        delete req.body.tag;
        req.body.sub_category_id = parseInt(req.body.sub_category_id);
        const sub_category = await subCategoryModel.findByID(req.body.sub_category_id);
        req.body.category_id = sub_category.category_id;
        req.body.type = 'FREE';
        req.body.author = req.user.id;
        req.body.featured_image = req.file.filename;
        const result = await postModel.add(req.body);
        const postID = result.insertId;

        tags = tags.split(' | ');
        tags.forEach(async tagName => {
            let tag = await tagModel.findByName(tagName);
            if(tag) {
                await postTagModel.add({
                    post_id: parseInt(postID),
                    tag_id: parseInt(tag.id)
                });
            }
        });

        fs.mkdir(path.join(rootPath.path, `/public/images/post/${postID}`), { recursive: true }, (err) => {
            if(err) {
                throw err;
            }
        });

        const currentPath = path.join(rootPath.path, `/public/images/post/content/${req.body.featured_image}`);
        const newPath = path.join(rootPath.path, `/public/images/post/${postID}/${req.body.featured_image}`);

        fs.rename(currentPath, newPath, function(err) {
            if (err) {
              throw err
            }
        })

        res.redirect('/writer/add/post');
    } catch(e) {
        console.log(e);
        res.redirect('/');
    }
})

router.post('/image', upload.single('file'), (req, res) => {
    res.json({ location: `/public/images/post/content/${req.file.filename}` });
})

module.exports = router;