const express = require('express')
const router = express.Router()
const challengeController = require('../controllers/challengeController')
const auth = require('../middleware/auth')

console.log('Challenges router loaded');
router.post('/', auth, challengeController.createChallenge)
    .get('/', auth, challengeController.getChallenges)
    .get('/:id', auth,challengeController.getChallengeById)
    .patch('/:id/accept', auth, challengeController.acceptChallenge)
    .patch('/:id/decline', auth, challengeController.declineChallenge)

module.exports = router    