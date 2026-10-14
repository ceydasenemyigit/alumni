#!/usr/bin/env node
const { runSeeds } = require('../src/database/seeders/databaseSeeder');

async function main() {
  try {
    await runSeeds();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Seeder Error:', err.message);
    process.exit(1);
  }
}

main();
