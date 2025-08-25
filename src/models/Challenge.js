const mongoose = require('mongoose');

//I defined the categories array outside the schema in case we will add categories API later (to reuse the sane categories array)
const categories = ['Fitness', 'Learning', 'Productivity', 'Health', 'Creativity', 'Self-Care', 'Finance', 'Mindfulness', 'Other'];

const ChallengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, `Title is required`],
      minlength: [5, `Title must be between 5 and 50 characters!`],
      maxlength: [50, 'Title must be between 5 and 50 characters!'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, `Please choose a category`],
      enum: categories,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed', 'failed'],
      default: 'pending',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invited: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      required: false,
      default: [], //allow solo-challenges
    },
    duration: {
      type: Number,
      required: true,
      min: [1, 'Duration must be at least 1 day'],
    },
    participant: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure title is unique per creator
ChallengeSchema.index({ title: 1, creator: 1 }, { unique: true });

module.exports = {Challenge: mongoose.model('Challenge', ChallengeSchema), categories}
