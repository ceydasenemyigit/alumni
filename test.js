const http = require('http');
const assert = require('assert');
const app = require('./index');

const server = http.createServer(app);

function get(path) {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    http.get(`http://localhost:${port}${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  server.listen(0, async () => {
    try {
      console.log('--- Running Route Tests ---');

      // Test 1: GET /
      const resRoot = await get('/');
      assert.strictEqual(resRoot.statusCode, 200);
      assert.strictEqual(resRoot.body, 'ok');
      console.log('✓ GET / -> "ok"');

      // Test 2: GET /hello
      const resHello = await get('/hello');
      assert.strictEqual(resHello.statusCode, 200);
      assert.strictEqual(resHello.body, 'Hello, World!');
      console.log('✓ GET /hello -> "Hello, World!"');

      // Test 3: GET /hello/:name
      const resHelloName = await get('/hello/emre');
      assert.strictEqual(resHelloName.statusCode, 200);
      assert.strictEqual(resHelloName.body, 'Hello, Emre!');
      console.log('✓ GET /hello/emre -> "Hello, Emre!"');

      // Test 4: GET /sum/:number1/:number2
      const resSum = await get('/sum/5/3');
      assert.strictEqual(resSum.statusCode, 200);
      assert.strictEqual(resSum.body, '8');
      console.log('✓ GET /sum/5/3 -> "8"');

      const resSumLarge = await get('/sum/25/75');
      assert.strictEqual(resSumLarge.statusCode, 200);
      assert.strictEqual(resSumLarge.body, '100');
      console.log('✓ GET /sum/25/75 -> "100"');

      // Test 5: GET /home (temporary one main page)
      const resHome = await get('/home');
      assert.strictEqual(resHome.statusCode, 200);
      assert.strictEqual(resHome.body, 'temporary one main page');
      console.log('✓ GET /home -> "temporary one main page"');

      // Test 5b: GET /?home
      const resRootHome = await get('/?home');
      assert.strictEqual(resRootHome.statusCode, 200);
      assert.strictEqual(resRootHome.body, 'temporary one main page');
      console.log('✓ GET /?home -> "temporary one main page"');

      // Test 6: GET /about
      const resAbout = await get('/about');
      assert.strictEqual(resAbout.statusCode, 200);
      assert.strictEqual(resAbout.body, 'temp. about page');
      console.log('✓ GET /about -> "temp. about page"');

      console.log('🎉 All endpoint tests passed successfully!');
      server.close(() => process.exit(0));
    } catch (err) {
      console.error('❌ Test failed:', err);
      server.close(() => process.exit(1));
    }
  });
}

runTests();
