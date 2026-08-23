const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Crop = require('../models/Crop');
const Order = require('../models/Order');
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
  limits: { fileSize: 2 * 1024 * 1024 },
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
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const updateData = { ...req.body };

    // Handle profile image upload
    if (req.file) {
      updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    }

    // Remove sensitive fields
    delete updateData.password;
    delete updateData.email;
    delete updateData.userType;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).lean();

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        address: user.address,
        profileImage: user.profileImage,
        farmDetails: user.farmDetails,
        businessDetails: user.businessDetails,
        rating: user.rating,
        isVerified: user.isVerified
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
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password and save
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await User.findByIdAndUpdate(req.user._id, { password: hashedPassword });

    res.json({ success: true, message: 'Password changed successfully' });

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
    const userId = req.user._id;
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
      const [totalCrops, activeCrops, recentCrops, farmerOrders] = await Promise.all([
        Crop.countDocuments({ farmer: userId }),
        Crop.countDocuments({ farmer: userId, isActive: true, 'availability.status': 'available' }),
        Crop.find({ farmer: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('name price quantity images availability createdAt')
          .lean(),
        Order.find({ farmer: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .lean()
      ]);

      const totalOrders = await Order.countDocuments({ farmer: userId });
      const pendingOrders = await Order.countDocuments({ farmer: userId, status: 'pending' });
      const earningsAgg = await Order.aggregate([
        { $match: { farmer: userId, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]);
      const totalEarnings = earningsAgg[0]?.total || 0;

      dashboardData.stats = { totalCrops, activeCrops, totalOrders, pendingOrders, totalEarnings };
      dashboardData.recentCrops = recentCrops.map(c => ({ ...c, _id: c._id.toString() }));
      dashboardData.recentOrders = farmerOrders.map(o => ({ ...o, _id: o._id.toString() }));

    } else if (userType === 'buyer') {
      const [totalOrders, pendingOrders, recentOrders] = await Promise.all([
        Order.countDocuments({ buyer: userId }),
        Order.countDocuments({ buyer: userId, status: 'pending' }),
        Order.find({ buyer: userId }).sort({ createdAt: -1 }).limit(5).lean()
      ]);

      const spentAgg = await Order.aggregate([
        { $match: { buyer: userId, paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$finalAmount' } } }
      ]);
      const totalSpent = spentAgg[0]?.total || 0;

      const favoriteCrops = await Crop.find({ favorites: userId, isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('farmer', 'name rating')
        .lean();

      dashboardData.stats = { totalOrders, pendingOrders, totalSpent };
      dashboardData.recentOrders = recentOrders.map(o => ({ ...o, _id: o._id.toString() }));
      dashboardData.favoriteCrops = favoriteCrops.map(c => ({ ...c, _id: c._id.toString() }));
    }

    res.json({ success: true, dashboard: dashboardData });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, userType, state, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };
    if (userType) query.userType = userType;
    if (state) query['address.state'] = state;
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { 'address.city': { $regex: q, $options: 'i' } }
      ];
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ 'rating.average': -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      users: users.map(u => ({
        id: u._id.toString(),
        name: u.name,
        userType: u.userType,
        address: u.address,
        rating: u.rating,
        createdAt: u.createdAt
      })),
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/users/:id/public
// @desc    Get public user profile
// @access  Public
router.get('/:id/public', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let stats = {};
    if (user.userType === 'farmer') {
      const [totalCrops, totalOrders] = await Promise.all([
        Crop.countDocuments({ farmer: user._id, isActive: true }),
        Order.countDocuments({ farmer: user._id })
      ]);
      stats = { totalCrops, totalOrders };
    } else if (user.userType === 'buyer') {
      const totalOrders = await Order.countDocuments({ buyer: user._id });
      stats = { totalOrders };
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
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

module.exports = router;
