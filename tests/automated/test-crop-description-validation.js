const http = require('http');

console.log('===========================================================');
console.log('🧪 TESTING CROP DESCRIPTION VALIDATION & OPTIONALITY');
console.log('===========================================================\n');

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
    // 1. Log in as a farmer to get JWT token
    console.log('--- Step 1: Logging in as Farmer ---');
    const loginPayload = JSON.stringify({
      email: 'farmer@test.com',
      password: 'farmer123'
    });

    const loginRes = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginPayload)
      }
    }, loginPayload);

    assert(loginRes.status === 200 && loginRes.data.token, 'Farmer logged in successfully');
    const token = loginRes.data.token;

    const baseCropPayload = {
      name: 'Test Crop',
      category: 'Vegetables',
      variety: 'Hybrid',
      quantity: JSON.stringify({ value: 50, unit: 'kg' }),
      price: JSON.stringify({ perUnit: 40 }),
      harvestDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: JSON.stringify({
        state: 'Maharashtra',
        district: 'Pune',
        pincode: '411001',
        coordinates: { latitude: 18.5204, longitude: 73.8567 }
      }),
      quality: JSON.stringify({ grade: 'Grade A', organic: true })
    };

    // --- TEST 1: Empty Description ---
    console.log('\n--- TEST 1: Creating Crop with Empty Description ---');
    const emptyDescPayload = JSON.stringify({
      ...baseCropPayload,
      name: 'Crop With Empty Desc',
      description: ''
    });

    const res1 = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/crops',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(emptyDescPayload),
        'Authorization': `Bearer ${token}`
      }
    }, emptyDescPayload);

    assert(res1.status === 201, `Empty description accepted (Status ${res1.status})`);
    assert(res1.data.success === true, 'Crop created successfully with empty description');

    // --- TEST 2: One-Word Description ---
    console.log('\n--- TEST 2: Creating Crop with One-Word Description ("Fresh") ---');
    const oneWordPayload = JSON.stringify({
      ...baseCropPayload,
      name: 'Crop With One Word Desc',
      description: 'Fresh'
    });

    const res2 = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/crops',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(oneWordPayload),
        'Authorization': `Bearer ${token}`
      }
    }, oneWordPayload);

    assert(res2.status === 201, `One-word description accepted (Status ${res2.status})`);
    assert(res2.data.crop?.description === 'Fresh', 'One-word description preserved correctly');

    // --- TEST 3: Two-Word Description ---
    console.log('\n--- TEST 3: Creating Crop with Two-Word Description ("Organic wheat") ---');
    const twoWordPayload = JSON.stringify({
      ...baseCropPayload,
      name: 'Crop With Two Word Desc',
      description: 'Organic wheat'
    });

    const res3 = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/crops',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(twoWordPayload),
        'Authorization': `Bearer ${token}`
      }
    }, twoWordPayload);

    assert(res3.status === 201, `Two-word description accepted (Status ${res3.status})`);
    assert(res3.data.crop?.description === 'Organic wheat', 'Two-word description preserved correctly');

    // --- TEST 4: Normal Long Description ---
    console.log('\n--- TEST 4: Creating Crop with Normal Long Description ---');
    const longDesc = 'Fresh organic cherry tomatoes grown without chemical pesticides. Sun-ripened and harvested daily with high sweetness.';
    const longDescPayload = JSON.stringify({
      ...baseCropPayload,
      name: 'Crop With Long Desc',
      description: longDesc
    });

    const res4 = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/crops',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(longDescPayload),
        'Authorization': `Bearer ${token}`
      }
    }, longDescPayload);

    assert(res4.status === 201, `Long description accepted (Status ${res4.status})`);
    assert(res4.data.crop?.description === longDesc, 'Long description preserved correctly');

    // --- TEST 5: Genuinely Required Field Validation (Name Missing) ---
    console.log('\n--- TEST 5: Verify Required Fields Still Reject Missing Name ---');
    const missingNamePayload = JSON.stringify({
      ...baseCropPayload,
      name: '',
      description: 'Some description'
    });

    const res5 = await makeRequest({
      hostname: 'localhost',
      port: 5002,
      path: '/api/crops',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(missingNamePayload),
        'Authorization': `Bearer ${token}`
      }
    }, missingNamePayload);

    assert(res5.status === 400, `Missing crop name correctly rejected with HTTP 400 (Status ${res5.status})`);

    // ==============================================================
    // SUMMARY
    // ==============================================================
    console.log('\n===========================================================');
    console.log(`🎉 TEST RUN COMPLETE: ${passCount} Passed, ${failCount} Failed`);
    console.log('===========================================================');

    if (failCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

  } catch (err) {
    console.error('Test execution failed with error:', err);
    process.exit(1);
  }
};

runTests();
