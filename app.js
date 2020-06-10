/**
 * define all routes at here
 */

const express = require('express');

module.exports = (app) => {
  app.use('/public', express.static('public'));

  app.get('/', (req, res) => {
    res.render('home');
  });

  app.get('/about', (req, res) => {
    res.render('statics/about');
  });

  app.use('/account', require('./src/routes/account.route'));

  app.use('/writer', require('./src/routes/writer.route'));

  app.use((req, res) => {
    res.render('statics/404', { layout: false });
  });

  return app;
};
