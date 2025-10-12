const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const { auth, authorize } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { orders, users } = require('../db');

// Initialize Razorpay (for UPI payments)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'demo_key',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'demo_secret'
});

const router = express.Router();

// @route   POST /api/payments/create-payment-intent
// @desc    Create payment intent for order
// @access  Private (Buyer only)
router.post('/create-payment-intent', auth, authorize('buyer'), [
  body('orderId').isMongoId().withMessage('Valid order ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { orderId, amount } = req.body;

    // Verify order belongs to user and is pending payment
    const order = await Order.findOne({
      _id: orderId,
      buyer: req.user.id,
      paymentStatus: 'pending'
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or already paid' });
    }

    // Verify amount matches order amount
    if (amount !== order.finalAmount) {
      return res.status(400).json({ message: 'Amount mismatch' });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'inr',
      metadata: {
        orderId: orderId,
        userId: req.user.id
      }
    });

    // Update order with payment intent ID
    order.paymentId = paymentIntent.id;
    await order.save();

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ message: 'Payment processing failed' });
  }
});

// @route   POST /api/payments/confirm-payment
// @desc    Confirm payment and update order
// @access  Private (Buyer only)
router.post('/confirm-payment', auth, authorize('buyer'), [
  body('paymentIntentId').notEmpty().withMessage('Payment intent ID is required'),
  body('orderId').isMongoId().withMessage('Valid order ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { paymentIntentId, orderId } = req.body;

    // Verify payment intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    // Update order
    const order = await Order.findOne({
      _id: orderId,
      buyer: req.user.id,
      paymentId: paymentIntentId
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = 'paid';
    order.status = 'confirmed';
    await order.save();

    res.json({
      success: true,
      message: 'Payment confirmed successfully',
      order
    });

  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Payment confirmation failed' });
  }
});

// @route   POST /api/payments/webhook
// @desc    Stripe webhook handler
// @access  Public (Stripe webhook)
router.post('/webhook', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent succeeded:', paymentIntent.id);
        
        // Update order status
        await Order.findOneAndUpdate(
          { paymentId: paymentIntent.id },
          { 
            paymentStatus: 'paid',
            status: 'confirmed'
          }
        );
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('PaymentIntent failed:', failedPayment.id);
        
        // Update order status
        await Order.findOneAndUpdate(
          { paymentId: failedPayment.id },
          { paymentStatus: 'failed' }
        );
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ message: 'Webhook handler failed' });
  }
});

// @route   POST /api/payments/cod
// @desc    Handle Cash on Delivery payment
// @access  Private (Buyer only)
router.post('/cod', auth, authorize('buyer'), [
  body('orderId').isMongoId().withMessage('Valid order ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { orderId } = req.body;

    // Update order for COD
    const order = await Order.findOne({
      _id: orderId,
      buyer: req.user.id,
      paymentMethod: 'cod'
    });

    if (!order) {
      return res.status(404).json({ message: 'COD order not found' });
    }

    order.paymentStatus = 'pending';
    order.status = 'confirmed';
    await order.save();

    res.json({
      success: true,
      message: 'COD order confirmed successfully',
      order
    });

  } catch (error) {
    console.error('COD payment error:', error);
    res.status(500).json({ message: 'COD processing failed' });
  }
});

// @route   GET /api/payments/methods
// @desc    Get available payment methods
// @access  Public
router.get('/methods', (req, res) => {
  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      description: 'Pay securely with your card',
      icon: '💳',
      enabled: true
    },
    {
      id: 'upi',
      name: 'UPI',
      description: 'Pay using UPI apps like Google Pay, PhonePe',
      icon: '📱',
      enabled: true
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'Pay using your bank account',
      icon: '🏦',
      enabled: true
    },
    {
      id: 'wallet',
      name: 'Digital Wallet',
      description: 'Pay using digital wallets',
      icon: '💰',
      enabled: false
    },
    {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when your order is delivered',
      icon: '💵',
      enabled: true
    }
  ];

  res.json({
    success: true,
    paymentMethods
  });
});

// @route   POST /api/payments/upi/create-order
// @desc    Create UPI payment order
// @access  Private (Buyer only)
router.post('/upi/create-order', auth, authorize('buyer'), [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { orderId, amount } = req.body;

    // For demo purposes, simulate order lookup from in-memory database
    // In production, you would verify the order from your database
    const order = orders.find(o => o._id === orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Create Razorpay order for UPI
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${orderId}_${Date.now()}`,
      payment_capture: 1,
      notes: {
        orderId: orderId,
        userId: req.user.id,
        paymentMethod: 'upi'
      }
    });

    // Update order with payment details
    order.paymentId = razorpayOrder.id;
    order.razorpayOrderId = razorpayOrder.id;

    res.json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID || 'demo_key',
      order: {
        id: orderId,
        amount: amount
      }
    });

  } catch (error) {
    console.error('UPI order creation error:', error);
    res.status(500).json({ message: 'UPI payment processing failed' });
  }
});

// @route   POST /api/payments/upi/verify
// @desc    Verify UPI payment
// @access  Private (Buyer only)
router.post('/upi/verify', auth, authorize('buyer'), [
  body('razorpay_order_id').notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id').notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpay_signature').notEmpty().withMessage('Razorpay signature is required'),
  body('orderId').notEmpty().withMessage('Order ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      orderId 
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'demo_secret')
      .update(body.toString())
      .digest('hex');

    if (expectedSignature === razorpay_signature) {
      // Payment is verified
      const order = orders.find(o => o._id === orderId);
      
      if (order) {
        order.paymentStatus = 'paid';
        order.status = 'confirmed';
        order.paymentId = razorpay_payment_id;
        order.updatedAt = new Date();
      }

      res.json({
        success: true,
        message: 'UPI payment verified successfully',
        paymentId: razorpay_payment_id,
        order: order
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('UPI verification error:', error);
    res.status(500).json({ message: 'UPI payment verification failed' });
  }
});

// @route   POST /api/payments/upi/simulate
// @desc    Simulate UPI payment for demo
// @access  Private (Buyer only)
router.post('/upi/simulate', auth, authorize('buyer'), [
  body('orderId').notEmpty().withMessage('Order ID is required'),
  body('upiId').notEmpty().withMessage('UPI ID is required'),
  body('amount').isNumeric().withMessage('Amount must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { orderId, upiId, amount } = req.body;

    // Simulate UPI payment processing
    const order = orders.find(o => o._id === orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Simulate payment success (90% success rate for demo)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      order.paymentStatus = 'paid';
      order.status = 'confirmed';
      order.paymentId = `upi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      order.updatedAt = new Date();

      res.json({
        success: true,
        message: 'UPI payment successful',
        paymentId: order.paymentId,
        upiTransactionId: `UPI${Date.now()}`,
        order: order
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'UPI payment failed. Please try again.'
      });
    }

  } catch (error) {
    console.error('UPI simulation error:', error);
    res.status(500).json({ message: 'UPI payment simulation failed' });
  }
});

module.exports = router;
