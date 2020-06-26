const express = require('express');
const router = express.Router();
const isAdmin = require('../../middlewares/isAdmin.middleware');

router.get('/', isAdmin, function (req, res) {
    res.render('Admin/home');
});

router.use('/categories', require('./categories.route'));
router.use('/tags', require('./tags.route'));
router.use('/subcategories', require('./subcategories.route'));
router.use('/posts', require('./posts.router'));

module.exports = router;