/**
 * Reference a file under ios/App/App/ as a build resource of the App
 * target so it lands in App.app at build time.
 *
 * Used by the PrivacyInfo.xcprivacy step (PR Privacy Manifest) — we
 * commit the file alongside the source, but Xcode only bundles
 * resources that are referenced in project.pbxproj. Without this the
 * file is silently dropped from the .ipa, which is exactly the kind
 * of failure that triggers an App Store rejection.
 *
 * Idempotent: running it twice is a no-op.
 *
 * Usage: node scripts/add-ios-resource.mjs <relative-path>
 *
 * The npm `xcode` package's high-level addResourceFile() crashes when
 * a PBXGroup has `path` but no `name` (which is what Capacitor emits
 * for the App folder), so we wire the entries by hand: PBXFileReference
 * + PBXBuildFile + the Resources build phase + the App PBXGroup's
 * children list.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import xcode from 'xcode';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_PATH = join(__dirname, '..', 'ios/App/App.xcodeproj/project.pbxproj');

function findGroupByPath(project, path) {
  const groups = project.hash.project.objects.PBXGroup;
  for (const key of Object.keys(groups)) {
    if (key.endsWith('_comment')) continue;
    if (groups[key]?.path === path) return key;
  }
  return null;
}

function findResourcesBuildPhase(project) {
  const phases = project.hash.project.objects.PBXResourcesBuildPhase;
  for (const key of Object.keys(phases)) {
    if (key.endsWith('_comment')) continue;
    return key;
  }
  return null;
}

function main() {
  const relativePath = process.argv[2];
  if (!relativePath) {
    console.error('usage: node scripts/add-ios-resource.mjs <relative-path>');
    process.exit(1);
  }

  const project = xcode.project(PROJECT_PATH);
  project.parseSync();

  const fileName = relativePath.split('/').pop();

  // Idempotency check.
  const fileRefSection = project.pbxFileReferenceSection();
  for (const id of Object.keys(fileRefSection)) {
    if (id.endsWith('_comment')) continue;
    const entry = fileRefSection[id];
    if (entry?.path === fileName || entry?.name === fileName) {
      console.log(`[xcodeproj] ${fileName} already referenced — skipping.`);
      return;
    }
  }

  const appGroupKey = findGroupByPath(project, 'App');
  if (!appGroupKey) {
    console.error('[xcodeproj] PBXGroup with path="App" not found.');
    process.exit(1);
  }

  const resourcesPhaseKey = findResourcesBuildPhase(project);
  if (!resourcesPhaseKey) {
    console.error('[xcodeproj] PBXResourcesBuildPhase not found.');
    process.exit(1);
  }

  const fileRefUuid = project.generateUuid();
  const buildFileUuid = project.generateUuid();

  // 1) PBXFileReference declaration.
  project.hash.project.objects.PBXFileReference[fileRefUuid] = {
    isa: 'PBXFileReference',
    lastKnownFileType: 'text.xml',
    path: fileName,
    sourceTree: '"<group>"',
  };
  project.hash.project.objects.PBXFileReference[`${fileRefUuid}_comment`] = fileName;

  // 2) PBXBuildFile entry that ties the ref to the build phase.
  project.hash.project.objects.PBXBuildFile[buildFileUuid] = {
    isa: 'PBXBuildFile',
    fileRef: fileRefUuid,
    fileRef_comment: fileName,
  };
  project.hash.project.objects.PBXBuildFile[`${buildFileUuid}_comment`] = `${fileName} in Resources`;

  // 3) Add to the App PBXGroup so the file appears in the navigator.
  const appGroup = project.hash.project.objects.PBXGroup[appGroupKey];
  appGroup.children = appGroup.children || [];
  appGroup.children.push({ value: fileRefUuid, comment: fileName });

  // 4) Add to the Resources build phase so it ships in the bundle.
  const resourcesPhase = project.hash.project.objects.PBXResourcesBuildPhase[resourcesPhaseKey];
  resourcesPhase.files = resourcesPhase.files || [];
  resourcesPhase.files.push({ value: buildFileUuid, comment: `${fileName} in Resources` });

  writeFileSync(PROJECT_PATH, project.writeSync());
  console.log(`[xcodeproj] added ${fileName} as a build resource of the App target.`);
}

main();
