const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const jwt = require('jsonwebtoken');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/v1/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Normalize email
        const email = profile.emails[0].value.toLowerCase().trim();

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
          // Create new user (no password since it's Google login)
          user = await User.create({
            username: profile.displayName,
            email,
            password: Math.random().toString(36).slice(-8), 
          });
        }

        // Generate JWT (reuse your helper if you want)
        const token = jwt.sign(
          { userId: user._id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_LIFETIME || '30d' }
        );

        return done(null, { user, token });
      } catch (err) {
        done(err, null);
      }
    }
  )
);

// required by passport 
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

module.exports = passport;
