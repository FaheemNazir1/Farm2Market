const http = require('http');

console.log('=====================================================================');
console.log('🚀 TESTING FARMER BUYING PERMISSIONS & GOOGLE AUTH ROLE PRESERVATION');
console.log('=====================================================================\n');

let passCount = 0;
let failCount = 0;

const assert = (condition, testName) => {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    failCount++;
  }
};

const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

const runTests = async () => {
  try {
    // ---------------------------------------------------------------
    // 1. Log in Farmer & Buyer
    // ---------------------------------------------------------------
    console.log('--- Step 1: Authentication ---');
    const farmerLogin = JSON.stringify({ email: 'farmer@test.com', password: 'farmer123' });
    const resFarmer = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(farmerLogin) }
    }, farmerLogin);

    assert(resFarmer.status === 200 && resFarmer.data.token, 'Farmer logged in');
    const farmerToken = resFarmer.data.token;
    const farmerUser = resFarmer.data.user;

    const buyerLogin = JSON.stringify({ email: 'buyer@test.com', password: 'buyer123' });
    const resBuyer = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(buyerLogin) }
    }, buyerLogin);

    assert(resBuyer.status === 200 && resBuyer.data.token, 'Buyer logged in');
    const buyerToken = resBuyer.data.token;

    // Get available crops
    const cropsRes = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/crops',
      method: 'GET'
    });
    const cropsList = cropsRes.data.crops || [];
    assert(cropsList.length > 0, `Found ${cropsList.length} crops in marketplace`);

    // Register a second farmer to test inter-farmer purchasing
    const farmer2Email = `farmer2.${Date.now()}@test.com`;
    const farmer2Register = JSON.stringify({
      name: 'Farmer Two',
      email: farmer2Email,
      password: 'password123',
      phone: '9876543222',
      userType: 'farmer',
      address: { street: '456 Farm Rd', city: 'Nashik', state: 'Maharashtra', pincode: '422001' }
    });

    const resFarmer2Reg = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(farmer2Register) }
    }, farmer2Register);

    const farmer2Token = resFarmer2Reg.data.token;
    const farmer2Id = resFarmer2Reg.data.user?.id;

    // Farmer 2 creates a crop
    const farmer2CropPayload = JSON.stringify({
      name: 'Farmer Two Wheat',
      category: 'Cereals',
      variety: 'Lokwan',
      quantity: JSON.stringify({ value: 100, unit: 'kg' }),
      price: JSON.stringify({ perUnit: 30 }),
      harvestDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      location: JSON.stringify({ state: 'Maharashtra', district: 'Nashik', pincode: '422001' })
    });

    const resFarmer2Crop = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/crops',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(farmer2CropPayload),
        'Authorization': `Bearer ${farmer2Token}`
      }
    }, farmer2CropPayload);

    const farmer2Crop = resFarmer2Crop.data.crop;

    // ---------------------------------------------------------------
    // 2. Farmer Purchasing Permissions
    // ---------------------------------------------------------------
    console.log('\n--- Step 2: Farmer Purchasing Permissions ---');

    // Farmer 1 places purchase order for Farmer 2's crop
    const farmer1BuyOrderPayload = JSON.stringify({
      items: [{ cropId: farmer2Crop._id, quantity: 10 }],
      shippingAddress: {
        name: 'Farmer One',
        phone: '9876543210',
        street: '123 Farm Way',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001'
      },
      paymentMethod: 'cod'
    });

    const resFarmerOrder = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(farmer1BuyOrderPayload),
        'Authorization': `Bearer ${farmerToken}`
      }
    }, farmer1BuyOrderPayload);

    assert(resFarmerOrder.status === 201, `Farmer 1 successfully placed purchase order for Farmer 2's crop (Status ${resFarmerOrder.status})`);
    assert(resFarmerOrder.data.order?.buyer?.id === farmerUser.id || resFarmerOrder.data.order?.buyer === farmerUser.id, 'Order correctly records Farmer 1 as buyer');
    assert(resFarmerOrder.data.order?.farmer?.id === farmer2Id || resFarmerOrder.data.order?.farmer === farmer2Id, 'Order correctly records Farmer 2 as seller');

    // Farmer ordering own crop should be prevented
    const ownFarmerCrop = cropsList.find(c => c.farmer === farmerUser.id || (c.farmer?._id === farmerUser.id));
    if (ownFarmerCrop) {
      const ownCropOrderPayload = JSON.stringify({
        items: [{ cropId: ownFarmerCrop._id, quantity: 1 }],
        shippingAddress: {
          name: 'Farmer Self',
          phone: '9876543210',
          street: '123 Farm Way',
          city: 'Pune',
          state: 'Maharashtra',
          pincode: '411001'
        },
        paymentMethod: 'cod'
      });

      const resOwnOrder = await makeRequest({
        hostname: 'localhost',
        port: 5002,
        path: '/api/orders',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(ownCropOrderPayload),
          'Authorization': `Bearer ${farmerToken}`
        }
      }, ownCropOrderPayload);

      assert(resOwnOrder.status === 400, `Farmer blocked from buying own produce (Status ${resOwnOrder.status})`);
    }

    // ---------------------------------------------------------------
    // 3. Buyer Restrictions (Cannot Create / Edit / Delete Crops)
    // ---------------------------------------------------------------
    console.log('\n--- Step 3: Buyer Restrictions ---');

    const buyerCropPayload = JSON.stringify({
      name: 'Illegal Buyer Crop',
      category: 'Vegetables',
      variety: 'Hybrid',
      quantity: JSON.stringify({ value: 10, unit: 'kg' }),
      price: JSON.stringify({ perUnit: 20 }),
      harvestDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 86400000).toISOString(),
      location: JSON.stringify({ state: 'Maharashtra', district: 'Pune', pincode: '411001' })
    });

    const resBuyerCrop = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/crops',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(buyerCropPayload),
        'Authorization': `Bearer ${buyerToken}`
      }
    }, buyerCropPayload);

    assert(resBuyerCrop.status === 403, `Buyer cannot create crops (Status 403 Forbidden)`);

    // ---------------------------------------------------------------
    // 4. Google Auth Flow & Role Preservation
    // ---------------------------------------------------------------
    console.log('\n--- Step 4: Google Auth Flow & Role Preservation ---');

    // Case A: Brand New Google User without role -> Must return 400 requiresRoleSelection
    const newGoogleNoRole = JSON.stringify({
      idToken: `mock-google-token-new-${Date.now()}@gmail.com`
    });

    const resNewGoogleNoRole = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/auth/google',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(newGoogleNoRole) }
    }, newGoogleNoRole);

    assert(resNewGoogleNoRole.status === 400, 'New Google user without role rejected with 400');
    assert(resNewGoogleNoRole.data.requiresRoleSelection === true, 'Response requiresRoleSelection is true');

    // Case B: Brand New Google Farmer -> Created as Farmer
    const newGoogleEmail = `farmer.google.${Date.now()}@gmail.com`;
    const newGoogleFarmer = JSON.stringify({
      idToken: `mock-google-token-${newGoogleEmail}`,
      userType: 'farmer'
    });

    const resNewFarmer = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/auth/google',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(newGoogleFarmer) }
    }, newGoogleFarmer);

    assert(resNewFarmer.status === 200 || resNewFarmer.status === 201, 'New Google Farmer registered');
    assert(resNewFarmer.data.user?.userType === 'farmer', 'New Google user created with role: farmer');

    // Case C: Subsequent Login of Existing Google Farmer WITHOUT sending role -> Logs in as Farmer
    const existingFarmerLoginNoRole = JSON.stringify({
      idToken: `mock-google-token-${newGoogleEmail}`
      // userType omitted intentionally
    });

    const resExistingFarmer = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/auth/google',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(existingFarmerLoginNoRole) }
    }, existingFarmerLoginNoRole);

    assert(resExistingFarmer.status === 200, 'Existing Google Farmer logged in without role prompt (Status 200)');
    assert(resExistingFarmer.data.user?.userType === 'farmer', 'Existing Google Farmer preserved role: farmer');

    // Case D: Existing Google Farmer tries sending userType: 'buyer' -> Must IGNORE and preserve 'farmer'
    const existingFarmerTamperRole = JSON.stringify({
      idToken: `mock-google-token-${newGoogleEmail}`,
      userType: 'buyer' // Tamper attempt
    });

    const resTamper = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/auth/google',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(existingFarmerTamperRole) }
    }, existingFarmerTamperRole);

    assert(resTamper.status === 200, 'Tamper request accepted as login');
    assert(resTamper.data.user?.userType === 'farmer', 'Existing Google Farmer strictly preserved as farmer (tamper ignored)');

    // ===============================================================
    // Summary
    // ===============================================================
    console.log('\n=====================================================================');
    console.log(`🎉 TEST RUN COMPLETE: ${passCount} Passed, ${failCount} Failed`);
    console.log('=====================================================================');

    if (failCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  }
};

runTests();
