const http = require('http');

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const token = JSON.parse(data).data.access_token;
    
    // Now fetch suppliers
    const req2 = http.request({
      hostname: 'localhost',
      port: 3001,
      path: '/api/v1/suppliers',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }, res2 => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => console.log('SUPPLIERS STATUS:', res2.statusCode, 'DATA:', data2.slice(0, 200)));
    });
    req2.end();
  });
});
req.write(JSON.stringify({ email: 'admin@aegis.gov', password: 'admin' }));
req.end();
