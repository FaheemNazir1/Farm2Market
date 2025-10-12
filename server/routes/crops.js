const express = require('express');
const { body, validationResult } = require('express-validator');
const { crops, users } = require('../db');
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Helper function to generate unique ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Helper function to populate farmer data
const populateFarmer = (crop) => {
  const farmer = users.find(u => u.id === crop.farmer);
  if (farmer) {
    crop.farmer = {
      _id: farmer.id,
      name: farmer.name,
      rating: farmer.rating || { average: 0, count: 0 },
      phone: farmer.phone,
      address: farmer.address,
      farmDetails: farmer.farmDetails
    };
  }
  return crop;
};

// @route   GET /api/crops
// @desc    Get all crops with filters
// @access  Public
router.get('/', optionalAuth, (req, res) => {
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
      sortOrder = 'desc'
    } = req.query;
    
    console.log('GET /api/crops - Total crops in DB:', crops.length);
    console.log('Crops status:');
    crops.forEach((crop, index) => {
      console.log(`  ${index + 1}. ${crop.name} - isActive: ${crop.isActive}, status: ${crop.availability.status}`);
    });

    let filteredCrops = crops.filter(crop =>
      crop.isActive && crop.availability.status === 'available'
    );
    
    console.log('Filtered crops (active & available):', filteredCrops.length);

    // Apply filters
    if (category) {
      filteredCrops = filteredCrops.filter(crop => crop.category === category);
    }
    if (state) {
      filteredCrops = filteredCrops.filter(crop => crop.location.state === state);
    }
    if (district) {
      filteredCrops = filteredCrops.filter(crop => crop.location.district === district);
    }
    if (organic !== undefined) {
      filteredCrops = filteredCrops.filter(crop => crop.quality.organic === (organic === 'true'));
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCrops = filteredCrops.filter(crop =>
        crop.name.toLowerCase().includes(searchLower) ||
        crop.description.toLowerCase().includes(searchLower) ||
        crop.category.toLowerCase().includes(searchLower)
      );
    }
    if (minPrice || maxPrice) {
      filteredCrops = filteredCrops.filter(crop => {
        const price = crop.price.perUnit;
        if (minPrice && price < Number(minPrice)) return false;
        if (maxPrice && price > Number(maxPrice)) return false;
        return true;
      });
    }

    // Sort
    filteredCrops.sort((a, b) => {
      let aVal, bVal;
      if (sortBy === 'price.perUnit') {
        aVal = a.price.perUnit;
        bVal = b.price.perUnit;
      } else if (sortBy === 'views') {
        aVal = a.views;
        bVal = b.views;
      } else {
        aVal = new Date(a.createdAt);
        bVal = new Date(b.createdAt);
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCrops = filteredCrops.slice(startIndex, endIndex);

    // Populate farmer data
    const populatedCrops = paginatedCrops.map(crop => populateFarmer({ ...crop }));

    res.json({
      success: true,
      crops: populatedCrops,
      pagination: {
        current: Number(page),
        pages: Math.ceil(filteredCrops.length / limit),
        total: filteredCrops.length
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

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/crops/prices/recent
// @desc    Get recent prices by category
// @access  Public
router.get('/prices/recent', (req, res) => {
  try {
    const recentPrices = {};

    // Get crops from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCrops = crops.filter(crop =>
      crop.isActive &&
      new Date(crop.createdAt) >= thirtyDaysAgo
    );

    // Group by category and calculate average prices
    const categoryPrices = {};
    recentCrops.forEach(crop => {
      if (!categoryPrices[crop.category]) {
        categoryPrices[crop.category] = [];
      }
      categoryPrices[crop.category].push(crop.price.perUnit);
    });

    // Calculate averages
    Object.keys(categoryPrices).forEach(category => {
      const prices = categoryPrices[category];
      const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      recentPrices[category] = {
        average: Math.round(average),
        count: prices.length,
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
    });

    res.json({
      success: true,
      recentPrices
    });

  } catch (error) {
    console.error('Get recent prices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/crops/farmer/my-crops
// @desc    Get farmer's crops
// @access  Private (Farmer only)
router.get('/farmer/my-crops', auth, authorize('farmer'), (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let farmerCrops = crops.filter(crop => crop.farmer === req.user.id);

    if (status) {
      if (status === 'active') {
        farmerCrops = farmerCrops.filter(crop => crop.isActive);
      } else if (status === 'sold') {
        farmerCrops = farmerCrops.filter(crop => crop.availability.status === 'sold');
      } else if (status === 'available') {
        farmerCrops = farmerCrops.filter(crop => crop.isActive && crop.availability.status === 'available');
      }
    }

    // Sort by creation date (newest first)
    farmerCrops.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCrops = farmerCrops.slice(startIndex, endIndex);

    res.json({
      success: true,
      crops: paginatedCrops,
      pagination: {
        current: Number(page),
        pages: Math.ceil(farmerCrops.length / limit),
        total: farmerCrops.length
      }
    });

  } catch (error) {
    console.error('Get farmer crops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/crops/:id
// @desc    Get single crop
// @access  Public
router.get('/:id', optionalAuth, (req, res) => {
  try {
    const crop = crops.find(c => c._id === req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    if (!crop.isActive) {
      return res.status(404).json({ message: 'Crop not available' });
    }

    // Increment view count
    crop.views += 1;

    const populatedCrop = populateFarmer({ ...crop });

    res.json({
      success: true,
      crop: populatedCrop
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
  body('description').isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),
  body('harvestDate').isISO8601().withMessage('Invalid harvest date'),
  body('expiryDate').isISO8601().withMessage('Invalid expiry date')
  // Note: location validation moved to custom validation since it's sent as JSON string
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const cropData = req.body;

    // Parse JSON strings from FormData
    const parseJsonField = (field) => {
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch (e) {
          return field;
        }
      }
      return field;
    };

    // Parse nested fields
    const quantity = parseJsonField(cropData.quantity);
    const price = parseJsonField(cropData.price);
    const location = parseJsonField(cropData.location);

    // Custom validation for parsed fields
    const customErrors = [];
    
    if (!quantity || !quantity.value || isNaN(quantity.value) || quantity.value <= 0) {
      customErrors.push({
        field: 'quantity.value',
        message: 'Quantity must be a positive number'
      });
    }
    
    if (!quantity || !quantity.unit || !['kg', 'quintal', 'tonne', 'piece', 'dozen', 'bunch'].includes(quantity.unit)) {
      customErrors.push({
        field: 'quantity.unit',
        message: 'Invalid unit'
      });
    }
    
    if (!price || !price.perUnit || isNaN(price.perUnit) || price.perUnit <= 0) {
      customErrors.push({
        field: 'price.perUnit',
        message: 'Price must be a positive number'
      });
    }

    // Validate location fields
    if (!location || !location.state || !location.state.trim()) {
      customErrors.push({
        field: 'location.state',
        message: 'State is required'
      });
    }

    if (!location || !location.district || !location.district.trim()) {
      customErrors.push({
        field: 'location.district',
        message: 'District is required'
      });
    }

    if (!location || !location.pincode || !/^\d{6}$/.test(location.pincode.toString())) {
      customErrors.push({
        field: 'location.pincode',
        message: 'Invalid pincode - must be exactly 6 digits'
      });
    }

    if (customErrors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: customErrors
      });
    }

    // Handle uploaded images
    const images = req.files ? req.files.map(file => ({
      url: `/uploads/crops/${file.filename}`,
      alt: `${cropData.name} image`
    })) : [];

    const crop = {
      _id: generateId(),
      name: cropData.name,
      category: cropData.category,
      variety: cropData.variety,
      description: cropData.description,
      farmer: req.user.id,
      images,
      quantity: {
        value: Number(quantity.value),
        unit: quantity.unit
      },
      price: {
        perUnit: Number(price.perUnit),
        currency: 'INR'
      },
      harvestDate: new Date(cropData.harvestDate),
      expiryDate: new Date(cropData.expiryDate),
      location: location, // Use parsed location object
      quality: parseJsonField(cropData.quality) || {
        grade: 'Grade A',
        organic: false,
        certified: false
      },
      packaging: parseJsonField(cropData.packaging) || { type: 'Standard' },
      availability: {
        status: 'available',
        ...parseJsonField(cropData.availability)
      },
      delivery: parseJsonField(cropData.delivery) || {
        available: false,
        radius: 0,
        charges: 0,
        estimatedDays: 0
      },
      tags: parseJsonField(cropData.tags) || [],
      views: 0,
      favorites: [],
      isActive: true,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    crops.push(crop);
    
    console.log('Crop added successfully:');
    console.log('- Crop ID:', crop._id);
    console.log('- Name:', crop.name);
    console.log('- Category:', crop.category);
    console.log('- isActive:', crop.isActive);
    console.log('- availability.status:', crop.availability.status);
    console.log('- Total crops in DB:', crops.length);

    const populatedCrop = populateFarmer({ ...crop });

    res.status(201).json({
      success: true,
      message: 'Crop added successfully',
      crop: populatedCrop
    });

  } catch (error) {
    console.error('Create crop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/crops/:id
// @desc    Update crop
// @access  Private (Farmer only)
router.put('/:id', auth, authorize('farmer'), upload.array('images', 5), (req, res) => {
  try {
    const cropIndex = crops.findIndex(c => c._id === req.params.id);

    if (cropIndex === -1) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    const crop = crops[cropIndex];

    if (crop.farmer !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this crop' });
    }

    const updateData = req.body;

    // Handle new images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        url: `/uploads/crops/${file.filename}`,
        alt: `${updateData.name || crop.name} image`
      }));

      updateData.images = [...(crop.images || []), ...newImages];
    }

    // Convert string numbers to numbers
    if (updateData.quantity?.value) {
      updateData.quantity.value = Number(updateData.quantity.value);
    }
    if (updateData.price?.perUnit) {
      updateData.price.perUnit = Number(updateData.price.perUnit);
    }

    // Convert dates
    if (updateData.harvestDate) {
      updateData.harvestDate = new Date(updateData.harvestDate);
    }
    if (updateData.expiryDate) {
      updateData.expiryDate = new Date(updateData.expiryDate);
    }

    // Update crop
    const updatedCrop = {
      ...crop,
      ...updateData,
      updatedAt: new Date()
    };

    crops[cropIndex] = updatedCrop;

    const populatedCrop = populateFarmer({ ...updatedCrop });

    res.json({
      success: true,
      message: 'Crop updated successfully',
      crop: populatedCrop
    });

  } catch (error) {
    console.error('Update crop error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/crops/:id
// @desc    Delete crop
// @access  Private (Farmer only)
router.delete('/:id', auth, authorize('farmer'), (req, res) => {
  try {
    const cropIndex = crops.findIndex(c => c._id === req.params.id);

    if (cropIndex === -1) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    const crop = crops[cropIndex];

    if (crop.farmer !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this crop' });
    }

    // Soft delete
    crops[cropIndex].isActive = false;
    crops[cropIndex].updatedAt = new Date();

    res.json({
      success: true,
      message: 'Crop deleted successfully'
    });

  } catch (error) {
    console.error('Delete crop error:', error);
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

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/crops/prices/recent
// @desc    Get recent prices by category
// @access  Public
router.get('/prices/recent', (req, res) => {
  try {
    const recentPrices = {};

    // Get crops from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCrops = crops.filter(crop =>
      crop.isActive &&
      new Date(crop.createdAt) >= thirtyDaysAgo
    );

    // Group by category and calculate average prices
    const categoryPrices = {};
    recentCrops.forEach(crop => {
      if (!categoryPrices[crop.category]) {
        categoryPrices[crop.category] = [];
      }
      categoryPrices[crop.category].push(crop.price.perUnit);
    });

    // Calculate averages
    Object.keys(categoryPrices).forEach(category => {
      const prices = categoryPrices[category];
      const average = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      recentPrices[category] = {
        average: Math.round(average),
        count: prices.length,
        min: Math.min(...prices),
        max: Math.max(...prices)
      };
    });

    res.json({
      success: true,
      recentPrices
    });

  } catch (error) {
    console.error('Get recent prices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/crops/farmer/my-crops
// @desc    Get farmer's crops
// @access  Private (Farmer only)
router.get('/farmer/my-crops', auth, authorize('farmer'), (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;

    let farmerCrops = crops.filter(crop => crop.farmer === req.user.id);

    if (status) {
      if (status === 'active') {
        farmerCrops = farmerCrops.filter(crop => crop.isActive);
      } else if (status === 'sold') {
        farmerCrops = farmerCrops.filter(crop => crop.availability.status === 'sold');
      } else if (status === 'available') {
        farmerCrops = farmerCrops.filter(crop => crop.isActive && crop.availability.status === 'available');
      }
    }

    // Sort by creation date (newest first)
    farmerCrops.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCrops = farmerCrops.slice(startIndex, endIndex);

    res.json({
      success: true,
      crops: paginatedCrops,
      pagination: {
        current: Number(page),
        pages: Math.ceil(farmerCrops.length / limit),
        total: farmerCrops.length
      }
    });

  } catch (error) {
    console.error('Get farmer crops error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/crops/:id/favorite
// @desc    Toggle favorite status
// @access  Private
router.post('/:id/favorite', auth, (req, res) => {
  try {
    const crop = crops.find(c => c._id === req.params.id);

    if (!crop) {
      return res.status(404).json({ message: 'Crop not found' });
    }

    const userId = req.user.id;
    const isFavorite = crop.favorites.includes(userId);

    if (isFavorite) {
      crop.favorites = crop.favorites.filter(id => id !== userId);
    } else {
      crop.favorites.push(userId);
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
