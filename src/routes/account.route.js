const router = require('express').Router();
const passport = require('passport');
const { v4 } = require('uuid');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const debug = require('debug')('app:account');
const { check, validationResult, body } = require('express-validator');
const User = require('../models/user.model');
const { authentication } = require('../configs/default');
const { MESSAGES } = require('../configs/messages');

router.get('/login', (req, res) => {
  res.render('account/login');
});

router.post('/local', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      debug(info);
      return res.render('account/login', { error: info.message });
    }
    return res.redirect('/');
  })(req, res, next);
});

router.get('/register', (req, res) => {
  res.render('account/register');
});

router.post(
  '/register',
  [
    check('full_name')
      .notEmpty()
      .withMessage('Full name must not be empty.')
      .trim()
      .matches(/^[A-Za-z ]*$/i)
      .withMessage('Full name must only contain A-Z, a-z and spaces.'),
    check('email')
      .notEmpty()
      .withMessage('Email must not be empty.')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email is invalid.'),
    check('password')
      .notEmpty()
      .withMessage('Password must not be empty.')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 chars long.')
      .matches(/\d/)
      .withMessage('Password must contain at least a number.'),
  ],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('account/register', {
        error: errors.array()[0].msg,
      });
    }
    try {
      user = await User.findByEmail(req.body.email);
      if (user) {
        throw MESSAGES.EMAIL_ALREADY_TAKEN;
      }
      req.body = _.pick(req.body, ['full_name', 'email', 'dob', 'password']);
      req.body = _.assign(req.body, {
        username: v4(),
        password: bcrypt.hashSync(req.body.password, authentication.saltRounds),
      });
      await User.create(req.body);

      // send email

      res.render('account/login', {
        message: MESSAGES.CHECK_EMAIL_TO_CONFIRM_ACCOUNT,
      });
    } catch (err) {
      const error = _.get(err, 'sqlMessage') ? err.sqlMessage : err;
      debug(error);
      res.render('account/register', {
        error: error,
      });
    }
  },
);

router.get('/forgot-password', (req, res) => {
  res.render('account/forgot-password');
});

router.post(
  '/forgot-password',
  [
    check('email')
      .notEmpty()
      .withMessage('Email must not be empty.')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email is invalid.'),
  ],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('account/forgot-password', {
        error: errors.array()[0].msg,
      });
    }
    user = await User.findByEmail(req.body.email);
    if (!user) {
      return res.render('account/forgot-password', {
        error: MESSAGES.ACCOUNT_IS_NOT_FOUND,
      });
    }

    // send email

    res.render('account/forgot-password', {
      message: MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD,
    });
  },
);

router.get('/reset-password', async (req, res) => {
  // compare code

  res.render('account/login', {
    message: MESSAGES.PASSWORD_HAS_BEEN_RESET,
  });
});

router.get('/facebook', passport.authenticate('facebook'));

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  },
);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  },
);

module.exports = router;
