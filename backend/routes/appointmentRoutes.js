const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

router.post('/book', authMiddleware, async (req, res) => {
  // Handle appointment booking
  // Save to database
  res.json({ message: 'Appointment booked' });
});

module.exports = router;