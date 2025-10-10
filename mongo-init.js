// MongoDB initialization script for Farm2Market

// Switch to farm2market database
db = db.getSiblingDB('farm2market');

// Create collections with initial indexes
db.createCollection('users');
db.createCollection('crops');
db.createCollection('orders');

// Create indexes for better performance

// Users collection indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "userType": 1 });
db.users.createIndex({ "isActive": 1 });
db.users.createIndex({ "address.state": 1 });
db.users.createIndex({ "createdAt": -1 });

// Crops collection indexes
db.crops.createIndex({ "farmer": 1, "isActive": 1 });
db.crops.createIndex({ "category": 1, "isActive": 1 });
db.crops.createIndex({ "location.state": 1, "isActive": 1 });
db.crops.createIndex({ "availability.status": 1, "isActive": 1 });
db.crops.createIndex({ "price.perUnit": 1 });
db.crops.createIndex({ "quality.organic": 1 });
db.crops.createIndex({ "createdAt": -1 });
db.crops.createIndex({ "views": -1 });
db.crops.createIndex({ "name": "text", "description": "text", "variety": "text" });

// Orders collection indexes
db.orders.createIndex({ "orderNumber": 1 }, { unique: true });
db.orders.createIndex({ "buyer": 1, "createdAt": -1 });
db.orders.createIndex({ "farmer": 1, "createdAt": -1 });
db.orders.createIndex({ "status": 1, "createdAt": -1 });
db.orders.createIndex({ "paymentStatus": 1 });
db.orders.createIndex({ "createdAt": -1 });

// Insert sample data for development
print('Creating sample data...');

// Sample admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@farm2market.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4mzBSfr1CG", // password: admin123
  phone: "9999999999",
  userType: "admin",
  address: {
    street: "123 Admin Street",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110001",
    country: "India"
  },
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Sample farmer
db.users.insertOne({
  name: "Rajesh Kumar",
  email: "rajesh@farmer.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4mzBSfr1CG", // password: farmer123
  phone: "9876543210",
  userType: "farmer",
  address: {
    street: "Village Khera",
    city: "Rohtak",
    state: "Haryana",
    pincode: "124001",
    country: "India"
  },
  farmDetails: {
    farmName: "Kumar Organic Farm",
    farmSize: "5 acres",
    farmingExperience: 15,
    organicCertified: true
  },
  rating: {
    average: 4.5,
    count: 23
  },
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

// Sample buyer
db.users.insertOne({
  name: "Priya Sharma",
  email: "priya@buyer.com",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4mzBSfr1CG", // password: buyer123
  phone: "9123456789",
  userType: "buyer",
  address: {
    street: "456 Market Road",
    city: "Gurgaon",
    state: "Haryana",
    pincode: "122001",
    country: "India"
  },
  businessDetails: {
    businessName: "Fresh Foods Restaurant",
    businessType: "Restaurant",
    gstNumber: "07AAACT2727Q1ZM",
    licenseNumber: "FL123456"
  },
  rating: {
    average: 4.8,
    count: 15
  },
  isVerified: true,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Sample data created successfully!');
print('Database initialization completed.');
