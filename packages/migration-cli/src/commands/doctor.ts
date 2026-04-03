import { execSync } from 'node:child_process';
import chalk from 'chalk';
import { loadConfig } from '@robertoborges/cafmm-sdk';

function tryExec(command: string): string | null {
  try {
    return execSync(command, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return null;
  }
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const na = pa[i] ?? 0;
    const nb = pb[i] ?? 0;
    if (na !== nb) return na - nb;
  }
  return 0;
}

export async function doctorCommand(): Promise<void> {
  const cwd = process.cwd();
  const config = loadConfig(cwd);

  console.log();
  console.log(chalk.bold.cyan('🩺 cafmm — CAF Migrate & Modernize — Environment Check'));
  console.log();

  const checks: {
    name: string;
    command: string;
    required: boolean;
    minVersion?: string;
  }[] = [
    {
      name: 'Node.js',
      command: 'node --version',
      required: true,
      minVersion: '22.5.0',
    },
    {
      name: 'Azure CLI (az)',
      command: 'az --version',
      required: false,
    },
    {
      name: 'Azure Developer CLI (azd)',
      command: 'azd version',
      required: false,
    },
    {
      name: 'Docker',
      command: 'docker --version',
      required: config?.target.containerize === true,
    },
    {
      name: '.NET SDK',
      command: 'dotnet --version',
      required:
        config?.source.framework === 'dotnet-framework' ||
        config?.source.framework === 'dotnet-core',
    },
    {
      name: 'Java',
      command: 'java --version',
      required:
        config?.source.framework === 'java-ee' ||
        config?.source.framework === 'java-spring',
    },
  ];

  let hasErrors = false;

  for (const check of checks) {
    const output = tryExec(check.command);

    if (output) {
      const versionMatch = output.match(/(\d+\.\d+[\d.]*)/);
      const version = versionMatch?.[1] ?? '';

      if (
        check.minVersion &&
        version &&
        compareVersions(version, check.minVersion) < 0
      ) {
        console.log(
          chalk.red(
            `   ✗ ${check.name}: v${version} (requires >= ${check.minVersion})`,
          ),
        );
        hasErrors = true;
      } else {
        console.log(chalk.green(`   ✓ ${check.name}: v${version}`));
      }
    } else if (check.required) {
      console.log(chalk.red(`   ✗ ${check.name}: not found (required)`));
      hasErrors = true;
    } else {
      console.log(
        chalk.yellow(`   ⚠ ${check.name}: not found (recommended)`),
      );
    }
  }

  console.log();
  if (hasErrors) {
    console.log(
      chalk.red(
        'Some required tools are missing. Please install them before continuing.',
      ),
    );
  } else {
    console.log(
      chalk.green('All checks passed! Your environment is ready.'),
    );
  }
  console.log();
}
