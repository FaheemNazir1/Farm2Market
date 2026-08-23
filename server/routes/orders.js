const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const Crop = require('../models/Crop');
const Order = require('../models/Order');
const User = require('../models/User');
const mongoose = require('mongoose');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Buyer or Farmer)
router.post('/', auth, authorize('buyer', 'farmer'), [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*').custom((item) => {
    const cropId = item?.cropId || (typeof item?.crop === 'object' ? item?.crop?._id : item?.crop);
    if (!cropId) throw new Error('Crop ID is required for each item');
    const qty = Number(item?.quantity);
    if (!qty || isNaN(qty) || qty <= 0) throw new Error('Quantity must be a positive number');
    return true;
  }),
  body('shippingAddress').custom((value) => {
    if (!value || typeof value !== 'object') throw new Error('Shipping address is required');
    if (!value.name || !value.name.trim()) throw new Error('Shipping name is required');
    if (!value.phone || !/^[0-9]{10,11}$/.test(value.phone)) throw new Error('Invalid phone number');
    if (!value.street || !value.street.trim()) throw new Error('Street address is required');
    if (!value.city || !value.city.trim()) throw new Error('City is required');
    if (!value.state || !value.state.trim()) throw new Error('State is required');
    if (!value.pincode || !/^\d{6}$/.test(value.pincode)) throw new Error('Invalid pincode');
    return true;
  }),
  body('paymentMethod').isIn(['card', 'upi', 'netbanking', 'wallet', 'cod', 'razorpay']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { items, shippingAddress, paymentMethod, notes } = req.body;

    let totalAmount = 0;
    let orderItems = [];
    let farmerId = null;

    for (const item of items) {
      const cropId = item.cropId || (typeof item.crop === 'object' ? item.crop?._id : item.crop);
      const quantity = Number(item.quantity);

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be greater than zero' });
      }

      if (!mongoose.Types.ObjectId.isValid(cropId)) {
        return res.status(400).json({ message: `Invalid crop ID: ${cropId}` });
      }

      const crop = await Crop.findById(cropId);

      if (!crop) {
        return res.status(400).json({ message: `Crop ${cropId} not found` });
      }

      if (crop.availability.status !== 'available' || crop.quantity.value <= 0) {
        return res.status(400).json({ message: `Crop ${crop.name} is not available` });
      }

      if (crop.farmer.toString() === req.user.id) {
        return res.status(400).json({ message: 'Cannot order your own crops' });
      }

      if (quantity > crop.quantity.value) {
        return res.status(400).json({
          message: `Insufficient quantity for ${crop.name}. Available: ${crop.quantity.value} ${crop.quantity.unit}`
        });
      }

      // Verify all items are from the same farmer
      if (farmerId && farmerId !== crop.farmer.toString()) {
        return res.status(400).json({ message: 'All items must be from the same farmer in a single order' });
      }
      farmerId = crop.farmer.toString();

      const unitPrice = Number(crop.price?.perUnit) || 0;
      const itemTotal = unitPrice * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        crop: crop._id,
        quantity,
        unitPrice,
        totalPrice: itemTotal
      });
    }

    const deliveryCharges = 0;
    const taxAmount = totalAmount * 0.05; // 5% tax
    const finalAmount = totalAmount + deliveryCharges + taxAmount;

    // Create order in MongoDB
    const order = new Order({
      buyer: req.user._id,
      farmer: new mongoose.Types.ObjectId(farmerId),
      items: orderItems,
      totalAmount,
      deliveryCharges,
      taxAmount,
      finalAmount,
      paymentMethod,
      shippingAddress,
      notes: notes ? { buyer: notes } : {},
      status: 'pending',
      paymentStatus: 'pending',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      isActive: true
    });

    // Generate orderNumber via pre-save hook
    await order.save();

    // Update crop quantities in MongoDB
    for (const item of orderItems) {
      await Crop.findByIdAndUpdate(item.crop, {
        $inc: { 'quantity.value': -item.quantity }
      });
      // If quantity hits 0, mark sold
      const updatedCrop = await Crop.findById(item.crop);
      if (updatedCrop && updatedCrop.quantity.value <= 0) {
        await Crop.findByIdAndUpdate(item.crop, { 'availability.status': 'sold' });
      }
    }

    console.log('Order created in MongoDB:', order._id.toString(), order.orderNumber);

    // Populate for response
    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email phone')
      .populate('farmer', 'name email phone')
      .populate('items.crop', 'name images price quantity')
      .lean();

    const responseOrder = {
      ...populatedOrder,
      _id: populatedOrder._id.toString(),
      buyer: populatedOrder.buyer ? { ...populatedOrder.buyer, id: populatedOrder.buyer._id.toString() } : null,
      farmer: populatedOrder.farmer ? { ...populatedOrder.farmer, id: populatedOrder.farmer._id.toString() } : null,
    };

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: responseOrder
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
    const { page = 1, limit = 10, status, type } = req.query;

    let query = {};
    if (type === 'buying') query.buyer = req.user._id;
    else if (type === 'selling') query.farmer = req.user._id;
    else query.$or = [{ buyer: req.user._id }, { farmer: req.user._id }];

    if (status) query.status = status;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('buyer', 'name email phone')
      .populate('farmer', 'name email phone')
      .populate('items.crop', 'name images price quantity')
      .lean();

    const normalizedOrders = orders.map(o => ({
      ...o,
      _id: o._id.toString(),
      buyer: o.buyer ? { ...o.buyer, id: o.buyer._id?.toString() } : null,
      farmer: o.farmer ? { ...o.farmer, id: o.farmer._id?.toString() } : null
    }));

    res.json({
      success: true,
      orders: normalizedOrders,
      pagination: { current: Number(page), pages: Math.ceil(total / limit), total }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private
router.put('/:id/status', auth, [
  body('status').isIn(['confirmed', 'processing', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { status, notes, trackingInfo } = req.body;
    const userRole = req.user.userType;

    if (userRole === 'farmer' && order.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }
    if (userRole === 'buyer' && order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

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
      return res.status(400).json({ message: `Cannot change status from ${order.status} to ${status}` });
    }

    order.status = status;
    if (notes) {
      if (!order.notes) order.notes = {};
      order.notes[userRole] = notes;
    }
    if (status === 'shipped' && trackingInfo) {
      if (!order.trackingInfo) order.trackingInfo = { updates: [] };
      order.trackingInfo = {
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
      order.deliveryDate = new Date();
      order.paymentStatus = 'paid';
    }

    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('buyer', 'name email phone')
      .populate('farmer', 'name email phone')
      .populate('items.crop', 'name images price quantity')
      .lean();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: { ...populatedOrder, _id: populatedOrder._id.toString() }
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
  body('review').optional().isString().isLength({ max: 500 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'delivered') return res.status(400).json({ message: 'Can only rate delivered orders' });

    const { rating, review } = req.body;
    const userRole = req.user.userType;

    if (userRole === 'buyer' && order.buyer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to rate this order' });
    }
    if (userRole === 'farmer' && order.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to rate this order' });
    }

    if (!order.ratings) order.ratings = {};
    order.ratings[userRole] = { rating, review, date: new Date() };
    await order.save();

    // Update target user's rating
    const targetId = userRole === 'buyer' ? order.farmer : order.buyer;
    const ratingsAgg = await Order.aggregate([
      { $match: { $or: [{ buyer: targetId }, { farmer: targetId }] } },
      {
        $project: {
          rating: {
            $cond: [
              { $eq: ['$buyer', targetId] },
              '$ratings.buyer.rating',
              '$ratings.farmer.rating'
            ]
          }
        }
      },
      { $match: { rating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (ratingsAgg.length > 0) {
      await User.findByIdAndUpdate(targetId, {
        'rating.average': ratingsAgg[0].avg,
        'rating.count': ratingsAgg[0].count
      });
    }

    res.json({ success: true, message: 'Rating submitted successfully' });

  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id/invoice
// @desc    Get order invoice data
// @access  Private
router.get('/:id/invoice', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone')
      .populate('farmer', 'name email phone')
      .populate('items.crop', 'name variety images price quantity')
      .lean();

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.buyer._id.toString() !== req.user.id && order.farmer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    res.json({
      success: true,
      invoice: { ...order, _id: order._id.toString() }
    });

  } catch (error) {
    console.error('Get invoice error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyer', 'name email phone address')
      .populate('farmer', 'name email phone address farmDetails businessDetails')
      .populate('items.crop', 'name images price quantity category')
      .lean();

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.buyer._id.toString() !== req.user.id && order.farmer._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json({
      success: true,
      order: { ...order, _id: order._id.toString() }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
