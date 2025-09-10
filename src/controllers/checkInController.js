const CheckIn = require('../models/CheckIn');
const { Challenge } = require('../models/Challenge');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError, ForbiddenError } = require('../errors');

// POST /challenges/:id/checkins - submit today's check-in
const submitCheckIn = async (req, res) => {
  try {
    const { id: challengeId } = req.params;
    const userId = req.user.id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }

    const isParticipant = challenge.participant.some(
      (p) => p._id.toString() === userId
    );
    if (!isParticipant) {
      throw new ForbiddenError('You are not a participant in this challenge');
    }

    if (challenge.status !== 'active' && challenge.status !== 'pending') {
      throw new BadRequestError(
        'This challenge is no longer active or pending'
      );
    }

    let checkIn = await CheckIn.findOne({
      challenge: challengeId,
      user: userId,
    });

    // if first check-in
    if (!checkIn) {
      checkIn = new CheckIn({
        challenge: challengeId,
        user: userId,
        startDate: new Date(),
        checkedDays: [1],
      });
      await checkIn.save();

      if (challenge.status === 'pending') {
        await Challenge.findByIdAndUpdate(challengeId, { status: 'active' });
      }
      return res.status(StatusCodes.CREATED).json(checkIn);
    }

    // calculate today’s day number
    const today = dayjs().utc().startOf('day');
    const startDate = dayjs(checkIn.startDate).utc().startOf('day');
    const currentDay = today.diff(startDate, 'day') + 1; // +1 because first day = 1

    if (currentDay > challenge.duration) {
      throw new BadRequestError('Challenge duration is over');
    }

    if (checkIn.checkedDays.includes(currentDay)) {
      throw new BadRequestError('Already checked in for today');
    }

    // atomic update to avoid duplicates
    checkIn = await CheckIn.findByIdAndUpdate(
      checkIn._id,
      { $addToSet: { checkedDays: currentDay } },
      { new: true }
    );

    checkIn.checkedDays.sort((a, b) => a - b);

    res.status(StatusCodes.OK).json(checkIn);
  } catch (error) {
    console.error('Error in submitCheckIn:', error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || 'Server error',
    });
  }
};

// GET /challenges/:id/checkins - get progress
const getCheckIn = async (req, res) => {
  try {
    const { id: challengeId } = req.params;
    const userId = req.user.id;

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }

    const hasAccess =
      challenge.participant.some(
        (p) => p._id.toString() === userId.toString()
      ) ||
      challenge.invited.some((i) => i._id.toString() === userId.toString()) ||
      challenge.creator._id.toString() === userId.toString();

    if (!hasAccess) {
      throw new ForbiddenError('You do not have access to this challenge');
    }

    const checkIn = await CheckIn.findOne({
      challenge: challengeId,
      user: userId,
    });

    if (!checkIn) {
      return res.status(StatusCodes.OK).json({
        currentDay: 0,
        checkedDays: [],
        missedDays: [],
        pendingDay: null,
      });
    }

    // figure out current day number
    const today = dayjs().utc().startOf('day');
    const startDate = dayjs(checkIn.startDate).utc().startOf('day');
    let currentDay = today.diff(startDate, 'day') + 1;

    // cap at duration
    if (currentDay > challenge.duration) {
      currentDay = challenge.duration;
    }

    // checked days
    const checkedDays = checkIn.checkedDays;

    // missed days => days between 1..currentDay-1 that are not checked
    const missedDays = [];
    for (let d = 1; d < currentDay; d++) {
      if (!checkedDays.includes(d)) {
        missedDays.push(d);
      }
    }

    // pending => only today’s day (if within duration and not already checked)
    let pendingDay = null;
    const isChallengeActive = currentDay < challenge.duration;
    const isTodayChecked = checkedDays.includes(currentDay);

    if (isChallengeActive && !isTodayChecked) {
      pendingDay = currentDay;
    }

    // if challenge ended, and today wasn't checked, mark as missed
    if (currentDay === challenge.duration && !isTodayChecked) {
      missedDays.push(currentDay);
      pendingDay = null;
    }

    res.status(200).json({
      currentDay,
      checkedDays,
      missedDays,
      pendingDay,
    });
  } catch (error) {
    console.error('Error in getCheckIn:', error);
    res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: error.message || 'Server error',
    });
  }
};

module.exports = {
  submitCheckIn,
  getCheckIn,
};
