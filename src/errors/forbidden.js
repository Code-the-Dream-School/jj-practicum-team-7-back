const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('./customAPI');

class ForbiddenError extends CustomAPIError {
  constructor(message) {
    super(message, StatusCodes.FORBIDDEN);
  }
}

module.exports = ForbiddenError;
