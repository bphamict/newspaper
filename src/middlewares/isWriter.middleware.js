/**
 * check user is Writer
 * role: 3
 */

const debug = require('debug')('app:middlewares');

module.exports = function (req, res, next) {
  debug('execute isWriter');

  return require('../middlewares/isAuthenticated.middleware')(
    req,
    res,
    next,
    3,
  );
};
