const express = require('express');
const { body, validationResult } = require('express-validator');
const { users, crops } = require('../db');
const { auth, authorize } = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/profiles/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        address: user.address,
        profileImage: user.profileImage,
        farmDetails: user.farmDetails,
        businessDetails: user.businessDetails,
        rating: user.rating,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, upload.single('profileImage'), [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('phone').optional().matches(/^[6-9]\d{9}$/).withMessage('Invalid phone number'),
  body('address.street').optional().notEmpty().withMessage('Street address is required'),
  body('address.city').optional().notEmpty().withMessage('City is required'),
  body('address.state').optional().notEmpty().withMessage('State is required'),
  body('address.pincode').optional().matches(/^\d{6}$/).withMessage('Invalid pincode')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updateData = req.body;

    // Handle profile image upload
    if (req.file) {
      updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    // Remove sensitive fields
    delete updateData.password;
    delete updateData.email;
    delete updateData.userType;

    // Update user
    Object.assign(users[userIndex], updateData);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: users[userIndex].id,
        name: users[userIndex].name,
        email: users[userIndex].email,
        phone: users[userIndex].phone,
        userType: users[userIndex].userType,
        address: users[userIndex].address,
        profileImage: users[userIndex].profileImage,
        farmDetails: users[userIndex].farmDetails,
        businessDetails: users[userIndex].businessDetails,
        rating: users[userIndex].rating,
        isVerified: users[userIndex].isVerified
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[userIndex];

    // Check current password
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userType = req.user.userType;

    let dashboardData = {
      user: {
        name: req.user.name,
        email: req.user.email,
        userType: req.user.userType,
        rating: req.user.rating,
        profileImage: req.user.profileImage
      }
    };

    if (userType === 'farmer') {
      // Farmer dashboard data using in-memory crops
      const userCrops = crops.filter(crop => crop.farmer === userId);
      const totalCrops = userCrops.length;
      const activeCrops = userCrops.filter(crop => crop.isActive && crop.availability.status === 'available').length;

      // For now, set orders to 0 since we don't have in-memory orders
      const totalOrders = 0;
      const pendingOrders = 0;
      const totalEarnings = 0;

      const recentCrops = userCrops
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(crop => ({
          _id: crop._id,
          name: crop.name,
          price: crop.price,
          quantity: crop.quantity,
          images: crop.images,
          availability: crop.availability,
          createdAt: crop.createdAt
        }));

      dashboardData.stats = {
        totalCrops,
        activeCrops,
        totalOrders,
        pendingOrders,
        totalEarnings
      };

      dashboardData.recentCrops = recentCrops;
      dashboardData.recentOrders = [];

    } else if (userType === 'buyer') {
      // Buyer dashboard data
      const totalOrders = 0;
      const pendingOrders = 0;
      const totalSpent = 0;

      const favoriteCrops = crops
        .filter(crop => crop.favorites && crop.favorites.includes(userId) && crop.isActive)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(crop => ({
          _id: crop._id,
          name: crop.name,
          price: crop.price,
          quantity: crop.quantity,
          images: crop.images,
          farmer: users.find(u => u.id === crop.farmer) ? {
            name: users.find(u => u.id === crop.farmer).name,
            rating: users.find(u => u.id === crop.farmer).rating
          } : null,
          createdAt: crop.createdAt
        }));

      dashboardData.stats = {
        totalOrders,
        pendingOrders,
        totalSpent
      };

      dashboardData.recentOrders = [];
      dashboardData.favoriteCrops = favoriteCrops;
    }

    res.json({
      success: true,
      dashboard: dashboardData
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id/public
// @desc    Get public user profile
// @access  Public
router.get('/:id/public', async (req, res) => {
  try {
    const user = users.find(u => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get additional stats based on user type
    let stats = {};
    if (user.userType === 'farmer') {
      const totalCrops = crops.filter(crop => crop.farmer === user.id && crop.isActive).length;
      stats = { totalCrops, totalOrders: 0 };
    } else if (user.userType === 'buyer') {
      stats = { totalOrders: 0 };
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        userType: user.userType,
        address: user.address,
        rating: user.rating,
        createdAt: user.createdAt,
        farmDetails: user.farmDetails,
        businessDetails: user.businessDetails,
        stats
      }
    });

  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, userType, state, page = 1, limit = 10 } = req.query;

    let filteredUsers = users.filter(u => u.isActive !== false);

    if (userType) filteredUsers = filteredUsers.filter(u => u.userType === userType);
    if (state) filteredUsers = filteredUsers.filter(u => u.address?.state === state);
    if (q) {
      const query = q.toLowerCase();
      filteredUsers = filteredUsers.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.address?.city?.toLowerCase().includes(query)
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = filteredUsers
      .sort((a, b) => (b.rating?.average || 0) - (a.rating?.average || 0) || new Date(b.createdAt) - new Date(a.createdAt))
      .slice(startIndex, endIndex);

    res.json({
      success: true,
      users: paginatedUsers.map(u => ({
        id: u.id,
        name: u.name,
        userType: u.userType,
        address: u.address,
        rating: u.rating,
        createdAt: u.createdAt
      })),
      pagination: {
        current: Number(page),
        pages: Math.ceil(filteredUsers.length / limit),
        total: filteredUsers.length
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
