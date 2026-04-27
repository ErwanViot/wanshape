/**
 * Theme flash prevention.
 *
 * Runs synchronously before the React bundle mounts so the <html data-theme>
 * attribute is set at first paint — avoids the brief white/dark flash when
 * the user has picked a non-system theme.
 *
 * This file is loaded via `<script src="/theme-init.js">` (external) rather
 * than inline so the CSP `script-src` can stay free of `'unsafe-inline'`.
 * Keep it framework-free, no import, no module syntax.
 *
 * IMPORTANT: the <script> tag referencing this file MUST NOT carry
 * `defer` or `async` — it has to block the HTML parser so the theme
 * attribute is set before first paint. Keep the script tag in index.html
 * bare.
 */
(function () {
  try {
    var p = localStorage.getItem('wan2fit-theme') || 'light';
    var t =
      p === 'system'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light'
        : p;
    if (t === 'light') document.documentElement.setAttribute('data-theme', 'light');
  } catch (_) {
    // localStorage can throw in privacy mode; fall through to the default dark theme.
  }
})();
