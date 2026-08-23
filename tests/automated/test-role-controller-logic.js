const path = require('path');
const users = require(path.join(__dirname, '../../server/db')).users;
const bcrypt = require(path.join(__dirname, '../../server/node_modules/bcryptjs'));
const jwt = require(path.join(__dirname, '../../server/node_modules/jsonwebtoken'));

const JWT_SECRET = process.env.JWT_SECRET || 'farm2market_jwt_super_secret_key_2025';

// Function representing the exact POST /api/auth/google logic
async function processGoogleAuth({ decodedToken, userType, isLogin = false }) {
  const { email, name, picture, uid } = decodedToken;

  if (!email) {
    return { status: 400, message: 'Google account does not provide a valid email address' };
  }

  // Check if user already exists in database
  let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    // Existing user: Link Firebase UID and update profile picture if missing
    user.firebaseUid = uid;
    if (!user.profileImage && picture) {
      user.profileImage = picture;
    }

    // CRITICAL: Preserve existing user.userType. Do NOT overwrite userType.
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return {
      status: 200,
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType, // Exactly preserved
        address: user.address,
        isVerified: user.isVerified,
        profileImage: user.profileImage || picture || ''
      }
    };
  }

  // New User: Validate role selection
  const normalizedRole = userType ? String(userType).toLowerCase().trim() : null;

  if (!normalizedRole || !['farmer', 'buyer'].includes(normalizedRole)) {
    return {
      status: 400,
      success: false,
      requiresRoleSelection: true,
      message: 'Please select whether you want to join as a Farmer or Buyer to complete registration.'
    };
  }

  // Create New User with explicitly selected role
  const userId = Date.now().toString() + Math.random().toString(36).substring(2, 7);
  const salt = await bcrypt.genSalt(10);
  const placeholderPassword = await bcrypt.hash(Date.now().toString() + Math.random().toString(36), salt);

  const newUser = {
    id: userId,
    name: name || email.split('@')[0],
    email: email.toLowerCase(),
    password: placeholderPassword,
    phone: '0000000000',
    userType: normalizedRole,
    address: {
      street: 'Not specified',
      city: 'Not specified',
      state: 'Not specified',
      pincode: '000000',
      country: 'India'
    },
    profileImage: picture || '',
    isVerified: true,
    isActive: true,
    authProvider: 'google',
    firebaseUid: uid,
    ...(normalizedRole === 'farmer' && {
      farmDetails: {
        farmName: `${name || 'Farmer'}'s Farm`,
        farmSize: '1 acre',
        farmingExperience: 0,
        organicCertified: false
      }
    }),
    ...(normalizedRole === 'buyer' && {
      businessDetails: {
        businessName: `${name || 'Buyer'} Trade`,
        businessType: 'Retail'
      }
    }),
    createdAt: new Date()
  };

  users.push(newUser);

  const token = jwt.sign({ id: newUser.id }, JWT_SECRET, { expiresIn: '7d' });

  return {
    status: 201,
    success: true,
    message: `Account created successfully as ${normalizedRole === 'farmer' ? 'Farmer' : 'Buyer'}!`,
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      userType: newUser.userType,
      address: newUser.address,
      isVerified: newUser.isVerified,
      profileImage: newUser.profileImage
    }
  };
}

async function runUnitTests() {
  // Wait for seed data initialization
  await new Promise(resolve => setTimeout(resolve, 800));
  console.log('\n--- 1. Testing New User Google Registration with Farmer Role ---');
  const res1 = await processGoogleAuth({
    decodedToken: { email: 'new_farmer@example.com', name: 'Ramesh Patel', uid: 'uid_farmer_123' },
    userType: 'farmer'
  });
  console.log('Result 1:', res1.status, '| UserType:', res1.user?.userType, '| Name:', res1.user?.name);
  if (res1.user?.userType !== 'farmer') throw new Error('Failed to assign farmer role');

  console.log('\n--- 2. Testing New User Google Registration with Buyer Role ---');
  const res2 = await processGoogleAuth({
    decodedToken: { email: 'new_buyer@example.com', name: 'Anita Sharma', uid: 'uid_buyer_456' },
    userType: 'buyer'
  });
  console.log('Result 2:', res2.status, '| UserType:', res2.user?.userType, '| Name:', res2.user?.name);
  if (res2.user?.userType !== 'buyer') throw new Error('Failed to assign buyer role');

  console.log('\n--- 3. Testing New User Google Registration without Role Selection ---');
  const res3 = await processGoogleAuth({
    decodedToken: { email: 'norole_user@example.com', name: 'No Role User', uid: 'uid_norole_789' },
    userType: null
  });
  console.log('Result 3:', res3.status, '(Expected 400) | RequiresRole:', res3.requiresRoleSelection);
  if (res3.status !== 400 || !res3.requiresRoleSelection) throw new Error('Failed to reject missing role');

  console.log('\n--- 4. Testing New User Google Registration with Invalid Role ---');
  const res4 = await processGoogleAuth({
    decodedToken: { email: 'invalid_role_user@example.com', name: 'Hacker', uid: 'uid_hacker' },
    userType: 'admin'
  });
  console.log('Result 4:', res4.status, '(Expected 400) | Message:', res4.message);
  if (res4.status !== 400) throw new Error('Failed to reject invalid role');

  console.log('\n--- 5. Testing Existing Farmer Preserving Farmer Role ---');
  // Pass 'buyer' to an existing farmer email
  const res5 = await processGoogleAuth({
    decodedToken: { email: 'farmer@test.com', name: 'Rajesh Kumar', uid: 'uid_existing_farmer' },
    userType: 'buyer' // Intentional conflict to verify role preservation
  });
  console.log('Result 5:', res5.status, '| Preserved UserType:', res5.user?.userType, '(Must remain farmer)');
  if (res5.user?.userType !== 'farmer') throw new Error('Existing farmer role was improperly overwritten');

  console.log('\n--- 6. Testing Existing Buyer Preserving Buyer Role ---');
  // Pass 'farmer' to an existing buyer email
  const res6 = await processGoogleAuth({
    decodedToken: { email: 'buyer@test.com', name: 'Priya Sharma', uid: 'uid_existing_buyer' },
    userType: 'farmer' // Intentional conflict to verify role preservation
  });
  console.log('Result 6:', res6.status, '| Preserved UserType:', res6.user?.userType, '(Must remain buyer)');
  if (res6.user?.userType !== 'buyer') throw new Error('Existing buyer role was improperly overwritten');

  console.log('\n✅ ALL 6 GOOGLE ROLE SPECIFICATION TESTS PASSED PERFECTLY!\n');
}

runUnitTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
