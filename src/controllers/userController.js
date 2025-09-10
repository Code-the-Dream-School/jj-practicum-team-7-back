const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('_id username email');
    return res.status(StatusCodes.OK).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Failed to fetch users' });
  }
};

module.exports = { getUsers };
