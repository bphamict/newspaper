const router = require('express').Router();
const userModel = require('../models/user.model');
const { check, validationResult, query } = require('express-validator');
const bcrypt = require('bcryptjs');
const { authentication } = require('../configs/default');
const userSubscribeModel = require('../models/user-subscribe.model');
const moment = require('moment');
const isLoggedIn = require('../middlewares/isLoggedIn.middleware');
moment.locale('vi');

router.get('/profile', isLoggedIn, async (req, res) => {
    const user = await userModel.loadUserDetails(req.user.id);
    if(!user) {
        return res.redirect('/');
    }
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const expired = moment(now).isAfter(user.expiry_time);
    user.expiry_value = user.expiry_time;
    user.expiry_time = moment(user.expiry_time).format('LLL');
    res.render('account/profile', { user, expired });
})

router.get('/change-password', isLoggedIn, async (req, res) => {
    res.render('account/change-password');
})

router.post('/profile', isLoggedIn, async (req, res) => {
    req.body.id = +req.body.id;
    if(req.body.expiry_time) {
        await userSubscribeModel.update({ userID: req.body.id, expiry_time: req.body.expiry_time});
        delete req.body.expiry_time;
    }
    await userModel.update(req.body);
    res.redirect('/');
})

router.post('/change-password', isLoggedIn, async (req, res) => {
    req.body.password = bcrypt.hashSync(req.body.password, authentication.saltRounds);
    await userModel.update({ id: req.user.id, password: req.body.password });
    res.redirect('/account/profile')
})

router.post('/checkEmail', isLoggedIn, [
    check('email')
      .notEmpty()
      .withMessage('Email không được để trống.')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email không hợp lệ.'),
  ], async (req, res) => {
    const errors = validationResult(req);
    const user = await userModel.findByEmail(req.body.email);
    res.send({ isEmail: errors.isEmpty(), isAvailable: !user });
})

router.post('/checkPseudonym', isLoggedIn, async (req, res) => {
    const user = await userModel.checkIfPseudonymExist(req.body.pseudonym, req.user.id);
    res.send({ isAvailable: !user });
})

router.post('/checkPassword', isLoggedIn, async (req, res) => {
    const user = await userModel.loadByID(req.user.id);
    res.send({ isCorrect: bcrypt.compareSync(req.body.password, user.password) });
})

module.exports = router;