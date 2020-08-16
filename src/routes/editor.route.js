const router = require('express').Router();
const postModel = require('../models/post.model');
const categoryModel = require('../models/admin/categories.model');
const postTagModel = require('../models/post-tag.model');
const tagModel = require('../models/admin/tags.model');
const subCategoryModel = require('../models/admin/subcategories.model');
const moment = require('moment');
const isEditor = require('../middlewares/isEditor.middleware');
const { convertToPDF } = require('../utils/toPdf');
moment.locale('vi')

router.get('/error', (req, res) => {
    res.render('editor/error');
})

router.get('/posts', isEditor, async (req, res) => {
    const category = await categoryModel.loadByUserID(req.user.id);
    var isManaging = !!category;

    if(!category) {
        return res.render('editor/list', { isManaging });
    }

    var categoryName = category.name;
    var page = +req.query.page || -1;
    var total = await postModel.countPendingPostsByCategoryID(category.id);
    const numOfPage = Math.ceil(total / 10);
    if(page < 1 || page > numOfPage) {
        page = 1;
    }

    const offset = (page - 1) * 10;
    const posts = await postModel.pageByEditorCategoryID(category.id, offset, 10);

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

    res.render('editor/list', { 
        posts, 
        isManaging, 
        categoryName, 
        pageItems,
        prev_value: page - 1,
        next_value: page + 1,
        canGoPrev: page > 1,
        canGoNext: page < numOfPage,
        numOfPage });
})

router.get('/post/:id', isEditor, async (req, res) => {
    const category = await categoryModel.loadByUserID(req.user.id);
    const postID = +req.params.id;
    const post = await postModel.loadPendingPostByID(postID);

    if(!post || post.category_id !== category.id) {
        return res.redirect('/editor/error');
    }

    const [postTags, tags, subCategories] = await Promise.all([postTagModel.loadByPostIDWithName(post.id), tagModel.loadAll(), subCategoryModel.loadByParentCategory(category.id)]);


    res.render('editor/details', { post, postTags, tags, subCategories });
})

router.post('/post/:id/accept', isEditor, async (req, res) => {
    const postID = +req.params.id;
    const [category, post] = await Promise.all([categoryModel.loadByUserID(req.user.id), postModel.loadPendingPostByID(postID)]);
    if(!post || post.category_id !== category.id) {
        return res.send({ success: false });
    }

    try {
        const tags = req.body.tags.split(',');
        delete req.body.tags;
        req.body.postID = postID;
        req.body.sub_category_id = +req.body.sub_category_id;
        req.body.publish_time = moment(req.body.publish_time, 'DD/MM/YYYY HH:mm').format('YYYY-MM-DD HH:mm:ss');
        req.body.status = 'APPROVED';
        await Promise.all([postModel.update(req.body), postTagModel.deleteByPostID(postID)]);

        tags.forEach(async tagName => {
            let tag = await tagModel.findByName(tagName);
            if(tag) {
                await postTagModel.add({
                    post_id: postID,
                    tag_id: +tag.id
                });
            }
        });

        if(req.body.type === 'PREMIUM') {
            const acceptedPost = await postModel.loadByPostIDWithCategoryAndSubCategoryName(postID);
            convertToPDF && convertToPDF(acceptedPost, tags);
        }

        res.send({ success: true });
    } catch(error) {
        res.send({ success: false})
    }
})

router.post('/post/:id/decline', isEditor, async (req, res) => {
    const postID = +req.params.id;
    const [category, post] = await Promise.all([categoryModel.loadByUserID(req.user.id), postModel.loadPendingPostByID(postID)]);
    if(!post || post.category_id !== category.id) {
        return res.send({ success: false });
    }

    try {
        req.body.postID = postID;
        req.body.status = 'DENIED';
        await postModel.update(req.body);

        res.send({ success: true });
    } catch(error) {
        res.send({ success: false})
    }
})

module.exports = router;