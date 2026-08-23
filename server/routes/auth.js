const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { verifyFirebaseToken } = require('../config/firebase');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').matches(/^[0-9]{10,11}$/).withMessage('Please enter a valid 10-11 digit phone number'),
  body('userType').isIn(['farmer', 'buyer']).withMessage('User type must be farmer or buyer'),
  body('address').optional({ nullable: true, checkFalsy: true }).custom((value) => {
    if (value && typeof value === 'object' && value.pincode && typeof value.pincode === 'string' && value.pincode.trim() && value.pincode.trim() !== '000000') {
      if (!/^\d{6}$/.test(value.pincode.trim())) {
        throw new Error('Please enter a valid 6-digit pincode');
      }
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { name, email, password, phone, userType, address, farmDetails, businessDetails } = req.body;

    // Check if user already exists in MongoDB
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Normalize optional address with defaults
    const userAddress = {
      street: (address && typeof address === 'object' && address.street) ? String(address.street).trim() : '',
      city: (address && typeof address === 'object' && address.city) ? String(address.city).trim() : '',
      state: (address && typeof address === 'object' && address.state) ? String(address.state).trim() : '',
      pincode: (address && typeof address === 'object' && address.pincode && String(address.pincode).trim()) ? String(address.pincode).trim() : '000000',
      country: (address && typeof address === 'object' && address.country) ? String(address.country).trim() : 'India'
    };

    const userData = {
      name,
      email: email.toLowerCase(),
      password, // Plain — pre-save hook hashes it
      phone,
      userType,
      address: userAddress,
      isVerified: false,
      isActive: true,
    };

    if (userType === 'farmer' && farmDetails) userData.farmDetails = farmDetails;
    if (userType === 'buyer' && businessDetails) userData.businessDetails = businessDetails;

    const user = new User(userData);
    await user.save(); // pre-save hook hashes password once

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        address: user.address,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user in MongoDB
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        address: user.address,
        isVerified: user.isVerified
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/google
// @desc    Authenticate with Google Firebase ID token
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { idToken, userType } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    // Cryptographically verify Firebase ID token
    let decodedToken;
    try {
      decodedToken = await verifyFirebaseToken(idToken);
    } catch (verifyError) {
      console.error('Firebase token verification failed:', verifyError.message);
      return res.status(401).json({
        message: 'Invalid or expired Google authentication token. Please try signing in again.',
        error: verifyError.message
      });
    }

    const { email, name, picture, uid } = decodedToken;

    if (!email) {
      return res.status(400).json({ message: 'Google account does not provide a valid email address' });
    }

    // Check if user already exists in MongoDB
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      // EXISTING user: preserve their role, update Firebase UID and profile pic
      const updateData = { firebaseUid: uid };
      if (!user.profileImage && picture) updateData.profileImage = picture;
      await User.updateOne({ _id: user._id }, { $set: updateData });

      const token = generateToken(user._id);
      return res.json({
        success: true,
        message: `Welcome back, ${user.name}!`,
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          phone: user.phone,
          userType: user.userType, // PRESERVED exactly
          address: user.address,
          isVerified: user.isVerified,
          profileImage: user.profileImage || picture || ''
        }
      });
    }

    // NEW user: validate role selection
    const normalizedRole = userType ? String(userType).toLowerCase().trim() : null;
    if (!normalizedRole || !['farmer', 'buyer'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        requiresRoleSelection: true,
        message: 'Please select whether you want to join as a Farmer or Buyer to complete registration.'
      });
    }

    // Create new user — use pre-hashed password to avoid double-hash from pre-save hook
    const salt = await bcrypt.genSalt(10);
    const placeholderPassword = await bcrypt.hash(Date.now().toString() + Math.random().toString(36), salt);

    const newUserData = {
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      phone: '0000000000',
      userType: normalizedRole,
      address: {
        street: 'Not specified',
        city: 'Not specified',
        state: 'Not specified',
        pincode: '000000',
        country: 'India'
      },
      profileImage: picture || '',
      isVerified: true,
      isActive: true,
      authProvider: 'google',
      firebaseUid: uid,
    };

    if (normalizedRole === 'farmer') {
      newUserData.farmDetails = {
        farmName: `${name || 'Farmer'}'s Farm`,
        farmSize: '1 acre',
        farmingExperience: 0,
        organicCertified: false
      };
    } else {
      newUserData.businessDetails = {
        businessName: `${name || 'Buyer'} Trade`,
        businessType: 'Retail'
      };
    }

    // Insert with pre-hashed password bypassing pre-save hook's second hash
    await User.collection.insertOne({
      ...newUserData,
      password: placeholderPassword,
      rating: { average: 0, count: 0 },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const newUser = await User.findOne({ email: email.toLowerCase() });
    const token = generateToken(newUser._id);

    return res.status(201).json({
      success: true,
      message: `Account created successfully as ${normalizedRole === 'farmer' ? 'Farmer' : 'Buyer'}!`,
      token,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        userType: newUser.userType,
        address: newUser.address,
        isVerified: newUser.isVerified,
        profileImage: newUser.profileImage
      }
    });

  } catch (error) {
    console.error('Google auth server error:', error);
    res.status(500).json({ message: 'Server error during Google authentication' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        address: user.address,
        isVerified: user.isVerified,
        farmDetails: user.farmDetails,
        businessDetails: user.businessDetails,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, (req, res) => {
  res.json({ success: true, message: 'Logout successful' });
});

module.exports = router;
