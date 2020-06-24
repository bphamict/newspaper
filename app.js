/**
 * define all routes at here
 */

const express = require('express');

module.exports = (app) => {
  // must be preloaded before all requests
  app.use(require('./src/middlewares/preloader.middleware'));
  const isAdmin = require('./src/middlewares/isAdmin.middleware');
  
  app.use('/public', express.static('public'));

  app.get('/', (req, res) => {
    res.render('home');
  });

  app.get('/about', (req, res) => {
    res.render('static/about');
  });

  app.get('/detail', (req, res) => {
    res.render('post/detail');
  });

  app.get('/admin', isAdmin, (req, res) => {
    res.render('Admin/home');
  });

  app.use('/auth', require('./src/routes/account.route'));

  app.use('/writer', require('./src/routes/writer.route'));

  app.use('/search', require('./src/routes/search.route'));

  app.use('/admin/categories', require('./src/routes/categories.route'));
  app.use('/admin/tags', require('./src/routes/tags.route'));


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
