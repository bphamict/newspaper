/**
 * define all routes here
 */

const express = require('express');

module.exports = (app) => {
  // must be preloaded before all requests
  app.use(require('./src/middlewares/preloader.middleware'));

  app.use('/public', express.static('public'));

  app.use('/', require('./src/routes/home.route'));

  app.get('/about', (req, res) => {
    res.render('static/about');
  });

  app.use('/category', require('./src/routes/category.route'));

  app.use('/sub-category', require('./src/routes/sub_category.route'));

  app.use('/tag', require('./src/routes/tag.route'));

  app.use('/auth', require('./src/routes/account.route'));

  app.use('/writer', require('./src/routes/writer.route'));

  app.use('/search', require('./src/routes/search.route'));

  app.use('/admin', require('./src/routes/admin/admin.route'));

  app.use('/post', require('./src/routes/post.route'));

  app.use('/editor', require('./src/routes/editor.route'));

  app.use('/account', require('./src/routes/profile.route'));

  app.use((req, res) => {
    res.render('static/404', { layout: false });
  });

  app.use((err, req, res) => {
    console.error(err.stack);
    res.status(err.status || 500).render('static/500', {
      layout: false,
      error: process.env.NODE_ENV === 'production' ? null : err,
    });
  });

  return app;
};
