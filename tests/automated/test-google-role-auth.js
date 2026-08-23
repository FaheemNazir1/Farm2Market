const http = require('http');

// Mock verifyFirebaseToken for unit testing endpoint logic
const firebaseConfig = require('../../server/config/firebase');
const users = require('../../server/db').users;

const postJSON = (path, data) => {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request({
      hostname: 'localhost',
      port: 5002,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
};

const getAuth = (path, token) => {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: 'localhost',
      port: 5002,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.end();
  });
};

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING GOOGLE AUTH & ROLE SELECTION TEST SUITE');
  console.log('====================================================');

  // Test 1: Existing Email/Password Authentication
  console.log('\n[Test 1] Existing Email/Password Farmer Login');
  const farmerLogin = await postJSON('/api/auth/login', {
    email: 'farmer@test.com',
    password: 'farmer123'
  });
  console.log('  Status:', farmerLogin.status);
  console.log('  User:', farmerLogin.data.user?.name, '| Role:', farmerLogin.data.user?.userType);
  if (farmerLogin.data.user?.userType !== 'farmer') throw new Error('Farmer role mismatch');

  console.log('\n[Test 2] Existing Email/Password Buyer Login');
  const buyerLogin = await postJSON('/api/auth/login', {
    email: 'buyer@test.com',
    password: 'buyer123'
  });
  console.log('  Status:', buyerLogin.status);
  console.log('  User:', buyerLogin.data.user?.name, '| Role:', buyerLogin.data.user?.userType);
  if (buyerLogin.data.user?.userType !== 'buyer') throw new Error('Buyer role mismatch');

  // Test 3: Protected Route with JWT
  console.log('\n[Test 3] Protected Route GET /api/auth/me');
  const meRes = await getAuth('/api/auth/me', farmerLogin.data.token);
  console.log('  Status:', meRes.status);
  console.log('  Email:', meRes.data.user?.email, '| Verified:', meRes.data.user?.isVerified);

  // Test 4: Missing Token Validation
  console.log('\n[Test 4] POST /api/auth/google without idToken');
  const noTokenRes = await postJSON('/api/auth/google', {});
  console.log('  Status:', noTokenRes.status, '(Expected 400)');
  console.log('  Message:', noTokenRes.data.message);
  if (noTokenRes.status !== 400) throw new Error('Should reject missing token with 400');

  // Test 5: Invalid Token Validation
  console.log('\n[Test 5] POST /api/auth/google with invalid idToken');
  const invalidTokenRes = await postJSON('/api/auth/google', { idToken: 'invalid_token_test' });
  console.log('  Status:', invalidTokenRes.status, '(Expected 401)');
  console.log('  Message:', invalidTokenRes.data.message);
  if (invalidTokenRes.status !== 401) throw new Error('Should reject invalid token with 401');

  console.log('\n====================================================');
  console.log('✅ ALL SERVER INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================\n');
}

runTests().catch(err => {
  console.error('\n❌ Test Suite Failed:', err);
  process.exit(1);
});
