import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import ora from 'ora';
import { loadConfig, TEMPLATE_MANIFEST } from '@migration-copilot/sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.resolve(__dirname, '..', '..', 'templates');

export async function upgradeCommand(): Promise<void> {
  const cwd = process.cwd();
  const config = loadConfig(cwd);

  if (!config) {
    console.log();
    console.log(chalk.red('❌ No migration.config.json found.'));
    console.log(
      chalk.white('   Run ') +
        chalk.bold('migrate-copilot init') +
        chalk.white(' first.'),
    );
    console.log();
    return;
  }

  const spinner = ora('Upgrading CLI-owned templates...').start();

  const updated: string[] = [];
  const skipped: string[] = [];

  for (const entry of TEMPLATE_MANIFEST) {
    // Only upgrade cli-owned templates
    if (entry.ownership !== 'cli-owned') {
      skipped.push(entry.target);
      continue;
    }

    // Skip entries with unmet conditions
    if (entry.condition && !entry.condition(config)) {
      skipped.push(entry.target);
      continue;
    }

    const sourcePath = path.resolve(templatesDir, entry.source);
    const targetPath = path.resolve(cwd, entry.target);

    if (!fs.existsSync(sourcePath)) {
      continue;
    }

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });

    if (fs.statSync(sourcePath).isDirectory()) {
      fs.cpSync(sourcePath, targetPath, { recursive: true });
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }

    updated.push(entry.target);
  }

  spinner.succeed('Upgrade complete');

  console.log();
  console.log(chalk.bold('📁 Updated files:'));
  for (const file of updated) {
    console.log(chalk.green(`   ✅ ${file}`));
  }

  if (skipped.length > 0) {
    console.log();
    console.log(
      chalk.dim(
        `   Preserved ${skipped.length} user-owned/skipped file(s)`,
      ),
    );
  }
  console.log();
}
