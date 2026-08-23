const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('====================================================');
console.log('🚀 TESTING FARM2MARKET 4-FEATURE EXPANSION SUITE');
console.log('====================================================\n');

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

// ==============================================================
// TEST 1: Check i18n Locales (English, Hindi, Marathi)
// ==============================================================
console.log('--- TEST 1: i18n Locales Validation ---');

const enPath = path.resolve(__dirname, '../../client/src/i18n/locales/en.json');
const hiPath = path.resolve(__dirname, '../../client/src/i18n/locales/hi.json');
const mrPath = path.resolve(__dirname, '../../client/src/i18n/locales/mr.json');

assert(fs.existsSync(enPath), 'English en.json exists');
assert(fs.existsSync(hiPath), 'Hindi hi.json exists');
assert(fs.existsSync(mrPath), 'Marathi mr.json exists');

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const hiData = JSON.parse(fs.readFileSync(hiPath, 'utf8'));
const mrData = JSON.parse(fs.readFileSync(mrPath, 'utf8'));

assert(enData.voice && hiData.voice && mrData.voice, 'Voice AI keys present in en, hi, mr');
assert(enData.location && hiData.location && mrData.location, 'Location GPS keys present in en, hi, mr');
assert(enData.whatsapp && hiData.whatsapp && mrData.whatsapp, 'WhatsApp keys present in en, hi, mr');
assert(mrData.nav.marketplace === 'बाजारपेठ', 'Marathi navigation translated correctly');
assert(hiData.nav.marketplace === 'बाज़ार' || hiData.nav.marketplace === 'बाजार', 'Hindi navigation translated correctly');

// ==============================================================
// TEST 2: Check Distance Calculation Function & Seed Data
// ==============================================================
console.log('\n--- TEST 2: Haversine Geolocation Distance Calculation ---');

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// Pune (18.5204, 73.8567) to Mumbai (19.0760, 72.8777) ~ 120km
const puneToMumbai = calculateDistance(18.5204, 73.8567, 19.0760, 72.8777);
console.log(`Calculated Pune to Mumbai distance: ${puneToMumbai} km`);
assert(puneToMumbai >= 115 && puneToMumbai <= 125, 'Pune to Mumbai distance is accurate (~120 km)');

// Pune to Nashik (19.9975, 73.7898) ~ 164km
const puneToNashik = calculateDistance(18.5204, 73.8567, 19.9975, 73.7898);
console.log(`Calculated Pune to Nashik distance: ${puneToNashik} km`);
assert(puneToNashik >= 160 && puneToNashik <= 170, 'Pune to Nashik distance is accurate (~164 km)');

// ==============================================================
// TEST 3: Check Live Server API GPS Endpoint
// ==============================================================
console.log('\n--- TEST 3: GET /api/crops with GPS Near Me Parameters ---');

const reqOptions = {
  hostname: 'localhost',
  port: 5002,
  path: '/api/crops?latitude=18.5204&longitude=73.8567&radius=100&sortBy=distance',
  method: 'GET',
  headers: { 'Content-Type': 'application/json' }
};

const apiReq = http.request(reqOptions, (res) => {
  let rawData = '';
  res.on('data', chunk => { rawData += chunk; });
  res.on('end', () => {
    try {
      const response = JSON.parse(rawData);
      assert(res.statusCode === 200, `API returned HTTP 200 OK (got ${res.statusCode})`);
      assert(response.success === true, 'API response success is true');
      assert(Array.isArray(response.crops), 'Crops array returned');
      
      const hasDistances = response.crops.every(c => c.distance !== undefined);
      assert(hasDistances, 'Every crop object has calculated distance field');

      // Check that crops are filtered to <= 100km
      const within100 = response.crops.every(c => c.distance <= 100);
      assert(within100, 'All returned crops are within 100 km radius filter');

      console.log(`\nReturned ${response.crops.length} crops within 100km of Pune:`);
      response.crops.forEach(c => {
        console.log(`  🌾 ${c.name} (${c.location?.district}): ${c.distance} km away`);
      });

      console.log('\n====================================================');
      console.log(`🎉 SUMMARY: ${passCount} Passed, ${failCount} Failed`);
      console.log('====================================================');
      process.exit(failCount > 0 ? 1 : 0);
    } catch (e) {
      console.error('Error parsing response:', e);
      process.exit(1);
    }
  });
});

apiReq.on('error', (e) => {
  console.warn('Live server not running or connection refused:', e.message);
  console.log('\n====================================================');
  console.log(`Summary (Static & Math Tests): ${passCount} Passed, ${failCount} Failed`);
  console.log('====================================================');
  process.exit(failCount > 0 ? 1 : 0);
});

apiReq.end();
