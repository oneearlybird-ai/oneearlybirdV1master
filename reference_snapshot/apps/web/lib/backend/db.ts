import { Pool } from 'pg';

type GP = { __eb_pg?: Pool } & typeof globalThis;
const g = globalThis as GP;

export function pgPool(): Pool {
  if (!g.__eb_pg) {
    const dsn = process.env.DATABASE_URL || '';
    const needsSSL = !/localhost|127\.0\.0\.1/.test(dsn);
    g.__eb_pg = new Pool({
      connectionString: dsn,
      ssl: needsSSL ? { rejectUnauthorized: false } : false,
      max: 5,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 5000
    });
  }
  return g.__eb_pg!;
}
