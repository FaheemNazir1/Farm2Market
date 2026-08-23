const { seedUsers, seedCrops } = require('./seedData');

let users = [];
let crops = [];
let orders = []; // Define orders array here
let carts = new Map(); // userId -> cart items array

// Initialize with seed data
const initializeDatabase = async () => {
  try {
    console.log('Checking database state...');
    console.log('Current users:', users.length);
    console.log('Current crops:', crops.length);
    console.log('Current orders:', orders.length);
    
    // Only initialize if database is empty
    if (users.length === 0) {
      console.log('Database empty - initializing with seed data...');
      
      // Seed users
      const seedData = await seedUsers();
      users.push(...seedData);
      
      // Find farmer user for seeding crops
      const farmer = users.find(user => user.userType === 'farmer');
      if (farmer && crops.length === 0) {
        // Seed crops with farmer ID
        const seedCropsData = seedCrops(farmer.id);
        crops.push(...seedCropsData);
        console.log(`Database initialized with ${seedCropsData.length} sample crops`);
        console.log('Available crops:');
        seedCropsData.forEach((crop, index) => {
          console.log(`  ${index + 1}. ${crop.name} (ID: ${crop._id}) - ${crop.quantity.value} ${crop.quantity.unit} at ₹${crop.price.perUnit}/${crop.quantity.unit}`);
        });
      }
      
      console.log('Database initialized with test users:');
      console.log('- Farmer: farmer@test.com / farmer123');
      console.log('- Buyer: buyer@test.com / buyer123');
      console.log('- Admin: admin@test.com / admin123');
    } else {
      console.log('Database already initialized - keeping existing data');
      console.log(`- ${users.length} users`);
      console.log(`- ${crops.length} crops`);
      console.log(`- ${orders.length} orders`);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Initialize database on startup
initializeDatabase();

module.exports = { users, crops, orders, carts };
