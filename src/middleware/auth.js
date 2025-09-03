const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
   return next( new UnauthenticatedError('Authentication invalid'));
  }
  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    //console.log(payload);
    req.user = { id: payload.userId, username: payload.username };
    next();
  } catch (error) {
    return next (new UnauthenticatedError('Authentication invalid'));
  }
};

module.exports = auth;
