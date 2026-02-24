#!/usr/bin/env node
/**
 * Generate exercise demo videos via Google Veo (Gemini API).
 *
 * Usage:
 *   GEMINI_API_KEY=xxx node scripts/generate-exercise-videos.mjs [--slug pompes-classiques] [--variants] [--dry-run]
 *
 * Options:
 *   --slug <slug>   Generate only for this exercise (default: all without video)
 *   --variants      Also generate variant videos
 *   --dry-run       Print prompts without calling the API
 *   --model <name>  Veo model (default: veo-3.1-generate-preview)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const EXERCISES_PATH = resolve(ROOT, 'src/data/exercises.ts');
const VIDEOS_DIR = resolve(ROOT, 'public/videos');

const MAX_POLL_ATTEMPTS = 40; // 40 × 15s = 10 min max

// ── Args ──────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const param = (name, fallback) => {
  const idx = args.indexOf(name);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
};

const DRY_RUN = flag('--dry-run');
const ONLY_SLUG = param('--slug', null);
const WITH_VARIANTS = flag('--variants');
const MODEL = param('--model', 'veo-3.1-generate-preview');
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY && !DRY_RUN) {
  console.error('Error: GEMINI_API_KEY env variable required (or use --dry-run)');
  process.exit(1);
}

// ── Parse exercises from TS source ────────────────────────────────────
function parseExercises() {
  const src = readFileSync(EXERCISES_PATH, 'utf8');
  const exercises = [];
  const blocks = src.split(/\n  \{[\s]*\n\s+slug:/);
  blocks.shift();

  for (const raw of blocks) {
    const block = `slug:${raw}`;
    const get = (key) => {
      const m = block.match(new RegExp(`${key}:\\s*'([^']*)'`));
      return m ? m[1] : '';
    };
    const getMultiline = (key) => {
      const m = block.match(new RegExp(`${key}:\\s*\\n?\\s*'([^']*(?:\\\\.[^']*)*)'`));
      return m ? m[1].replace(/\\'/g, "'") : '';
    };

    const slug = get('slug');
    const name = get('name');
    const hasVideo = block.includes("video: '/videos/");
    const execution = getMultiline('execution');
    const shortDescription = getMultiline('shortDescription');

    const variants = [];
    const variantsMatch = block.match(/variants:\s*\[([\s\S]*?)\],\s*\n\s*tips/);
    if (variantsMatch) {
      const vBlock = variantsMatch[1];
      const vEntries = vBlock.split(/\{/).slice(1);
      for (const v of vEntries) {
        const vName = v.match(/name:\s*'([^']+)'/)?.[1] || '';
        const vDesc = v.match(/description:\s*'([^']*(?:\\.[^']*)*)'/)?.[1]?.replace(/\\'/g, "'") || '';
        const vHasVideo = v.includes("video: '/videos/");
        if (vName) variants.push({ name: vName, description: vDesc, hasVideo: vHasVideo });
      }
    }

    if (slug) exercises.push({ slug, name, execution, shortDescription, hasVideo, variants });
  }
  return exercises;
}

// ── Prompt builder ────────────────────────────────────────────────────
function buildPrompt(name, execution, shortDescription) {
  return [
    `Generate a short looping video (6-8 seconds, no sound) of a fit person performing "${name}".`,
    '',
    `**Movement:** ${execution}`,
    '',
    `**Context:** ${shortDescription}`,
    '',
    '**Style:** Clean home or gym setting, well-lit, plain background. Camera at a slight side angle to show full body movement. Smooth continuous loop, 2-3 full reps. The person wears simple athletic clothing.',
  ].join('\n');
}

function buildVariantPrompt(variantName, variantDesc, parentName) {
  return [
    `Generate a short looping video (6-8 seconds, no sound) of a fit person performing "${variantName}" (a variant of ${parentName}).`,
    '',
    `**Movement:** ${variantDesc}`,
    '',
    '**Style:** Clean home or gym setting, well-lit, plain background. Camera at a slight side angle to show full body movement. Smooth continuous loop, 2-3 full reps. The person wears simple athletic clothing.',
  ].join('\n');
}

function slugifyVariant(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// ── Veo API ───────────────────────────────────────────────────────────
async function generateVideo(prompt, outputPath) {
  console.log(`  Calling Veo API...`);

  const startRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:predictLongRunning`,
    {
      method: 'POST',
      headers: {
        'x-goog-api-key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          aspectRatio: '16:9',
          durationSeconds: 6,
          resolution: '720p',
        },
      }),
    },
  );

  if (!startRes.ok) {
    const err = await startRes.text();
    throw new Error(`API start failed (${startRes.status}): ${err}`);
  }

  const startData = await startRes.json();
  const operationName = startData.name;
  console.log(`  Operation: ${operationName}`);

  // Poll until done (max 10 minutes)
  let result;
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await new Promise((r) => setTimeout(r, 15_000));
    const pollRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/${operationName}`,
      { headers: { 'x-goog-api-key': API_KEY } },
    );
    if (!pollRes.ok) {
      console.warn(`  Poll request failed (${pollRes.status}), retrying...`);
      continue;
    }
    result = await pollRes.json();
    if (result.done) break;
    process.stdout.write('.');
  }
  console.log();

  if (!result?.done) {
    throw new Error(`Timed out after ${MAX_POLL_ATTEMPTS * 15}s waiting for video generation`);
  }

  if (result.error) {
    throw new Error(`API error: ${JSON.stringify(result.error)}`);
  }

  // Download video
  const videoUri =
    result.response?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
  if (!videoUri) {
    throw new Error(`No video URI in response: ${JSON.stringify(result.response)}`);
  }

  const dlRes = await fetch(videoUri, {
    headers: { 'x-goog-api-key': API_KEY },
  });
  if (!dlRes.ok) throw new Error(`Download failed: ${dlRes.status}`);

  const buffer = Buffer.from(await dlRes.arrayBuffer());
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, buffer);
  console.log(`  Saved: ${outputPath} (${(buffer.length / 1024 / 1024).toFixed(1)} MB)`);
}

// ── Update exercises.ts ───────────────────────────────────────────────
function addVideoToExercise(slug, videoPath) {
  let src = readFileSync(EXERCISES_PATH, 'utf8');
  const imageLineRegex = new RegExp(
    `(slug: '${slug}',[\\s\\S]*?image: '[^']+',)\\n(\\s+shortDescription:)`,
  );
  if (src.match(imageLineRegex) && !src.match(new RegExp(`slug: '${slug}'[\\s\\S]*?video: '`))) {
    src = src.replace(imageLineRegex, `$1\n    video: '${videoPath}',\n$2`);
    writeFileSync(EXERCISES_PATH, src);
  }
}

function addVideoToVariant(exerciseSlug, variantName, videoPath) {
  let src = readFileSync(EXERCISES_PATH, 'utf8');
  const escaped = variantName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Check if this specific variant already has a video field
  const variantBlockRegex = new RegExp(`name: '${escaped}'[\\s\\S]*?\\}`);
  const variantBlock = src.match(variantBlockRegex);
  if (variantBlock && variantBlock[0].includes("video:")) return;

  const descRegex = new RegExp(
    `(name: '${escaped}',[\\s\\S]*?description:[\\s\\S]*?',)\\n(\\s+\\})`,
  );
  if (src.match(descRegex)) {
    src = src.replace(descRegex, `$1\n        video: '${videoPath}',\n$2`);
    writeFileSync(EXERCISES_PATH, src);
  }
}

// ── Main ──────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(VIDEOS_DIR, { recursive: true });
  const exercises = parseExercises();
  console.log(`Found ${exercises.length} exercises\n`);

  const targets = ONLY_SLUG ? exercises.filter((e) => e.slug === ONLY_SLUG) : exercises;

  let generated = 0;
  let skipped = 0;

  for (const ex of targets) {
    const videoFile = `/videos/${ex.slug}.mp4`;
    const outputPath = resolve(VIDEOS_DIR, `${ex.slug}.mp4`);

    if (ex.hasVideo || existsSync(outputPath)) {
      console.log(`[skip] ${ex.name} — already has video`);
      skipped++;
    } else {
      const prompt = buildPrompt(ex.name, ex.execution, ex.shortDescription);

      if (DRY_RUN) {
        console.log(`\n── ${ex.name} (${ex.slug}) ──`);
        console.log(prompt);
        console.log();
      } else {
        console.log(`\n[gen] ${ex.name} (${ex.slug})`);
        try {
          await generateVideo(prompt, outputPath);
          addVideoToExercise(ex.slug, videoFile);
          generated++;
        } catch (err) {
          console.error(`  ❌ Failed: ${err.message}`);
        }
      }
    }

    // Variants
    if (WITH_VARIANTS) {
      for (const v of ex.variants) {
        const vSlug = slugifyVariant(v.name);
        const vVideoFile = `/videos/${vSlug}.mp4`;
        const vOutputPath = resolve(VIDEOS_DIR, `${vSlug}.mp4`);

        if (v.hasVideo || existsSync(vOutputPath)) {
          console.log(`  [skip] ${v.name} — already has video`);
          skipped++;
        } else {
          const prompt = buildVariantPrompt(v.name, v.description, ex.name);

          if (DRY_RUN) {
            console.log(`  ── ${v.name} ──`);
            console.log(`  ${prompt.replace(/\n/g, '\n  ')}`);
            console.log();
          } else {
            console.log(`  [gen] ${v.name}`);
            try {
              await generateVideo(prompt, vOutputPath);
              addVideoToVariant(ex.slug, v.name, vVideoFile);
              generated++;
            } catch (err) {
              console.error(`    ❌ Failed: ${err.message}`);
            }
          }
        }
      }
    }
  }

  console.log(`\nDone! Generated: ${generated}, Skipped: ${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
