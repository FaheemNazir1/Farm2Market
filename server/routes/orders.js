const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const { users, crops, orders } = require('../db');

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Buyer only)
router.post('/', auth, authorize('buyer'), [
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.cropId').notEmpty().withMessage('Crop ID is required'),
  body('items.*.quantity').isNumeric().withMessage('Quantity must be a number'),
  // Custom validation for nested shippingAddress object
  body('shippingAddress').custom((value) => {
    if (!value || typeof value !== 'object') {
      throw new Error('Shipping address is required');
    }
    if (!value.name || !value.name.trim()) {
      throw new Error('Shipping name is required');
    }
    if (!value.phone || !/^[0-9]{10,11}$/.test(value.phone)) {
      throw new Error('Invalid phone number');
    }
    if (!value.street || !value.street.trim()) {
      throw new Error('Street address is required');
    }
    if (!value.city || !value.city.trim()) {
      throw new Error('City is required');
    }
    if (!value.state || !value.state.trim()) {
      throw new Error('State is required');
    }
    if (!value.pincode || !/^\d{6}$/.test(value.pincode)) {
      throw new Error('Invalid pincode');
    }
    return true;
  }),
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
      const crop = crops.find(c => c._id === item.cropId);
      
      if (!crop) {
        return res.status(400).json({ message: `Crop ${item.cropId} not found` });
      }

      if (crop.availability.status !== 'available') {
        return res.status(400).json({ message: `Crop ${crop.name} is not available` });
      }

      if (crop.farmer === req.user.id) {
        return res.status(400).json({ message: 'Cannot order your own crops' });
      }

      if (item.quantity > crop.quantity.value) {
        return res.status(400).json({ 
          message: `Insufficient quantity for ${crop.name}. Available: ${crop.quantity.value} ${crop.quantity.unit}` 
        });
      }

      const itemTotal = crop.price.perUnit * item.quantity;
      totalAmount += itemTotal;
      farmerIds.add(crop.farmer);

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
    const orderId = Date.now().toString();
    const orderNumber = `F2M${Date.now()}${String(orders.length + 1).padStart(4, '0')}`;
    
    const order = {
      _id: orderId,
      orderNumber,
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
      status: 'pending',
      paymentStatus: 'pending',
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    };

    orders.push(order);
    
    console.log('Order created successfully:');
    console.log('- Order ID:', order._id);
    console.log('- Order Number:', order.orderNumber);
    console.log('- Buyer:', order.buyer);
    console.log('- Farmer:', order.farmer);
    console.log('- Total orders in DB:', orders.length);

    // Update crop quantities
    for (const item of orderItems) {
      const cropToUpdate = crops.find(c => c._id === item.crop);
      if (cropToUpdate) {
        cropToUpdate.quantity.value -= item.quantity;
        
        // Mark crops as sold if quantity becomes 0
        if (cropToUpdate.quantity.value <= 0) {
          cropToUpdate.availability.status = 'sold';
        }
        cropToUpdate.updatedAt = new Date();
      }
    }

    // Get populated order data for response
    const buyer = users.find(u => u.id === order.buyer);
    const farmer = users.find(u => u.id === order.farmer);
    
    const populatedOrder = {
      ...order,
      buyer: buyer ? { id: buyer.id, name: buyer.name, email: buyer.email, phone: buyer.phone } : null,
      farmer: farmer ? { id: farmer.id, name: farmer.name, email: farmer.email, phone: farmer.phone } : null,
      items: order.items.map(item => {
        const crop = crops.find(c => c._id === item.crop);
        return {
          ...item,
          crop: crop ? { _id: crop._id, name: crop.name, images: crop.images, price: crop.price, quantity: crop.quantity } : null
        };
      })
    };

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: populatedOrder
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
    
    console.log('GET /api/orders - Request from user:', req.user.id, '(', req.user.userType, ')');
    console.log('Total orders in database:', orders.length);
    
    // Filter orders by user (buyer or farmer)
    let userOrders = orders.filter(order => 
      order.buyer === req.user.id || order.farmer === req.user.id
    );
    
    console.log('Orders for this user:', userOrders.length);
    
    // Filter by status if provided
    if (status) {
      userOrders = userOrders.filter(order => order.status === status);
    }
    
    // Sort by creation date (newest first)
    userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Pagination
    const total = userOrders.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = userOrders.slice(startIndex, endIndex);
    
    // Populate orders with user and crop data
    const populatedOrders = paginatedOrders.map(order => {
      const buyer = users.find(u => u.id === order.buyer);
      const farmer = users.find(u => u.id === order.farmer);
      
      return {
        ...order,
        buyer: buyer ? { id: buyer.id, name: buyer.name, email: buyer.email, phone: buyer.phone } : null,
        farmer: farmer ? { id: farmer.id, name: farmer.name, email: farmer.email, phone: farmer.phone } : null,
        items: order.items.map(item => {
          const crop = crops.find(c => c._id === item.crop);
          return {
            ...item,
            crop: crop ? { _id: crop._id, name: crop.name, images: crop.images, price: crop.price, quantity: crop.quantity } : null
          };
        })
      };
    });

    res.json({
      success: true,
      orders: populatedOrders,
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

    const order = orders.find(o => o._id === req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const { status, notes, trackingInfo } = req.body;
    const userRole = req.user.userType;

    // Authorization checks
    if (userRole === 'farmer' && order.farmer !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    if (userRole === 'buyer' && order.buyer !== req.user.id) {
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

    // Update order status
    order.status = status;
    order.updatedAt = new Date();
    
    if (notes) {
      if (!order.notes) {
        order.notes = {};
      }
      order.notes[userRole] = notes;
    }

    if (status === 'shipped' && trackingInfo) {
      if (!order.trackingInfo) {
        order.trackingInfo = { updates: [] };
      }
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

    // Get populated order data for response
    const buyer = users.find(u => u.id === order.buyer);
    const farmer = users.find(u => u.id === order.farmer);
    
    const populatedOrder = {
      ...order,
      buyer: buyer ? { 
        id: buyer.id, 
        name: buyer.name, 
        email: buyer.email, 
        phone: buyer.phone 
      } : null,
      farmer: farmer ? { 
        id: farmer.id, 
        name: farmer.name, 
        email: farmer.email, 
        phone: farmer.phone 
      } : null,
      items: order.items.map(item => {
        const crop = crops.find(c => c._id === item.crop);
        return {
          ...item,
          crop: crop ? { 
            _id: crop._id, 
            name: crop.name, 
            images: crop.images, 
            price: crop.price, 
            quantity: crop.quantity 
          } : null
        };
      })
    };

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: populatedOrder
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

    const order = orders.find(o => o._id === req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Can only rate delivered orders' });
    }

    const { rating, review } = req.body;
    const userRole = req.user.userType;

    // Check if user is authorized to rate
    if (userRole === 'buyer' && order.buyer !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to rate this order' });
    }

    if (userRole === 'farmer' && order.farmer !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to rate this order' });
    }

    // Initialize ratings object if it doesn't exist
    if (!order.ratings) {
      order.ratings = {};
    }

    // Update rating
    order.ratings[userRole] = {
      rating,
      review,
      date: new Date()
    };

    order.updatedAt = new Date();

    // Update user rating
    const targetUserId = userRole === 'buyer' ? order.farmer : order.buyer;
    updateUserRating(targetUserId);

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
function updateUserRating(userId) {
  try {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    const userOrders = orders.filter(o => 
      (o.buyer === userId && o.ratings?.buyer?.rating) ||
      (o.farmer === userId && o.ratings?.farmer?.rating)
    );

    let totalRating = 0;
    let ratingCount = 0;

    userOrders.forEach(order => {
      if (order.buyer === userId && order.ratings?.buyer?.rating) {
        totalRating += order.ratings.buyer.rating;
        ratingCount++;
      }
      if (order.farmer === userId && order.ratings?.farmer?.rating) {
        totalRating += order.ratings.farmer.rating;
        ratingCount++;
      }
    });

    if (ratingCount > 0) {
      user.rating = {
        average: totalRating / ratingCount,
        count: ratingCount
      };
    }
  } catch (error) {
    console.error('Update user rating error:', error);
  }
}

// @route   GET /api/orders/:id/invoice
// @desc    Get order invoice data
// @access  Private
router.get('/:id/invoice', auth, async (req, res) => {
  try {
    const order = orders.find(o => o._id === req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this invoice
    if (order.buyer !== req.user.id && order.farmer !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this invoice' });
    }

    // Populate order with user and crop data
    const buyer = users.find(u => u.id === order.buyer);
    const farmer = users.find(u => u.id === order.farmer);
    
    const invoiceData = {
      ...order,
      buyer: buyer ? { 
        id: buyer.id, 
        name: buyer.name, 
        email: buyer.email, 
        phone: buyer.phone 
      } : null,
      farmer: farmer ? { 
        id: farmer.id, 
        name: farmer.name, 
        email: farmer.email, 
        phone: farmer.phone 
      } : null,
      items: order.items.map(item => {
        const crop = crops.find(c => c._id === item.crop);
        return {
          ...item,
          crop: crop ? { 
            _id: crop._id, 
            name: crop.name, 
            variety: crop.variety,
            images: crop.images, 
            price: crop.price, 
            quantity: crop.quantity 
          } : null
        };
      })
    };

    res.json({
      success: true,
      invoice: invoiceData
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
    const order = orders.find(o => o._id === req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user is authorized to view this order
    if (order.buyer !== req.user.id && order.farmer !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    // Populate order with user and crop data
    const buyer = users.find(u => u.id === order.buyer);
    const farmer = users.find(u => u.id === order.farmer);
    
    const populatedOrder = {
      ...order,
      buyer: buyer ? { 
        id: buyer.id, 
        name: buyer.name, 
        email: buyer.email, 
        phone: buyer.phone, 
        address: buyer.address 
      } : null,
      farmer: farmer ? { 
        id: farmer.id, 
        name: farmer.name, 
        email: farmer.email, 
        phone: farmer.phone, 
        address: farmer.address,
        farmDetails: farmer.farmDetails,
        businessDetails: farmer.businessDetails
      } : null,
      items: order.items.map(item => {
        const crop = crops.find(c => c._id === item.crop);
        return {
          ...item,
          crop: crop ? { 
            _id: crop._id, 
            name: crop.name, 
            images: crop.images, 
            price: crop.price, 
            quantity: crop.quantity,
            category: crop.category
          } : null
        };
      })
    };

    res.json({
      success: true,
      order: populatedOrder
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
