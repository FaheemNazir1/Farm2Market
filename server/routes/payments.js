const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const { auth, authorize } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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

module.exports = router;
