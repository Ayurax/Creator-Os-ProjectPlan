const fs = require('node:fs');
const path = require('node:path');
const { Client } = require('pg');

const migrationName = '00000000000000_initial';
const migrationPath = path.join(__dirname, '..', 'prisma', 'migrations-postgresql', migrationName, 'migration.sql');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required to initialize PostgreSQL');
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined,
});

async function initialize() {
  await client.connect();
  try {
    await client.query('BEGIN');
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_CreatorOSMigrations" (
        "name" TEXT PRIMARY KEY,
        "appliedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const existing = await client.query('SELECT 1 FROM "_CreatorOSMigrations" WHERE "name" = $1', [migrationName]);
    if (existing.rowCount === 0) {
      await client.query(fs.readFileSync(migrationPath, 'utf8'));
      await client.query('INSERT INTO "_CreatorOSMigrations" ("name") VALUES ($1)', [migrationName]);
      console.log(`Applied PostgreSQL migration ${migrationName}`);
    } else {
      console.log(`PostgreSQL migration ${migrationName} is already applied`);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

initialize().catch((error) => {
  console.error('PostgreSQL initialization failed:', error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
