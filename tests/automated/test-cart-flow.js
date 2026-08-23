/**
 * Automated Test Suite for Cart Data Flow & Farmer Grouping
 */

console.log('=====================================================================');
console.log('🛒 TESTING CART DATA FLOW, FARMER GROUPING & PERSISTENCE');
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

// Simulation of CartContext logic
class MockCartService {
  constructor() {
    this.cartItems = [];
  }

  loadFromStorage(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        this.cartItems = parsed.filter(item => item && item.crop && item.crop._id && item.quantity > 0);
      } else {
        this.cartItems = [];
      }
    } catch (e) {
      this.cartItems = [];
    }
  }

  saveToStorage() {
    return JSON.stringify(this.cartItems);
  }

  addToCart(crop, quantity = 1) {
    if (!crop || !crop._id) return;
    const addQty = Math.max(1, Number(quantity) || 1);
    const existingIndex = this.cartItems.findIndex(item => item.crop._id === crop._id);

    if (existingIndex > -1) {
      const newQty = this.cartItems[existingIndex].quantity + addQty;
      const maxVal = crop.quantity?.value;
      if (maxVal && newQty > maxVal) {
        return { success: false, message: `Only ${maxVal} available` };
      }
      this.cartItems[existingIndex].quantity = newQty;
      return { success: true, action: 'updated' };
    } else {
      const maxVal = crop.quantity?.value;
      if (maxVal && addQty > maxVal) {
        return { success: false, message: `Only ${maxVal} available` };
      }
      this.cartItems.push({ crop, quantity: addQty });
      return { success: true, action: 'added' };
    }
  }

  updateQuantity(cropId, quantity) {
    const numQty = Number(quantity);
    if (numQty <= 0) {
      this.removeFromCart(cropId);
      return;
    }
    const item = this.cartItems.find(i => i.crop._id === cropId);
    if (item) {
      item.quantity = numQty;
    }
  }

  removeFromCart(cropId) {
    this.cartItems = this.cartItems.filter(i => i.crop._id !== cropId);
  }

  clearCart() {
    this.cartItems = [];
  }

  getCartTotal() {
    return this.cartItems.reduce((total, item) => {
      const price = Number(item?.crop?.price?.perUnit) || 0;
      const qty = Number(item?.quantity) || 0;
      return total + (price * qty);
    }, 0);
  }

  getCartItemsCount() {
    return this.cartItems.reduce((total, item) => total + (Number(item?.quantity) || 0), 0);
  }

  getCartItemsByFarmer() {
    const farmersMap = new Map();
    
    this.cartItems.forEach(item => {
      if (!item || !item.crop) return;
      const farmerObj = typeof item.crop.farmer === 'object' && item.crop.farmer !== null ? item.crop.farmer : null;
      const farmerId = farmerObj?._id || farmerObj?.id || (typeof item.crop.farmer === 'string' ? item.crop.farmer : 'unknown');
      const farmerName = farmerObj?.name || 'Verified Farmer';

      if (!farmersMap.has(farmerId)) {
        farmersMap.set(farmerId, {
          farmerId,
          farmer: farmerObj || { id: farmerId, _id: farmerId, name: farmerName },
          farmerName,
          items: []
        });
      }
      farmersMap.get(farmerId).items.push(item);
    });
    
    return Array.from(farmersMap.values());
  }
}

// -------------------------------------------------------------
// Sample Crop Fixtures
// -------------------------------------------------------------
const crop1 = {
  _id: 'crop_tomato_1',
  name: 'Organic Tomatoes',
  farmer: { _id: 'farmer_ramesh', name: 'Ramesh Patel' },
  price: { perUnit: 40, currency: 'INR' },
  quantity: { value: 50, unit: 'kg' },
  images: [{ url: 'https://example.com/tomato.jpg' }]
};

const crop2 = {
  _id: 'crop_wheat_2',
  name: 'Sharbati Wheat',
  farmer: { _id: 'farmer_ramesh', name: 'Ramesh Patel' },
  price: { perUnit: 35, currency: 'INR' },
  quantity: { value: 200, unit: 'kg' },
  images: [{ url: 'https://example.com/wheat.jpg' }]
};

const crop3 = {
  _id: 'crop_apple_3',
  name: 'Kashmiri Apples',
  farmer: { _id: 'farmer_tariq', name: 'Tariq Ahmad' },
  price: { perUnit: 120, currency: 'INR' },
  quantity: { value: 80, unit: 'kg' },
  images: [{ url: 'https://example.com/apple.jpg' }]
};

// -------------------------------------------------------------
// RUN TESTS
// -------------------------------------------------------------

console.log('--- TEST 1: Initial Empty Cart State ---');
const cart = new MockCartService();
assert(cart.cartItems.length === 0, '1. Initial cart is empty');
assert(cart.getCartTotal() === 0, 'Initial cart total is 0');
assert(cart.getCartItemsCount() === 0, 'Initial cart count is 0');
const initialGroups = cart.getCartItemsByFarmer();
assert(Array.isArray(initialGroups) && initialGroups.length === 0, 'Initial getCartItemsByFarmer returns empty array');

