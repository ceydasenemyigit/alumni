#!/usr/bin/env node
const { createDatabaseIfNotExists, migrateUp, migrateDown, migrateStatus } = require('../src/database/migrator');

const command = process.argv[2] || 'up';

async function main() {
  try {
    switch (command.toLowerCase()) {
      case 'create':
        await createDatabaseIfNotExists();
        break;
      case 'up':
        await migrateUp();
        break;
      case 'down':
      case 'rollback':
        await migrateDown();
        break;
      case 'status':
        await migrateStatus();
        break;
      default:
        console.log(`Unknown command "${command}". Available options: create, up, down, status.`);
        process.exit(1);
    }
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration Error:', err.message);
    process.exit(1);
  }
}

main();
