/**
 * bump-version.mjs
 * Increment build number for pre-release versions.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const packages = ['packages/migration-cli/package.json', 'packages/migration-sdk/package.json'];

for (const pkg of packages) {
  const filePath = resolve(root, pkg);
  const json = JSON.parse(readFileSync(filePath, 'utf-8'));
  const [base, build] = json.version.split('-build.');
  const newBuild = build ? parseInt(build, 10) + 1 : 1;
  json.version = `${base}-build.${newBuild}`;
  writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n');
  console.log(`📦 ${json.name} → ${json.version}`);
}
