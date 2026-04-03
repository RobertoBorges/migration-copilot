import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk';
import { loadConfig } from '@robertoborges/cafmm-sdk';

export async function statusCommand(): Promise<void> {
  const cwd = process.cwd();
  const statusFile = path.resolve(cwd, 'reports', 'Report-Status.md');

  if (fs.existsSync(statusFile)) {
    const content = fs.readFileSync(statusFile, 'utf-8');
    console.log();
    console.log(chalk.bold.cyan('📊 Migration Status'));
    console.log();
    console.log(content);
    return;
  }

  const config = loadConfig(cwd);

  if (config) {
    console.log();
    console.log(chalk.bold.cyan('📊 Migration Status'));
    console.log();
    console.log(
      chalk.yellow('   Migration initialized but no phases started yet.'),
    );
    console.log(
      chalk.dim(
        `   Source: ${config.source.framework} → Target: ${config.target.platform}`,
      ),
    );
    console.log();
    console.log(
      chalk.white('   Run ') +
        chalk.bold('cafmm assess') +
        chalk.white(' to begin Phase 1.'),
    );
    console.log();
    return;
  }

  console.log();
  console.log(
    chalk.red('❌ No migration found. Run `cafmm init` first.'),
  );
  console.log();
}
