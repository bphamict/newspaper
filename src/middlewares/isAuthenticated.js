/**
 * check user has been authenticated
 * if not then redirect to login page
 */

const debug = require('debug')('app:middlewares');

module.exports = function (req, res, next) {
  debug('execute isAuthenticated');

  if (!req.session.isAuthenticated) {
    return res.redirect(`/account/login?retUrl=${req.originalUrl}`);
  }

  next();
};
