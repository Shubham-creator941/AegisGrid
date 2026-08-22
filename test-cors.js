const http = require('http');
const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/suppliers',
  method: 'OPTIONS',
  headers: {
    'Origin': 'http://localhost:5174',
    'Access-Control-Request-Method': 'GET'
  }
}, res => {
  console.log('OPTIONS STATUS:', res.statusCode);
  console.log('HEADERS:', res.headers);
});
req.end();
