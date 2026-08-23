const bcrypt = require('bcryptjs');

// Helper function to generate unique ID
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Sample orders array (in-memory database)
const orders = [];

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
      street: 'Village Road 123, Haveli',
      city: 'Pune',
      state: 'Maharashtra',
      pincode: '411001',
      country: 'India',
      coordinates: {
        latitude: 18.5204,
        longitude: 73.8567
      }
    },
    farmDetails: {
      farmName: 'Green Valley Agro Farm',
      farmSize: '10 acres',
      farmingExperience: 15,
      certifications: ['Organic Certified'],
      organicCertified: true
    },
    isVerified: true,
    isActive: true,
    rating: { average: 4.8, count: 18 },
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
      street: 'Business District, Bandra',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      country: 'India',
      coordinates: {
        latitude: 19.0596,
        longitude: 72.8295
      }
    },
    businessDetails: {
      businessName: 'Fresh Foods Direct Ltd',
      businessType: 'Retail Chain',
      gstNumber: '27ABCDE1234F1Z5',
      licenseNumber: 'FSSAI123456789'
    },
    isVerified: true,
    isActive: true,
    rating: { average: 4.9, count: 32 },
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
  const sampleCrops = [
    {
      _id: generateId(),
      name: 'Organic Tomatoes',
      category: 'Vegetables',
      variety: 'Cherry Tomatoes',
      description: 'Fresh organic cherry tomatoes grown without chemical pesticides. Sun-ripened and harvested daily.',
      farmer: farmerId,
      images: [{
        url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
        alt: 'Organic Tomatoes'
      }],
      quantity: {
        value: 120,
        unit: 'kg'
      },
      price: {
        perUnit: 60,
        currency: 'INR'
      },
      harvestDate: new Date('2025-01-10'),
      expiryDate: new Date('2025-01-25'),
      location: {
        state: 'Maharashtra',
        district: 'Pune',
        city: 'Pune',
        pincode: '411001',
        coordinates: {
          latitude: 18.5204,
          longitude: 73.8567
        }
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
        radius: 60,
        charges: 20,
        estimatedDays: 1
      },
      tags: ['organic', 'fresh', 'tomatoes', 'pune'],
      views: 124,
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
      variety: 'Pusa 1121 Basmati',
      description: 'Premium quality long-grain Basmati rice aged for 2 years with signature aroma and non-sticky cooking.',
      farmer: farmerId,
      images: [{
        url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
        alt: 'Basmati Rice'
      }],
      quantity: {
        value: 500,
        unit: 'kg'
      },
      price: {
        perUnit: 110,
        currency: 'INR'
      },
      harvestDate: new Date('2024-11-20'),
      expiryDate: new Date('2025-11-20'),
      location: {
        state: 'Maharashtra',
        district: 'Nashik',
        city: 'Nashik',
        pincode: '422001',
        coordinates: {
          latitude: 19.9975,
          longitude: 73.7898
        }
      },
      quality: {
        grade: 'Premium Grade A',
        organic: false,
        certified: true
      },
      packaging: { type: 'Jute Sacks (25kg)' },
      availability: {
        status: 'available'
      },
      delivery: {
        available: true,
        radius: 150,
        charges: 40,
        estimatedDays: 3
      },
      tags: ['premium', 'aromatic', 'rice', 'nashik'],
      views: 89,
      favorites: [],
      isActive: true,
      featured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: generateId(),
      name: 'Fresh Spinach (पालक)',
      category: 'Vegetables',
      variety: 'Green Broad Leaf',
      description: 'Crisp green organic spinach rich in natural iron and essential vitamins. Cleaned and bunched.',
      farmer: farmerId,
      images: [{
        url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80',
        alt: 'Fresh Spinach'
      }],
      quantity: {
        value: 80,
        unit: 'kg'
      },
      price: {
        perUnit: 35,
        currency: 'INR'
      },
      harvestDate: new Date('2025-01-14'),
      expiryDate: new Date('2025-01-20'),
      location: {
        state: 'Maharashtra',
        district: 'Kolhapur',
        city: 'Kolhapur',
        pincode: '416001',
        coordinates: {
          latitude: 16.7050,
          longitude: 74.2433
        }
      },
      quality: {
        grade: 'Grade A',
        organic: true,
        certified: true
      },
      packaging: { type: 'Eco Bundles' },
      availability: {
        status: 'available'
      },
      delivery: {
        available: true,
        radius: 40,
        charges: 15,
        estimatedDays: 1
      },
      tags: ['spinach', 'leafy', 'organic', 'kolhapur'],
      views: 65,
      favorites: [],
      isActive: true,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: generateId(),
      name: 'Alphonso Mangoes (हापूस आंबा)',
      category: 'Fruits',
      variety: 'Ratnagiri Hapus',
      description: 'Authentic GI-tagged Ratnagiri Alphonso mangoes. Naturally tree-ripened with unmatched sweetness and fragrance.',
      farmer: farmerId,
      images: [{
        url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80',
        alt: 'Alphonso Mangoes'
      }],
      quantity: {
        value: 200,
        unit: 'dozen'
      },
      price: {
        perUnit: 450,
        currency: 'INR'
      },
      harvestDate: new Date('2025-02-01'),
      expiryDate: new Date('2025-02-15'),
      location: {
        state: 'Maharashtra',
        district: 'Ratnagiri',
        city: 'Ratnagiri',
        pincode: '415612',
        coordinates: {
          latitude: 16.9902,
          longitude: 73.3120
        }
      },
      quality: {
        grade: 'Export Grade 1',
        organic: true,
        certified: true
      },
      packaging: { type: 'Cushioned Boxes' },
      availability: {
        status: 'available'
      },
      delivery: {
        available: true,
        radius: 300,
        charges: 60,
        estimatedDays: 2
      },
      tags: ['alphonso', 'mango', 'hapus', 'ratnagiri', 'export'],
      views: 310,
      favorites: [],
      isActive: true,
      featured: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: generateId(),
      name: 'Red Onions (लाल कांदा)',
      category: 'Vegetables',
      variety: 'Nashik Red Onion',
      description: 'Firm and pungent high-grade red onions with excellent shelf life. Graded and cleaned of loose skins.',
      farmer: farmerId,
      images: [{
        url: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
        alt: 'Red Onions'
      }],
      quantity: {
        value: 1000,
        unit: 'kg'
      },
      price: {
        perUnit: 28,
        currency: 'INR'
      },
      harvestDate: new Date('2024-12-28'),
      expiryDate: new Date('2025-03-28'),
      location: {
        state: 'Maharashtra',
        district: 'Solapur',
        city: 'Solapur',
        pincode: '413001',
        coordinates: {
          latitude: 17.6599,
          longitude: 75.9064
        }
      },
      quality: {
        grade: 'Grade A Super',
        organic: false,
        certified: true
      },
      packaging: { type: 'Mesh Bags (50kg)' },
      availability: {
        status: 'available'
      },
      delivery: {
        available: true,
        radius: 200,
        charges: 30,
        estimatedDays: 2
      },
      tags: ['onion', 'kanda', 'solapur', 'vegetables'],
      views: 145,
      favorites: [],
      isActive: true,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  return sampleCrops;
};

module.exports = { seedUsers, seedCrops, orders };
