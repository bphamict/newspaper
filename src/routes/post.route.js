const router = require('express').Router();
const postModel = require('../models/post.model');
const postTagModel = require('../models/post-tag.model');
const subCategoryModel = require('../models/sub-category.model');
const categoryModel = require('../models/categories.model');
const commentModel = require('../models/comment.model');
const moment = require('moment');
const { shuffle } = require('../utils/array-utils');
const isAuthenticated = require('../middlewares/isAuthenticated.middleware');
moment.locale('vi')

router.get('/:id', async (req, res) => {
    const postID = +req.params.id;
    const [post, postTags, comments] = await Promise.all([postModel.loadByPostIDWithCategoryAndSubCategoryName(postID), postTagModel.loadByPostIDWithName(postID), commentModel.loadNCommentsFromPost(postID, 0, 3)]);
    post.created_at = moment(post.created_at).format('LLL');
    comments.forEach(comment => {
        comment.created_at = moment(comment.created_at).format('LLL');
    });

    var relatedPosts = await postModel.loadBySubCategoryID(post.sub_category_id);
    relatedPosts = relatedPosts.filter(relatedPost => relatedPost.id !== post.id);
    relatedPosts = relatedPosts.slice(0, 10);

    var result = shuffle(relatedPosts).slice(0, 5);
    result.forEach(post => {
        post.created_at = moment(post.created_at).format('LL')
    })
    
    res.render('post/details', { post, postTags, comments, related: result });
})

router.get('/:id/comments', async (req, res) => {
    let start = parseInt(req.query.start);
    const postID = +req.params.id;
    const [comments, nextComments] = await Promise.all([commentModel.loadNCommentsFromPost(postID, start, 3), commentModel.loadNCommentsFromPost(postID, start + 3, 3)]);
    let atEnd = false;
    if(!nextComments) {
        atEnd = true;
    }
    comments.forEach(comment => {
        comment.created_at = moment(comment.created_at).format('LLL');
    });

    res.send({comments, atEnd});
})

router.post('/:id/comments', isAuthenticated, async (req, res) => {
    req.body.post_id = +req.params.id;
    req.body.user_id = req.user.id;

    const data = await commentModel.add(req.body);
    const commentID = data.insertId;
    const comment = await commentModel.loadByCommentID(commentID);
    comment.created_at = moment(comment.created_at).format('LLL');
    res.send(comment);
})

module.exports = router;