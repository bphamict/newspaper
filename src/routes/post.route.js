const router = require('express').Router();
const postModel = require('../models/post.model');
const sub_categoryModel = require('../models/sub-category.model');
const postTagModel = require('../models/post-tag.model');
const commentModel = require('../models/comment.model');
const userSubscribeModel = require('../models/user-subscribe.model');
const config = require('../configs/default');
const moment = require('moment');
const { shuffle } = require('../utils/array-utils');
const isAuthenticated = require('../middlewares/isAuthenticated.middleware');
const { query } = require('express-validator');
moment.locale('vi');

router.get('/error', (req, res) => {
  res.render('post/error');
});

router.get('/:slug', async (req, res) => {
    const slug = req.params.slug;
    const post = await postModel.loadBySlugWithCategoryAndSubCategoryName(slug);

    if(!post || post.status === 'PENDING' || post.status === 'DENIED' || (post.status === 'APPROVED' && moment().isBefore(post.publish_time))) {
        return res.redirect('/post/error');
    }

    var blur = false;
    var blurMsg = '';
    if(post.type === 'PREMIUM') {
        if(!req.user) {
            blur = true;
            blurMsg = 'Hãy trở thành độc giả để xem bài viết này';
        } else {
            const userSubscribe = await userSubscribeModel.loadByID(req.user.id);
            if(userSubscribe && moment().isAfter(userSubscribe.expiry_time, 'second')) {
                blur = true;
                blurMsg = 'Hãy gia hạn tài khoản để xem bài viết này';
            }
        }
    }
    let [postTags, comments, numberOfCmt, relatedPosts, viewCountResult] = await Promise.all([postTagModel.loadByPostIDWithName(post.id), commentModel.loadNCommentsFromPost(post.id, 0, 3), commentModel.getNumberOfCommentFromPost(post.id), postModel.loadRelatedPost(post.id, post.sub_category_id), postModel.increaseView(post.id)]);
    post.created_at = moment(post.created_at).format('LLL');

  comments &&
    comments.forEach((comment) => {
      comment.created_at = moment(comment.created_at).format('LLL');
    });

  if (!relatedPosts) {
    relatedPosts = [];
  }
  var result = shuffle(relatedPosts).slice(0, 5);
  result.length !== 0 &&
    result.forEach((post) => {
      post.created_at = moment(post.created_at).format('LL');
    });
    
  res.render('post/details', { post, postTags, comments, related: result, commentsLength: numberOfCmt ? numberOfCmt.NumberOfComment : 0, blur, blurMsg });
})

router.get('/:id/comments', async (req, res) => {
  let start = parseInt(req.query.start);
  const postID = +req.params.id;
  const [comments, nextComments] = await Promise.all([
    commentModel.loadNCommentsFromPost(postID, start, 3),
    commentModel.loadNCommentsFromPost(postID, start + 3, 3),
  ]);
  let atEnd = false;
  if (!nextComments) {
    atEnd = true;
  }
  comments.forEach((comment) => {
    comment.created_at = moment(comment.created_at).format('LLL');
  });

  res.send({ comments, atEnd });
});

router.post('/:id/comments', isAuthenticated, async (req, res) => {
  req.body.post_id = +req.params.id;
  req.body.user_id = req.user.id;

  const data = await commentModel.add(req.body);
  const commentID = data.insertId;
  const comment = await commentModel.loadByCommentID(commentID);
  comment.created_at = moment(comment.created_at).format('LLL');
  res.send(comment);
});

router.get('/category/:slugCategory', async (req, res) => {
  const page = +req.query.page || 1;
  if (page < 0) page = 1;
  const limit = config.pagination.limit;
  const offset = (page - 1) * limit;

  const slugCategory = req.params.slugCategory;

  const [rowsCg, listSubCg, posts, total] = await Promise.all([
    sub_categoryModel.findNameCgBySlug(slugCategory),
    sub_categoryModel.allBySlugCategory(slugCategory),
    postModel.pageBySlugCategory(slugCategory, limit, offset),
    postModel.countBySlugCategory(slugCategory),
  ]);

  const nPages = Math.ceil(total / limit);

  const page_items = [];
  for (let i = 1; i <= nPages; i++) {
    const item = {
      value: i,
      isActive: i === page,
    };
    page_items.push(item);
  }

  console.log(posts);
  res.render('post/byCategory', {
    nameCategory: rowsCg[0],
    listSubCg,
    posts,
    empty: posts.length === 0,
    page_items,
    prev_value: page - 1,
    next_value: page + 1,
    can_go_prev: page > 1,
    can_go_next: page < nPages,
  });
});

router.get('/sub_category/:slugSubcategory', async (req, res) => {
  const page = +req.query.page || 1;
  if (page < 0) page = 1;
  const limit = config.pagination.limit;
  const offset = (page - 1) * limit;

  const slugSub_category = req.params.slugSubcategory;

  const [nameSubCategory, nameSlugCat] = await Promise.all([
    sub_categoryModel.findNameSubCategoryBySlug(slugSub_category),
    sub_categoryModel.findSlugCatBySlugSub_Cat(slugSub_category),
  ]);

  if (typeof nameSlugCat !== 'undefined') {
    const [rowsCg, listSubCg, posts, total] = await Promise.all([
      sub_categoryModel.findNameCgBySlug(nameSlugCat.slug),
      sub_categoryModel.allBySlugCategory(nameSlugCat.slug),
      postModel.pageBySlugCategoryAndSlugSubcategory(
        nameSlugCat.slug,
        slugSub_category,
        limit,
        offset,
      ),
      postModel.countBySlugCategorySlugSub_category(
        nameSlugCat.slug,
        slugSub_category,
      ),
    ]);

    const nPages = Math.ceil(total / limit);

    const page_items = [];
    for (let i = 1; i <= nPages; i++) {
      const item = {
        value: i,
        isActive: i === page,
      };
      page_items.push(item);
    }
    //console.log(posts);
    res.render('post/byCategory', {
      nameCategory: rowsCg[0],
      nameSubCategory,
      listSubCg,
      posts,
      empty: posts.length === 0,
      page_items,
      prev_value: page - 1,
      next_value: page + 1,
      can_go_prev: page > 1,
      can_go_next: page < nPages,
    });
  } else {
    res.redirect('/post/error');
  }
});

module.exports = router;
