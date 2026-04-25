#!/usr/bin/env node
/**
 * Upsert a single daily session into the `daily_sessions` table.
 *
 * Usage:
 *   node scripts/upsert-daily-session.mjs --env dev --date 20260501
 *   node scripts/upsert-daily-session.mjs --env prod --date 20260501
 *
 * Reads `public/sessions/<date>.json` (FR) and, if it exists,
 * `public/sessions/en/<date>.json` (EN). Each present file is upserted as
 * its own (date_key, locale) row.
 *
 * Designed to be called by the `generate-session` skill after it writes the
 * two JSON files. Reuses the env safety check from migrate-daily-sessions.
 */
import { createClient } from '@supabase/supabase-js';
import { config as loadEnv } from 'dotenv';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

loadEnv({ path: '.env.local' });

const args = process.argv.slice(2);

function arg(name) {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
}

const envFlag = arg('env') ?? 'dev';
const dateKey = arg('date');

if (envFlag !== 'dev' && envFlag !== 'prod') {
  console.error(`Invalid --env: ${envFlag}. Use 'dev' or 'prod'.`);
  process.exit(1);
}

if (!dateKey || !/^\d{8}$/.test(dateKey)) {
  console.error('Missing or invalid --date (expected YYYYMMDD).');
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
    `Refusing to run with --env ${envFlag}: SUPABASE_URL doesn't match ${expectedRef}.`,
  );
  process.exit(1);
}

const SESSIONS_DIR = 'public/sessions';
const frPath = join(SESSIONS_DIR, `${dateKey}.json`);
const enPath = join(SESSIONS_DIR, 'en', `${dateKey}.json`);

const rows = [];
if (existsSync(frPath)) {
  rows.push({ date_key: dateKey, locale: 'fr', session_data: JSON.parse(readFileSync(frPath, 'utf8')) });
}
if (existsSync(enPath)) {
  rows.push({ date_key: dateKey, locale: 'en', session_data: JSON.parse(readFileSync(enPath, 'utf8')) });
}

if (rows.length === 0) {
  console.error(`No source file found for ${dateKey} in ${SESSIONS_DIR}.`);
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { error } = await supabase.from('daily_sessions').upsert(rows, { onConflict: 'date_key,locale' });
if (error) {
  console.error(`Upsert failed for ${dateKey}:`, error);
  process.exit(1);
}

console.log(`[${envFlag}] upserted ${rows.map((r) => r.locale).join('+')} for ${dateKey}`);
