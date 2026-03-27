#!/usr/bin/env node
import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { assessCommand } from './commands/assess.js';
import { statusCommand } from './commands/status.js';
import { upgradeCommand } from './commands/upgrade.js';
import { doctorCommand } from './commands/doctor.js';

const program = new Command();

program
  .name('migrate-copilot')
  .version('1.0.0')
  .description(
    'Scaffold GitHub Copilot migration agents for Java/.NET → Azure modernization',
  );

program
  .command('init')
  .description('Initialize migration scaffolding in the current repository')
  .action(initCommand);

program
  .command('assess')
  .description('Run the migration assessment phase')
  .action(assessCommand);

program
  .command('status')
  .description('Show migration status and phase progress')
  .action(statusCommand);

program
  .command('upgrade')
  .description('Upgrade CLI-owned templates to latest versions')
  .action(upgradeCommand);

program
  .command('doctor')
  .description('Check prerequisites and environment setup')
  .action(doctorCommand);

program.parse();
