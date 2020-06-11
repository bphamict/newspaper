const router = require('express').Router();
const passport = require('passport');
const { v4 } = require('uuid');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const debug = require('debug')('app:account');
const { check, validationResult, query } = require('express-validator');
const cryptoRandomString = require('crypto-random-string');
const User = require('../models/user.model');
const UserVerify = require('../models/user-verify.model');
const { authentication } = require('../configs/default');
const { MESSAGES } = require('../configs/messages');
const { sendEmail } = require('../utils/send-email');

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

      user = await User.findByEmail(req.body.email);
      const code = cryptoRandomString(authentication.randomString);
      await UserVerify.create({
        user_id: user.id,
        code: code,
        type: authentication.typeOfCode.CONFIRM_ACCOUNT,
      });
      sendEmail({
        to: req.body.email,
        subject: 'Account confirmation',
        type: authentication.typeOfCode.CONFIRM_ACCOUNT,
        templateData: {
          user_id: user.id,
          code: code,
        },
      });

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

router.get(
  '/confirm-account',
  [query('code').notEmpty().withMessage('Code must not be empty.').trim()],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('account/login', {
        error: errors.array()[0].msg,
      });
    }
    try {
      const data = await UserVerify.findOne({
        code: req.query.code,
        type: authentication.typeOfCode.CONFIRM_ACCOUNT,
      });
      if (!data) {
        return res.render('account/login', {
          code: req.query.code,
          error: MESSAGES.CODE_IS_INVALID,
        });
      }
      await User.update({
        id: data.user_id,
        confirmed: true,
      });
      await UserVerify.deleteByCode(req.body.code);
      res.render('account/login', {
        message: MESSAGES.ACCOUNT_HAS_BEEN_CONFIRMED,
      });
    } catch (err) {
      res.render('account/reset-password', {
        code: req.body.code,
        error: err,
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

    const code = cryptoRandomString(authentication.randomString);
    await UserVerify.create({
      user_id: user.id,
      code: code,
      type: authentication.typeOfCode.RESET_PASSWORD,
    });
    sendEmail({
      to: req.body.email,
      subject: 'Reset password',
      type: authentication.typeOfCode.RESET_PASSWORD,
      templateData: {
        user_id: user.id,
        code: code,
      },
    });

    res.render('account/forgot-password', {
      message: MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD,
    });
  },
);

router.get('/reset-password', (req, res) => {
  res.render('account/reset-password');
});

router.post(
  '/reset-password',
  [
    check('code').notEmpty().withMessage('Code must not be empty.').trim(),
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
      return res.render('account/reset-password', {
        code: req.body.code,
        error: errors.array()[0].msg,
      });
    }
    try {
      const data = await UserVerify.findOne({
        code: req.body.code,
        type: authentication.typeOfCode.RESET_PASSWORD,
      });
      if (!data) {
        return res.render('account/reset-password', {
          code: req.body.code,
          error: MESSAGES.CODE_IS_INVALID,
        });
      }
      await User.update({
        id: data.user_id,
        password: bcrypt.hashSync(req.body.password, authentication.saltRounds),
        confirmed: true,
      });
      await UserVerify.deleteByCode(req.body.code);
      res.render('account/login', {
        message: MESSAGES.PASSWORD_HAS_BEEN_RESET,
      });
    } catch (err) {
      res.render('account/reset-password', {
        code: req.body.code,
        error: err,
      });
    }
  },
);

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
