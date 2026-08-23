const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const { auth, authorize } = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');

// Initialize Razorpay SDK with real credentials from environment
let razorpay = null;
try {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (key_id && key_secret) {
    razorpay = new Razorpay({ key_id, key_secret });
    console.log('✅ Razorpay SDK initialized');
  } else {
    console.warn('⚠️  Razorpay credentials missing — payment endpoints will be disabled');
  }
} catch (err) {
  console.error('❌ Razorpay SDK initialization failed:', err.message);
}

const router = express.Router();

// ============================================================================
// 1. RAZORPAY STANDARD PAYMENT ENDPOINTS
// ============================================================================

// @route   POST /api/payments/razorpay/create-order
// @desc    Create Razorpay order for authenticated user's pending order
// @access  Private (Buyer or Farmer)
router.post('/razorpay/create-order', auth, authorize('buyer', 'farmer'), [
  body('orderId').notEmpty().withMessage('Valid order ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    if (!razorpay) {
      return res.status(503).json({ message: 'Razorpay payment gateway is not configured on this server.' });
    }

    const { orderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    // Look up order in MongoDB
    const order = await Order.findOne({ _id: orderId, buyer: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or unauthorized' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    // Server-side amount computation in paise (1 INR = 100 paise)
    const finalAmountInRupees = Number(order.finalAmount) || 0;
    if (finalAmountInRupees <= 0) {
      return res.status(400).json({ message: 'Invalid order amount' });
    }

    const amountInPaise = Math.round(finalAmountInRupees * 100);
    const receipt = `rcpt_${order._id.toString().slice(-8)}_${Date.now()}`;

    // Create REAL Razorpay order — no silent fallback
    let rzpOrder;
    try {
      rzpOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt,
        notes: {
          farm2marketOrderId: order._id.toString(),
          userId: req.user.id
        }
      });
    } catch (rzpErr) {
      console.error('Razorpay order creation failed:', rzpErr.message || JSON.stringify(rzpErr?.error || rzpErr));
      return res.status(502).json({
        message: 'Failed to create payment order with Razorpay. Please try again.',
        detail: rzpErr.message || (rzpErr.error ? JSON.stringify(rzpErr.error) : 'Unknown error')
      });
    }

    // Store the real Razorpay order ID on the Farm2Market order
    await Order.findByIdAndUpdate(orderId, {
      razorpayOrderId: rzpOrder.id,
      paymentMethod: 'razorpay'
    });

    console.log('Razorpay order created:', rzpOrder.id, 'for Farm2Market order:', orderId);

    res.json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      orderId: order._id.toString(),
      orderNumber: order.orderNumber
    });

  } catch (error) {
    console.error('Razorpay create-order error:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order' });
  }
});

// @route   POST /api/payments/razorpay/verify
// @desc    Verify Razorpay payment signature server-side and mark order paid
// @access  Private (Buyer or Farmer)
router.post('/razorpay/verify', auth, authorize('buyer', 'farmer'), [
  body('razorpay_order_id').notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Razorpay signature is required'),
  body('orderId').notEmpty().withMessage('Order ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    // Look up order in MongoDB
    const order = await Order.findOne({ _id: orderId, buyer: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or unauthorized' });
    }

    if (order.paymentStatus === 'paid') {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    // HMAC-SHA256 signature verification
    // Razorpay spec: HMAC(razorpay_order_id + "|" + razorpay_payment_id, RAZORPAY_KEY_SECRET)
    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error('RAZORPAY_KEY_SECRET is not set — cannot verify signature');
      return res.status(500).json({ message: 'Payment verification configuration error' });
    }

    const signatureBody = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(signatureBody)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Razorpay signature mismatch for order:', orderId);
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed — payment not recorded'
      });
    }

    // Signature verified — mark order as paid
    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    order.paymentMethod = 'razorpay';
    order.paymentId = razorpay_payment_id;
    order.razorpayOrderId = razorpay_order_id;
    await order.save();

    // Clear the user's cart after successful payment
    try {
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [] } },
        { new: true }
      );
      console.log('Cart cleared after successful Razorpay payment for user:', req.user.id);
    } catch (cartErr) {
      console.warn('Could not clear cart after payment (non-fatal):', cartErr.message);
    }

    console.log('Razorpay payment verified and order confirmed:', orderId, razorpay_payment_id);

    res.json({
      success: true,
      message: 'Razorpay payment verified successfully',
      paymentId: razorpay_payment_id,
      order: {
        _id: order._id.toString(),
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentId: order.paymentId
      }
    });

  } catch (error) {
    console.error('Razorpay verification error:', error);
    res.status(500).json({ message: 'Payment verification processing failed' });
  }
});

// ============================================================================
// 2. CASH ON DELIVERY (COD) ENDPOINT
// ============================================================================

// @route   POST /api/payments/cod
// @desc    Handle Cash on Delivery payment
// @access  Private (Buyer or Farmer)
router.post('/cod', auth, authorize('buyer', 'farmer'), [
  body('orderId').notEmpty().withMessage('Valid order ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const { orderId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID format' });
    }

    const order = await Order.findOne({ _id: orderId, buyer: req.user._id });

    if (!order) {
      return res.status(404).json({ message: 'COD order not found' });
    }

    order.paymentStatus = 'pending'; // COD is paid on delivery
    order.status = 'confirmed';
    order.paymentMethod = 'cod';
    await order.save();

    // Clear cart after COD order is confirmed
    try {
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [] } }
      );
    } catch (cartErr) {
      console.warn('Could not clear cart after COD (non-fatal):', cartErr.message);
    }

    res.json({
      success: true,
      message: 'COD order confirmed successfully',
      order: {
        _id: order._id.toString(),
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        status: order.status
      }
    });

  } catch (error) {
    console.error('COD payment error:', error);
    res.status(500).json({ message: 'COD processing failed' });
  }
});

// ============================================================================
// 3. AVAILABLE PAYMENT METHODS
// ============================================================================

// @route   GET /api/payments/methods
// @desc    Get available payment methods
// @access  Public
router.get('/methods', (req, res) => {
  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Pay Online (Razorpay)',
      description: 'UPI, Credit/Debit Cards, Net Banking, Wallets',
      icon: '💳',
      enabled: !!razorpay
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when your order is delivered',
      icon: '💵',
      enabled: true
    }
  ];

  res.json({ success: true, paymentMethods });
});

module.exports = router;
