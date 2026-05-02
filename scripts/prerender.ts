/**
 * Pre-render public routes to static HTML for SEO and LLM indexing.
 *
 * Usage: tsx scripts/prerender.ts
 *
 * Boots `vite preview`, drives a headless Chromium through every public route
 * with a French locale, captures the rendered DOM (including JSON-LD structured
 * data), and writes `dist/<route>/index.html`. Also regenerates `dist/sitemap.xml`.
 *
 * Locale: pre-rendering is FR-only by design. The SPA hydrates client-side and
 * lets users toggle EN via i18next; a single FR snapshot is enough for the FR
 * audience and matches `<html lang="fr">` in `index.html`.
 *
 * Designed to run after `vite build`.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { type Browser, chromium } from 'playwright';
import { SITE_URL } from '../src/lib/jsonld.ts';
import { getPublicRoutes, type SeoRoute } from '../src/lib/seoRoutes.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = join(__dirname, '..', 'dist');
const PORT = 4173;
const BASE = `http://localhost:${PORT}`;
const NAV_TIMEOUT_MS = 30_000;
const SETTLE_MS = 300;

const routes = getPublicRoutes();
console.log(`[prerender] ${routes.length} routes queued`);

console.log(`[prerender] starting vite preview on :${PORT}…`);
const preview = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env },
});
preview.stderr?.on('data', (chunk) => process.stderr.write(`[preview] ${chunk}`));

let browser: Browser | undefined;
let hadError = false;

try {
  await waitForServer(`${BASE}/`, NAV_TIMEOUT_MS);
  console.log('[prerender] preview ready');

  browser = await chromium.launch();
  const context = await browser.newContext({ locale: 'fr-FR' });
  const page = await context.newPage();

  const failed: string[] = [];
  let captured = 0;

  for (const route of routes) {
    const url = `${BASE}${route.path}`;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
      await page.waitForTimeout(SETTLE_MS);
      const html = await page.content();
      // SPA fallback always returns HTTP 200, so detect the NotFoundPage marker
      // instead — guards against silently capturing a 404 for routes listed in
      // seoRoutes but missing from the router.
      if (route.path !== '/' && /text-brand[^"]*">404</.test(html)) {
        throw new Error('route resolved to NotFoundPage (404)');
      }
      const outDir = route.path === '/' ? DIST : join(DIST, route.path);
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, 'index.html'), html);
      captured++;
      process.stdout.write(`\r[prerender] ${captured}/${routes.length} ${route.path.padEnd(40)}`);
    } catch (err) {
      failed.push(route.path);
      console.error(`\n[prerender] FAILED ${route.path}: ${(err as Error).message}`);
    }
  }

  if (failed.length > 0) {
    console.error(`\n[prerender] ${failed.length} route(s) failed: ${failed.join(', ')}`);
    hadError = true;
  } else {
    console.log('\n[prerender] all routes captured');
  }

  // Sitemap reflects only successfully captured routes — avoid pointing crawlers
  // at URLs whose static HTML may be stale or missing.
  const successful = routes.filter((r) => !failed.includes(r.path));
  const today = new Date().toISOString().split('T')[0];
  writeFileSync(join(DIST, 'sitemap.xml'), buildSitemap(successful, today));
  console.log(`[prerender] sitemap.xml: ${successful.length} routes, lastmod=${today}`);
} catch (err) {
  console.error('\n[prerender] fatal error:', err);
  hadError = true;
} finally {
  if (browser) {
    await browser.close().catch(() => {
      /* already closed */
    });
  }
  preview.kill('SIGTERM');
}

// Force-exit so the lingering preview subprocess and stdio listeners don't
// keep the event loop alive (CI runners would otherwise hang until timeout).
process.exit(hadError ? 1 : 0);

async function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (preview.exitCode != null) {
      throw new Error(`vite preview exited early with code ${preview.exitCode}`);
    }
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {
      // server not ready yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Server at ${url} did not start within ${timeoutMs}ms`);
}

function buildSitemap(items: SeoRoute[], lastmod: string): string {
  const urls = items
    .map((r) => {
      const parts = [
        '  <url>',
        `    <loc>${SITE_URL}${r.path}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
      ];
      if (r.changefreq) parts.push(`    <changefreq>${r.changefreq}</changefreq>`);
      if (r.priority != null) parts.push(`    <priority>${r.priority}</priority>`);
      parts.push('  </url>');
      return parts.join('\n');
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}
