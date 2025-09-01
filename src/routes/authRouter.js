const express = require('express');
const passport = require('passport');
const router = express.Router();


const { loginUser, registerUser, logoutUser } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
// Google OAuth
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

    // Redirect to frontend OAuth success page
    res.redirect(
      `${process.env.VITE_FRONTEND_URL}/oauth-success?token=${token}&username=${encodeURIComponent(
        user.username
      )}&email=${encodeURIComponent(user.email)}`
    );
  }
);

router.get('/validate-token', auth, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
