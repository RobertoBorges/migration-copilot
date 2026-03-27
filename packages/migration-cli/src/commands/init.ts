import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import ora from 'ora';
import { select } from '@inquirer/prompts';
import {
  detectFrameworks,
  createConfig,
  saveConfig,
  TEMPLATE_MANIFEST,
} from '@robertoborges/migration-copilot-sdk';
import type {
  AzurePlatform,
  IaCTool,
  DatabaseTarget,
} from '@robertoborges/migration-copilot-sdk';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const templatesDir = path.resolve(__dirname, '..', '..', 'templates');

const FRAMEWORK_LABELS: Record<string, string> = {
  'dotnet-framework': '.NET Framework',
  'dotnet-core': '.NET Core',
  'java-ee': 'Java EE',
  'java-spring': 'Spring Boot',
  'asp-classic': 'Classic ASP',
  wcf: 'WCF',
};

const LANGUAGE_LABELS: Record<string, string> = {
  csharp: 'C#',
  java: 'Java',
  vbscript: 'VBScript',
  unknown: 'Unknown',
};

export async function initCommand(): Promise<void> {
  // Welcome banner
  console.log();
  console.log(
    chalk.bold.cyan('🚀 Migration Copilot — Java/.NET → Azure Modernization'),
  );
  console.log();

  const cwd = process.cwd();

  // Framework auto-detection
  const spinner = ora('Scanning repository...').start();
  const detection = detectFrameworks(cwd);
  spinner.succeed('Scanning complete');

  // Display what was found
  console.log();
  if (detection.frameworks.length > 0) {
    const primary = detection.frameworks[0];
    const label = FRAMEWORK_LABELS[primary] ?? primary;
    const lang = LANGUAGE_LABELS[detection.language] ?? detection.language;
    const version = detection.frameworkVersion
      ? ` ${detection.frameworkVersion}`
      : '';
    console.log(
      chalk.white('🔍 Scanning repository...'),
    );
    console.log(
      chalk.white(
        `   Found: ${label}${version} (${lang}) — ${detection.projectFiles.length} project file(s)`,
      ),
    );
  } else {
    console.log(
      chalk.yellow('🔍 No frameworks detected — you can configure manually.'),
    );
  }
  console.log();

  // Interactive prompts
  const platform = (await select({
    message: 'Target Azure platform:',
    choices: [
      { name: 'App Service (recommended)', value: 'app-service' },
      { name: 'Container Apps', value: 'container-apps' },
      { name: 'AKS', value: 'aks' },
    ],
  })) as AzurePlatform;

  const iac = (await select({
    message: 'Infrastructure as Code:',
    choices: [
      { name: 'Bicep (recommended)', value: 'bicep' },
      { name: 'Terraform', value: 'terraform' },
    ],
  })) as IaCTool;

  const database = (await select({
    message: 'Database:',
    choices: [
      { name: 'Azure SQL Database (recommended)', value: 'azure-sql' },
      { name: 'Cosmos DB', value: 'cosmos-db' },
      { name: 'PostgreSQL', value: 'postgresql' },
    ],
  })) as DatabaseTarget;

  // Create and save config
  const config = createConfig(detection, { platform, iac, database });
  saveConfig(cwd, config);
  console.log();
  console.log(chalk.green('✅ Created migration.config.json'));

  // Scaffold templates
  const scaffolded: string[] = [];
  const skipped: string[] = [];

  for (const entry of TEMPLATE_MANIFEST) {
    // Skip entries with unmet conditions
    if (entry.condition && !entry.condition(config)) {
      skipped.push(entry.target);
      continue;
    }

    const targetPath = path.resolve(cwd, entry.target);

    // User-owned files are never overwritten
    if (entry.ownership === 'user-owned' && fs.existsSync(targetPath)) {
      skipped.push(entry.target);
      continue;
    }

    const sourcePath = path.resolve(templatesDir, entry.source);

    if (!fs.existsSync(sourcePath)) {
      continue;
    }

    // Ensure parent directory exists
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });

    // Copy directory or file
    if (fs.statSync(sourcePath).isDirectory()) {
      fs.cpSync(sourcePath, targetPath, { recursive: true });
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }

    scaffolded.push(entry.target);
  }

  // Summary
  console.log();
  console.log(chalk.bold('📁 Scaffolded files:'));
  for (const file of scaffolded) {
    console.log(chalk.green(`   ✅ ${file}`));
  }
  if (skipped.length > 0) {
    console.log();
    console.log(
      chalk.dim(
        `   Skipped ${skipped.length} file(s) (conditions not met or user-owned)`,
      ),
    );
  }

  // Next steps
  console.log();
  console.log(chalk.bold.cyan('🚀 Next steps:'));
  console.log(chalk.white('   1. Open GitHub Copilot Chat'));
  console.log(chalk.white('   2. Use @Code-Migration-Modernization agent'));
  console.log(chalk.white('   3. Or run: migrate-copilot assess'));
  console.log();
}
