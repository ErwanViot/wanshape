#!/usr/bin/env node
/**
 * One-shot import of public/sessions/<YYYYMMDD>.json into the
 * `daily_sessions` table created by migration 019.
 *
 * Usage:
 *   node scripts/migrate-daily-sessions.mjs --env dev   # default
 *   node scripts/migrate-daily-sessions.mjs --env prod
 *   node scripts/migrate-daily-sessions.mjs --env dev --dry-run
 *
 * Idempotent: rows are upserted on (date_key, locale). Re-running the script
 * after editing a JSON file overwrites the existing FR row safely.
 *
 * EN content is intentionally NOT inserted here — bilingual translation
 * happens in PR 5b. After this script, the table holds 110 FR rows and
 * `useSession` falls back to FR for users on the EN locale.
 *
 * Reads SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * For --env prod, the script refuses to run unless the URL contains the
 * known prod project ref to avoid clobbering dev with prod credentials.
 */
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

loadEnv({ path: '.env.local' });

const args = process.argv.slice(2);
const envFlag = args.includes('--env') ? args[args.indexOf('--env') + 1] : 'dev';
const dryRun = args.includes('--dry-run');

if (envFlag !== 'dev' && envFlag !== 'prod') {
  console.error(`Invalid --env: ${envFlag}. Use 'dev' or 'prod'.`);
  process.exit(1);
}

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const DEV_PROJECT_REF = 'rgwwpkyuavhqdautpciu';
const PROD_PROJECT_REF = 'pipbhkaaqsltnvprmzrl';
const expectedRef = envFlag === 'prod' ? PROD_PROJECT_REF : DEV_PROJECT_REF;

if (!SUPABASE_URL.includes(expectedRef)) {
  console.error(
    `Refusing to run with --env ${envFlag}: SUPABASE_URL doesn't match ${expectedRef}.\n` +
      `URL: ${SUPABASE_URL}\n` +
      `If you want to switch envs, update .env.local accordingly.`,
  );
  process.exit(1);
}

const SESSIONS_DIR = 'public/sessions';
const files = readdirSync(SESSIONS_DIR)
  .filter((f) => /^\d{8}\.json$/.test(f))
  .sort();

if (files.length === 0) {
  console.error(`No YYYYMMDD.json files found in ${SESSIONS_DIR}`);
  process.exit(1);
}

console.log(`[${envFlag}] importing ${files.length} sessions${dryRun ? ' (dry-run)' : ''}`);

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const rows = files.map((file) => {
  const dateKey = file.replace('.json', '');
  const payload = JSON.parse(readFileSync(join(SESSIONS_DIR, file), 'utf8'));
  return {
    date_key: dateKey,
    locale: 'fr',
    session_data: payload,
  };
});

if (dryRun) {
  console.log(`[dry-run] would upsert ${rows.length} rows. First 3:`);
  console.log(rows.slice(0, 3).map((r) => `  ${r.date_key} (${r.locale})`).join('\n'));
  process.exit(0);
}

// Batch upsert. Supabase has a default batch size limit; chunk to be safe.
const CHUNK = 50;
let inserted = 0;
for (let i = 0; i < rows.length; i += CHUNK) {
  const slice = rows.slice(i, i + CHUNK);
  const { error } = await supabase.from('daily_sessions').upsert(slice, { onConflict: 'date_key,locale' });
  if (error) {
    console.error(`Upsert failed at chunk ${i}-${i + slice.length}:`, error);
    process.exit(1);
  }
  inserted += slice.length;
  console.log(`  ${inserted}/${rows.length} upserted`);
}

console.log(`[${envFlag}] done — ${inserted} rows upserted into daily_sessions.`);
