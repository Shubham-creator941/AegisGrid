import fs from 'fs';
import path from 'path';
import { pool } from './pool.js';

const MIGRATIONS_DIR = path.join(__dirname, '../../database/migrations');

async function runMigrations() {
  const client = await pool.connect();

  try {
    // 1. Ensure the migrations directory exists (it may not exist initially)
    if (!fs.existsSync(MIGRATIONS_DIR)) {
      console.log(`Migrations directory not found at ${MIGRATIONS_DIR}. Creating...`);
      fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    }

    // 2. Ensure migration history table exists
    await client.query(`
      CREATE TABLE IF NOT EXISTS migration_history (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Read and sort migration files
    const files = fs.readdirSync(MIGRATIONS_DIR)
      .filter(f => f.endsWith('.sql'))
      .sort();

    if (files.length === 0) {
      console.log('No migration files found. Database is up to date.');
      return;
    }

    // 4. Get applied migrations
    const { rows } = await client.query('SELECT name FROM migration_history');
    const appliedMigrations = new Set(rows.map(r => r.name));

    // 5. Execute pending migrations
    let appliedCount = 0;
    for (const file of files) {
      if (!appliedMigrations.has(file)) {
        console.log(`Applying migration: ${file}...`);
        const filePath = path.join(MIGRATIONS_DIR, file);
        const sql = fs.readFileSync(filePath, 'utf8');

        try {
          await client.query('BEGIN');
          await client.query(sql);
          await client.query('INSERT INTO migration_history (name) VALUES ($1)', [file]);
          await client.query('COMMIT');
          console.log(`Migration ${file} applied successfully.`);
          appliedCount++;
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`Error applying migration ${file}:`, error);
          throw error;
        }
      }
    }

    if (appliedCount === 0) {
      console.log('No pending migrations found. Database is up to date.');
    } else {
      console.log(`Successfully applied ${appliedCount} migration(s).`);
    }

  } catch (error) {
    console.error('Migration runner failed:', error);
    process.exit(1);
  } finally {
    client.release();
    // End the pool so the script can exit cleanly
    await pool.end();
  }
}

// Execute if run directly
if (require.main === module) {
  console.log('Starting migration runner...');
  runMigrations().catch(err => {
    console.error('Fatal error during migrations:', err);
    process.exit(1);
  });
}
