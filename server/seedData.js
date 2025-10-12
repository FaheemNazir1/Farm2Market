const bcrypt = require('bcryptjs');

// Helper function to generate unique ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Seed test users
const seedUsers = async () => {
  const users = [];
  
  // Create test farmer
  const farmerPassword = await bcrypt.hash('farmer123', 10);
  const farmer = {
    id: generateId(),
    name: 'Rajesh Kumar',
    email: 'farmer@test.com',
    password: farmerPassword,
    phone: '9876543210',
    userType: 'farmer',
    address: {
      street: 'Village Road 123',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      country: 'India'
    },
    farmDetails: {
      farmName: 'Green Valley Farm',
      farmSize: '10 acres',
      farmingExperience: 15,
      certifications: ['Organic Certified'],
      organicCertified: true
    },
    isVerified: true,
    isActive: true,
    rating: { average: 4.5, count: 12 },
    createdAt: new Date()
  };
  users.push(farmer);

  // Create test buyer
  const buyerPassword = await bcrypt.hash('buyer123', 10);
  const buyer = {
    id: generateId(),
    name: 'Priya Sharma',
    email: 'buyer@test.com',
    password: buyerPassword,
    phone: '9876543211',
    userType: 'buyer',
    address: {
      street: 'Business District',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India'
    },
    businessDetails: {
      businessName: 'Fresh Foods Ltd',
      businessType: 'Retail Chain',
      gstNumber: '27ABCDE1234F1Z5',
      licenseNumber: 'FSSAI123456789'
    },
    isVerified: true,
    isActive: true,
    rating: { average: 4.8, count: 25 },
    createdAt: new Date()
  };
  users.push(buyer);

  // Create test admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = {
    id: generateId(),
    name: 'Admin User',
    email: 'admin@test.com',
    password: adminPassword,
    phone: '9876543212',
    userType: 'admin',
    address: {
      street: 'Admin Office',
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India'
    },
    isVerified: true,
    isActive: true,
    rating: { average: 5.0, count: 1 },
    createdAt: new Date()
  };
  users.push(admin);

  return users;
};

// Seed test crops
const seedCrops = (farmerId) => {
  const crops = [];
  
  const sampleCrops = [
    {
      _id: generateId(),
      name: 'Organic Tomatoes',
      category: 'Vegetables',
      variety: 'Cherry Tomatoes',
      description: 'Fresh organic cherry tomatoes grown without pesticides. Perfect for salads and cooking.',
      farmer: farmerId,
      images: [{
        url: '/uploads/crops/1760276060831-671568258.jpeg',
        alt: 'Organic Tomatoes'
      }],
      quantity: {
        value: 100,
        unit: 'kg'
      },
      price: {
        perUnit: 80,
        currency: 'INR'
      },
      harvestDate: new Date('2024-12-15'),
      expiryDate: new Date('2024-12-25'),
      location: {
        state: 'Maharashtra',
        district: 'Pune',
        pincode: '411001'
      },
      quality: {
        grade: 'Grade A',
        organic: true,
        certified: true
      },
      packaging: { type: 'Crates' },
      availability: {
        status: 'available'
      },
      delivery: {
        available: true,
        radius: 50,
        charges: 20,
        estimatedDays: 2
      },
      tags: ['organic', 'fresh', 'local'],
      views: 45,
      favorites: [],
      isActive: true,
      featured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: generateId(),
      name: 'Basmati Rice',
      category: 'Cereals',
      variety: 'Pusa Basmati',
      description: 'Premium quality Basmati rice with excellent aroma and taste. Aged for perfect texture.',
      farmer: farmerId,
      images: [{
        url: '/uploads/crops/1760276073276-882194197.jpeg',
        alt: 'Basmati Rice'
      }],
      quantity: {
        value: 500,
        unit: 'kg'
      },
      price: {
        perUnit: 120,
        currency: 'INR'
      },
      harvestDate: new Date('2024-11-20'),
      expiryDate: new Date('2025-11-20'),
      location: {
        state: 'Maharashtra',
        district: 'Pune',
        pincode: '411001'
      },
      quality: {
        grade: 'Grade A',
        organic: false,
        certified: true
      },
      packaging: { type: 'Sacks' },
      availability: {
        status: 'available'
      },
      delivery: {
        available: true,
        radius: 100,
        charges: 50,
        estimatedDays: 3
      },
      tags: ['premium', 'aromatic', 'long-grain'],
      views: 78,
      favorites: [],
      isActive: true,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: generateId(),
      name: 'Fresh Spinach',
      category: 'Vegetables',
      variety: 'Green Leaf',
      description: 'Fresh green spinach leaves rich in iron and vitamins. Harvested daily for maximum freshness.',
      farmer: farmerId,
      images: [{
        url: '/uploads/crops/1760276084567-580322489.jpeg',
        alt: 'Fresh Spinach'
      }],
      quantity: {
        value: 50,
        unit: 'kg'
      },
      price: {
        perUnit: 40,
        currency: 'INR'
      },
      harvestDate: new Date('2024-12-10'),
      expiryDate: new Date('2024-12-17'),
      location: {
        state: 'Maharashtra',
        district: 'Pune',
        pincode: '411001'
      },
      quality: {
        grade: 'Grade A',
        organic: true,
        certified: true
      },
      packaging: { type: 'Bunches' },
      availability: {
        status: 'available'
      },
      delivery: {
        available: true,
        radius: 30,
        charges: 15,
        estimatedDays: 1
      },
      tags: ['organic', 'leafy-green', 'vitamin-rich'],
      views: 32,
      favorites: [],
      isActive: true,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
  
  crops.push(...sampleCrops);
  return crops;
};

module.exports = { seedUsers, seedCrops };
