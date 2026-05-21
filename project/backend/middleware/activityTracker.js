const User = require('../models/User');

// Update user activity on every request
const trackActivity = async (req, res, next) => {
  try {
    // Only track if user is authenticated
    if (req.user && req.user.id) {
      await User.findByIdAndUpdate(
        req.user.id,
        {
          lastActivity: new Date(),
          lastActivityIP: req.ip || req.connection.remoteAddress || ''
        }
      );
    }
  } catch (error) {
    // Don't block request if activity tracking fails
    console.error('Activity tracking error:', error);
  }
  next();
};

module.exports = trackActivity;