const router = require('express').Router();

router.get('/', (req, res) => {
  console.log(req.query);
  res.render('static/search', {
    q: req.query.q,
  });
});

module.exports = router;
