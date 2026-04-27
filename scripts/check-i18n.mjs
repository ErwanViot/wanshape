#!/usr/bin/env node
/**
 * Verify FR/EN locale parity.
 *
 * For every namespace JSON in `src/i18n/locales/fr/<ns>.json` we expect
 * an exact match in `src/i18n/locales/en/<ns>.json` and vice-versa.
 * Object keys must be identical and arrays must have the same length so
 * `t('list', { returnObjects: true })` returns the same shape regardless
 * of locale.
 *
 * Exits non-zero on any mismatch — wired into CI so a missing translation
 * never reaches develop.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'src/i18n/locales';

function listNamespaces(locale) {
  return readdirSync(join(BASE, locale))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort();
}

function loadJson(locale, namespace) {
  return JSON.parse(readFileSync(join(BASE, locale, `${namespace}.json`), 'utf8'));
}

/**
 * Walk an object and emit a flat key path for every leaf and array element.
 * Object: foo.bar.baz
 * Array of primitives: foo.bar[0], foo.bar[1]
 * Array of objects: foo.bar[0].name, foo.bar[1].name
 */
function flatten(value, prefix = '') {
  const out = [];
  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      const path = `${prefix}[${i}]`;
      if (item !== null && typeof item === 'object') out.push(...flatten(item, path));
      else out.push(path);
    });
    return out;
  }
  if (value !== null && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      const path = prefix ? `${prefix}.${k}` : k;
      if (v !== null && typeof v === 'object') out.push(...flatten(v, path));
      else out.push(path);
    }
    return out;
  }
  return [prefix];
}

function diff(setA, setB) {
  return [...setA].filter((k) => !setB.has(k));
}

const frNamespaces = listNamespaces('fr');
const enNamespaces = listNamespaces('en');

let problems = 0;
let totalKeys = 0;

if (JSON.stringify(frNamespaces) !== JSON.stringify(enNamespaces)) {
  console.error('[FAIL] namespace lists differ');
  console.error('  fr:', frNamespaces);
  console.error('  en:', enNamespaces);
  problems++;
}

for (const namespace of frNamespaces) {
  if (!enNamespaces.includes(namespace)) continue;
  const frKeys = new Set(flatten(loadJson('fr', namespace)));
  const enKeys = new Set(flatten(loadJson('en', namespace)));

  const missingInEn = diff(frKeys, enKeys);
  const extraInEn = diff(enKeys, frKeys);

  if (missingInEn.length || extraInEn.length) {
    console.error(`[FAIL] ${namespace}: missing in EN=${missingInEn.length}, extra in EN=${extraInEn.length}`);
    if (missingInEn.length) console.error('  missing:', missingInEn.slice(0, 8).join(', '));
    if (extraInEn.length) console.error('  extra:', extraInEn.slice(0, 8).join(', '));
    problems++;
  } else {
    totalKeys += frKeys.size;
  }
}

if (problems) {
  console.error(`\nFR/EN parity broken in ${problems} namespace(s).`);
  process.exit(1);
}

console.log(`OK — ${frNamespaces.length} namespaces, ${totalKeys} keys aligned.`);
