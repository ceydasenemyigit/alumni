const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'alumni_db'
};

/**
 * 1. Creates the target database if it does not already exist
 */
async function createDatabaseIfNotExists() {
  const adminClient = new Client({
    ...dbConfig,
    database: 'postgres' // Connect to default postgres DB
  });

  try {
    await adminClient.connect();
    const res = await adminClient.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbConfig.database]
    );

    if (res.rowCount === 0) {
      console.log(`Database "${dbConfig.database}" does not exist. Creating...`);
      await adminClient.query(`CREATE DATABASE "${dbConfig.database}";`);
      console.log(`✓ Database "${dbConfig.database}" created successfully.`);
    } else {
      console.log(`✓ Database "${dbConfig.database}" already exists.`);
    }
  } catch (err) {
    console.error(`Warning during database existence check: ${err.message}`);
    throw err;
  } finally {
    await adminClient.end();
  }
}

/**
 * 2. Gets list of all migration files sorted chronologically
 */
function getMigrationFiles() {
  const dir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.js'))
    .sort()
    .map(f => ({
      filename: f,
      module: require(path.join(dir, f))
    }));
}

/**
 * 3. Initializes migrations tracking table
 */
async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

/**
 * 4. Runs pending migrations (UP)
 */
async function migrateUp() {
  await createDatabaseIfNotExists();

  const client = new Client(dbConfig);
  try {
    await client.connect();
    await ensureMigrationsTable(client);

    const executedRes = await client.query(`SELECT name FROM migrations ORDER BY id ASC`);
    const executedNames = new Set(executedRes.rows.map(r => r.name));

    const allMigrations = getMigrationFiles();
    const pending = allMigrations.filter(m => !executedNames.has(m.module.name));

    if (pending.length === 0) {
      console.log('✓ All migrations are already up to date. Nothing to run.');
      return;
    }

    console.log(`\nFound ${pending.length} pending migration(s)...`);
    for (const migration of pending) {
      console.log(`- Running migration: ${migration.module.name}...`);
      await client.query('BEGIN');
      try {
        await migration.module.up(client);
        await client.query(`INSERT INTO migrations (name) VALUES ($1)`, [migration.module.name]);
        await client.query('COMMIT');
        console.log(`  ✓ Applied: ${migration.module.name}`);
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`  ❌ Failed: ${migration.module.name}`);
        throw err;
      }
    }
    console.log('\n🎉 All migrations completed successfully!\n');
  } finally {
    await client.end();
  }
}

/**
 * 5. Reverts the most recent migration (DOWN)
 */
async function migrateDown() {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await ensureMigrationsTable(client);

    const lastRes = await client.query(`SELECT name FROM migrations ORDER BY id DESC LIMIT 1`);
    if (lastRes.rowCount === 0) {
      console.log('No migrations to rollback.');
      return;
    }

    const lastMigrationName = lastRes.rows[0].name;
    const allMigrations = getMigrationFiles();
    const target = allMigrations.find(m => m.module.name === lastMigrationName);

    if (!target) {
      console.error(`Migration file for "${lastMigrationName}" not found on disk.`);
      return;
    }

    console.log(`Rolling back migration: ${target.module.name}...`);
    await client.query('BEGIN');
    try {
      await target.module.down(client);
      await client.query(`DELETE FROM migrations WHERE name = $1`, [target.module.name]);
      await client.query('COMMIT');
      console.log(`✓ Reverted: ${target.module.name}`);
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`❌ Rollback failed: ${target.module.name}`);
      throw err;
    }
  } finally {
    await client.end();
  }
}

/**
 * 6. Migration Status
 */
async function migrateStatus() {
  const client = new Client(dbConfig);
  try {
    await client.connect();
    await ensureMigrationsTable(client);

    const executedRes = await client.query(`SELECT name, executed_at FROM migrations ORDER BY id ASC`);
    const executedMap = new Map(executedRes.rows.map(r => [r.name, r.executed_at]));

    const allMigrations = getMigrationFiles();
    console.log('\n=== MIGRATION STATUS ===');
    allMigrations.forEach(m => {
      const isExecuted = executedMap.has(m.module.name);
      const status = isExecuted ? '✓ EXECUTED' : '⏳ PENDING';
      const time = isExecuted ? `(${executedMap.get(m.module.name).toISOString()})` : '';
      console.log(`${status.padEnd(12)} : ${m.module.name} ${time}`);
    });
    console.log('========================\n');
  } finally {
    await client.end();
  }
}

module.exports = {
  createDatabaseIfNotExists,
  migrateUp,
  migrateDown,
  migrateStatus
};
