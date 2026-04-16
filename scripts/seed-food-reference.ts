/**
 * Seed script — imports CIQUAL (ANSES) French food composition data into
 * public.food_reference.
 *
 * Dataset: https://ciqual.anses.fr/ (Etalab Open License 2.0)
 * Attribution required: "ANSES — Table CIQUAL" in app credits.
 *
 * Usage:
 *   VITE_SUPABASE_URL="..." SUPABASE_SERVICE_ROLE_KEY="..." \
 *     npx tsx scripts/seed-food-reference.ts [path/to/ciqual.csv]
 *
 * Default CSV path: data/ciqual/ciqual.csv (see data/ciqual/README.md).
 *
 * Security: this script bypasses RLS via service role. Never run in a context
 * that could be exposed to anon clients.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { buildColumnIndex, type FoodReferenceRow, mapRow, splitCsv } from './lib/ciqualParser.ts';

const BATCH_SIZE = 500;
const DEFAULT_CSV_PATH = 'data/ciqual/ciqual.csv';

async function main() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error('Missing env vars: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const csvPath = resolve(process.cwd(), process.argv[2] ?? DEFAULT_CSV_PATH);
  console.log(`Reading CSV: ${csvPath}`);

  const content = readFileSync(csvPath, 'utf-8');
  const { headers, rows } = splitCsv(content);
  const idx = buildColumnIndex(headers);
  console.log(`Parsed ${rows.length} rows with ${headers.length} columns`);

  const records: FoodReferenceRow[] = [];
  for (const row of rows) {
    const record = mapRow(row, idx);
    if (record) records.push(record);
  }
  console.log(`Mapped ${records.length} valid food entries`);

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let inserted = 0;
  let failed = 0;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('food_reference').upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`Batch ${i}-${i + batch.length} failed:`, error.message);
      failed += batch.length;
    } else {
      inserted += batch.length;
      console.log(`  ✓ upserted ${inserted}/${records.length}`);
    }
  }

  console.log(`Done. Upserted: ${inserted}, failed: ${failed}`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
