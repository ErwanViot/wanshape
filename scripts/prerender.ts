/**
 * Pre-render public routes to static HTML for SEO and LLM indexing.
 *
 * Usage: tsx scripts/prerender.ts
 *
 * Boots `vite preview`, drives a headless Chromium through every public route,
 * captures the rendered DOM (including JSON-LD structured data), and writes
 * `dist/<route>/index.html`. Also regenerates `dist/sitemap.xml` with hreflang
 * alternates for the bilingual recipe pages.
 *
 * For routes that declare `alternates` in seoRoutes, this script also injects
 * the corresponding `<link rel="alternate" hreflang="...">` tags directly into
 * the captured HTML's `<head>` so search engines can discover the FR↔EN pair
 * even from a single page hit.
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
  /** Routes intentionally skipped (e.g. recipe details without seed). */
  const skipped: string[] = [];
  let captured = 0;

  for (const route of routes) {
    const isEnRoute = route.path.startsWith('/en/');
    // Bilingual pages render under their URL's locale (recipe components read
    // it from the path). The `?lng=en` query param drives i18next's initial
    // language detection so the chrome (header, nav) renders in English too,
    // matching the URL.
    const url = `${BASE}${route.path}${isEnRoute ? '?lng=en' : ''}`;
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: NAV_TIMEOUT_MS });
      await page.waitForTimeout(SETTLE_MS);
      const rawHtml = await page.content();
      // SPA fallback always returns HTTP 200, so detect the NotFoundPage marker
      // instead — guards against silently capturing a 404 for routes listed in
      // seoRoutes but missing from the router.
      if (route.path !== '/' && /text-brand[^"]*">404</.test(rawHtml)) {
        throw new Error('route resolved to NotFoundPage (404)');
      }
      // Recipe detail pages are data-bound: if Supabase hasn't been seeded for
      // this build env, the component renders the recipe-not-found state. Skip
      // those routes (no dist file, no sitemap entry) so we never ship hollow
      // pages. They'll be picked up by the next rebuild after the seed is in
      // place. This is *expected*, not an error — `skipped` is reported but
      // doesn't fail the build.
      if (isRecipeDetailPath(route.path) && !rawHtml.includes('"@type":"Recipe"')) {
        skipped.push(route.path);
        continue;
      }
      const html = postProcessHtml(rawHtml, route);
      const outDir = route.path === '/' ? DIST : join(DIST, route.path);
      mkdirSync(outDir, { recursive: true });
      writeFileSync(join(outDir, 'index.html'), html);
      captured++;
      process.stdout.write(`\r[prerender] ${captured}/${routes.length} ${route.path.padEnd(50)}`);
    } catch (err) {
      failed.push(route.path);
      console.error(`\n[prerender] FAILED ${route.path}: ${(err as Error).message}`);
    }
  }

  if (failed.length > 0) {
    console.error(`\n[prerender] ${failed.length} route(s) failed: ${failed.join(', ')}`);
    hadError = true;
  } else {
    console.log(`\n[prerender] ${captured} route(s) captured${skipped.length ? `, ${skipped.length} skipped` : ''}`);
  }
  if (skipped.length > 0) {
    console.warn(
      `[prerender] ${skipped.length} recipe detail route(s) skipped (Supabase seed not yet applied for this build env)`,
    );
  }

  // Sitemap reflects only routes whose HTML was actually written to dist/ —
  // skipped + failed are excluded so crawlers never see hollow URLs.
  const written = new Set(routes.map((r) => r.path).filter((p) => !failed.includes(p) && !skipped.includes(p)));
  const successful = routes.filter((r) => written.has(r.path));
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
      // hreflang alternates per https://developers.google.com/search/docs/specialty/international/localized-versions
      if (r.alternates?.length) {
        for (const alt of r.alternates) {
          parts.push(
            `    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${SITE_URL}${alt.href}" />`,
          );
        }
      }
      parts.push('  </url>');
      return parts.join('\n');
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;
}

/**
 * Injects `<link rel="alternate" hreflang="...">` and a self-canonical into the
 * captured HTML's `<head>`. Pages that already have a <link rel="canonical">
 * (set by useDocumentHead at runtime) keep it; we just append the hreflang
 * siblings. No-op when the route declares no alternates.
 */
function isRecipeDetailPath(path: string): boolean {
  return /^\/(en\/)?nutrition\/(recettes|recipes)\/.+/.test(path);
}

/**
 * Post-rendering tweaks applied to every captured HTML before writing it:
 * - Inject hreflang `<link>` siblings under `<head>` for routes that have
 *   declared alternates in seoRoutes.
 * - For EN routes, swap the shell's `<html lang="fr">` for `<html lang="en">`
 *   so the document's primary language matches its URL and content.
 */
function postProcessHtml(html: string, route: SeoRoute): string {
  let next = html;
  if (route.path.startsWith('/en/')) {
    next = next.replace(/<html(\s[^>]*)?\slang="fr"/i, '<html$1 lang="en"');
  }
  if (route.alternates?.length) {
    const links = route.alternates
      .map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${SITE_URL}${a.href}">`)
      .join('');
    // Insert just before </head> — works for the Vite shell which emits one.
    next = next.replace(/<\/head>/i, `${links}</head>`);
  }
  return next;
}
