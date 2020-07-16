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
app.use(
  morgan(
    '[:date[iso]] :method :url :status :response-time ms - :res[content-length]',
  ),
);

if (process.env.NODE_ENV === 'production') {
  const rateLimit = require('express-rate-limit');
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: 'Too many request from this IP, please try again after 15 minutes',
  });
  app.use(apiLimiter);
}

app.use('/public', express.static(path.join(__dirname, '/public')));

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const exphbs = require('express-handlebars');
const express_handlebars_sections = require('express-handlebars-sections');
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
      section: hbs_sections(),
      ifEqual: function(v1, v2, options) {
        if(v1 === v2) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      ifInListObject: function(item, list, options) {
        if(list.find(element => element.tag_id === item)) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      json: function (content) {
        return JSON.stringify(content);
      },
      ifNotEqual: function(v1, v2, options) {
        if(v1 !== v2) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      ifLarger: function(v1, v2, options) {
        if(v1 > v2) {
          return options.fn(this);
        }
        return options.inverse(this);
      },
      ifTagNotInPostTag: function (item, list, options) {
        if(!list.find(element => element.id === item.id)) {
          return options.fn(this);
        }
        return options.inverse(this);
      }
    },
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
