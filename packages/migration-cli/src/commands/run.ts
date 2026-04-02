import { execSync, spawn } from 'node:child_process';
import chalk from 'chalk';
import { loadConfig } from '@robertoborges/migration-copilot-sdk';

export async function runCommand(): Promise<void> {
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

  // Check that GitHub Copilot CLI is available
  try {
    execSync('copilot --version', { stdio: 'pipe' });
  } catch {
    console.log();
    console.log(chalk.red('❌ GitHub Copilot CLI not found.'));
    console.log(chalk.white('   Install it: https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line'));
    console.log();
    return;
  }

  console.log();
  console.log(chalk.bold.cyan('🚀 Launching migrate-copilot agent...'));
  console.log(chalk.dim('   Loading agent from .github/agents/migrate-copilot.agent.md'));
  console.log(chalk.dim('   Type /phase1-planandassess to start, or ask anything'));
  console.log();

  // Launch Copilot CLI with the agent
  const child = spawn('copilot', ['--agent', 'migrate-copilot'], {
    cwd,
    stdio: 'inherit',
    shell: true,
  });

  child.on('error', (err) => {
    console.error(chalk.red(`Failed to launch Copilot CLI: ${err.message}`));
  });

  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.log(chalk.yellow(`Copilot CLI exited with code ${code}`));
    }
  });
}
