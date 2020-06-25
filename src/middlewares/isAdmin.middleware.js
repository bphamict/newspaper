/**
 * check user is Admin
 * role: 1
 */

const debug = require('debug')('app:middlewares');

module.exports = function (req, res, next) {
  debug('execute isAdmin');

  return require('../middlewares/isAuthenticated.middleware')(
    req,
    res,
    next,
    1,
  );
};
