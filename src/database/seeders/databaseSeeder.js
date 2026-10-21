const { Client } = require('pg');
require('dotenv').config();

const departmentSeeder = require('./departmentSeeder');
const userSeeder = require('./userSeeder');
const announcementSeeder = require('./announcementSeeder');
const jobPostingSeeder = require('./jobPostingSeeder');

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'alumni_db'
};

async function runSeeds() {
  console.log('\n=== RUNNING DATABASE SEEDERS ===\n');
  const client = new Client(dbConfig);
  let connected = false;

  try {
    await client.connect();
    connected = true;
    console.log(`Connected to database "${dbConfig.database}". Seeding relational tables...`);

    // Clean existing tables in proper order (respecting foreign keys)
    console.log('Cleaning existing table data...');
    await client.query(`
      TRUNCATE TABLE applications, job_postings, alumni_profiles, announcements, users, departments RESTART IDENTITY CASCADE;
    `);

    // Run individual seeders
    await departmentSeeder.seed(client);
    await userSeeder.seed(client);
    await announcementSeeder.seed(client);
    await jobPostingSeeder.seed(client);

    // Summary counts
    const deptCount = await client.query('SELECT COUNT(*) FROM departments');
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    const profileCount = await client.query('SELECT COUNT(*) FROM alumni_profiles');
    const annCount = await client.query('SELECT COUNT(*) FROM announcements');
    const jobCount = await client.query('SELECT COUNT(*) FROM job_postings');

    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log(`  - Departments     : ${deptCount.rows[0].count}`);
    console.log(`  - Users           : ${userCount.rows[0].count}`);
    console.log(`  - Alumni Profiles : ${profileCount.rows[0].count}`);
    console.log(`  - Announcements   : ${annCount.rows[0].count}`);
    console.log(`  - Job Postings    : ${jobCount.rows[0].count}\n`);
  } catch (err) {
    if (!connected) {
      console.log('PostgreSQL database not reachable. Seeding in-memory models...');
      await departmentSeeder.seed(null);
      await userSeeder.seed(null);
      await announcementSeeder.seed(null);
      await jobPostingSeeder.seed(null);
      console.log('🎉 In-memory models seeded successfully with factories!');
    } else {
      console.error('❌ Seeding failed:', err.message);
      throw err;
    }
  } finally {
    if (connected) {
      await client.end();
    }
  }
}

module.exports = { runSeeds };
