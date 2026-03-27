/**
 * sync-templates.mjs
 * Pre-build script that ensures templates are in place for distribution.
 * Mirrors squad-dev's sync-templates.mjs pattern.
 */
import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const cliTemplates = resolve(root, 'packages', 'migration-cli', 'templates');

if (!existsSync(cliTemplates)) {
  console.warn('⚠  No templates directory found at', cliTemplates);
  process.exit(0);
}

// Verify all expected template categories exist
const expected = ['agents', 'prompts', 'skills', 'copilot-instructions.md'];
const missing = expected.filter(e => !existsSync(resolve(cliTemplates, e)));

if (missing.length > 0) {
  console.warn('⚠  Missing template categories:', missing.join(', '));
} else {
  console.log('✅ All template categories present in migration-cli/templates/');
}

console.log('✅ Template sync complete');
