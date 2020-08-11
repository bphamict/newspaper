const categoryModel = require('../models/category.model');
const subCategoryModel = require('../models/sub-category.model');

module.exports = async function (req, res, next) {
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

  const [categories, subCategories] = await Promise.all([
    categoryModel.all(),
    subCategoryModel.loadAll(),
  ]);
  const localsCatWithSubCat = [];

  categories.forEach((category) => {
    const subCats = [];
    subCategories.forEach((subCat) => {
      if (subCat.category_id === category.id) {
        subCats.push({
          sub_category_name: subCat.name,
          sub_category_slug: subCat.slug,
        });
      }
    });

    localsCatWithSubCat.push({
      category_name: category.name,
      category_slug: category.slug,
      subCats,
    });
  });

  res.locals.localsCatWithSubCat = localsCatWithSubCat;

  next();
};
