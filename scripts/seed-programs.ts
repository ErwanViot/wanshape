/**
 * Seed script — inserts program session data into Supabase.
 *
 * Usage:
 *   npx tsx scripts/seed-programs.ts
 *
 * Requires VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 */
import { createClient } from '@supabase/supabase-js';
import { PROGRAM_SEEDS } from '../src/data/programs/index.ts';

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error('Missing env vars: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function main() {
  for (const seed of PROGRAM_SEEDS) {
    // Find program by slug
    const { data: program, error: pgmErr } = await supabase
      .from('programs')
      .select('id, title')
      .eq('slug', seed.slug)
      .single();

    if (pgmErr || !program) {
      console.error(`Program "${seed.slug}" not found — run migration first`);
      continue;
    }

    console.log(`Seeding "${program.title}" (${seed.sessions.length} sessions)…`);

    for (const s of seed.sessions) {
      const { error } = await supabase.from('program_sessions').upsert(
        {
          program_id: program.id,
          session_order: s.sessionOrder,
          week_number: s.weekNumber,
          session_data: s.data,
        },
        { onConflict: 'program_id,session_order' },
      );

      if (error) {
        console.error(`  Error inserting session ${s.sessionOrder}:`, error.message);
      } else {
        console.log(`  ✓ Session ${s.sessionOrder} (week ${s.weekNumber})`);
      }
    }
  }

  console.log('Done.');
}

main();
