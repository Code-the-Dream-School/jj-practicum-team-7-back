const mongoose = require('mongoose');

const CheckInSchema = new mongoose.Schema(
  {
    challenge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date, // when user first checked in
      default: null,
    },
    checkedDays: [
      {
        type: Number, // e.g. 1, 2, 3 => day numbers relative to startDate
      },
    ],
  },
  { timestamps: true }
);

// one check-in document per (user + challenge)
CheckInSchema.index({ challenge: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('CheckIn', CheckInSchema);
