/**
 * check user has been authenticated
 * if not then redirect to login page
 */

const debug = require('debug')('app:middlewares');

module.exports = function (req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect(`/auth/login?origin=${req.originalUrl}`);
  }

  next();
};
