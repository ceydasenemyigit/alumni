#!/usr/bin/env node
const { createDatabaseIfNotExists, migrateUp } = require('../src/database/migrator');
const { runSeeds } = require('../src/database/seeders/databaseSeeder');

async function main() {
  console.log('====================================================');
  console.log('   ALUMNI TRACKING SYSTEM - FULL DATABASE SETUP     ');
  console.log('====================================================\n');

  try {
    console.log('[Phase 1/3] Creating Database (if not exists)...');
    await createDatabaseIfNotExists();

    console.log('\n[Phase 2/3] Running Database Migrations (UP)...');
    await migrateUp();

    console.log('\n[Phase 3/3] Running Factories & Seeders...');
    await runSeeds();

    console.log('\n====================================================');
    console.log('🎉 Database setup, migrations, and seeders completed!');
    console.log('====================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Database setup encountered an error:', err.message);
    process.exit(1);
  }
}

main();
