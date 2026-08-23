const express = require('express');
const { auth } = require('../middleware/auth');
const Cart = require('../models/Cart');
const Crop = require('../models/Crop');
const mongoose = require('mongoose');

const router = express.Router();

// @route   GET /api/cart
// @desc    Get current user's cart
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: 'items.crop',
        select: 'name images price quantity farmer isActive availability'
      })
      .lean();

    const rawItems = cart?.items || [];

    // Filter out deleted/inactive crops and refresh live data
    const validatedItems = rawItems.filter(item => {
      const crop = item.crop;
      return crop && crop.isActive;
    }).map(item => ({
      crop: {
        _id: item.crop._id.toString(),
        name: item.crop.name,
        images: item.crop.images,
        price: item.crop.price,
        quantity: item.crop.quantity,
        farmer: item.crop.farmer?.toString()
      },
      quantity: item.quantity
    }));

    res.json({
      success: true,
      items: validatedItems
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Server error retrieving cart' });
  }
});

// @route   POST /api/cart
// @desc    Save/Sync current user's cart
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'Items must be an array' });
    }

    // Validate and clean items
    const cleanItems = [];
    for (const item of items) {
      if (!item || !item.crop || !item.quantity || item.quantity <= 0) continue;
      const cropId = item.crop._id || item.crop;
      if (!mongoose.Types.ObjectId.isValid(cropId)) continue;
      cleanItems.push({
        crop: new mongoose.Types.ObjectId(cropId),
        quantity: Number(item.quantity)
      });
    }

    // Upsert cart document for this user
    const cart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: cleanItems } },
      { upsert: true, new: true }
    ).populate({
      path: 'items.crop',
      select: 'name images price quantity farmer isActive'
    }).lean();

    const responseItems = (cart.items || []).map(item => ({
      crop: item.crop ? {
        _id: item.crop._id.toString(),
        name: item.crop.name,
        images: item.crop.images,
        price: item.crop.price,
        quantity: item.crop.quantity,
        farmer: item.crop.farmer?.toString()
      } : null,
      quantity: item.quantity
    })).filter(item => item.crop);

    res.json({
      success: true,
      message: 'Cart synced successfully',
      items: responseItems
    });
  } catch (error) {
    console.error('Save cart error:', error);
    res.status(500).json({ message: 'Server error saving cart' });
  }
});

// @route   DELETE /api/cart
// @desc    Clear current user's cart
// @access  Private
router.delete('/', auth, async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } },
      { upsert: true }
    );
    res.json({ success: true, message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Server error clearing cart' });
  }
});

module.exports = router;
