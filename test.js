const http = require('http');
const assert = require('assert');
const app = require('./src/app');
const { generateToken } = require('./src/middlewares/authMiddleware');

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

      // 10. Guardians, Logger & Validation Rules
      console.log('\n--- 10. Guardians, Logger & Job Posting Validation Rules ---');

      // Rule: Title is required
      const resJobNoTitle = await request({ path: '/api/jobs', method: 'POST' }, { company: 'Acme Corp' });
      assert.strictEqual(resJobNoTitle.statusCode, 400);
      assert.strictEqual(resJobNoTitle.json.success, false);
      assert.ok(resJobNoTitle.json.message.includes('title'));
      console.log('✓ Validation: Job posting rejects missing title (400 Bad Request)');

      // Rule: Title max 120 characters
      const longTitle = 'A'.repeat(121);
      const resJobLongTitle = await request({ path: '/api/jobs', method: 'POST' }, { title: longTitle, company: 'Acme Corp' });
      assert.strictEqual(resJobLongTitle.statusCode, 400);
      assert.strictEqual(resJobLongTitle.json.success, false);
      assert.ok(resJobLongTitle.json.message.includes('120'));
      console.log('✓ Validation: Job posting rejects title exceeding 120 characters (400 Bad Request)');

      // Rule: Company is required
      const resJobNoCompany = await request({ path: '/api/jobs', method: 'POST' }, { title: 'Cloud Engineer' });
      assert.strictEqual(resJobNoCompany.statusCode, 400);
      assert.strictEqual(resJobNoCompany.json.success, false);
      assert.ok(resJobNoCompany.json.message.includes('company') || resJobNoCompany.json.message.includes('Company'));
      console.log('✓ Validation: Job posting rejects missing company (400 Bad Request)');

      // Rule: City and Description are optional
      const resJobOptionalFields = await request({ path: '/api/jobs', method: 'POST' }, {
        title: 'Platform Site Reliability Engineer',
        company: 'CloudSphere Global',
        city: 'Izmir',
        employment_type: 'Remote'
        // description intentionally omitted!
      });
      assert.strictEqual(resJobOptionalFields.statusCode, 201);
      assert.strictEqual(resJobOptionalFields.json.success, true);
      assert.strictEqual(resJobOptionalFields.json.data.location, 'Izmir');
      assert.strictEqual(resJobOptionalFields.json.data.description, null);
      console.log('✓ Validation: Job posting creates successfully with optional city and without description (201 Created)');

      // 404 Guardian: API Route with reason
      const res404Api = await request({ path: '/api/non-existent-endpoint-test' });
      assert.strictEqual(res404Api.statusCode, 404);
      assert.strictEqual(res404Api.json.success, false);
      assert.ok(res404Api.json.reason);
      assert.ok(res404Api.json.reason.includes('does not exist'));
      console.log('✓ 404 Guardian (API): returns 404 JSON with explicit reason');

      // 404 Guardian: Generic 404 Page (HTML)
      const res404Html = await request({ path: '/some-missing-page', headers: { Accept: 'text/html' } });
      assert.strictEqual(res404Html.statusCode, 404);
      assert.ok(res404Html.body.includes('404'));
      assert.ok(res404Html.body.includes('REASON:') || res404Html.body.includes('Page Not Found'));
      console.log('✓ 404 Guardian (Web): renders generic 404 page with reason and navigation');

      // 5xx Guardian & logs/error.logs
      const res500Test = await request({ path: '/api/test/error-500' });
      assert.strictEqual(res500Test.statusCode, 500);
      assert.strictEqual(res500Test.json.status, 500);
      assert.ok(res500Test.json.reason);
      assert.ok(res500Test.json.reason.includes('deadlock') || res500Test.json.message.includes('500'));
      console.log('✓ 5xx Guardian: catches server error and returns structured 500 with reason');

      // Verify logs/error.logs file content
      const errorLogPath = path.join(__dirname, 'logs', 'error.logs');
      assert.ok(fs.existsSync(errorLogPath), 'logs/error.logs must exist');
      const errorLogContent = fs.readFileSync(errorLogPath, 'utf8');
      assert.ok(errorLogContent.includes('Simulated 500 server exception') || errorLogContent.includes('deadlock'));
      console.log('✓ Error Logging: verified error entries successfully written to logs/error.logs');

      // 11. Registration Page & Functionality (/register & /api/auth/register)
      console.log('\n--- 11. Registration Page & Functionality (/register & /api/auth/register) ---');

      // GET /register - HTML Registration Form View
      const resGetRegister = await request({ path: '/register', headers: { Accept: 'text/html' } });
      assert.strictEqual(resGetRegister.statusCode, 200);
      assert.ok(resGetRegister.body.includes('Create Your Account'));
      assert.ok(resGetRegister.body.includes('Alumni Graduate'));
      assert.ok(resGetRegister.body.includes('Current Student'));
      assert.ok(resGetRegister.body.includes('Academic Department'));
      console.log('✓ GET /register -> 200 HTML Registration Page Rendered');

      // POST /register - Fails when terms are not accepted (Web Form)
      const resRegNoTerms = await request({
        path: '/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }, 'first_name=Ali&last_name=Can&email=ali.can%40example.com&password=Secret123&confirm_password=Secret123&role=ALUMNI');
      assert.strictEqual(resRegNoTerms.statusCode, 400);
      assert.ok(resRegNoTerms.body.includes('Terms of Service') || resRegNoTerms.body.includes('Honor Code'));
      console.log('✓ Validation: Web registration rejects missing Terms of Service acceptance (400 Bad Request)');

      // POST /register - Fails when passwords do not match
      const resRegMismatchPass = await request({
        path: '/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }, 'first_name=Ali&last_name=Can&email=ali.can%40example.com&password=Secret123&confirm_password=Different123&terms_accepted=on');
      assert.strictEqual(resRegMismatchPass.statusCode, 400);
      assert.ok(resRegMismatchPass.body.includes('Passwords do not match'));
      console.log('✓ Validation: Web registration rejects mismatched passwords (400 Bad Request)');

      // POST /register - Successful Web Form Registration (creates User and 1:1 Profile)
      const validWebPayload = 'first_name=Sude&last_name=Demir&email=sude.demir%40alumni.istanbul.edu.tr&password=Password123&confirm_password=Password123&role=ALUMNI&department=Computer+Engineering&graduation_year=2024&terms_accepted=on&current_company=Trendyol&current_title=Backend+Engineer';
      const resRegWebSuccess = await request({
        path: '/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }, validWebPayload);
      assert.strictEqual(resRegWebSuccess.statusCode, 302);
      assert.ok(resRegWebSuccess.headers.location.includes('/users/'));
      assert.ok(resRegWebSuccess.headers.location.includes('registered=true'));
      console.log('✓ POST /register -> 302 Redirect to user profile (User & Profile Created)');

      // POST /api/auth/register - REST API Student Registration
      const resRegApiStudent = await request({
        path: '/api/auth/register',
        method: 'POST'
      }, {
        first_name: 'Berk',
        last_name: 'Yilmaz',
        email: 'berk.yilmaz@student.istanbul.edu.tr',
        password: 'SecurePassword123',
        confirm_password: 'SecurePassword123',
        role: 'STUDENT',
        department: 'Software Engineering',
        graduation_year: 2026
      });
      assert.strictEqual(resRegApiStudent.statusCode, 201);
      assert.strictEqual(resRegApiStudent.json.success, true);
      assert.strictEqual(resRegApiStudent.json.data.user.email, 'berk.yilmaz@student.istanbul.edu.tr');
      assert.strictEqual(resRegApiStudent.json.data.user.role, 'STUDENT');
      console.log('✓ POST /api/auth/register -> 201 JSON Student Account Registered');

      // POST /api/auth/register - Duplicate Email Rejection (409 Conflict)
      const resRegApiDuplicate = await request({
        path: '/api/auth/register',
        method: 'POST'
      }, {
        first_name: 'Duplicate',
        last_name: 'User',
        email: 'berk.yilmaz@student.istanbul.edu.tr',
        password: 'Password123456',
        role: 'STUDENT'
      });
      assert.strictEqual(resRegApiDuplicate.statusCode, 409);
      assert.strictEqual(resRegApiDuplicate.json.success, false);
      assert.ok(resRegApiDuplicate.json.message.includes('already registered'));
      console.log('✓ Conflict: API rejects registration with existing email (409 Conflict)');

      // GET /login - Companion Sign In Page
      const resGetLogin = await request({ path: '/login', headers: { Accept: 'text/html' } });
      assert.strictEqual(resGetLogin.statusCode, 200);
      assert.ok(resGetLogin.body.includes('Welcome Back'));
      assert.ok(resGetLogin.body.includes('Register Now'));
      console.log('✓ GET /login -> 200 HTML Sign In Page Rendered');

      // 12. Authentication Lifecycle (Log In, Log Out & Token State)
      console.log('\n--- 12. Authentication Lifecycle (Log In, Log Out & Token State) ---');

      // POST /login - Fails on missing credentials (Web Form)
      const resWebLoginEmpty = await request({
        path: '/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }, 'email=&password=');
      assert.strictEqual(resWebLoginEmpty.statusCode, 400);
      assert.ok(resWebLoginEmpty.body.includes('Please enter both email address and password'));
      console.log('✓ Validation: Web login rejects missing credentials (400 Bad Request)');

      // POST /login - Fails on invalid credentials
      const resWebLoginInvalid = await request({
        path: '/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }, 'email=emre%40example.com&password=WrongPassword999');
      assert.strictEqual(resWebLoginInvalid.statusCode, 401);
      assert.ok(resWebLoginInvalid.body.includes('Invalid email address or password'));
      console.log('✓ Authentication: Web login rejects invalid password (401 Unauthorized)');

      // POST /login - Successful Web Sign In
      const resWebLoginSuccess = await request({
        path: '/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }, 'email=emre%40example.com&password=password');
      assert.strictEqual(resWebLoginSuccess.statusCode, 302);
      assert.ok(resWebLoginSuccess.headers.location.includes('/users/1'));
      assert.ok(resWebLoginSuccess.headers['set-cookie']);
      const webCookie = resWebLoginSuccess.headers['set-cookie'][0];
      assert.ok(webCookie.includes('auth_token='));
      console.log('✓ POST /login -> 302 Redirect & issues HTTP-only auth cookie (Login Successful)');

      // GET /logout - Web Sign Out
      const resWebLogout = await request({ path: '/logout' });
      assert.strictEqual(resWebLogout.statusCode, 302);
      assert.ok(resWebLogout.headers.location.includes('/login?logged_out=true'));
      const clearCookie = resWebLogout.headers['set-cookie'][0];
      assert.ok(clearCookie.includes('auth_token=;') || clearCookie.includes('Max-Age=0'));
      console.log('✓ GET /logout -> 302 Redirect & clears auth cookie (Sign Out Successful)');

      // POST /api/auth/login - REST API Validation
      const resApiLoginEmpty = await request({ path: '/api/auth/login', method: 'POST' }, {});
      assert.strictEqual(resApiLoginEmpty.statusCode, 400);
      assert.strictEqual(resApiLoginEmpty.json.success, false);
      console.log('✓ Validation: API login rejects empty credentials (400 Bad Request)');

      const resApiLoginInvalid = await request({
        path: '/api/auth/login',
        method: 'POST'
      }, { email: 'ceyda@example.com', password: 'incorrect_pass' });
      assert.strictEqual(resApiLoginInvalid.statusCode, 401);
      assert.strictEqual(resApiLoginInvalid.json.success, false);
      console.log('✓ Authentication: API login rejects incorrect credentials (401 Unauthorized)');

      // POST /api/auth/login - REST API Success
      const resApiLoginSuccess = await request({
        path: '/api/auth/login',
        method: 'POST'
      }, { email: 'ceyda@example.com', password: 'password' });
      assert.strictEqual(resApiLoginSuccess.statusCode, 200);
      assert.strictEqual(resApiLoginSuccess.json.success, true);
      assert.ok(resApiLoginSuccess.json.token);
      assert.strictEqual(resApiLoginSuccess.json.user.email, 'ceyda@example.com');
      const apiToken = resApiLoginSuccess.json.token;
      console.log('✓ POST /api/auth/login -> 200 JSON Token & User returned (API Login Successful)');

      // GET /api/auth/me - Protected user verification
      const resMeUnauth = await request({ path: '/api/auth/me' });
      assert.strictEqual(resMeUnauth.statusCode, 401);
      console.log('✓ Protected Route: GET /api/auth/me rejects unauthenticated request (401 Unauthorized)');

      const resMeAuth = await request({
        path: '/api/auth/me',
        headers: { Authorization: `Bearer ${apiToken}` }
      });
      assert.strictEqual(resMeAuth.statusCode, 200);
      assert.strictEqual(resMeAuth.json.success, true);
      assert.strictEqual(resMeAuth.json.user.email, 'ceyda@example.com');
      console.log('✓ Protected Route: GET /api/auth/me returns authenticated user with Bearer token (200 OK)');

      // POST /api/auth/logout - REST API Logout
      const resApiLogout = await request({ path: '/api/auth/logout', method: 'POST' });
      assert.strictEqual(resApiLogout.statusCode, 200);
      assert.strictEqual(resApiLogout.json.success, true);
      assert.ok(resApiLogout.json.message.includes('Logged out'));
      console.log('✓ POST /api/auth/logout -> 200 JSON Sign Out Successful');

      // 13. Auth Middleware & RBAC Route Protection (/api/protected, /api/admin-only)
      console.log('\n--- 13. Auth Middleware & RBAC Route Protection ---');

      // 13.1. Protected API rejects unauthenticated request with structured 401 & reason
      const resProtNoAuth = await request({ path: '/api/protected' });
      assert.strictEqual(resProtNoAuth.statusCode, 401);
      assert.strictEqual(resProtNoAuth.json.success, false);
      assert.strictEqual(resProtNoAuth.json.error, 'Unauthorized');
      assert.ok(resProtNoAuth.json.reason);
      assert.ok(resProtNoAuth.json.reason.includes('Missing, expired, or invalid authentication token'));
      console.log('✓ Auth Middleware: rejects missing token with structured 401 & reason');

      // 13.2. Protected API rejects tampered/invalid token
      const resProtTampered = await request({
        path: '/api/protected',
        headers: { Authorization: 'Bearer invalid.tampered.token.payload' }
      });
      assert.strictEqual(resProtTampered.statusCode, 401);
      assert.strictEqual(resProtTampered.json.error, 'Unauthorized');
      console.log('✓ Auth Middleware: rejects forged/tampered token (401 Unauthorized)');

      // 13.3. Protected API grants access with valid Bearer token
      const resProtBearer = await request({
        path: '/api/protected',
        headers: { Authorization: `Bearer ${apiToken}` }
      });
      assert.strictEqual(resProtBearer.statusCode, 200);
      assert.strictEqual(resProtBearer.json.success, true);
      assert.ok(resProtBearer.json.message.includes('Access granted'));
      assert.strictEqual(resProtBearer.json.user.email, 'ceyda@example.com');
      console.log('✓ Auth Middleware: grants access with valid Bearer header (200 OK)');

      // 13.4. Protected API grants access with valid auth_token cookie
      const resProtCookie = await request({
        path: '/api/protected',
        headers: { Cookie: `auth_token=${apiToken}` }
      });
      assert.strictEqual(resProtCookie.statusCode, 200);
      assert.strictEqual(resProtCookie.json.success, true);
      console.log('✓ Auth Middleware: grants access with valid auth_token cookie (200 OK)');

      // 13.5. RBAC requireRole rejects insufficient role with structured 403 & reason
      // ceyda@example.com is 'ALUMNI', attempting to access ADMIN-only endpoint
      const resAdminForbidden = await request({
        path: '/api/admin-only',
        headers: { Authorization: `Bearer ${apiToken}` }
      });
      assert.strictEqual(resAdminForbidden.statusCode, 403);
      assert.strictEqual(resAdminForbidden.json.success, false);
      assert.strictEqual(resAdminForbidden.json.error, 'Forbidden');
      assert.ok(resAdminForbidden.json.reason);
      assert.ok(resAdminForbidden.json.reason.includes("Your role 'ALUMNI' does not possess required clearance"));
      console.log('✓ RBAC Guard (requireRole): rejects ALUMNI on ADMIN-only route with 403 & reason');

      // 13.6. RBAC requireRole grants access to user with matching ADMIN role
      const adminToken = generateToken({
        id: 99,
        email: 'admin@alumni.istanbul.edu.tr',
        role: 'ADMIN',
        first_name: 'Admin',
        last_name: 'System'
      });

      const resAdminSuccess = await request({
        path: '/api/admin-only',
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      assert.strictEqual(resAdminSuccess.statusCode, 200);
      assert.strictEqual(resAdminSuccess.json.success, true);
      assert.ok(resAdminSuccess.json.message.includes('Admin clearance verified'));
      console.log('✓ RBAC Guard (requireRole): grants access to user with matching ADMIN role (200 OK)');

      // 13.7. Multi-role RBAC: ALUMNI accessing route requiring ALUMNI or ADMIN
      const resAlumniSuccess = await request({
        path: '/api/alumni-only',
        headers: { Authorization: `Bearer ${apiToken}` }
      });
      assert.strictEqual(resAlumniSuccess.statusCode, 200);
      assert.strictEqual(resAlumniSuccess.json.success, true);
      assert.ok(resAlumniSuccess.json.message.includes('Alumni access verified'));
      console.log('✓ RBAC Guard (requireRole): grants access for multi-role permitted endpoint (200 OK)');

      // 14. Admin Panel, Role Assignment & Data Manipulation Subsystem
      console.log('\n--- 14. Admin Panel, Role Assignment & Data Manipulation ---');

      // 14.1. Claim / Assign Admin Role
      const resClaimPage = await request({ path: '/admin/claim' });
      assert.strictEqual(resClaimPage.statusCode, 200);
      assert.ok(resClaimPage.body.includes('Claim Administrator Role'));
      console.log('✓ GET /admin/claim -> 200 HTML Admin Elevation Portal');

      // 14.2. API Claim: Establishes Antigravity Superuser Admin and receives Bearer token
      const resApiClaim = await request({ path: '/api/admin/claim', method: 'POST' });
      assert.strictEqual(resApiClaim.statusCode, 200);
      assert.strictEqual(resApiClaim.json.success, true);
      assert.strictEqual(resApiClaim.json.user.role, 'ADMIN');
      const superAdminToken = resApiClaim.json.token;
      assert.ok(superAdminToken);
      console.log('✓ POST /api/admin/claim -> 200 JSON (Assigned ADMIN role & issued superuser token)');

      // 14.3. RBAC Route Protection on /admin
      // Unauthenticated request should redirect to /login
      const resUnauthAdmin = await request({ path: '/admin' });
      assert.strictEqual(resUnauthAdmin.statusCode, 302);
      assert.ok(resUnauthAdmin.headers['location'].includes('/login'));
      console.log('✓ Route Guard: unauthenticated GET /admin redirects to login');

      // Unauthenticated API request should return structured 401
      const resUnauthAdminApi = await request({ path: '/api/admin/stats' });
      assert.strictEqual(resUnauthAdminApi.statusCode, 401);
      assert.strictEqual(resUnauthAdminApi.json.error, 'Unauthorized');
      console.log('✓ Route Guard: unauthenticated GET /api/admin/stats returns 401 Unauthorized');

      // Non-Admin (ALUMNI) accessing /api/admin/stats returns structured 403 Forbidden
      const resAlumniBlocked = await request({
        path: '/api/admin/stats',
        headers: { Authorization: `Bearer ${apiToken}` }
      });
      assert.strictEqual(resAlumniBlocked.statusCode, 403);
      assert.strictEqual(resAlumniBlocked.json.error, 'Forbidden');
      console.log('✓ RBAC Guard: non-admin (ALUMNI) blocked from /api/admin/stats with 403 Forbidden');

      // 14.4. Admin Telemetry & Dashboard Access
      const resAdminStats = await request({
        path: '/api/admin/stats',
        headers: { Authorization: `Bearer ${superAdminToken}` }
      });
      assert.strictEqual(resAdminStats.statusCode, 200);
      assert.strictEqual(resAdminStats.json.success, true);
      assert.ok(resAdminStats.json.data.users);
      assert.ok(resAdminStats.json.data.jobs);
      assert.ok(resAdminStats.json.data.applications);
      console.log('✓ GET /api/admin/stats -> 200 JSON Administrative Telemetry');

      const resAdminDashboard = await request({
        path: '/admin',
        headers: { Cookie: `auth_token=${superAdminToken}` }
      });
      assert.strictEqual(resAdminDashboard.statusCode, 200);
      assert.ok(resAdminDashboard.body.includes('Executive Control Center'));
      console.log('✓ GET /admin -> 200 HTML Executive Dashboard View');

      // 14.5. Data Manipulation: Users
      const resAdminUsers = await request({
        path: '/admin/users',
        headers: { Cookie: `auth_token=${superAdminToken}` }
      });
      assert.strictEqual(resAdminUsers.statusCode, 200);
      assert.ok(resAdminUsers.body.includes('User Management'));
      console.log('✓ GET /admin/users -> 200 HTML User Management Table');

      // Manipulate User Role: change user 1 to ADMIN
      const resUpdateRole = await request({
        path: '/api/admin/users/1/role',
        method: 'PATCH',
        headers: { Authorization: `Bearer ${superAdminToken}` }
      }, { role: 'ADMIN' });
      assert.strictEqual(resUpdateRole.statusCode, 200);
      assert.strictEqual(resUpdateRole.json.data.role, 'ADMIN');
      console.log('✓ PATCH /api/admin/users/1/role -> 200 JSON (Role manipulated to ADMIN)');

      // Manipulate User Verification: toggle verification
      const resToggleVerify = await request({
        path: '/api/admin/users/1/verify',
        method: 'PATCH',
        headers: { Authorization: `Bearer ${superAdminToken}` }
      }, { is_verified: false });
      assert.strictEqual(resToggleVerify.statusCode, 200);
      assert.strictEqual(resToggleVerify.json.data.is_verified, false);
      console.log('✓ PATCH /api/admin/users/1/verify -> 200 JSON (Verification manipulated to false)');

      // 14.6. Data Manipulation: Job Postings
      const resAdminJobs = await request({
        path: '/admin/jobs',
        headers: { Cookie: `auth_token=${superAdminToken}` }
      });
      assert.strictEqual(resAdminJobs.statusCode, 200);
      assert.ok(resAdminJobs.body.includes('Job Postings Moderation'));
      console.log('✓ GET /admin/jobs -> 200 HTML Job Moderation View');

      // Manipulate Job Status: toggle active status
      const resToggleJob = await request({
        path: '/api/admin/jobs/1/status',
        method: 'PATCH',
        headers: { Authorization: `Bearer ${superAdminToken}` }
      }, { is_active: false });
      assert.strictEqual(resToggleJob.statusCode, 200);
      assert.strictEqual(resToggleJob.json.data.is_active, false);
      console.log('✓ PATCH /api/admin/jobs/1/status -> 200 JSON (Job active status manipulated to false)');

      // 14.7. Data Manipulation: Applications Pipeline
      const resAdminApps = await request({
        path: '/admin/applications',
        headers: { Cookie: `auth_token=${superAdminToken}` }
      });
      assert.strictEqual(resAdminApps.statusCode, 200);
      assert.ok(resAdminApps.body.includes('Candidate Pipeline Management'));
      console.log('✓ GET /admin/applications -> 200 HTML Candidate Pipeline View');

      // Manipulate Application Pipeline: update status to REVIEWING
      const resUpdateAppStatus = await request({
        path: '/api/admin/applications/2/status',
        method: 'PATCH',
        headers: { Authorization: `Bearer ${superAdminToken}` }
      }, { status: 'REVIEWING' });
      assert.strictEqual(resUpdateAppStatus.statusCode, 200);
      assert.strictEqual(resUpdateAppStatus.json.data.status, 'REVIEWING');
      console.log('✓ PATCH /api/admin/applications/2/status -> 200 JSON (Application pipeline manipulated to REVIEWING)');

      // Manipulate Application: delete application 2
      const resAdminDeleteApp = await request({
        path: '/api/admin/applications/2',
        method: 'DELETE',
        headers: { Authorization: `Bearer ${superAdminToken}` }
      });
      assert.strictEqual(resAdminDeleteApp.statusCode, 200);
      assert.strictEqual(resAdminDeleteApp.json.success, true);
      console.log('✓ DELETE /api/admin/applications/2 -> 200 JSON (Application removed by Admin)');

      console.log('\n🎉 ALL 100+ TESTS PASSED SUCCESSFULLY! MVC, APIs, Relations, N:M Action Table, Migrations, Seeders, Logger, Guardians, Registration, Log In, Log Out, Auth Middleware & Admin Control Panel Verified.\n');
      server.close(() => process.exit(0));
    } catch (err) {
      console.error('\n❌ Test Failure:', err);
      server.close(() => process.exit(1));
    }
  });
}

runTests();
