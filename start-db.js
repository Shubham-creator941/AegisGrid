const EmbeddedPostgres = require('embedded-postgres').default;
const { execSync } = require('child_process');
const path = require('path');

const DATA_DIR = path.join(__dirname, '.pg-data');
const DB_PORT = 5433;
const DB_NAME = 'aegisgrid';

async function main() {
  console.log('Starting embedded PostgreSQL on port', DB_PORT, '...');

  const pg = new EmbeddedPostgres({
    databaseDir: DATA_DIR,
    user: 'postgres',
    password: 'password',
    port: DB_PORT,
    persistent: true,
  });

  try {
    await pg.initialise();
  } catch (e) {
    if (!e.message.includes('exists') && !e.message.includes('not empty')) {
      console.log('Note: init says:', e.message);
    }
  }

  await pg.start();
  console.log('PostgreSQL started.');

  // Create the database if it doesn't exist
  try {
    await pg.createDatabase(DB_NAME);
    console.log(`Database "${DB_NAME}" created.`);
  } catch (e) {
    if (e.message && e.message.includes('already exists')) {
      console.log(`Database "${DB_NAME}" already exists.`);
    } else {
      console.log('Create DB note:', e.message);
    }
  }

  // Create the 'user' role matching the default DATABASE_URL
  const { Client } = require('pg');
  const adminClient = new Client({
    host: '127.0.0.1',
    port: DB_PORT,
    user: 'postgres',
    password: 'password',
    database: DB_NAME,
  });
  await adminClient.connect();

  try {
    await adminClient.query(`DO $$ BEGIN IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'user') THEN CREATE ROLE "user" WITH LOGIN PASSWORD 'password' SUPERUSER; END IF; END $$;`);
    console.log('Role "user" ensured.');
  } catch (e) {
    console.log('Role note:', e.message);
  }

  // Set database encoding for client connections
  try {
    await adminClient.query("SET client_encoding TO 'UTF8';");
  } catch (e) {
    // not critical
  }

  await adminClient.end();

  const connStr = `postgres://user:password@127.0.0.1:${DB_PORT}/${DB_NAME}`;
  console.log(`DATABASE_URL=${connStr}`);

  // Run migrations
  console.log('Running migrations...');
  try {
    execSync('npm run migrate -w server', {
      cwd: __dirname,
      stdio: 'inherit',
      env: {
        ...process.env,
        DATABASE_URL: connStr,
        PGCLIENTENCODING: 'UTF8',
      },
    });
    console.log('Migrations complete.');
  } catch (e) {
    console.error('Migration error:', e.message);
  }

  // Keep running
  console.log('\nPostgreSQL is running. Press Ctrl+C to stop.');
  console.log(`Connection: ${connStr}`);
  process.on('SIGINT', async () => {
    console.log('Stopping PostgreSQL...');
    await pg.stop();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await pg.stop();
    process.exit(0);
  });
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
