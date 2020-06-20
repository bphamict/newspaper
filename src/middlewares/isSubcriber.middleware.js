/**
 * check user is Subcriber
 * role: 4
 */

const debug = require('debug')('app:middlewares');

module.exports = function (req, res, next) {
  debug('execute isSubcriber');

  return require('../middlewares/isAuthenticated.middleware')(
    req,
    res,
    next,
    4,
  );
};
