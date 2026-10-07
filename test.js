const http = require('http');
const assert = require('assert');
const app = require('./src/app');

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
      console.log('=== RUNNING COMPLETE MVC & API TEST SUITE ===\n');

      // 1. Basic Introductory Routes
      console.log('--- 1. Introductory Routes ---');
      const resHello = await request({ path: '/hello' });
      assert.strictEqual(resHello.statusCode, 200);
      assert.strictEqual(resHello.body, 'Hello World');
      console.log('✓ GET /hello -> "Hello World"');

      const resHelloName = await request({ path: '/hello/emre' });
      assert.strictEqual(resHelloName.statusCode, 200);
      assert.strictEqual(resHelloName.body, 'Hello Emre!');
      console.log('✓ GET /hello/emre -> "Hello Emre!"');

      const resSum = await request({ path: '/sum/3/5' });
      assert.strictEqual(resSum.statusCode, 200);
      assert.strictEqual(resSum.body, 'toplam= 8');
      console.log('✓ GET /sum/3/5 -> "toplam= 8"');

      const resSumBad = await request({ path: '/sum/abc/5' });
      assert.strictEqual(resSumBad.statusCode, 400);
      console.log('✓ GET /sum/abc/5 -> 400 Bad Request');

      // 2. Health & Swagger
      console.log('\n--- 2. System Health & Swagger ---');
      const resHealth = await request({ path: '/api/health' });
      assert.strictEqual(resHealth.statusCode, 200);
      assert.strictEqual(resHealth.json.status, 'UP');
      assert.ok(resHealth.json.uptime !== undefined);
      console.log('✓ GET /api/health -> status "UP"');

      const resSwaggerJson = await request({ path: '/api/swagger.json' });
      assert.strictEqual(resSwaggerJson.statusCode, 200);
      assert.ok(resSwaggerJson.json.openapi.includes('3.0'));
      console.log('✓ GET /api/swagger.json -> OpenAPI 3.0.3 valid spec');

      // 3. MVC Web Routes (/users with Views)
      console.log('\n--- 3. MVC Web Routes (/users with Views) ---');

      // GET /users - Listing View
      const resWebList = await request({ path: '/users', headers: { Accept: 'text/html' } });
      assert.strictEqual(resWebList.statusCode, 200);
      assert.ok(resWebList.body.includes('Alumni Users') || resWebList.body.includes('Alumni User Directory'));
      assert.ok(resWebList.body.includes('Emre'));
      console.log('✓ GET /users -> 200 HTML Listing View');

      // GET /users/new - Creation Form View
      const resWebNew = await request({ path: '/users/new' });
      assert.strictEqual(resWebNew.statusCode, 200);
      assert.ok(resWebNew.body.includes('Register New User'));
      console.log('✓ GET /users/new -> 200 HTML Creation Form');

      // POST /users - Creating User via Web Form
      const webFormPayload = 'first_name=Mehmet&last_name=Oz&email=mehmet%40example.com&role=ALUMNI&department=Civil+Eng&graduation_year=2021';
      const resWebCreate = await request({
        path: '/users',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }, webFormPayload);
      assert.strictEqual(resWebCreate.statusCode, 302); // Redirects to /users/:id
      console.log('✓ POST /users -> 302 Redirect (Created User via Web Form)');

      // GET /users/1 - Single User Show View
      const resWebShow = await request({ path: '/users/1' });
      assert.strictEqual(resWebShow.statusCode, 200);
      assert.ok(resWebShow.body.includes('Emre Yılmaz'));
      console.log('✓ GET /users/1 -> 200 HTML Profile View');

      // GET /users/1/edit - User Edit Form View
      const resWebEdit = await request({ path: '/users/1/edit' });
      assert.strictEqual(resWebEdit.statusCode, 200);
      assert.ok(resWebEdit.body.includes('Edit User'));
      console.log('✓ GET /users/1/edit -> 200 HTML Edit Form View');

      // POST /users/1 - Update User via Web Form
      const webUpdatePayload = 'first_name=Emre&last_name=Yilmaz+Updated&email=emre%40example.com&role=ALUMNI';
      const resWebUpdate = await request({
        path: '/users/1',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }, webUpdatePayload);
      assert.strictEqual(resWebUpdate.statusCode, 302);
      console.log('✓ POST /users/1 -> 302 Redirect (Updated User via Web Form)');

      // 4. RESTful JSON API Routes (/api/users)
      console.log('\n--- 4. RESTful JSON API Routes (/api/users) ---');

      // GET /api/users
      const resApiList = await request({ path: '/api/users' });
      assert.strictEqual(resApiList.statusCode, 200);
      assert.strictEqual(resApiList.json.success, true);
      assert.ok(Array.isArray(resApiList.json.data));
      console.log(`✓ GET /api/users -> 200 JSON (${resApiList.json.count} users)`);

      // POST /api/users
      const newApiUser = {
        name: 'Burak Demir',
        email: 'burak@example.com',
        role: 'STUDENT',
        department: 'Electrical Engineering',
        graduation_year: 2026
      };
      const resApiCreate = await request({ path: '/api/users', method: 'POST' }, newApiUser);
      assert.strictEqual(resApiCreate.statusCode, 201);
      assert.strictEqual(resApiCreate.json.success, true);
      assert.strictEqual(resApiCreate.json.data.email, 'burak@example.com');
      const createdId = resApiCreate.json.data.id;
      console.log(`✓ POST /api/users -> 201 JSON Created (ID: ${createdId})`);

      // GET /api/users/:id
      const resApiGet = await request({ path: `/api/users/${createdId}` });
      assert.strictEqual(resApiGet.statusCode, 200);
      assert.strictEqual(resApiGet.json.data.first_name, 'Burak');
      console.log(`✓ GET /api/users/${createdId} -> 200 JSON Details`);

      // PUT /api/users/:id
      const putPayload = {
        first_name: 'Burak Can',
        last_name: 'Demir',
        email: 'burak.can@example.com',
        role: 'STUDENT'
      };
      const resApiPut = await request({ path: `/api/users/${createdId}`, method: 'PUT' }, putPayload);
      assert.strictEqual(resApiPut.statusCode, 200);
      assert.strictEqual(resApiPut.json.data.first_name, 'Burak Can');
      console.log(`✓ PUT /api/users/${createdId} -> 200 JSON Full Update`);

      // PATCH /api/users/:id
      const patchPayload = { department: 'Robotics' };
      const resApiPatch = await request({ path: `/api/users/${createdId}`, method: 'PATCH' }, patchPayload);
      assert.strictEqual(resApiPatch.statusCode, 200);
      assert.strictEqual(resApiPatch.json.data.department, 'Robotics');
      console.log(`✓ PATCH /api/users/${createdId} -> 200 JSON Partial Update`);

      // DELETE /api/users/:id
      const resApiDelete = await request({ path: `/api/users/${createdId}`, method: 'DELETE' });
      assert.strictEqual(resApiDelete.statusCode, 200);
      assert.strictEqual(resApiDelete.json.success, true);
      console.log(`✓ DELETE /api/users/${createdId} -> 200 JSON Deleted`);

      // Verify Deleted
      const resApiVerifyDel = await request({ path: `/api/users/${createdId}` });
      assert.strictEqual(resApiVerifyDel.statusCode, 404);
      console.log(`✓ GET /api/users/${createdId} -> 404 Not Found after deletion`);

      console.log('\n🎉 ALL 18 TESTS PASSED SUCCESSFULLY! MVC & API Fully Verified.\n');
      server.close(() => process.exit(0));
    } catch (err) {
      console.error('\n❌ Test Failure:', err);
      server.close(() => process.exit(1));
    }
  });
}

runTests();
