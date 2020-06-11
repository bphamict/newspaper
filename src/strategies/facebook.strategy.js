const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user.model');
const { app } = require('../configs/default');

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: `http://${app.domain}/auth/facebook/callback`,
      enableProof: true,
      profileFields: ['id', 'displayName', 'photos', 'email'],
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        const user = await User.findOrCreate(profile);
        cb(null, user);
      } catch (err) {
        cb(err);
      }
    },
  ),
);
