const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');
const { logActivity } = require('../utils/activityLogger');

// Register new user
const register = async (req, res) => {
  try {
    const { name, email, password, role, specialization, licenseNumber, qualification, experience } = req.body;

    // Fetch system settings
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
      await settings.save();
    }

    // Check if registration is allowed for the given role
    if (role === 'doctor' && !settings.clinicianRegistration) {
      return res.status(403).json({ message: 'Doctor registration is currently disabled by administrator.' });
    }
    if (role === 'patient' && !settings.patientSelfOnboarding) {
      return res.status(403).json({ message: 'Patient onboarding is currently disabled by administrator.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      specialization: specialization || '',
      licenseNumber: licenseNumber || '',
      qualification: qualification || '',
      experience: experience || 0,
      status: role === 'patient' ? 'approved' : 'pending'
    });

    await user.save();

    // Log activity
    await logActivity(user._id, 'register', `New ${role} registered: ${name}`, null, { role }, req);

    // Different messages based on role
    let message = 'User registered successfully';
    if (role === 'doctor') {
      message = 'Doctor registration submitted! Waiting for admin/superadmin approval.';
    } else if (role === 'admin') {
      message = 'Admin registration submitted! Waiting for superadmin approval.';
    }

    res.status(201).json({ 
      message,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Fetch system settings
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = new SystemSettings();
      await settings.save();
    }

    // Check maintenance mode
    if (settings.maintenanceMode && role !== 'admin' && role !== 'superadmin') {
      return res.status(503).json({ message: 'System is currently under maintenance. Please try again later.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if role matches
    if (user.role !== role) {
      return res.status(400).json({ message: 'Invalid role selected' });
    }

    // CHECK APPROVAL STATUS
    if (user.status === 'pending' && (user.role === 'doctor' || user.role === 'admin')) {
      return res.status(403).json({ 
        message: `Your ${user.role} account is pending approval. Please wait for admin/superadmin to approve your request.`,
        status: 'pending'
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ 
        message: `Your account has been rejected. Reason: ${user.rejectionReason || 'Not specified'}`,
        status: 'rejected'
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // ✅ UPDATE ONLINE STATUS AND LAST LOGIN
    user.isOnline = true;
    user.lastLogin = new Date();
    user.lastActivity = new Date();
    user.lastActivityIP = req.ip || req.connection.remoteAddress || '';
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        email: user.email, 
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log activity
    await logActivity(user._id, 'login', `${user.role} logged in: ${user.name}`, null, {}, req);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isOnline: user.isOnline,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ✅ LOGOUT USER
const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // UPDATE OFFLINE STATUS AND LAST LOGOUT
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isOnline: false,
        lastLogout: new Date(),
        lastActivity: new Date()
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Log activity
    await logActivity(userId, 'logout', `${user.role} logged out: ${user.name}`, null, {}, req);

    res.json({
      message: 'Logged out successfully',
      lastLogout: user.lastLogout
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check if setup is allowed (only if no superadmin exists)
const checkSetupAllowed = async (req, res) => {
  try {
    const superadminExists = await User.findOne({ role: 'superadmin' });
    
    res.json({
      allowed: !superadminExists
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Setup Owner (One-time only)
const setupOwner = async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;
    
    // Verify secret key
    if (secretKey !== 'OWNER2024') {
      return res.status(403).json({ message: 'Invalid setup key' });
    }
    
    // Check if superadmin already exists
    const superadminExists = await User.findOne({ role: 'superadmin' });
    if (superadminExists) {
      return res.status(403).json({ message: 'Setup has already been completed' });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create superadmin (auto-approved)
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'superadmin',
      status: 'approved'
    });
    
    await user.save();

    // Log activity
    await logActivity(user._id, 'register', 'SuperAdmin account created', null, {}, req);
    
    res.status(201).json({ 
      message: 'Owner account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// SuperAdmin Login
const superadminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user with superadmin role
    const user = await User.findOne({ email, role: 'superadmin' });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ✅ UPDATE ONLINE STATUS AND LAST LOGIN
    user.isOnline = true;
    user.lastLogin = new Date();
    user.lastActivity = new Date();
    user.lastActivityIP = req.ip || req.connection.remoteAddress || '';
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Log activity
    await logActivity(user._id, 'login', 'SuperAdmin logged in', null, {}, req);
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOnline: user.isOnline,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export all functions
module.exports = { 
  register, 
  login,
  logout,
  checkSetupAllowed, 
  setupOwner, 
  superadminLogin 
};