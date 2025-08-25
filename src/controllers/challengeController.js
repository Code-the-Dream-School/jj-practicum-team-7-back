const mongoose = require('mongoose');
const { Challenge, categories } = require('../models/Challenge');
const User = require('../models/User');

const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');

const createChallenge = async (req, res) => {
  const { title, category, duration, invited = [] } = req.body;
  try {
    if (!title || typeof title !== 'string') {
      throw new BadRequestError(`Let's name your challenge to get started!`);
    }
    if (title.length < 5) {
      throw new BadRequestError(
        `That title's a bit short - try at least 5 characters`
      );
    }
    if (title.length > 50) {
      throw new BadRequestError(
        'Short and sweet titles work best - try under 50 characters!'
      );
    }
    if (!category || !categories.includes(category)) {
      throw new BadRequestError(`Please choose a category from the list`);
    }
    if (!duration || typeof duration !== 'number' || duration < 1) {
      throw new BadRequestError('Duration must be at least 1 day');
    }
    const userId = req.user.id;
    const user = await User.findById(userId).select('_id username');
    if (!user) {
      throw new BadRequestError(`User with ID ${userId} not found`);
    }
    const existingChallenge = await Challenge.findOne({
      title,
      creator: userId,
    });
    if (existingChallenge) {
      throw new BadRequestError(
        `Challenge with title '${title}' already exists for this user!`
      );
    }
    const challenge = await Challenge.create({
      title,
      category,
      duration,
      creator: userId,
      participant: [userId],
      invited: invited.map(id => mongoose.Types.ObjectId(id)),
    });
    return res.status(StatusCodes.CREATED).json({ challenge });
  } catch (error) {
    console.error('Error in createChallenge:', error);
    if (error.name === 'MongoServerError' && error.code === 11000) {
      throw new BadRequestError(
        'Oops, you already have a challenge with that title!'
      );
    }
    if (error.name === 'ValidationError') {
      throw new BadRequestError(`Validation failed: ${error.message}`);
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Failed to create challenge' });
  }
};

const getChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({
      $or: [{ participant: req.user.id }, { invited: req.user.id }],
    })
      .populate('creator', 'username')
      .populate('participant', 'username');
    return res.status(StatusCodes.OK).json({ challenges });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Failed to fetch challenges' });
  }
};

const acceptChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }
    if (!challenge.invited.includes(req.user.id)) {
      throw new BadRequestError(`You're not invited to this challenge`);
    }
    if (challenge.participant.includes(req.user.id)) {
      throw new BadRequestError(`You're already in this challenge`);
    }
    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      {
        $push: { participant: req.user.id },
        $pull: { invited: req.user.id },
        $set: { status: 'active' },
      },
      { new: true }
    )
      .populate('creator', 'username')
      .populate('participant', 'username');

    // TODO: Create CheckIn record with startDate for user (waiting for Romanna's CheckIn model)

    return res.status(StatusCodes.OK).json({ challenge: updatedChallenge });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Failed to accept challenge' });
  }
};

const declineChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) {
      throw new NotFoundError('Challenge not found');
    }
    if (!challenge.invited.includes(req.user.id)) {
      throw new BadRequestError(`You're not invited to this challenge`);
    }
    if (challenge.participant.includes(req.user.id)) {
      throw new BadRequestError(`You're already in this challenge`);
    }
    const updatedChallenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      { $pull: { invited: req.user.id } },
      { new: true }
    )
      .populate('creator', 'username')
      .populate('participant', 'username');

    return res
      .status(StatusCodes.OK)
      .json({ challenge: updatedChallenge, message: 'Challenge declined' });
  } catch (error) {
    throw error;
  }
};
module.exports = {
  createChallenge,
  getChallenges,
  acceptChallenge,
  declineChallenge,
};
