import { createInterface } from 'node:readline';
import { execSync, spawnSync } from 'node:child_process';
import chalk from 'chalk';
import { loadConfig } from '@robertoborges/migration-copilot-sdk';
import type { MigrationConfig } from '@robertoborges/migration-copilot-sdk';

interface MenuItem {
  key: string;
  label: string;
  description: string;
  action: (config: MigrationConfig) => void | Promise<void>;
}

function showBanner(): void {
  console.log();
  console.log(chalk.bold.cyan('┌─────────────────────────────────────────────────┐'));
  console.log(chalk.bold.cyan('│') + chalk.bold('  🚀 Migration Copilot — Interactive Shell       ') + chalk.bold.cyan('│'));
  console.log(chalk.bold.cyan('│') + chalk.dim('  Java/.NET → Azure Modernization                ') + chalk.bold.cyan('│'));
  console.log(chalk.bold.cyan('└─────────────────────────────────────────────────┘'));
  console.log();
}

function showMenu(config: MigrationConfig): void {
  const framework = config.source.framework;
  const version = config.source.frameworkVersion ?? '';
  const platform = config.target.platform;

  console.log(chalk.dim(`  Project: ${framework} ${version} → ${platform}`));
  console.log();
  console.log(chalk.bold('  Migration Phases:'));
  console.log();
  console.log(chalk.white('    0') + chalk.dim(')') + chalk.white(' Multi-Repo Assessment') + chalk.dim('  — Analyze multiple repositories'));
  console.log(chalk.white('    1') + chalk.dim(')') + chalk.white(' Plan & Assess') + chalk.dim('         — Discover frameworks, assess risks'));
  console.log(chalk.white('    2') + chalk.dim(')') + chalk.white(' Migrate Code') + chalk.dim('          — Upgrade code to modern framework'));
  console.log(chalk.white('    3') + chalk.dim(')') + chalk.white(' Generate Infra') + chalk.dim('        — Create Bicep/Terraform templates'));
  console.log(chalk.white('    4') + chalk.dim(')') + chalk.white(' Deploy to Azure') + chalk.dim('       — Deploy with azd'));
  console.log(chalk.white('    5') + chalk.dim(')') + chalk.white(' Setup CI/CD') + chalk.dim('           — Configure pipelines'));
  console.log();
  console.log(chalk.bold('  Tools:'));
  console.log();
  console.log(chalk.white('    s') + chalk.dim(')') + chalk.white(' Status') + chalk.dim('                — Check migration progress'));
  console.log(chalk.white('    d') + chalk.dim(')') + chalk.white(' Doctor') + chalk.dim('                — Check prerequisites'));
  console.log(chalk.white('    u') + chalk.dim(')') + chalk.white(' Upgrade') + chalk.dim('               — Update templates'));
  console.log(chalk.white('    r') + chalk.dim(')') + chalk.white(' Run Agent') + chalk.dim('             — Launch Copilot CLI with agent'));
  console.log(chalk.white('    q') + chalk.dim(')') + chalk.white(' Quit'));
  console.log();
}

function launchPhase(phase: number, config: MigrationConfig): void {
  const prompts: Record<number, string> = {
    0: 'phase0-multi-repo-assessment',
    1: 'phase1-planandassess',
    2: 'phase2-migratecode',
    3: 'phase3-generateinfra',
    4: 'phase4-deploytoazure',
    5: 'phase5-setupcicd',
  };

  const promptName = prompts[phase];
  if (!promptName) return;

  console.log();
  console.log(chalk.bold.cyan(`  🚀 Launching Phase ${phase}...`));
  console.log(chalk.dim(`     Prompt: /${promptName}`));
  console.log();

  try {
    execSync('copilot --version', { stdio: 'pipe' });

    console.log(chalk.white('  Starting Copilot CLI with migrate-copilot agent...'));
    console.log(chalk.dim(`  The agent will run /${promptName} automatically.`));
    console.log();

    // Launch copilot with the agent — stdin inherited for interactive use
    spawnSync('copilot', ['--agent', 'migrate-copilot', '--message', `/${promptName}`], {
      cwd: process.cwd(),
      stdio: 'inherit',
      shell: true,
    });
  } catch {
    console.log(chalk.yellow('  ⚠ Copilot CLI not found. Run the phase manually:'));
    console.log();
    console.log(chalk.white(`     1. Open GitHub Copilot Chat (VS Code)`));
    console.log(chalk.white(`     2. Select @migrate-copilot agent`));
    console.log(chalk.white(`     3. Type: /${promptName}`));
    console.log();
  }
}

function prompt(rl: ReturnType<typeof createInterface>, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

export async function shellCommand(): Promise<void> {
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

  showBanner();
  showMenu(config);

  const rl = createInterface({ input: process.stdin, output: process.stdout });

  let running = true;
  while (running) {
    const answer = await prompt(rl, chalk.cyan('  migrate-copilot> '));
    const input = answer.trim().toLowerCase();

    switch (input) {
      case '0': case '1': case '2': case '3': case '4': case '5':
        launchPhase(parseInt(input, 10), config);
        showMenu(config);
        break;

      case 's': case 'status': {
        const { statusCommand } = await import('./status.js');
        await statusCommand();
        break;
      }

      case 'd': case 'doctor': {
        const { doctorCommand } = await import('./doctor.js');
        await doctorCommand();
        break;
      }

      case 'u': case 'upgrade': {
        const { upgradeCommand } = await import('./upgrade.js');
        await upgradeCommand();
        break;
      }

      case 'r': case 'run': {
        const { runCommand } = await import('./run.js');
        await runCommand();
        break;
      }

      case 'q': case 'quit': case 'exit':
        running = false;
        break;

      case '': case 'h': case 'help': case '?':
        showMenu(config);
        break;

      default:
        console.log(chalk.yellow(`  Unknown command: ${input}. Press h for help.`));
        break;
    }
  }

  rl.close();
  console.log();
  console.log(chalk.dim('  Goodbye! 👋'));
  console.log();
}
