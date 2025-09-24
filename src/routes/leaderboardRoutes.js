const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const { getLeaderboard } = require('../controllers/leaderboardController');

// Global leaderboard -> /api/v1/leaderboard
router.get('/', auth, getLeaderboard);

// Challenge leaderboard -> /api/v1/challenges/:id/leaderboard
router.get('/:id/leaderboard', auth, getLeaderboard);

module.exports = router;
