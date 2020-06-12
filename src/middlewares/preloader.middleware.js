module.exports = function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.isAuthenticated && (res.locals.user = req.user);
  res.locals.app = require('../configs/default').app;
  if (
    !req.path.startsWith('/auth/') &&
    !req.path.startsWith('/favicon.ico') &&
    !req.path.startsWith('/style.css') &&
    req.session.redirectUrl
  ) {
    delete req.session.redirectUrl;
  }
  if (
    res.locals.isAuthenticated &&
    req.path.startsWith('/auth/') &&
    !req.path.startsWith('/auth/logout')
  ) {
    return res.render('static/400', {
      error: require('../configs/messages').MESSAGES.YOU_HAS_BEEN_AUTHENTICATED,
    });
  }
  next();
};
