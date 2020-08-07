const router = require('express').Router();
const postModel = require('../models/post.model');
const { hasAccent, cleanStrFromSpecialCharacters } = require('../utils/str-utils');
const postTagModel = require('../models/post-tag.model');
const moment = require('moment');
moment.locale('vi');

router.get('/', async (req, res) => {
  const search_by = req.query.search_by || 'summary';
  var page = +req.query.page || 1;
  const offset = (page - 1) * 10;

  const [posts, total, post_tags] = await Promise.all([postModel.searchPosts(req.query.q, search_by, 10, offset), postModel.getNumberOfSearchPost(req.query.q, search_by), postTagModel.loadAllWithName()]);

  posts && posts.forEach((post) => {
    post.publish_time = moment(post.publish_time).format('LLL');
  })
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
  

  res.render('static/search', {
    q: req.query.q,
    posts,
    canGoPrev: page > 1,
    canGoNext: page < numOfPage,
    pageItems,
    search_by,
    numOfPage,
    post_tags
  });
});

module.exports = router;
