/**
 * server configs
 */

require('dotenv').config();
require('express-async-errors');
const express = require('express');
let app = express();

const cors = require('cors');
app.use(cors());

const helmet = require('helmet');
app.use(helmet());

const morgan = require('morgan');
app.use(morgan('dev'));

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.disable('x-powered-by');

const exphbs = require('express-handlebars');
app.set('views', 'src/views');
app.set('view engine', 'hbs');
app.engine(
  'hbs',
  exphbs({
    layoutsDir: 'src/views/_layouts',
    defaultLayout: 'main',
    partialsDir: 'src/views/_partials',
    extname: '.hbs',
  }),
);

// require all routes
app = require('./app')(app);

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).render('statics/500', { layout: false });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`server running on PORT: ${PORT}`));
