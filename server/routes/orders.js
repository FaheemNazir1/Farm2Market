const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Crop = require('../models/Crop');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Buyer only)
router.post('/', auth, authorize('buyer'), [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.cropId').isMongoId().withMessage('Invalid crop ID'),
  body('items.*.quantity').isNumeric().withMessage('Quantity must be a number'),
  body('shippingAddress.name').notEmpty().withMessage('Shipping name is required'),
  body('shippingAddress.phone').matches(/^[6-9]\d{9}$/).withMessage('Invalid phone number'),
  body('shippingAddress.street').notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').notEmpty().withMessage('City is required'),
  body('shippingAddress.state').notEmpty().withMessage('State is required'),
  body('shippingAddress.pincode').matches(/^\d{6}$/).withMessage('Invalid pincode'),
  body('paymentMethod').isIn(['card', 'upi', 'netbanking', 'wallet', 'cod']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { items, shippingAddress, paymentMethod, notes } = req.body;
    
    // Validate crops and calculate totals
    let totalAmount = 0;
    let orderItems = [];
    const farmerIds = new Set();

    for (const item of items) {
      const crop = await Crop.findById(item.cropId);
      
      if (!crop) {
        return res.status(400).json({ message: `Crop ${item.cropId} not found` });
      }

      if (!crop.isAvailable()) {
        return res.status(400).json({ message: `Crop ${crop.name} is not available` });
      }

      if (crop.farmer.toString() === req.user.id) {
        return res.status(400).json({ message: 'Cannot order your own crops' });
      }

      if (item.quantity > crop.quantity.value) {
        return res.status(400).json({ 
          message: `Insufficient quantity for ${crop.name}. Available: ${crop.quantity.value} ${crop.quantity.unit}` 
        });
      }

      const itemTotal = crop.price.perUnit * item.quantity;
      totalAmount += itemTotal;
      farmerIds.add(crop.farmer.toString());

      orderItems.push({
        crop: crop._id,
        quantity: item.quantity,
        unitPrice: crop.price.perUnit,
        totalPrice: itemTotal
      });
    }

    // Check if all items are from the same farmer
    if (farmerIds.size > 1) {
      return res.status(400).json({ 
        message: 'All items must be from the same farmer in a single order' 
      });
    }

    const farmerId = Array.from(farmerIds)[0];
    const deliveryCharges = 0; // Can be calculated based on distance
    const taxAmount = totalAmount * 0.05; // 5% tax
    const finalAmount = totalAmount + deliveryCharges + taxAmount;

    // Create order
    const order = new Order({
      buyer: req.user.id,
      farmer: farmerId,
      items: orderItems,
      totalAmount,
      deliveryCharges,
      taxAmount,
      finalAmount,
      paymentMethod,
      shippingAddress,
      notes: notes || '',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });

    await order.save();

    // Update crop quantities
    for (const item of orderItems) {
      await Crop.findByIdAndUpdate(item.crop, {
        $inc: { 'quantity.value': -item.quantity }
      });
    }

    // Mark crops as sold if quantity becomes 0
    for (const item of orderItems) {
      const crop = await Crop.findById(item.crop);
      if (crop.quantity.value <= 0) {
        crop.availability.status = 'sold';
        await crop.save();
      }
    }

    await order.populate([
      { path: 'buyer', select: 'name email phone' },
      { path: 'farmer', select: 'name email phone' },
      { path: 'items.crop', select: 'name images price quantity' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    
    const filter = { 
      $or: [
        { buyer: req.user.id },
        { farmer: req.user.id }
      ]
    };
    
    if (status) {
      filter.status = status;
    }

    const orders = await Order.find(filter)
      .populate([
        { path: 'buyer', select: 'name email phone' },
        { path: 'farmer', select: 'name email phone' },
        { path: 'items.crop', select: 'name images price quantity' }
      ])
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(filter);

    res.json({
      success: true,
      orders,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate([
        { path: 'buyer', select: 'name email phone address' },
        { path: 'farmer', select: 'name email phone address farmDetails businessDetails' },
        { path: 'items.crop', select: 'name images price quantity category' }
      ]);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (order.buyer._id.toString() !== req.user.id && 
        order.farmer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json({
      success: true,
      order
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', auth, [
  body('status').isIn([
    'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'
  ]).withMessage('Invalid status'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { status, notes, trackingInfo } = req.body;
    const userRole = req.user.userType;

    // Authorization checks
    if (userRole === 'farmer' && order.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    if (userRole === 'buyer' && order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    // Status transition rules
    const validTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered'],
      delivered: [],
      cancelled: [],
      refunded: []
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return res.status(400).json({ 
        message: `Cannot change status from ${order.status} to ${status}` 
      });
    }

    // Update order
    const updateData = { status };
    
    if (notes) {
      updateData[`notes.${userRole}`] = notes;
    }

    if (status === 'shipped' && trackingInfo) {
      updateData.trackingInfo = {
        ...order.trackingInfo,
        ...trackingInfo,
        updates: [
          ...(order.trackingInfo?.updates || []),
          {
            status: 'shipped',
            location: trackingInfo.location || 'Warehouse',
            timestamp: new Date(),
            description: trackingInfo.description || 'Order has been shipped'
          }
        ]
      };
    }

    if (status === 'delivered') {
      updateData.deliveryDate = new Date();
      updateData.paymentStatus = 'paid';
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate([
      { path: 'buyer', select: 'name email phone' },
      { path: 'farmer', select: 'name email phone' },
      { path: 'items.crop', select: 'name images price quantity' }
    ]);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/orders/:id/rating
// @desc    Add rating for order
// @access  Private
router.post('/:id/rating', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isString().isLength({ max: 500 }).withMessage('Review must be less than 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only rate delivered orders' });
    }

    const { rating, review } = req.body;
    const userRole = req.user.userType;

    // Check if user is authorized to rate
    if (userRole === 'buyer' && order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to rate this order' });
    }

    if (userRole === 'farmer' && order.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to rate this order' });
    }

    // Update rating
    order.ratings[userRole] = {
      rating,
      review,
      date: new Date()
    };

    await order.save();

    // Update user rating
    const targetUserId = userRole === 'buyer' ? order.farmer : order.buyer;
    await updateUserRating(targetUserId);

    res.json({
      success: true,
      message: 'Rating submitted successfully'
    });

  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to update user rating
async function updateUserRating(userId) {
  try {
    const user = await User.findById(userId);
    const orders = await Order.find({
      $or: [
        { 'ratings.buyer.rating': { $exists: true }, 
          buyer: userId },
        { 'ratings.farmer.rating': { $exists: true }, 
          farmer: userId }
      ]
    });

    let totalRating = 0;
    let ratingCount = 0;

    orders.forEach(order => {
      if (order.buyer.toString() === userId && order.ratings.buyer?.rating) {
        totalRating += order.ratings.buyer.rating;
        ratingCount++;
      }
      if (order.farmer.toString() === userId && order.ratings.farmer?.rating) {
        totalRating += order.ratings.farmer.rating;
        ratingCount++;
      }
    });

    if (ratingCount > 0) {
      user.rating = {
        average: totalRating / ratingCount,
        count: ratingCount
      };
      await user.save();
    }
  } catch (error) {
    console.error('Update user rating error:', error);
  }
}

module.exports = router;
