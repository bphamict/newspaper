const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { MESSAGES } = require('../configs/messages');

passport.use(
  new LocalStrategy(
    { usernameField: 'email', passwordField: 'password' },
    async function (email, password, done) {
      try {
        const user = await User.findByEmail(email);
        if (!user) {
          return done(null, false, {
            message: MESSAGES.ACCOUNT_IS_NOT_FOUND,
          });
        }
        if (user.blocked) {
          return done(null, false, {
            message: MESSAGES.ACCOUNT_HAS_BEEN_BLOCKED,
          });
        }
        if (!user.confirmed) {
          return done(null, false, {
            message: MESSAGES.ACCOUNT_WAS_NOT_CONFIRMED,
          });
        }
        if (!bcrypt.compareSync(password, user.password)) {
          return done(null, false, {
            message: MESSAGES.INCORRECT_PASSWORD,
          });
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    },
  ),
);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function (id, done) {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
