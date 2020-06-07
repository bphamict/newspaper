const router = require('express').Router();

router.get('/login', (req, res) => {
  res.render('account/login');
});

router.get('/register', (req, res) => {
  res.render('account/register');
});

router.get('/forgot-password', (req, res) => {
  res.render('account/forgot-password');
});

module.exports = router;
