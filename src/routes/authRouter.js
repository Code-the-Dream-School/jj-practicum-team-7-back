const express = require('express');
const passport = require('passport');
const router = express.Router();

const {
  loginUser,
  registerUser,
  logoutUser,
  checkAuth,
} = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', auth, logoutUser);
router.get('/check-auth', auth, checkAuth);

// Google OAuth authentication
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const { user, token } = req.user;
    res.redirect(
      `${process.env.VITE_FRONTEND_URL}/oauth-success?token=${token}&username=${user.username}&email=${user.email}`
    );
  }
);

module.exports = router;
