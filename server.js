/**
 * server configs
 */

require('dotenv').config();
require('express-async-errors');
const hbs_sections = require('express-handlebars-sections');
const express = require('express');
const path = require('path');
let app = express();

app.disable('x-powered-by');

const cors = require('cors');
app.use(cors());

const helmet = require('helmet');
app.use(helmet());

const morgan = require('morgan');
app.use(morgan('dev'));

app.use('/public', express.static(path.join(__dirname, '/public')));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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
    helpers: {
      section: hbs_sections()
    }
  }),
);

const { v4 } = require('uuid');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
app.use(
  session({
    genid: function (req) {
      return v4();
    },
    store: new FileStore(),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 30 }, // 30 min
  }),
);

const passport = require('passport');
require('./src/strategies/local.strategy');
require('./src/strategies/facebook.strategy');
require('./src/strategies/google.strategy');
app.use(passport.initialize());
app.use(passport.session());

// require all routes
app = require('./app')(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✔️ server running on PORT: ${PORT}`));
