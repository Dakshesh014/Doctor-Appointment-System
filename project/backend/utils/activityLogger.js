const ActivityLog = require('../models/ActivityLog');

// Log activity
const logActivity = async (userId, action, description, targetUserId = null, metadata = {}, req = null) => {
  try {
    const activityLog = new ActivityLog({
      user: userId,
      action,
      description,
      targetUser: targetUserId,
      ipAddress: req ? req.ip || req.connection.remoteAddress : '',
      userAgent: req ? req.get('user-agent') : '',
      metadata
    });

    await activityLog.save();
    return true;
  } catch (error) {
    console.error('Activity logging error:', error);
    return false;
  }
};

module.exports = { logActivity };