const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization header, access denied' });
    }

    // Extract token (format: "Bearer TOKEN")
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
    
    // Set user object with proper ID handling
    req.user = {
      id: decoded.id || decoded._id || decoded.userId,  // ✅ Handle all cases
      email: decoded.email,
      role: decoded.role
    };

    console.log('✅ Auth Success - User ID:', req.user.id); // Debug log
    
    next();
  } catch (error) {
    console.error('❌ Auth Error:', error.message);
    res.status(401).json({ message: 'Token is not valid', error: error.message });
  }
};

const verifyRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
};

// Expose individual exports
authMiddleware.verifyToken = authMiddleware;
authMiddleware.verifyAdmin = verifyRole('admin', 'superadmin');
authMiddleware.verifyDoctor = verifyRole('doctor');
authMiddleware.verifyPatient = verifyRole('patient');
authMiddleware.verifySuperAdmin = verifyRole('superadmin');

module.exports = authMiddleware;