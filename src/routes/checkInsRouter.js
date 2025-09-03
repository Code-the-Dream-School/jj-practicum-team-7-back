const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middleware/auth');
const checkInController = require('../controllers/checkInController');

console.log('Check-ins router loaded');

// GET all check-ins for a challenge
router.get('/', auth, checkInController.getCheckIn);

// POST a new check-in for today
router.post('/', auth, checkInController.submitCheckIn);

module.exports = router;
