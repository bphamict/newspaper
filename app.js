/**
 * define all routes at here
 */

const express = require('express');

//Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

module.exports = (app) => {
  app.use('/public', express.static('public'));

  app.get('/', (req, res) => {
    res.render('home');
  });

  app.get('/about', (req, res) => {
    res.render('statics/about');
  });

  app.get('/detail', (req, res) => {
    res.render('post/detail');
  });

  app.use('/auth', require('./src/routes/account.route'));

  app.use((req, res) => {
    res.render('statics/404', { layout: false });
  });

  app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).render('statics/500', { layout: false });
  });

  if (!isProduction) {
    app.use((err, req, res) => {
      res.status(err.status || 500);

      res.json({
        errors: {
          message: err.message,
          error: err,
        },
      });
    });
  }

  app.use((err, req, res) => {
    res.status(err.status || 500);

    res.json({
      errors: {
        message: err.message,
        error: {},
      },
    });
  });

  return app;
};
