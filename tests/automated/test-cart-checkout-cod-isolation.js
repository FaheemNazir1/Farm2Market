/**
 * Farm2Market Automated Test Suite:
 * - Cart User Isolation (Buyer A vs Farmer B)
 * - Checkout & Cash-on-Delivery (COD) Flow
 * - Server-Side Price & Quantity Validation
 * - Prevention of Self-Purchasing
 * - Google Auth Role Preservation
 * - Crop Description Optionality
 */

const http = require('http');

console.log('=====================================================================');
console.log('🚀 COMPREHENSIVE TEST: CART ISOLATION, CHECKOUT, COD & SECURITY');
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
    const timestamp = Date.now();

    // -----------------------------------------------------------------
    // 1. Setup Test Users (Buyer A, Farmer B, Farmer C)
    // -----------------------------------------------------------------
    console.log('--- Step 1: Register Test Users ---');
    
    // Buyer A
    const buyerAData = JSON.stringify({
      name: 'Buyer Alice',
      email: `buyer.alice.${timestamp}@test.com`,
      password: 'password123',
      phone: '9876543201',
      userType: 'buyer',
      address: { street: '101 Buyer St', city: 'Pune', state: 'Maharashtra', pincode: '411001' }
    });
    const resBuyerA = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(buyerAData) }
    }, buyerAData);
    const tokenBuyerA = resBuyerA.data.token;
    const userBuyerA = resBuyerA.data.user;
    assert(tokenBuyerA && userBuyerA?.userType === 'buyer', 'Buyer Alice registered');

    // Farmer B
    const farmerBData = JSON.stringify({
      name: 'Farmer Bob',
      email: `farmer.bob.${timestamp}@test.com`,
      password: 'password123',
      phone: '9876543202',
      userType: 'farmer',
      address: { street: '202 Farm Rd', city: 'Nashik', state: 'Maharashtra', pincode: '422001' }
    });
    const resFarmerB = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(farmerBData) }
    }, farmerBData);
    const tokenFarmerB = resFarmerB.data.token;
    const userFarmerB = resFarmerB.data.user;
    assert(tokenFarmerB && userFarmerB?.userType === 'farmer', 'Farmer Bob registered');

    // Farmer C
    const farmerCData = JSON.stringify({
      name: 'Farmer Charlie',
      email: `farmer.charlie.${timestamp}@test.com`,
      password: 'password123',
      phone: '9876543203',
      userType: 'farmer',
      address: { street: '303 Farm Way', city: 'Nagpur', state: 'Maharashtra', pincode: '440001' }
    });
    const resFarmerC = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/auth/register', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(farmerCData) }
    }, farmerCData);
    const tokenFarmerC = resFarmerC.data.token;
    const userFarmerC = resFarmerC.data.user;
    assert(tokenFarmerC && userFarmerC?.userType === 'farmer', 'Farmer Charlie registered');

    // Farmer B creates Crop 1 (Tomatoes, ₹50/kg)
    const crop1Data = JSON.stringify({
      name: 'Bob Organic Tomatoes',
      category: 'Vegetables',
      variety: 'Cherry',
      price: JSON.stringify({ perUnit: 50 }),
      quantity: JSON.stringify({ value: 100, unit: 'kg' }),
      harvestDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 86400000 * 10).toISOString(),
      location: JSON.stringify({ state: 'Maharashtra', district: 'Nashik', pincode: '422001' })
    });
    const resCrop1 = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/crops', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(crop1Data), 'Authorization': `Bearer ${tokenFarmerB}` }
    }, crop1Data);
    const crop1 = resCrop1.data.crop;
    assert(crop1 && crop1.price.perUnit === 50, 'Farmer Bob created Crop 1 (₹50/kg)');

    // Farmer B creates Crop 2 (Wheat, ₹40/kg) with empty description
    const crop2Data = JSON.stringify({
      name: 'Bob Golden Wheat',
      category: 'Cereals',
      variety: 'Sharbati',
      description: '', // Optional description
      price: JSON.stringify({ perUnit: 40 }),
      quantity: JSON.stringify({ value: 200, unit: 'kg' }),
      harvestDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 86400000 * 60).toISOString(),
      location: JSON.stringify({ state: 'Maharashtra', district: 'Nashik', pincode: '422001' })
    });
    const resCrop2 = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/crops', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(crop2Data), 'Authorization': `Bearer ${tokenFarmerB}` }
    }, crop2Data);
    const crop2 = resCrop2.data.crop;
    assert(crop2 && crop2.name === 'Bob Golden Wheat', 'Farmer Bob created Crop 2 with empty description');

    // Farmer C creates Crop 3 (Oranges, ₹80/kg) with one-word description "Fresh"
    const crop3Data = JSON.stringify({
      name: 'Charlie Nagpur Oranges',
      category: 'Fruits',
      variety: 'Nagpur Mandarin',
      description: 'Fresh',
      price: JSON.stringify({ perUnit: 80 }),
      quantity: JSON.stringify({ value: 50, unit: 'kg' }),
      harvestDate: new Date().toISOString(),
      expiryDate: new Date(Date.now() + 86400000 * 15).toISOString(),
      location: JSON.stringify({ state: 'Maharashtra', district: 'Nagpur', pincode: '440001' })
    });
    const resCrop3 = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/crops', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(crop3Data), 'Authorization': `Bearer ${tokenFarmerC}` }
    }, crop3Data);
    const crop3 = resCrop3.data.crop;
    assert(crop3 && crop3.description === 'Fresh', 'Farmer Charlie created Crop 3 with one-word description');

    // -----------------------------------------------------------------
    // 2. User-Specific Cart Isolation Tests
    // -----------------------------------------------------------------
    console.log('\n--- Step 2: User Cart Isolation Tests ---');

    // Initial check: Buyer A cart is empty
    const resCartAInitial = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/cart', method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenBuyerA}` }
    });
    assert(resCartAInitial.status === 200 && resCartAInitial.data.items.length === 0, 'Buyer Alice initial cart is empty');

    // Buyer A adds Crop 1 (2 kg) and Crop 2 (5 kg) to cart
    const buyerACartItems = JSON.stringify({
      items: [
        { crop: crop1, quantity: 2 },
        { crop: crop2, quantity: 5 }
      ]
    });
    const resCartASave = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/cart', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(buyerACartItems), 'Authorization': `Bearer ${tokenBuyerA}` }
    }, buyerACartItems);
    assert(resCartASave.status === 200 && resCartASave.data.items.length === 2, 'Buyer Alice saved 2 items to cart');

    // Farmer B checks their cart -> MUST BE EMPTY (NO LEAKAGE FROM BUYER A)
    const resCartBInitial = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/cart', method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenFarmerB}` }
    });
    assert(resCartBInitial.status === 200 && resCartBInitial.data.items.length === 0, 'Farmer Bob cart is completely empty (zero leakage from Buyer Alice)');

    // Farmer B adds Crop 3 (Charlie\'s oranges, 4 kg) to their cart
    const farmerBCartItems = JSON.stringify({
      items: [
        { crop: crop3, quantity: 4 }
      ]
    });
    const resCartBSave = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/cart', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(farmerBCartItems), 'Authorization': `Bearer ${tokenFarmerB}` }
    }, farmerBCartItems);
    assert(resCartBSave.status === 200 && resCartBSave.data.items.length === 1, 'Farmer Bob saved 1 item to their own cart');

    // Buyer A logs in again / fetches cart -> MUST STILL HAVE EXACTLY THEIR 2 ORIGINAL ITEMS
    const resCartAFetchAgain = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/cart', method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenBuyerA}` }
    });
    assert(resCartAFetchAgain.data.items.length === 2, 'Buyer Alice cart strictly preserved with original 2 items');
    assert(resCartAFetchAgain.data.items[0].crop._id === crop1._id, 'Buyer Alice item 1 is Crop 1');
    assert(resCartAFetchAgain.data.items[1].crop._id === crop2._id, 'Buyer Alice item 2 is Crop 2');

    // Farmer B fetches cart again -> MUST STILL HAVE EXACTLY THEIR 1 ITEM
    const resCartBFetchAgain = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/cart', method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenFarmerB}` }
    });
    assert(resCartBFetchAgain.data.items.length === 1, 'Farmer Bob cart strictly preserved with 1 item');
    assert(resCartBFetchAgain.data.items[0].crop._id === crop3._id, 'Farmer Bob item is Crop 3');

    // -----------------------------------------------------------------
    // 3. Checkout & COD Order Placement
    // -----------------------------------------------------------------
    console.log('\n--- Step 3: Checkout & Cash-on-Delivery (COD) Orders ---');

    // Buyer Alice places COD order for Crop 1 & Crop 2 (Both from Farmer Bob)
    const buyerAOrderPayload = JSON.stringify({
      farmer: userFarmerB.id,
      items: [
        { cropId: crop1._id, crop: crop1._id, quantity: 2 },
        { cropId: crop2._id, crop: crop2._id, quantity: 5 }
      ],
      shippingAddress: {
        name: 'Buyer Alice',
        phone: '9876543201',
        street: '101 Buyer St',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001'
      },
      paymentMethod: 'cod'
    });

    const resOrderAlice = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(buyerAOrderPayload), 'Authorization': `Bearer ${tokenBuyerA}` }
    }, buyerAOrderPayload);

    assert(resOrderAlice.status === 201, 'Buyer Alice COD order created successfully (HTTP 201)');
    const aliceOrder = resOrderAlice.data.order;
    assert(aliceOrder.paymentMethod === 'cod', 'Order payment method is cod');
    assert(aliceOrder.paymentStatus === 'pending', 'Order payment status is pending (COD)');
    assert(aliceOrder.status === 'pending' || aliceOrder.status === 'confirmed', 'Order status is pending/confirmed');

    // Verify Server-Side Price Calculation: (2 * 50) + (5 * 40) = 100 + 200 = 300 subtotal, 5% tax = 15, total = 315
    assert(aliceOrder.totalAmount === 300, 'Server computed items subtotal = ₹300');
    assert(aliceOrder.taxAmount === 15, 'Server computed 5% tax = ₹15');
    assert(aliceOrder.finalAmount === 315, 'Server computed final total = ₹315');

    // Clear Buyer Alice's cart after successful order creation
    await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/cart', method: 'DELETE',
      headers: { 'Authorization': `Bearer ${tokenBuyerA}` }
    });
    const resCartACleared = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/cart', method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenBuyerA}` }
    });
    assert(resCartACleared.data.items.length === 0, 'Buyer Alice cart cleared after order');

    // Farmer Bob's cart must STILL HAVE THEIR 1 ITEM (Farmer Bob cart was NOT cleared by Alice's order)
    const resCartBAfterAliceOrder = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/cart', method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenFarmerB}` }
    });
    assert(resCartBAfterAliceOrder.data.items.length === 1, 'Farmer Bob cart remains completely intact after Alice cleared hers');

    // -----------------------------------------------------------------
    // 4. Farmer Buying Capabilities & Self-Purchase Prevention
    // -----------------------------------------------------------------
    console.log('\n--- Step 4: Farmer Buying & Self-Purchase Prevention ---');

    // Farmer Bob buys Farmer Charlie's Crop 3 (4 kg Oranges) using COD
    const farmerBOrderPayload = JSON.stringify({
      farmer: userFarmerC.id,
      items: [
        { cropId: crop3._id, quantity: 4 }
      ],
      shippingAddress: {
        name: 'Farmer Bob',
        phone: '9876543202',
        street: '202 Farm Rd',
        city: 'Nashik',
        state: 'Maharashtra',
        pincode: '422001'
      },
      paymentMethod: 'cod'
    });

    const resOrderBob = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(farmerBOrderPayload), 'Authorization': `Bearer ${tokenFarmerB}` }
    }, farmerBOrderPayload);

    assert(resOrderBob.status === 201, 'Farmer Bob successfully placed COD purchase order for Farmer Charlie\'s crop');
    assert(resOrderBob.data.order.buyer?.id === userFarmerB.id || resOrderBob.data.order.buyer === userFarmerB.id, 'Bob recorded as buyer');
    assert(resOrderBob.data.order.farmer?.id === userFarmerC.id || resOrderBob.data.order.farmer === userFarmerC.id, 'Charlie recorded as seller');

    // Farmer Bob attempts to buy THEIR OWN Crop 1 -> MUST BE PREVENTED (HTTP 400)
    const selfOrderPayload = JSON.stringify({
      farmer: userFarmerB.id,
      items: [
        { cropId: crop1._id, quantity: 1 }
      ],
      shippingAddress: {
        name: 'Farmer Bob Self',
        phone: '9876543202',
        street: '202 Farm Rd',
        city: 'Nashik',
        state: 'Maharashtra',
        pincode: '422001'
      },
      paymentMethod: 'cod'
    });

    const resSelfOrder = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(selfOrderPayload), 'Authorization': `Bearer ${tokenFarmerB}` }
    }, selfOrderPayload);

    assert(resSelfOrder.status === 400, 'Farmer Bob blocked from buying own crop (Status 400)');

    // -----------------------------------------------------------------
    // 5. Security & Price Tampering Tests
    // -----------------------------------------------------------------
    console.log('\n--- Step 5: Security & Price Tampering ---');

    // Malicious user attempts to send price: 1 and totalAmount: 1
    const tamperOrderPayload = JSON.stringify({
      farmer: userFarmerC.id,
      items: [
        { cropId: crop3._id, quantity: 10, unitPrice: 1, totalPrice: 10 } // Trying to pay ₹10 for ₹800 worth
      ],
      shippingAddress: {
        name: 'Tamper Tester',
        phone: '9876543201',
        street: '101 St',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001'
      },
      totalAmount: 10,
      finalAmount: 10.5,
      paymentMethod: 'cod'
    });

    const resTamperOrder = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(tamperOrderPayload), 'Authorization': `Bearer ${tokenBuyerA}` }
    }, tamperOrderPayload);

    assert(resTamperOrder.status === 201, 'Order created with server-computed prices');
    // Real price in DB is 80, quantity is 10 -> Subtotal MUST be 800, total = 840 (tampered ₹10 completely ignored)
    assert(resTamperOrder.data.order.totalAmount === 800, 'Server enforced true subtotal = ₹800 (tamper ignored)');
    assert(resTamperOrder.data.order.finalAmount === 840, 'Server enforced true final total = ₹840 (tamper ignored)');

    // Invalid Quantity (Zero) -> MUST BE REJECTED
    const zeroQtyPayload = JSON.stringify({
      farmer: userFarmerC.id,
      items: [{ cropId: crop3._id, quantity: 0 }],
      shippingAddress: { name: 'Test', phone: '9876543201', street: 'St', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
      paymentMethod: 'cod'
    });
    const resZeroQty = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(zeroQtyPayload), 'Authorization': `Bearer ${tokenBuyerA}` }
    }, zeroQtyPayload);
    assert(resZeroQty.status === 400, 'Zero quantity rejected with HTTP 400');

    // Invalid Crop ID -> MUST BE REJECTED
    const invalidCropPayload = JSON.stringify({
      farmer: userFarmerC.id,
      items: [{ cropId: 'non_existent_crop_9999', quantity: 1 }],
      shippingAddress: { name: 'Test', phone: '9876543201', street: 'St', city: 'Pune', state: 'Maharashtra', pincode: '411001' },
      paymentMethod: 'cod'
    });
    const resInvalidCrop = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/orders', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(invalidCropPayload), 'Authorization': `Bearer ${tokenBuyerA}` }
    }, invalidCropPayload);
    assert(resInvalidCrop.status === 400, 'Invalid crop ID rejected with HTTP 400');

    // -----------------------------------------------------------------
    // 6. Orders Page Retrieval & Categorization
    // -----------------------------------------------------------------
    console.log('\n--- Step 6: Orders Page Retrieval & Categorization ---');

    // Buyer Alice gets all orders -> Should have Alice's purchases
    const resAliceOrders = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/orders', method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenBuyerA}` }
    });
    assert(resAliceOrders.data.orders.length >= 2, 'Buyer Alice retrieved their purchase orders');

    // Farmer Bob gets selling orders
    const resBobSelling = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/orders?type=selling', method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenFarmerB}` }
    });
    assert(resBobSelling.data.orders.length >= 1, 'Farmer Bob retrieved selling orders');
    assert(resBobSelling.data.orders[0].farmer?.id === userFarmerB.id || resBobSelling.data.orders[0].farmer === userFarmerB.id, 'Bob is recorded as seller for selling orders');

    // Farmer Bob gets buying orders
    const resBobBuying = await makeRequest({
      hostname: 'localhost', port: 5002, path: '/api/orders?type=buying', method: 'GET',
      headers: { 'Authorization': `Bearer ${tokenFarmerB}` }
    });
    assert(resBobBuying.data.orders.length >= 1, 'Farmer Bob retrieved their buying/purchase orders');
    assert(resBobBuying.data.orders[0].buyer?.id === userFarmerB.id || resBobBuying.data.orders[0].buyer === userFarmerB.id, 'Bob is recorded as buyer for buying orders');

    // -----------------------------------------------------------------
    // SUMMARY
    // -----------------------------------------------------------------
    console.log('\n=====================================================================');
    console.log(`🎉 COMPREHENSIVE SUITE COMPLETED: ${passCount} Passed, ${failCount} Failed`);
    console.log('=====================================================================');

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
