const http = require('http');
const assert = require('assert');
const app = require('./index');

const server = http.createServer(app);

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const reqOptions = {
      hostname: 'localhost',
      port: port,
      path: options.path,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    if (postData) {
      if (typeof postData === 'object' && !reqOptions.headers['Content-Type']) {
        postData = JSON.stringify(postData);
        reqOptions.headers['Content-Type'] = 'application/json';
      }
      reqOptions.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data, json });
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  server.listen(0, async () => {
    try {
      console.log('--- Running Complete Route Tests ---');

      // --- Lab 1 Tests ---
      console.log('\n[Lab 1 Routes]');
      const resRoot = await request({ path: '/' });
      assert.strictEqual(resRoot.statusCode, 200);
      assert.strictEqual(resRoot.body, 'ok');
      console.log('✓ GET / -> "ok"');

      const resHello = await request({ path: '/hello' });
      assert.strictEqual(resHello.statusCode, 200);
      assert.strictEqual(resHello.body, 'Hello, World!');
      console.log('✓ GET /hello -> "Hello, World!"');

      const resHelloName = await request({ path: '/hello/emre' });
      assert.strictEqual(resHelloName.statusCode, 200);
      assert.strictEqual(resHelloName.body, 'Hello, Emre!');
      console.log('✓ GET /hello/emre -> "Hello, Emre!"');

      const resSum = await request({ path: '/sum/5/3' });
      assert.strictEqual(resSum.statusCode, 200);
      assert.strictEqual(resSum.body, '8');
      console.log('✓ GET /sum/5/3 -> "8"');

      const resHome = await request({ path: '/home' });
      assert.strictEqual(resHome.statusCode, 200);
      assert.strictEqual(resHome.body, 'temporary one main page');
      console.log('✓ GET /home -> "temporary one main page"');

      const resAbout = await request({ path: '/about' });
      assert.strictEqual(resAbout.statusCode, 200);
      assert.strictEqual(resAbout.body, 'temp. about page');
      console.log('✓ GET /about -> "temp. about page"');

      // --- Lab 2 Tests ---
      console.log('\n[Lab 2 Routes]');

      // 1. GET /api/health
      const resHealth = await request({ path: '/api/health' });
      assert.strictEqual(resHealth.statusCode, 200);
      assert.strictEqual(resHealth.json.status, 'OK');
      assert.ok(resHealth.json.uptime !== undefined);
      assert.ok(resHealth.json.timestamp !== undefined);
      console.log('✓ GET /api/health -> JSON status: OK');

      // 2. GET /api/users (initial list)
      const resUsersInitial = await request({ path: '/api/users' });
      assert.strictEqual(resUsersInitial.statusCode, 200);
      assert.ok(Array.isArray(resUsersInitial.json));
      assert.strictEqual(resUsersInitial.json.length, 2);
      console.log('✓ GET /api/users -> returns initial users array');

      // 3. POST /api/users (JSON format)
      const newUserJson = {
        name: 'Caner Demir',
        email: 'caner@example.com',
        department: 'Industrial Engineering',
        graduationYear: 2025
      };
      const resPostJson = await request({ path: '/api/users', method: 'POST' }, newUserJson);
      assert.strictEqual(resPostJson.statusCode, 201);
      assert.strictEqual(resPostJson.json.name, 'Caner Demir');
      assert.strictEqual(resPostJson.json.id, 3);
      console.log('✓ POST /api/users (JSON) -> 201 Created with id: 3');

      // 3b. POST /api/users (Form URL-encoded format)
      const formPayload = 'name=Selin+Y%C4%B1ld%C4%B1z&email=selin%40example.com&department=Management&graduationYear=2024';
      const resPostForm = await request({
        path: '/api/users',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }, formPayload);
      assert.strictEqual(resPostForm.statusCode, 201);
      assert.strictEqual(resPostForm.json.name, 'Selin Yıldız');
      assert.strictEqual(resPostForm.json.id, 4);
      console.log('✓ POST /api/users (Form URL-Encoded) -> 201 Created with id: 4');

      // 4. GET /api/users/:id
      const resGetUser = await request({ path: '/api/users/3' });
      assert.strictEqual(resGetUser.statusCode, 200);
      assert.strictEqual(resGetUser.json.name, 'Caner Demir');
      console.log('✓ GET /api/users/3 -> returns Caner Demir');

      // 5. PUT /api/users/:id (Full update)
      const putData = {
        name: 'Caner Demir Updated',
        email: 'caner.new@example.com',
        department: 'Computer Science',
        graduationYear: 2025
      };
      const resPut = await request({ path: '/api/users/3', method: 'PUT' }, putData);
      assert.strictEqual(resPut.statusCode, 200);
      assert.strictEqual(resPut.json.name, 'Caner Demir Updated');
      assert.strictEqual(resPut.json.email, 'caner.new@example.com');
      assert.strictEqual(resPut.json.department, 'Computer Science');
      console.log('✓ PUT /api/users/3 -> updated user successfully');

      // 6. PATCH /api/users/:id (Partial update)
      const patchData = {
        department: 'Artificial Intelligence'
      };
      const resPatch = await request({ path: '/api/users/3', method: 'PATCH' }, patchData);
      assert.strictEqual(resPatch.statusCode, 200);
      assert.strictEqual(resPatch.json.department, 'Artificial Intelligence');
      assert.strictEqual(resPatch.json.name, 'Caner Demir Updated'); // unchanged field
      console.log('✓ PATCH /api/users/3 -> partially updated department');

      // 7. DELETE /api/users/:id
      const resDelete = await request({ path: '/api/users/3', method: 'DELETE' });
      assert.strictEqual(resDelete.statusCode, 200);
      assert.strictEqual(resDelete.json.user.id, 3);
      console.log('✓ DELETE /api/users/3 -> deleted user 3');

      // Verify deletion
      const resGetDeleted = await request({ path: '/api/users/3' });
      assert.strictEqual(resGetDeleted.statusCode, 404);
      console.log('✓ GET /api/users/3 -> 404 Not Found after deletion');

      // 8. GET /api/swagger.json & GET /api/swagger
      const resSwaggerJson = await request({ path: '/api/swagger.json' });
      assert.strictEqual(resSwaggerJson.statusCode, 200);
      assert.strictEqual(resSwaggerJson.json.openapi, '3.0.3');
      console.log('✓ GET /api/swagger.json -> returns valid OpenAPI 3.0 spec');

      const resSwaggerUI = await request({ path: '/api/swagger/' });
      assert.strictEqual(resSwaggerUI.statusCode, 200);
      assert.ok(resSwaggerUI.body.includes('Swagger UI') || resSwaggerUI.body.includes('swagger-ui'));
      console.log('✓ GET /api/swagger/ -> serves Swagger UI HTML');

      console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! (15/15 assertions)\n');
      server.close(() => process.exit(0));
    } catch (err) {
      console.error('\n❌ Test failed:', err);
      server.close(() => process.exit(1));
    }
  });
}

runTests();
