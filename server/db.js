const { seedUsers, seedCrops } = require('./seedData');

let users = [];
let crops = [];

// Initialize with seed data
const initializeDatabase = async () => {
  try {
    // Clear existing data
    users.splice(0, users.length);
    crops.splice(0, crops.length);
    
    // Seed users
    const seedData = await seedUsers();
    users.push(...seedData);
    
    // Find farmer user for seeding crops
    const farmer = users.find(user => user.userType === 'farmer');
    if (farmer) {
      // Seed crops with farmer ID
      const seedCropsData = seedCrops(farmer.id);
      crops.push(...seedCropsData);
      console.log(`Database initialized with ${seedCropsData.length} sample crops`);
    }
    
    console.log('Database initialized with test users:');
    console.log('- Farmer: farmer@test.com / farmer123');
    console.log('- Buyer: buyer@test.com / buyer123');
    console.log('- Admin: admin@test.com / admin123');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Initialize database on startup
initializeDatabase();

module.exports = { users, crops };
