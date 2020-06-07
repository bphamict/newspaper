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
    res.render('about');
  });

  app.use((req, res) => {
    res.render('404', { layout: false });
  });

  return app;
};