console.log('\n--- TEST 2: Add 1 Product to Cart ---');
cart.addToCart(crop1, 2);
assert(cart.cartItems.length === 1, '2. One product added to cart');
assert(cart.cartItems[0].crop.name === 'Organic Tomatoes', 'Product name matches');
assert(cart.cartItems[0].quantity === 2, 'Product quantity is 2');
assert(cart.getCartTotal() === 80, 'Cart total is 40 * 2 = 80');

console.log('\n--- TEST 3: Cart.js Rendering Data Contract (.map works without error) ---');
const groups1 = cart.getCartItemsByFarmer();
assert(Array.isArray(groups1), '3. getCartItemsByFarmer returns an Array');
assert(groups1.length === 1, 'Contains 1 farmer group');

// Verify Cart.js mapping loop execution:
let renderedItemsCount = 0;
let renderFailed = false;
try {
  groups1.map(({ farmerId, farmer, farmerName, items }) => {
    assert(typeof farmerId === 'string' && farmerId === 'farmer_ramesh', 'Group has correct farmerId string');
    assert(farmerName === 'Ramesh Patel', 'Group has correct farmerName');
    assert(Array.isArray(items), 'Group items is a valid Array');
    items.map((item) => {
      renderedItemsCount++;
      assert(item.crop._id === 'crop_tomato_1', 'Item inside items.map has correct crop ID');
    });
  });
} catch (err) {
  renderFailed = true;
  console.error('Render mapping failed with error:', err);
}
assert(!renderFailed && renderedItemsCount === 1, 'Cart.js map loop completed without "TypeError: items.map is not a function"');

console.log('\n--- TEST 4: Add Multiple Products (Same and Different Farmers) ---');
cart.addToCart(crop2, 5); // From farmer_ramesh
cart.addToCart(crop3, 3); // From farmer_tariq
assert(cart.cartItems.length === 3, '4. Cart contains 3 unique products');
assert(cart.getCartItemsCount() === 10, 'Total item quantity count is 2 + 5 + 3 = 10');
assert(cart.getCartTotal() === (2 * 40) + (5 * 35) + (3 * 120), 'Total price is correct (80 + 175 + 360 = 615)');

const groupsMulti = cart.getCartItemsByFarmer();
assert(groupsMulti.length === 2, 'Items correctly grouped into 2 distinct farmers');
const rameshGroup = groupsMulti.find(g => g.farmerId === 'farmer_ramesh');
const tariqGroup = groupsMulti.find(g => g.farmerId === 'farmer_tariq');
assert(rameshGroup && rameshGroup.items.length === 2, 'Ramesh group has 2 crops (Tomatoes & Wheat)');
assert(tariqGroup && tariqGroup.items.length === 1, 'Tariq group has 1 crop (Apples)');

console.log('\n--- TEST 5: Increase / Decrease Quantity ---');
cart.updateQuantity('crop_tomato_1', 4);
assert(cart.cartItems.find(i => i.crop._id === 'crop_tomato_1').quantity === 4, '5. Tomato quantity increased to 4');
assert(cart.getCartTotal() === (4 * 40) + (5 * 35) + (3 * 120), 'Total recalculates correctly (695)');

cart.updateQuantity('crop_tomato_1', 1);
assert(cart.cartItems.find(i => i.crop._id === 'crop_tomato_1').quantity === 1, 'Tomato quantity decreased to 1');

console.log('\n--- TEST 6: Remove Product from Cart ---');
cart.removeFromCart('crop_wheat_2');
assert(cart.cartItems.length === 2, '6. Product removed; 2 products remain');
assert(!cart.cartItems.some(i => i.crop._id === 'crop_wheat_2'), 'Removed product is no longer present');

console.log('\n--- TEST 7 & 8: LocalStorage Persistence & Rehydration ---');
const savedData = cart.saveToStorage();
assert(typeof savedData === 'string' && savedData.includes('crop_apple_3'), '7. Cart serialized to localStorage format');

const newSessionCart = new MockCartService();
newSessionCart.loadFromStorage(savedData);
assert(newSessionCart.cartItems.length === 2, '8. Cart rehydrated with 2 products');
assert(newSessionCart.getCartTotal() === (1 * 40) + (3 * 120), 'Rehydrated cart maintains correct total');
const rehydratedGroups = newSessionCart.getCartItemsByFarmer();
assert(rehydratedGroups.length === 2, 'Rehydrated cart groups by farmer correctly');

console.log('\n--- TEST 9, 10, 11: Clear Cart & Empty State Contract ---');
newSessionCart.clearCart();
assert(newSessionCart.cartItems.length === 0, '9. Cart cleared');
assert(newSessionCart.getCartItemsByFarmer().length === 0, '10. Empty cart returns 0 groups');
assert(newSessionCart.getCartTotal() === 0, '11. Empty cart total is 0');

console.log('\n=====================================================================');
console.log(`🎉 CART TEST RUN: ${passCount} Passed, ${failCount} Failed`);
console.log('=====================================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
