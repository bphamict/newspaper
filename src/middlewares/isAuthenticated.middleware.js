/**
 * check user has been authenticated
 * if not then redirect to login page
 */

const debug = require('debug')('app:middlewares');

module.exports = function (req, res, next, role) {
  // debug('execute isAuthenticated');

  if (!req.isAuthenticated()) {
    return res.redirect(`/auth/login?origin=${req.originalUrl}`);
  }

  if (req.user.role <= role) {
    return next();
  }

  let error = '';
  switch (role) {
    case 1:
      error = 'Access denied. You are not Administrator.';
      break;
    case 2:
      error = 'Access denied. You are not Editor.';
      break;
    case 3:
      error = 'Access denied. You are not Writer.';
      break;
    case 4:
      error = 'Access denied. You are not Subcriber.';
      break;
  }
  return res.render('static/400', {
    error: error,
  });
};
