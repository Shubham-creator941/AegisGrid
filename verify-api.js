const http = require('http');

function post(url, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname, port: u.port, path: u.pathname,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(d) }));
    });
    req.on('error', reject);
    req.write(data); req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname, port: u.port, path: u.pathname,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    }, res => {
      let d = ''; res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, body: d }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  const BASE = 'http://localhost:3001';

  // 1. Login
  console.log('=== POST /api/v1/auth/login ===');
  const login = await post(`${BASE}/api/v1/auth/login`, { email: 'admin@aegis.gov', password: 'admin' });
  console.log('STATUS:', login.status);
  console.log('SUCCESS:', login.body.success);
  const token = login.body.data?.access_token;
  console.log('TOKEN:', token ? token.substring(0, 20) + '...' : 'NONE');
  console.log();

  if (!token) { console.log('FATAL: No token. Aborting.'); process.exit(1); }

  // 2. Test endpoints
  const endpoints = [
    '/api/v1/events',
    '/api/v1/suppliers',
    '/api/v1/facilities',
    '/api/v1/corridors',
    '/api/v1/supply-flows',
  ];

  for (const ep of endpoints) {
    console.log(`=== GET ${ep} ===`);
    const res = await get(`${BASE}${ep}`, token);
    console.log('STATUS:', res.status);
    if (res.status === 200) {
      const data = res.body.data || res.body;
      console.log('DATA:', Array.isArray(data) ? `Array(${data.length})` : JSON.stringify(data).substring(0, 100));
    } else {
      console.log('BODY:', JSON.stringify(res.body).substring(0, 200));
    }
    console.log();
  }

  console.log('=== ALL ENDPOINT TESTS COMPLETE ===');
}

main().catch(e => { console.error('Error:', e); process.exit(1); });
