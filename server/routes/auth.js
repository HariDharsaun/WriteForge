const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const secret = process.env.JWT_SECRET || 'secret';

// Input validation middleware
const validateInput = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Email and password are required'
    });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Invalid email',
      message: 'Please provide a valid email address'
    });
  }

  // Password strength validation
  if (password.length < 6) {
    return res.status(400).json({
      error: 'Weak password',
      message: 'Password must be at least 6 characters long'
    });
  }

  next();
};

// register
router.post('/register', validateInput, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        error: 'User exists',
        message: 'An account with this email already exists'
      });
    }

    // Create new user
    const hash = await bcrypt.hash(password, 12); // Increased from 10 to 12 rounds
    const user = new User({
      name: name || email.split('@')[0], // Use part of email as name if not provided
      email: email.toLowerCase(),
      passwordHash: hash
    });
    
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      secret,
      { expiresIn: '7d' }
    );

    // Return user data (excluding sensitive information)
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    });
  }
});

// login
router.post('/login', validateInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      secret,
      { expiresIn: '7d' }
    );

    // Return user data
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        credits: user.credits
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
});

// get profile
const auth = require('../middleware/auth');
router.get('/me', auth, (req, res) => {
  const u = req.user;
  res.json({ id: u._id, name: u.name, email: u.email, credits: u.credits });
});

// Add credits to user account
router.post('/add-credits', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    
    // Validate amount
    const creditAmount = Number(amount);
    if (isNaN(creditAmount) || creditAmount <= 0) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Please provide a valid positive number for credits'
      });
    }

    // Update user credits
    const user = req.user;
    user.credits += creditAmount;
    await user.save();

    res.json({
      message: 'Credits added successfully',
      newBalance: user.credits,
      added: creditAmount
    });
  } catch (err) {
    console.error('Add credits error:', err);
    res.status(500).json({
      error: 'Failed to add credits',
      message: 'An error occurred while adding credits'
    });
  }
});

module.exports = router;