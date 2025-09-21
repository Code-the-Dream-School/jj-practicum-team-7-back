const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { BadRequestError, UnauthenticatedError } = require('../errors');
const { StatusCodes } = require('http-status-codes');

const generateToken = (userId, username) => {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_LIFETIME || '30d';
  const token = jwt.sign({ userId, username }, secret, { expiresIn });
  return token;
};
// Check if user is authenticated
const checkAuth = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthenticatedError('No token provided');
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select(
      'username email timezone'
    );
    if (!user) {
      throw new UnauthenticatedError('User not found');
    }
    res.status(StatusCodes.OK).json({ user });
  } catch (error) {
    console.error('Check auth error:', error);
    const status = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Invalid token';
    res.status(status).json({ message });
  }
};

//Register a new user
const registerUser = async (req, res) => {
  try {
    const { username, email, password, timezone } = req.body;
    if (!username || !email || !password) {
      throw new BadRequestError('username, email and password are required');
    }
    const emailNormalized = String(email).toLowerCase().trim();

    // Check if a user with the provided username/email already exists
    const emailTaken = await User.findOne({ email: emailNormalized });
    if (emailTaken) {
      throw new BadRequestError('This email is already taken.');
    }

    // Check if a user with the provided username already exists
    const usernameTaken = await User.findOne({ username });
    if (usernameTaken) {
      throw new BadRequestError('This username is already taken.');
    }

    // create user
    const user = await User.create({
      username,
      email: emailNormalized,
      password,
      timezone,
    });

    // generate a token for new user
    const token = generateToken(user._id, user.username);
    res.status(StatusCodes.CREATED).json({
      user: { username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    const status = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = error.statusCode ? error.message : 'Registration failed';
    return res.status(status).json({ message });
  }
};

//Login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestError('Please provide email and password');
    }
    const emailNormalized = String(email).toLowerCase().trim();

    const user = await User.findOne({ email: emailNormalized }).select(
      '+password'
    );
    if (!user) {
      throw new UnauthenticatedError('Invalid credentials');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthenticatedError('Invalid credentials');
    }

    const token = generateToken(user._id, user.username);

    res.status(StatusCodes.OK).json({
      user: {
        username: user.username,
        email: user.email,
        timezone: user.timezone,
      },
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    const status = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    const message = error.message || 'Login failed';
    res.status(status).json({ message: message });
  }
};

// Logout
const logoutUser = async (req, res) => {
  try {
    if (!req.user) {
      throw new UnauthenticatedError('No user authenticated');
    }
    if (req.session) {
      req.logout((err) => {
        if (err) {
          console.error('Passport logout error:', err);
          throw new Error('Logout failed');
        }
      });
    }
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(StatusCodes.OK).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Error during logout:', error);
    res
      .status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: error.message || 'Logout failed' });
  }
};
module.exports = { registerUser, loginUser, logoutUser, checkAuth };
