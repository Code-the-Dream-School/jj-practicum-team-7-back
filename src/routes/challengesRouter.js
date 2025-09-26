const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const auth = require('../middleware/auth');
const checkInsRouter = require('./checkInsRouter');

console.log('Challenges router loaded');

router
  .post('/', auth, challengeController.createChallenge)
  .get('/', auth, challengeController.getChallenges)
  .get('/:id', auth, challengeController.getChallengeById)
  .patch('/:id/accept', auth, challengeController.acceptChallenge)
  .patch('/:id/decline', auth, challengeController.declineChallenge)
  .delete('/:id', auth, challengeController.deleteChallenge)
  .patch('/:id', auth, challengeController.updateChallenge);

// Mount check-ins routes under /challenges/:id/checkins
router.use('/:id/checkins', checkInsRouter);

module.exports = router;
