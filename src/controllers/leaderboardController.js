const { Challenge } = require('../models/Challenge');
const CheckIn = require('../models/CheckIn');
const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const { NotFoundError } = require('../errors');

// GET /api/v1/challenges/:id/top3  -> top 3 inside one challenge
// GET /api/v1/leaderboard          -> global leaderboard (all check-ins)
const getLeaderboard = async (req, res) => {
  try {
    const { id: challengeId } = req.params;

    if (challengeId) {
      // leaderboard for a specific challenge 
      const challenge = await Challenge.findById(challengeId).populate(
        'participant',
        'username'
      );
      if (!challenge) {
        throw new NotFoundError('Challenge not found');
      }

      const checkIns = await CheckIn.find({ challenge: challengeId }).populate(
        'user',
        'username'
      );

      const leaderboard = challenge.participant.map((p) => {
        const checkIn = checkIns.find(
          (c) => c.user._id.toString() === p._id.toString()
        );
        return {
          userId: p._id,
          username: p.username,
          totalCheckIns: checkIn ? checkIn.checkedDays.length : 0,
        };
      });

      leaderboard.sort((a, b) => b.totalCheckIns - a.totalCheckIns);

      return res.status(StatusCodes.OK).json({
        scope: 'challenge',
        challengeId,
        leaderboard,
        top3: leaderboard.slice(0, 3),
      });
    }

    // global leaderboard across all challenges 
    const checkIns = await CheckIn.find({}).populate('user', 'username');

    // Group by user
    const scores = {};
    checkIns.forEach((c) => {
      const userId = c.user._id.toString();
      if (!scores[userId]) {
        scores[userId] = {
          userId,
          username: c.user.username,
          totalCheckIns: 0,
        };
      }
      scores[userId].totalCheckIns += c.checkedDays.length;
    });

    const globalLeaderboard = Object.values(scores).sort(
      (a, b) => b.totalCheckIns - a.totalCheckIns
    );

    res.status(StatusCodes.OK).json({
      scope: 'global',
      leaderboard: globalLeaderboard,
      top3: globalLeaderboard.slice(0, 3),
    });
  } catch (error) {
    console.error('Error in getLeaderboard:', error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || 'Failed to fetch leaderboard',
    });
  }
};

module.exports = { getLeaderboard };
