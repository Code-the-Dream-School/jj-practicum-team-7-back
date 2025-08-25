const express = require('express')
const router = express.Router()
const challengeController = require('../controllers/challengeController')
const auth = require('../middleware/auth')

router
    .post('/challenges', auth, challengeController.createChallenge)
    .get('/challenges', auth, challengeController.getChallenges)
    .patch('/challenges/:id/accept', auth, challengeController.acceptChallenge)
    .patch('/challenges/:id/decline', auth, challengeController.declineChallenge)

module.exports = router    