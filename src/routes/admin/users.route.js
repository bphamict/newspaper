const router = require('express').Router();
const { v4 } = require('uuid');
const _ = require('lodash');
const bcrypt = require('bcryptjs');
const { authentication } = require('../../configs/default');
const userModel = require('../../models/user.model');
const roleModel = require('../../models/role.model');
const { check, validationResult, query } = require('express-validator');
const moment = require('moment');
const userSubscribeModel = require('../../models/user-subscribe.model');
const categoryModel = require('../../models/admin/categories.model');
const isAdmin = require('../../middlewares/isAdmin.middleware');
moment.locale('vi');

router.get('/error', isAdmin, (req, res) => {
    res.render('Admin/User/error');
})

router.get('/', isAdmin, async (req, res) => {
    var page = +req.query.page || 1;
    const offset = (page - 1) * 10;
    var [userList, total] = await Promise.all([userModel.loadWithRoleName(req.user.id, offset, 10), userModel.getTotal(req.user.id)]);

    const numOfPage = Math.ceil(total / 10);
    if(page < 1 || page > numOfPage) {
        page = 1;
    }

    const pageItems = [];
    if(numOfPage > 5) {
        const isNearEnd = page + 2 > numOfPage;
        if(!isNearEnd) {
            for(let i = page - 2; i <= page; i++) {
                if(i > 0) {
                    pageItems.push({
                        value: i,
                        isActive: i === page
                    })
                }
            }

            const numberOfPage = pageItems.length;

            for(let i = page + 1; i <= page + (5 - numberOfPage); i++) {
                pageItems.push({
                    value: i,
                    isActive: false,
                })
            }
        } else {
            for(let i = page; i <= numOfPage; i++) {
                pageItems.push({
                    value: i,
                    isActive: i === page,
                })
            }

            const numberOfPage = pageItems.length;

            for(let i = page - 1; i >=  page - (5 - numberOfPage); i--) {
                pageItems.unshift({
                    value: i,
                    isActive: false,
                })
            }
        }
    } else {
        for(let i = 1; i <= numOfPage; i++) {
            pageItems.push({
                value: i,
                isActive: i === page,
            })
        }
    }
    
    if(!userList) {
        userList = [];
    }

    res.render('Admin/User/list', { 
        userList,
        canGoPrev: page > 1,
        canGoNext: page < numOfPage,
        pageItems,
        numOfPage
    });
});

router.get('/:id/details', isAdmin, async (req, res) => {
    var userID = +req.params.id;
    var [user, roles] = await Promise.all([userModel.loadUserDetails(userID), roleModel.loadAll()]);
    if(!user) {
        return res.redirect('/admin/users/error');
    }
    const vacantCategories = await categoryModel.loadVacantCategories(user.id);
    user.created_at = moment(user.created_at).format('LL');
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    const expired = moment(now).isAfter(user.expiry_time);
    user.expiry_value = user.expiry_time;
    user.expiry_time = moment(user.expiry_time).format('LLL');
    res.render('Admin/User/details', { user, roles, expired, vacantCategories });
})

router.post('/:id/details', isAdmin, async (req, res) => {
    req.body.role = +req.body.role;
    const userID = +req.params.id;
    const role_id = req.body.role;
    if(req.body.expiry_time !== 'Invalid date') {
        req.body.expiry_time = moment(req.body.expiry_time).format('YYYY-MM-DD HH:mm:ss');
    }
    if(role_id === 4) {
        await Promise.all([userSubscribeModel.update({ userID: userID, expiry_time: req.body.expiry_time }), categoryModel.deleteUser({ userID })]);
    } else if (role_id === 3) {
        await Promise.all([userSubscribeModel.delete(userID), categoryModel.deleteUser({ userID }), userModel.update({ id: userID, writer_pseudonym: req.body.full_name })]);
    } else {
        await userSubscribeModel.delete(userID);
        if(req.body.category) {
            await categoryModel.update({ id: req.body.category, user_id: userID});
        }
    }
    delete req.body.expiry_time;
    delete req.body.category;
    if(!req.body.password) {
        delete req.body.password;
    } else {
        req.body.password = bcrypt.hashSync(req.body.password, authentication.saltRounds);
    }
    req.body.id = userID;
    await userModel.update(req.body);
    res.redirect('/admin/users');
})

router.post('/:id/delete', isAdmin, async (req, res) => {
    var userID = +req.params.id;
    var success = false;
    const result = await userModel.deleteUser(userID);
    if(result.affectedRows === 1) {
        success = true;
    }
    res.send({ success });
})

router.post('/isEmail', isAdmin, [
    check('email')
      .notEmpty()
      .withMessage('Email không được để trống.')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Email không hợp lệ.'),
  ], async (req, res) => {
      const errors = validationResult(req);
      var msg = 'Là email'
      if(!errors.isEmpty()) {
          msg = errors.array()[0].msg;
      }
      const user = await userModel.findByEmail(req.body.email);
      if(user) {
          msg = 'Email đã có người sử dụng';
      }
      res.send({ msg });
})

router.get('/add', isAdmin, async (req, res) => {
    const roles = await roleModel.loadAll();
    const vacantCategories = await categoryModel.loadVacantCategories();
    res.render('Admin/User/add', { roles, vacantCategories });
})

router.post('/add', isAdmin, async (req, res) => {
    const categoryID = +req.body.category;
    req.body = _.pick(req.body, ['full_name', 'email', 'dob', 'password', 'role']);
    req.body = _.assign(req.body, {
        username: v4(),
        password: bcrypt.hashSync(req.body.password, authentication.saltRounds),
        confirmed: true,
        role: +req.body.role,
    });
    const result = await userModel.create(req.body);
    const user = await userModel.findById(result.insertId);
    if(req.body.role === 4) {
        await userSubscribeModel.add({ user_id: user.id, expiry_time: moment(user.created_at).add(10080, 'm').format('YYYY-MM-DD HH:mm:ss') });
    } else if(req.body.role === 2) {
        await categoryModel.update({ id: categoryID, user_id: result.insertId });
    }
    res.redirect('/admin/users');
})

module.exports = router;