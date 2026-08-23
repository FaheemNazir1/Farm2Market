const http = require('http');

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
      res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
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

async function testAll() {
  console.log('--- Testing Existing Email/Password Login ---');
  const loginRes = await postJSON('/api/auth/login', {
    email: 'farmer@test.com',
    password: 'farmer123'
  });
  console.log('Login Status:', loginRes.status);
  console.log('Login Success:', loginRes.data.success, '| User:', loginRes.data.user?.name);

  console.log('\n--- Testing Protected Route /api/auth/me ---');
  const meRes = await getAuth('/api/auth/me', loginRes.data.token);
  console.log('Me Status:', meRes.status);
  console.log('Me User Email:', meRes.data.user?.email, '| UserType:', meRes.data.user?.userType);

  console.log('\n--- Testing POST /api/auth/google (Missing Token) ---');
  const googleMissingRes = await postJSON('/api/auth/google', {});
  console.log('Google Missing Status:', googleMissingRes.status, '(Expected 400)');
  console.log('Google Missing Message:', googleMissingRes.data.message);

  console.log('\n--- Testing POST /api/auth/google (Invalid Token) ---');
  const googleInvalidRes = await postJSON('/api/auth/google', { idToken: 'invalid_mock_token_12345' });
  console.log('Google Invalid Status:', googleInvalidRes.status, '(Expected 401)');
  console.log('Google Invalid Message:', googleInvalidRes.data.message);

  console.log('\nAll API tests completed successfully!');
}

testAll().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
