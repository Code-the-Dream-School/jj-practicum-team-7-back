const express = require('express');
const router = express.Router();

const { loginUser, registerUser, logoutUser } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.get('/validate-token', auth, (req, res) => {
  res.status(200).json({ user: req.user });
});

module.exports = router;
