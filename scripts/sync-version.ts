/**
 * Propagate package.json version to the iOS + Android native projects.
 *
 * Run: npm run sync:version
 *
 * Reads `package.json.version` (semver) and updates:
 *   - android/app/build.gradle      → versionName + versionCode
 *   - ios/App/App.xcodeproj/        → MARKETING_VERSION + CURRENT_PROJECT_VERSION
 *
 * Numeric build code derivation (Android versionCode + iOS
 * CURRENT_PROJECT_VERSION) is `major * 10000 + minor * 100 + patch`,
 * which keeps the value strictly increasing and stays well under
 * Android's 2_100_000_000 limit until major hits 200000.
 *
 * Both stores enforce monotonic build numbers per release; the formula
 * lets us re-derive the value from the semver string alone, so the
 * script is idempotent — re-running it for the same package.json
 * produces the same files and the next major/minor/patch bump always
 * climbs the build number.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PACKAGE_JSON = join(ROOT, 'package.json');
const ANDROID_GRADLE = join(ROOT, 'android/app/build.gradle');
const IOS_PBXPROJ = join(ROOT, 'ios/App/App.xcodeproj/project.pbxproj');

function parseSemver(raw: string): { major: number; minor: number; patch: number } {
  const match = raw.match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/);
  if (!match) throw new Error(`package.json.version "${raw}" is not a clean major.minor.patch semver`);
  return { major: Number(match[1]), minor: Number(match[2]), patch: Number(match[3]) };
}

function buildCode(major: number, minor: number, patch: number): number {
  return major * 10000 + minor * 100 + patch;
}

function updateAndroid(versionName: string, versionCode: number): boolean {
  const original = readFileSync(ANDROID_GRADLE, 'utf8');
  let next = original.replace(/versionName\s+"[^"]+"/, `versionName "${versionName}"`);
  next = next.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
  if (next === original) return false;
  writeFileSync(ANDROID_GRADLE, next);
  return true;
}

function updateIos(versionName: string, versionCode: number): boolean {
  const original = readFileSync(IOS_PBXPROJ, 'utf8');
  let next = original.replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${versionName};`);
  next = next.replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${versionCode};`);
  if (next === original) return false;
  writeFileSync(IOS_PBXPROJ, next);
  return true;
}

function main() {
  const pkg = JSON.parse(readFileSync(PACKAGE_JSON, 'utf8')) as { version?: string };
  if (!pkg.version) {
    console.error('package.json has no "version" field');
    process.exit(1);
  }
  const { major, minor, patch } = parseSemver(pkg.version);
  const code = buildCode(major, minor, patch);

  const androidChanged = updateAndroid(pkg.version, code);
  const iosChanged = updateIos(pkg.version, code);

  console.log(`[sync-version] target ${pkg.version} (build code ${code})`);
  console.log(`[sync-version] android/app/build.gradle: ${androidChanged ? 'updated' : 'unchanged'}`);
  console.log(`[sync-version] ios/App/App.xcodeproj/project.pbxproj: ${iosChanged ? 'updated' : 'unchanged'}`);
}

main();
