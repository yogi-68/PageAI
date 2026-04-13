// scripts/migrate.mjs — Run SQL migration against Supabase
// Usage: node scripts/migrate.mjs [path/to/file.sql]

import { readFileSync } from 'fs';
import { resolve } from 'path';
import pg from 'pg';

const file = process.argv[2] || 'supabase/migration.sql';
const sql = readFileSync(resolve(file), 'utf-8');

// Read from .env.local or .env (DIRECT_URL = direct connection, no pgbouncer)
const url =
    process.env.DIRECT_URL ||
    process.env.DATABASE_URL ||
    'postgresql://postgres.tqbcaynfcqyfrjudscqt:PlustoYogi%4042@aws-1-ap-south-1.pooler.supabase.com:5432/postgres';

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

try {
    await client.connect();
    console.log('Connected to database.');
    await client.query(sql);
    console.log(`Migration applied successfully from ${file}`);
} catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
} finally {
    await client.end();
}
