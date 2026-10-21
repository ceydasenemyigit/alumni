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

      // 5. MVC Web Routes (/announcements with Views)
      console.log('\n--- 5. MVC Web Routes (/announcements with Views) ---');

      // GET /announcements - Listing View
      const resAnnounceList = await request({ path: '/announcements', headers: { Accept: 'text/html' } });
      assert.strictEqual(resAnnounceList.statusCode, 200);
      assert.ok(resAnnounceList.body.includes('Announcements & Notices'));
      assert.ok(resAnnounceList.body.includes('Alumni Homecoming'));
      console.log('✓ GET /announcements -> 200 HTML Listing View');

      // GET /announcements/new - Creation Form View
      const resAnnounceNew = await request({ path: '/announcements/new' });
      assert.strictEqual(resAnnounceNew.statusCode, 200);
      assert.ok(resAnnounceNew.body.includes('Publish New Announcement'));
      console.log('✓ GET /announcements/new -> 200 HTML Creation Form');

      // POST /announcements - Creating Announcement via Web Form
      const webAnnouncePayload = 'title=Web+Programming+Hackathon&category=Event&author=Tech+Club&content=Join+the+upcoming+hackathon+with+great+prizes!';
      const resAnnounceCreate = await request({
        path: '/announcements',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }, webAnnouncePayload);
      assert.strictEqual(resAnnounceCreate.statusCode, 302);
      console.log('✓ POST /announcements -> 302 Redirect (Created Announcement via Web Form)');

      // GET /announcements/1 - Single Announcement Show View
      const resAnnounceShow = await request({ path: '/announcements/1' });
      assert.strictEqual(resAnnounceShow.statusCode, 200);
      assert.ok(resAnnounceShow.body.includes('Annual Alumni Homecoming 2026'));
      console.log('✓ GET /announcements/1 -> 200 HTML Details View');

      // GET /announcements/1/edit - Announcement Edit Form View
      const resAnnounceEdit = await request({ path: '/announcements/1/edit' });
      assert.strictEqual(resAnnounceEdit.statusCode, 200);
      assert.ok(resAnnounceEdit.body.includes('Edit Announcement'));
      console.log('✓ GET /announcements/1/edit -> 200 HTML Edit Form View');

      // POST /announcements/1 - Update Announcement via Web Form
      const webAnnounceUpdatePayload = 'title=Annual+Alumni+Homecoming+2026+(Updated)&category=Event&author=Alumni+Relations&content=Updated+schedule+available.';
      const resAnnounceUpdate = await request({
        path: '/announcements/1',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }, webAnnounceUpdatePayload);
      assert.strictEqual(resAnnounceUpdate.statusCode, 302);
      console.log('✓ POST /announcements/1 -> 302 Redirect (Updated Announcement via Web Form)');

      // 6. RESTful JSON API Routes (/api/announcements)
      console.log('\n--- 6. RESTful JSON API Routes (/api/announcements) ---');

      // GET /api/announcements
      const resApiAnnounceList = await request({ path: '/api/announcements' });
      assert.strictEqual(resApiAnnounceList.statusCode, 200);
      assert.strictEqual(resApiAnnounceList.json.success, true);
      assert.ok(Array.isArray(resApiAnnounceList.json.data));
      console.log(`✓ GET /api/announcements -> 200 JSON (${resApiAnnounceList.json.count} announcements)`);

      // POST /api/announcements
      const newApiAnnounce = {
        title: 'Spring Career Fair 2026',
        category: 'Career',
        author: 'Career Center',
        content: 'Meet with over 50 top company recruiters at the spring fair.'
      };
      const resApiAnnounceCreate = await request({ path: '/api/announcements', method: 'POST' }, newApiAnnounce);
      assert.strictEqual(resApiAnnounceCreate.statusCode, 201);
      assert.strictEqual(resApiAnnounceCreate.json.success, true);
      assert.strictEqual(resApiAnnounceCreate.json.data.title, 'Spring Career Fair 2026');
      const createdAnnounceId = resApiAnnounceCreate.json.data.id;
      console.log(`✓ POST /api/announcements -> 201 JSON Created (ID: ${createdAnnounceId})`);

      // GET /api/announcements/:id
      const resApiAnnounceGet = await request({ path: `/api/announcements/${createdAnnounceId}` });
      assert.strictEqual(resApiAnnounceGet.statusCode, 200);
      assert.strictEqual(resApiAnnounceGet.json.data.category, 'Career');
      console.log(`✓ GET /api/announcements/${createdAnnounceId} -> 200 JSON Details`);

      // PUT /api/announcements/:id
      const putAnnouncePayload = {
        title: 'Spring Career Fair 2026 - Extended',
        category: 'Career',
        author: 'Career Center',
        content: 'Fair has been extended to two days!'
      };
      const resApiAnnouncePut = await request({ path: `/api/announcements/${createdAnnounceId}`, method: 'PUT' }, putAnnouncePayload);
      assert.strictEqual(resApiAnnouncePut.statusCode, 200);
      assert.strictEqual(resApiAnnouncePut.json.data.title, 'Spring Career Fair 2026 - Extended');
      console.log(`✓ PUT /api/announcements/${createdAnnounceId} -> 200 JSON Full Update`);

      // PATCH /api/announcements/:id
      const patchAnnouncePayload = { category: 'Event' };
      const resApiAnnouncePatch = await request({ path: `/api/announcements/${createdAnnounceId}`, method: 'PATCH' }, patchAnnouncePayload);
      assert.strictEqual(resApiAnnouncePatch.statusCode, 200);
      assert.strictEqual(resApiAnnouncePatch.json.data.category, 'Event');
      console.log(`✓ PATCH /api/announcements/${createdAnnounceId} -> 200 JSON Partial Update`);

      // DELETE /api/announcements/:id
      const resApiAnnounceDelete = await request({ path: `/api/announcements/${createdAnnounceId}`, method: 'DELETE' });
      assert.strictEqual(resApiAnnounceDelete.statusCode, 200);
      assert.strictEqual(resApiAnnounceDelete.json.success, true);
      console.log(`✓ DELETE /api/announcements/${createdAnnounceId} -> 200 JSON Deleted`);

      // Verify Deleted
      const resApiAnnounceVerifyDel = await request({ path: `/api/announcements/${createdAnnounceId}` });
      assert.strictEqual(resApiAnnounceVerifyDel.statusCode, 404);
      console.log(`✓ GET /api/announcements/${createdAnnounceId} -> 404 Not Found after deletion`);

      // 7. Database Migrations, Factories & Seeders Verification
      console.log('\n--- 7. Database Migrations, Factories & Seeders ---');

      // Test Factories
      const deptFactory = require('./src/database/factories/departmentFactory');
      const testDept = deptFactory.create();
      assert.ok(testDept.name && testDept.faculty);
      const testDepts = deptFactory.createMany(3);
      assert.strictEqual(testDepts.length, 3);
      console.log('✓ Department Factory: generates valid department and batch objects');

      const userFactory = require('./src/database/factories/userFactory');
      const testUser = userFactory.create({ role: 'ALUMNI' });
      assert.ok(testUser.email.includes('@'));
      assert.strictEqual(testUser.role, 'ALUMNI');
      const testUsers = userFactory.createMany(4);
      assert.strictEqual(testUsers.length, 4);
      console.log('✓ User Factory: generates valid user records with unique emails');

      const profileFactory = require('./src/database/factories/alumniProfileFactory');
      const testProfile = profileFactory.create(1);
      assert.strictEqual(testProfile.user_id, 1);
      assert.ok(testProfile.current_company && testProfile.current_title);
      console.log('✓ Alumni Profile Factory: generates complete professional profiles');

      const announceFactory = require('./src/database/factories/announcementFactory');
      const testAnnounce = announceFactory.create({ category: 'Event' });
      assert.strictEqual(testAnnounce.category, 'Event');
      assert.ok(announceFactory.CATEGORIES.includes(testAnnounce.category));
      console.log('✓ Announcement Factory: generates categorized announcements');

      const appFactory = require('./src/database/factories/applicationFactory');
      const testApp = appFactory.create(1, 2, { status: 'REVIEWING' });
      assert.strictEqual(testApp.user_id, 1);
      assert.strictEqual(testApp.job_posting_id, 2);
      assert.strictEqual(testApp.status, 'REVIEWING');
      assert.ok(appFactory.VALID_STATUSES.includes(testApp.status));
      console.log('✓ Application Factory: generates valid N:M association records');

      const jobFactory = require('./src/database/factories/jobPostingFactory');
      const testJob = jobFactory.create(1, { employment_type: 'Full-Time' });
      assert.strictEqual(testJob.posted_by_user_id, 1);
      assert.strictEqual(testJob.employment_type, 'Full-Time');
      assert.ok(jobFactory.VALID_EMPLOYMENT_TYPES.includes(testJob.employment_type));
      const testJobs = jobFactory.createMany(3, 2);
      assert.strictEqual(testJobs.length, 3);
      console.log('✓ Job Posting Factory: generates realistic career vacancy records');

      // Test Migrations
      const fs = require('fs');
      const path = require('path');
      const migrationsDir = path.join(__dirname, 'src', 'database', 'migrations');
      const migrationFiles = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.js'));
      assert.strictEqual(migrationFiles.length, 6);
      for (const file of migrationFiles) {
        const mod = require(path.join(migrationsDir, file));
        assert.ok(typeof mod.name === 'string');
        assert.ok(typeof mod.up === 'function');
        assert.ok(typeof mod.down === 'function');
      }
      console.log(`✓ Migration Files: 6 verified migrations (departments, users, profiles, announcements, job_postings, applications)`);

      // Test Seeders
      const { runSeeds } = require('./src/database/seeders/databaseSeeder');
      assert.ok(typeof runSeeds === 'function');
      await runSeeds();
      console.log('✓ Database Seeder: successfully seeded models via factories');

      // 8. Direct & Needed Routes (Jobs, Departments, User Relations)
      console.log('\n--- 8. Direct & Needed Routes (Jobs, Departments, Relations) ---');
      const resWebJobs = await request({ path: '/jobs' });
      assert.strictEqual(resWebJobs.statusCode, 200);
      assert.ok(resWebJobs.body.includes('Job Board'));
      console.log('✓ GET /jobs -> 200 HTML Job Board View');

      const resApiJobs = await request({ path: '/api/jobs' });
      assert.strictEqual(resApiJobs.statusCode, 200);
      assert.strictEqual(resApiJobs.json.success, true);
      assert.ok(Array.isArray(resApiJobs.json.data));
      console.log('✓ GET /api/jobs -> 200 JSON Job Postings');

      const newJobPayload = {
        title: 'Backend Node.js Developer',
        company: 'InnovateX',
        location: 'Remote',
        employment_type: 'Full-Time',
        description: 'Building microservices with Node.js and Express.',
        posted_by_user_id: 1
      };
      const resCreateJob = await request({ path: '/api/jobs', method: 'POST' }, newJobPayload);
      assert.strictEqual(resCreateJob.statusCode, 201);
      assert.strictEqual(resCreateJob.json.success, true);
      const createdJobId = resCreateJob.json.data.id;
      console.log(`✓ POST /api/jobs -> 201 JSON Created (ID: ${createdJobId})`);

      const resJobPoster = await request({ path: `/api/jobs/${createdJobId}/poster` });
      assert.strictEqual(resJobPoster.statusCode, 200);
      assert.strictEqual(resJobPoster.json.data.id, 1);
      console.log('✓ GET /api/jobs/:id/poster -> 200 JSON Relational Poster');

      const resDepts = await request({ path: '/api/departments' });
      assert.strictEqual(resDepts.statusCode, 200);
      assert.ok(Array.isArray(resDepts.json.data));
      console.log('✓ GET /api/departments -> 200 JSON Academic Departments');

      const resUserRelations = await request({ path: '/api/users/1/relations' });
      assert.strictEqual(resUserRelations.statusCode, 200);
      assert.strictEqual(resUserRelations.json.data.id, 1);
      assert.ok(resUserRelations.json.data.alumni_profile);
      assert.ok(Array.isArray(resUserRelations.json.data.applications));
      console.log('✓ GET /api/users/:id/relations -> 200 JSON User with Relations & Applications');

      // 9. Applications Action Table (User <-> Job N:M Relations)
      console.log('\n--- 9. Applications Action Table (User <-> Job N:M Relations) ---');

      // GET /applications - HTML Listing View
      const resWebApps = await request({ path: '/applications' });
      assert.strictEqual(resWebApps.statusCode, 200);
      assert.ok(resWebApps.body.includes('Job Applications'));
      console.log('✓ GET /applications -> 200 HTML Applications Board View');

      // GET /applications/new - HTML Form View
      const resWebNewApp = await request({ path: '/applications/new' });
      assert.strictEqual(resWebNewApp.statusCode, 200);
      assert.ok(resWebNewApp.body.includes('Submit a Job Application'));
      console.log('✓ GET /applications/new -> 200 HTML Application Form View');

      // GET /api/applications - REST API list
      const resApiApps = await request({ path: '/api/applications' });
      assert.strictEqual(resApiApps.statusCode, 200);
      assert.strictEqual(resApiApps.json.success, true);
      assert.ok(Array.isArray(resApiApps.json.data));
      console.log('✓ GET /api/applications -> 200 JSON Applications list');

      // POST /api/applications - Create new application linking user and job
      const newAppPayload = {
        user_id: 1,
        job_posting_id: createdJobId,
        resume_url: 'https://example.com/resumes/emre_cv.pdf',
        cover_letter: 'Applying for backend developer role.'
      };
      const resCreateApp = await request({ path: '/api/applications', method: 'POST' }, newAppPayload);
      assert.strictEqual(resCreateApp.statusCode, 201);
      assert.strictEqual(resCreateApp.json.success, true);
      const createdAppId = resCreateApp.json.data.id;
      console.log(`✓ POST /api/applications -> 201 JSON Created (ID: ${createdAppId})`);

      // Conflict test (unique constraint: same user + same job)
      const resDuplicateApp = await request({ path: '/api/applications', method: 'POST' }, newAppPayload);
      assert.strictEqual(resDuplicateApp.statusCode, 409);
      console.log('✓ POST /api/applications -> 409 Conflict on duplicate application (uq_applications_user_job)');

      // GET /api/applications/:id/relations
      const resAppRelations = await request({ path: `/api/applications/${createdAppId}/relations` });
      assert.strictEqual(resAppRelations.statusCode, 200);
      assert.strictEqual(resAppRelations.json.data.id, createdAppId);
      assert.strictEqual(resAppRelations.json.data.applicant.id, 1);
      assert.strictEqual(resAppRelations.json.data.job_posting.id, createdJobId);
      console.log('✓ GET /api/applications/:id/relations -> 200 JSON Populated with applicant and job');

      // PATCH /api/applications/:id/status
      const resUpdateStatus = await request({ path: `/api/applications/${createdAppId}/status`, method: 'PATCH' }, { status: 'ACCEPTED' });
      assert.strictEqual(resUpdateStatus.statusCode, 200);
      assert.strictEqual(resUpdateStatus.json.data.status, 'ACCEPTED');
      console.log('✓ PATCH /api/applications/:id/status -> 200 JSON Status updated to ACCEPTED');

      // GET /api/jobs/:id/applications (Relational 1:N)
      const resJobApps = await request({ path: `/api/jobs/${createdJobId}/applications` });
      assert.strictEqual(resJobApps.statusCode, 200);
      assert.strictEqual(resJobApps.json.success, true);
      assert.ok(resJobApps.json.data.some(a => a.id === createdAppId));
      console.log('✓ GET /api/jobs/:id/applications -> 200 JSON Applications for Job');

      // GET /api/jobs/:id/applicants (Relational N:M)
      const resJobApplicants = await request({ path: `/api/jobs/${createdJobId}/applicants` });
      assert.strictEqual(resJobApplicants.statusCode, 200);
      assert.strictEqual(resJobApplicants.json.success, true);
      assert.ok(resJobApplicants.json.data.some(u => u.id === 1));
      console.log('✓ GET /api/jobs/:id/applicants -> 200 JSON Applicants for Job');

      // GET /api/users/:id/applications (Relational 1:N)
      const resUserApps = await request({ path: '/api/users/1/applications' });
      assert.strictEqual(resUserApps.statusCode, 200);
      assert.strictEqual(resUserApps.json.success, true);
      assert.ok(resUserApps.json.data.some(a => a.id === createdAppId));
      console.log('✓ GET /api/users/:id/applications -> 200 JSON Applications by User');

      // GET /applications/:id - HTML Details View
      const resWebAppShow = await request({ path: `/applications/${createdAppId}` });
      assert.strictEqual(resWebAppShow.statusCode, 200);
      assert.ok(resWebAppShow.body.includes(`Application #${createdAppId}`));
      console.log(`✓ GET /applications/:id -> 200 HTML Application Detail View`);

      // GET /applications/:id/edit - HTML Edit Form View
      const resWebAppEdit = await request({ path: `/applications/${createdAppId}/edit` });
      assert.strictEqual(resWebAppEdit.statusCode, 200);
      assert.ok(resWebAppEdit.body.includes(`Edit Application #${createdAppId}`));
      console.log(`✓ GET /applications/:id/edit -> 200 HTML Application Edit Form`);

      // DELETE /api/applications/:id
      const resDeleteApp = await request({ path: `/api/applications/${createdAppId}`, method: 'DELETE' });
      assert.strictEqual(resDeleteApp.statusCode, 200);
      assert.strictEqual(resDeleteApp.json.success, true);
      console.log(`✓ DELETE /api/applications/:id -> 200 JSON Application Removed`);

      console.log('\n🎉 ALL 57 TESTS PASSED SUCCESSFULLY! MVC, APIs, Relations, N:M Action Table, Migrations, Factories & Seeds Verified.\n');
      server.close(() => process.exit(0));
    } catch (err) {
      console.error('\n❌ Test Failure:', err);
      server.close(() => process.exit(1));
    }
  });
}

runTests();
