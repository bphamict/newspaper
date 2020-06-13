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

  app.get('/detail', (req, res) => {
    res.render('post/detail');
  });

  app.get('/byCat', (req, res) => {
    res.render('post/byCat');
  });

  app.get('/byTag', (req, res) => {
    res.render('post/byTag');
  });

  app.use('/account', require('./src/routes/account.route'));

  app.use((req, res) => {
    res.render('statics/404', { layout: false });
  });

  return app;
};
