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
const moment = require('moment');
const userSubscribeModel = require('../models/user-subscribe.model');
const verifyRecaptcha = require('../utils/verify-recaptcha.helper');

router.get('/login', (req, res) => {
  if (req.query.origin) {
    req.session.redirectUrl = req.query.origin;
  } else {
    req.session.redirectUrl = req.header('Referer');
  }
  res.render('account/login', {
    message: req.query.origin
      ? MESSAGES.YOU_MUST_LOGIN_TO_READ_THIS_PAGE
      : null,
  });
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
    let redirectUrl = '/';
    if (req.session.redirectUrl) {
      redirectUrl = req.session.redirectUrl;
      delete req.session.redirectUrl;
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      return res.redirect(redirectUrl);
    });
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
      .withMessage('Tên không được để trống.')
      .trim()
      .matches(/^[A-Za-z ]*$/i)
      .withMessage('Tên chỉ được chứa A-Z, a-z và khoảng cách.'),
    check('email')
      .notEmpty()
      .withMessage('Email không được để trống.')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email không hợp lệ.'),
    check('password')
      .notEmpty()
      .withMessage('Mật khẩu không được để trống.')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Mật khẩu phải có ít nhất 8 kí tự.')
      .matches(/\d/)
      .withMessage('Mật khẩu phải chứa ít nhất 1 chữ số.'),
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
      await verifyRecaptcha(req.body.recaptcha, req.ip);
    } catch (err) {
      // debug(err);
      return res.render('account/register', {
        error: 'Captcha không đúng.',
      });
    }

    try {
      user = await User.findByEmail(req.body.email);
      if (user) {
        throw MESSAGES.EMAIL_ALREADY_HAS_TAKEN;
      }
      req.body = _.pick(req.body, ['full_name', 'email', 'dob', 'password']);
      req.body = _.assign(req.body, {
        username: v4(),
        password: bcrypt.hashSync(req.body.password, authentication.saltRounds),
      });
      await User.create(req.body);

      user = await User.findByEmail(req.body.email);
      await userSubscribeModel.add({
        user_id: user.id,
        expiry_time: moment(user.created_at)
          .add(10080, 'm')
          .format('YYYY-MM-DD HH:mm:ss'),
      });
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
  [query('code').notEmpty().withMessage('Mã không hợp lệ.').trim()],
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
      .withMessage('Email không được để trống.')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email không hợp lệ.'),
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
    check('code').notEmpty().withMessage('Mã không hợp lệ.').trim(),
    check('password')
      .notEmpty()
      .withMessage('Mật khẩu không được để trống.')
      .trim()
      .isLength({ min: 8 })
      .withMessage('Mật khẩu phải có ít nhất 8 kí tự.')
      .matches(/\d/)
      .withMessage('Mật khẩu phải chưa ít nhất 1 chữ số.'),
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

router.get('/logout', (req, res) => {
  req.logout();
  if (req.session.redirectUrl) {
    delete req.session.redirectUrl;
  }
  res.redirect(req.header('Referer') || '/');
});

router.get('/facebook', passport.authenticate('facebook'));

router.get(
  '/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
  (req, res) => {
    let redirectUrl = '/';
    if (req.session.redirectUrl) {
      redirectUrl = req.session.redirectUrl;
      delete req.session.redirectUrl;
    }
    res.redirect(redirectUrl);
  },
);

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/login' }),
  (req, res) => {
    let redirectUrl = '/';
    if (req.session.redirectUrl) {
      redirectUrl = req.session.redirectUrl;
      delete req.session.redirectUrl;
    }
    res.redirect(redirectUrl);
  },
);

module.exports = router;
