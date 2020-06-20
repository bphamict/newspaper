/**
 * check user is Editor
 * role: 2
 */

const debug = require('debug')('app:middlewares');

module.exports = function (req, res, next) {
  debug('execute isEditor');

  return require('../middlewares/isAuthenticated.middleware')(
    req,
    res,
    next,
    2,
  );
};
