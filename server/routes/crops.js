const express = require('express');
const { body, validationResult } = require('express-validator');
const Crop = require('../models/Crop');
const User = require('../models/User');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/crops/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Distance calculation helper (Haversine formula in km)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// @route   GET /api/crops
// @desc    Get all crops with filters
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      state,
      district,
      minPrice,
      maxPrice,
      organic,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      latitude,
      longitude,
      radius
    } = req.query;

    // Build MongoDB query
    const query = { isActive: true, 'availability.status': 'available' };

    if (category) query.category = category;
    if (state) query['location.state'] = state;
    if (district) query['location.district'] = district;
    if (organic !== undefined) query['quality.organic'] = organic === 'true';
    if (minPrice || maxPrice) {
      query['price.perUnit'] = {};
      if (minPrice) query['price.perUnit'].$gte = Number(minPrice);
      if (maxPrice) query['price.perUnit'].$lte = Number(maxPrice);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { 'location.district': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } }
      ];
    }

    // Sort
    const sortOptions = {};
    if (sortBy === 'price.perUnit') {
      sortOptions['price.perUnit'] = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'views') {
      sortOptions['views'] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions['createdAt'] = sortOrder === 'asc' ? 1 : -1;
    }

    let crops = await Crop.find(query)
      .sort(sortOptions)
      .populate('farmer', 'name rating phone address farmDetails')
      .lean();

    // Apply GPS distance filtering if coordinates provided
    if (latitude && longitude) {
      const userLat = parseFloat(latitude);
      const userLon = parseFloat(longitude);

      crops = crops.map(crop => {
        const coords = crop.location?.coordinates;
        const dist = coords?.latitude && coords?.longitude
          ? calculateDistance(userLat, userLon, coords.latitude, coords.longitude)
          : null;
        return { ...crop, distance: dist };
      });

      if (radius && radius !== 'all') {
        const maxRadius = parseFloat(radius);
        crops = crops.filter(c => c.distance !== null && c.distance <= maxRadius);
      }

      if (sortBy === 'distance') {
        crops.sort((a, b) => (a.distance ?? 999999) - (b.distance ?? 999999));
      }
    }

    // Pagination (after distance filter which reduces total count)
    const total = crops.length;
    const startIndex = (page - 1) * limit;
    const paginatedCrops = crops.slice(startIndex, startIndex + Number(limit));

    // Normalize _id
    const normalizedCrops = paginatedCrops.map(c => ({
      ...c,
      _id: c._id.toString(),
      farmer: c.farmer ? { ...c.farmer, _id: c.farmer._id?.toString() } : null
    }));

    res.json({
      success: true,
      crops: normalizedCrops,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total
      }
    });

  } catch (error) {
    console.error('Get crops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/crops/categories
// @desc    Get crop categories
// @access  Public
router.get('/categories', (req, res) => {
  try {
    const categories = [
      'Cereals', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits',
      'Spices', 'Medicinal Plants', 'Flowers', 'Others'
    ];
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/crops/prices/recent
// @desc    Get recent prices by category
// @access  Public
router.get('/prices/recent', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const priceAgg = await Crop.aggregate([
      { $match: { isActive: true, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$category',
          average: { $avg: '$price.perUnit' },
          count: { $sum: 1 },
          min: { $min: '$price.perUnit' },
          max: { $max: '$price.perUnit' }
        }
      }
    ]);

    const recentPrices = {};
    priceAgg.forEach(item => {
      recentPrices[item._id] = {
        average: Math.round(item.average),
        count: item.count,
        min: item.min,
        max: item.max
      };
    });

    res.json({ success: true, recentPrices });
  } catch (error) {
    console.error('Get recent prices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/crops/farmer/my-crops
// @desc    Get farmer's crops
// @access  Private (Farmer only)
router.get('/farmer/my-crops', auth, authorize('farmer'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    const query = { farmer: req.user._id };
    if (status === 'active') query.isActive = true;
    else if (status === 'sold') query['availability.status'] = 'sold';
    else if (status === 'available') { query.isActive = true; query['availability.status'] = 'available'; }

    const total = await Crop.countDocuments(query);
    const crops = await Crop.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      crops: crops.map(c => ({ ...c, _id: c._id.toString() })),
      pagination: { current: Number(page), pages: Math.ceil(total / limit), total }
    });

  } catch (error) {
    console.error('Get farmer crops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/crops/:id
// @desc    Get single crop
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id)
      .populate('farmer', 'name rating phone address farmDetails')
      .lean();

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (!crop.isActive) {
      return res.status(404).json({ message: 'Crop not available' });
    }

    // Increment view count
    await Crop.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({
      success: true,
      crop: {
        ...crop,
        _id: crop._id.toString(),
        farmer: crop.farmer ? { ...crop.farmer, _id: crop.farmer._id?.toString() } : null
      }
    });

  } catch (error) {
    console.error('Get crop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/crops
// @desc    Create new crop
// @access  Private (Farmer only)
router.post('/', auth, authorize('farmer'), upload.array('images', 5), [
  body('name').notEmpty().withMessage('Crop name is required'),
  body('category').isIn([
    'Cereals', 'Pulses', 'Oilseeds', 'Vegetables', 'Fruits',
    'Spices', 'Medicinal Plants', 'Flowers', 'Others'
  ]).withMessage('Invalid category'),
  body('variety').notEmpty().withMessage('Crop variety is required'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
  body('harvestDate').isISO8601().withMessage('Invalid harvest date'),
  body('expiryDate').isISO8601().withMessage('Invalid expiry date')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }

    const cropData = req.body;

    const parseJsonField = (field) => {
      if (typeof field === 'string') {
        try { return JSON.parse(field); } catch (e) { return field; }
      }
      return field;
    };

    const quantity = parseJsonField(cropData.quantity);
    const price = parseJsonField(cropData.price);
    const location = parseJsonField(cropData.location);

    // Custom validation
    const customErrors = [];
    if (!quantity || !quantity.value || isNaN(quantity.value) || quantity.value <= 0)
      customErrors.push({ field: 'quantity.value', message: 'Quantity must be a positive number' });
    if (!quantity || !quantity.unit || !['kg', 'quintal', 'tonne', 'piece', 'dozen', 'bunch'].includes(quantity.unit))
      customErrors.push({ field: 'quantity.unit', message: 'Invalid unit' });
    if (!price || !price.perUnit || isNaN(price.perUnit) || price.perUnit <= 0)
      customErrors.push({ field: 'price.perUnit', message: 'Price must be a positive number' });
    if (!location || !location.state || !location.state.trim())
      customErrors.push({ field: 'location.state', message: 'State is required' });
    if (!location || !location.district || !location.district.trim())
      customErrors.push({ field: 'location.district', message: 'District is required' });
    if (!location || !location.pincode || !/^\d{6}$/.test(location.pincode.toString()))
      customErrors.push({ field: 'location.pincode', message: 'Invalid pincode - must be exactly 6 digits' });

    if (customErrors.length > 0) {
      return res.status(400).json({ message: 'Validation failed', errors: customErrors });
    }

    const images = req.files ? req.files.map(file => ({
      url: `/uploads/crops/${file.filename}`,
      alt: `${cropData.name} image`
    })) : [];

    const crop = await Crop.create({
      name: cropData.name,
      category: cropData.category,
      variety: cropData.variety,
      description: cropData.description || '',
      farmer: req.user._id,
      images,
      quantity: { value: Number(quantity.value), unit: quantity.unit },
      price: { perUnit: Number(price.perUnit), currency: 'INR' },
      harvestDate: new Date(cropData.harvestDate),
      expiryDate: new Date(cropData.expiryDate),
      location: location,
      quality: parseJsonField(cropData.quality) || { grade: 'Grade A', organic: false, certified: false },
      packaging: parseJsonField(cropData.packaging) || { type: 'Standard' },
      availability: { status: 'available', ...parseJsonField(cropData.availability) },
      delivery: parseJsonField(cropData.delivery) || { available: false, radius: 0, charges: 0, estimatedDays: 0 },
      tags: parseJsonField(cropData.tags) || [],
      views: 0,
      isActive: true,
      featured: false
    });

    const populatedCrop = await Crop.findById(crop._id)
      .populate('farmer', 'name rating phone address farmDetails')
      .lean();

    console.log('Crop created in MongoDB:', crop._id.toString(), crop.name);

    res.status(201).json({
      success: true,
      message: 'Crop added successfully',
      crop: { ...populatedCrop, _id: populatedCrop._id.toString() }
    });

  } catch (error) {
    console.error('Create crop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/crops/:id
// @desc    Update crop
// @access  Private (Farmer only)
router.put('/:id', auth, authorize('farmer'), upload.array('images', 5), async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (crop.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this crop' });
    }

    const updateData = { ...req.body };

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/crops/${file.filename}`,
        alt: `${updateData.name || crop.name} image`
      }));
      updateData.images = [...(crop.images || []), ...newImages];
    }

    if (updateData.quantity?.value) updateData['quantity.value'] = Number(updateData.quantity.value);
    if (updateData.price?.perUnit) updateData['price.perUnit'] = Number(updateData.price.perUnit);
    if (updateData.harvestDate) updateData.harvestDate = new Date(updateData.harvestDate);
    if (updateData.expiryDate) updateData.expiryDate = new Date(updateData.expiryDate);

    const updatedCrop = await Crop.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: false }
    ).populate('farmer', 'name rating phone address farmDetails').lean();

    res.json({
      success: true,
      message: 'Crop updated successfully',
      crop: { ...updatedCrop, _id: updatedCrop._id.toString() }
    });

  } catch (error) {
    console.error('Update crop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/crops/:id
// @desc    Soft-delete crop
// @access  Private (Farmer only)
router.delete('/:id', auth, authorize('farmer'), async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (crop.farmer.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this crop' });
    }

    await Crop.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ success: true, message: 'Crop deleted successfully' });

  } catch (error) {
    console.error('Delete crop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/crops/:id/favorite
// @desc    Toggle favorite status
// @access  Private
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    const userId = req.user._id;
    const isFavorite = crop.favorites.some(id => id.toString() === userId.toString());

    if (isFavorite) {
      await Crop.findByIdAndUpdate(req.params.id, { $pull: { favorites: userId } });
    } else {
      await Crop.findByIdAndUpdate(req.params.id, { $addToSet: { favorites: userId } });
    }

    res.json({
      success: true,
      message: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      isFavorite: !isFavorite
    });

  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
