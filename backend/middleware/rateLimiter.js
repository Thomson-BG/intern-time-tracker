const rateLimit = require('express-rate-limit');

// Rate limiting middleware
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// General API rate limit
const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // limit each IP to 100 requests per windowMs
  'Too many requests from this IP, please try again later.'
);

// Strict rate limit for admin login
const loginLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // limit each IP to 5 login requests per windowMs
  'Too many login attempts from this IP, please try again after 15 minutes.'
);

// Rate limit for time logging (more permissive)
const timeLogLimiter = createRateLimit(
  60 * 1000, // 1 minute
  10, // limit each IP to 10 time log requests per minute
  'Too many time log requests, please try again in a minute.'
);

module.exports = {
  generalLimiter,
  loginLimiter,
  timeLogLimiter
};