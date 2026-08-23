const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Crop = require('./models/Crop');

const seedDatabaseIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      // Database already has users, ensuring farmer@test.com and buyer@test.com exist
      const hasFarmer = await User.findOne({ email: 'farmer@test.com' });
      if (!hasFarmer) {
        const farmerPassword = await bcrypt.hash('farmer123', 10);
        await User.collection.insertOne({
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
            coordinates: { latitude: 18.5204, longitude: 73.8567 }
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
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      const hasBuyer = await User.findOne({ email: 'buyer@test.com' });
      if (!hasBuyer) {
        const buyerPassword = await bcrypt.hash('buyer123', 10);
        await User.collection.insertOne({
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
            coordinates: { latitude: 19.0596, longitude: 72.8295 }
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
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      return;
    }

    console.log('🌱 Database empty - seeding default users and crops for Demo/Test mode...');

    // 1. Create Default Farmer
    const farmerPassword = await bcrypt.hash('farmer123', 10);
    const farmerInsert = await User.collection.insertOne({
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
        coordinates: { latitude: 18.5204, longitude: 73.8567 }
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
      createdAt: new Date(),
      updatedAt: new Date()
    });
    const farmerId = farmerInsert.insertedId;

    // 2. Create Default Buyer
    const buyerPassword = await bcrypt.hash('buyer123', 10);
    await User.collection.insertOne({
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
        coordinates: { latitude: 19.0596, longitude: 72.8295 }
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
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 3. Create Sample Crops
    const sampleCrops = [
      {
        name: 'Organic Tomatoes',
        category: 'Vegetables',
        variety: 'Cherry Tomatoes',
        description: 'Fresh organic cherry tomatoes grown without chemical pesticides.',
        farmer: farmerId,
        images: [{ url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80', alt: 'Organic Tomatoes' }],
        quantity: { value: 120, unit: 'kg' },
        price: { perUnit: 60, currency: 'INR' },
        harvestDate: new Date(),
        expiryDate: new Date(Date.now() + 15 * 86400000),
        location: { state: 'Maharashtra', district: 'Pune', pincode: '411001', coordinates: { latitude: 18.5204, longitude: 73.8567 } },
        quality: { grade: 'Grade A', organic: true, certified: true },
        availability: { status: 'available' },
        delivery: { available: true, radius: 50, charges: 50, estimatedDays: 2 },
        tags: ['organic', 'fresh', 'tomatoes'],
        views: 45,
        isActive: true,
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Basmati Rice',
        category: 'Cereals',
        variety: '1121 Extra Long',
        description: 'Premium quality aged Basmati rice with distinct aroma.',
        farmer: farmerId,
        images: [{ url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80', alt: 'Basmati Rice' }],
        quantity: { value: 500, unit: 'kg' },
        price: { perUnit: 110, currency: 'INR' },
        harvestDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 86400000),
        location: { state: 'Punjab', district: 'Amritsar', pincode: '143001', coordinates: { latitude: 31.634, longitude: 74.8723 } },
        quality: { grade: 'Premium', organic: false, certified: true },
        availability: { status: 'available' },
        delivery: { available: true, radius: 200, charges: 150, estimatedDays: 5 },
        tags: ['rice', 'basmati', 'premium'],
        views: 89,
        isActive: true,
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Fresh Spinach (पालक)',
        category: 'Vegetables',
        variety: 'Local Green',
        description: 'Crisp, iron-rich fresh spinach harvested this morning.',
        farmer: farmerId,
        images: [{ url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80', alt: 'Spinach' }],
        quantity: { value: 80, unit: 'kg' },
        price: { perUnit: 35, currency: 'INR' },
        harvestDate: new Date(),
        expiryDate: new Date(Date.now() + 5 * 86400000),
        location: { state: 'Maharashtra', district: 'Nashik', pincode: '422001', coordinates: { latitude: 19.9975, longitude: 73.7898 } },
        quality: { grade: 'Grade A', organic: true, certified: false },
        availability: { status: 'available' },
        delivery: { available: true, radius: 30, charges: 30, estimatedDays: 1 },
        tags: ['spinach', 'greens', 'healthy'],
        views: 23,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await Crop.insertMany(sampleCrops);
    console.log('✅ Seeded default accounts (farmer@test.com / buyer@test.com) and sample crops.');
  } catch (err) {
    console.warn('Seed database notice (non-fatal):', err.message);
  }
};

module.exports = { seedDatabaseIfEmpty };
