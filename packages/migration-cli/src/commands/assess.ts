import chalk from 'chalk';
import { loadConfig } from '@robertoborges/migration-copilot-sdk';

export async function assessCommand(): Promise<void> {
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

  console.log();
  console.log(chalk.bold.cyan('📋 To run the assessment:'));
  console.log(chalk.white('   1. Open GitHub Copilot Chat'));
  console.log(chalk.white('   2. Type: /Phase1-PlanAndAssess'));
  console.log(
    chalk.white(
      '   3. The agent will analyze your codebase and generate reports/Application-Assessment-Report.md',
    ),
  );
  console.log();
}
