import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  AzurePlatform,
  DatabaseTarget,
  DetectionResult,
  IaCTool,
  MigrationConfig,
  SkillId,
  SourceFramework,
} from './types.js';

const CONFIG_FILENAME = 'migration.config.json';

/**
 * Auto-select skills based on detected frameworks and chosen Azure platform.
 */
export function selectSkills(detection: DetectionResult, platform: AzurePlatform): SkillId[] {
  const skills = new Set<SkillId>();

  // Always include infrastructure
  skills.add('azure-infrastructure');

  const isDotnet = detection.frameworks.some(
    (f) => f === 'dotnet-framework' || f === 'dotnet-core',
  );
  const isJava = detection.frameworks.some((f) => f === 'java-spring' || f === 'java-ee');

  if (isDotnet) {
    skills.add('dotnet-modernization');
    skills.add('config-transformation');
    skills.add('business-logic-mapping');
    skills.add('migration-unit-testing');
  }

  if (detection.hasWcf || detection.frameworks.includes('wcf')) {
    skills.add('wcf-to-rest-migration');
  }

  if (isJava) {
    skills.add('java-modernization');
    skills.add('config-transformation');
    skills.add('business-logic-mapping');
    skills.add('migration-unit-testing');
  }

  if (platform === 'container-apps' || platform === 'aks') {
    skills.add('azure-containerization');
  }

  return [...skills];
}

/**
 * Pick the primary framework from the detection result.
 */
function pickPrimaryFramework(detection: DetectionResult): SourceFramework {
  // WCF is an add-on; prefer the underlying dotnet framework
  const nonWcf = detection.frameworks.filter((f) => f !== 'wcf');
  return nonWcf[0] ?? detection.frameworks[0] ?? 'dotnet-framework';
}

/**
 * Create a new MigrationConfig from detection results and user choices.
 */
export function createConfig(
  detection: DetectionResult,
  userChoices: { platform: AzurePlatform; iac: IaCTool; database: DatabaseTarget },
): MigrationConfig {
  const now = new Date().toISOString();
  const primaryFramework = pickPrimaryFramework(detection);
  const containerize = userChoices.platform === 'container-apps' || userChoices.platform === 'aks';

  return {
    version: 1,
    source: {
      framework: primaryFramework,
      frameworkVersion: detection.frameworkVersion,
      language: detection.language,
    },
    target: {
      platform: userChoices.platform,
      iac: userChoices.iac,
      database: userChoices.database,
      containerize,
    },
    skills: selectSkills(detection, userChoices.platform),
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Load a MigrationConfig from a directory. Returns null if the file doesn't exist.
 */
export function loadConfig(dir: string): MigrationConfig | null {
  try {
    const raw = readFileSync(join(dir, CONFIG_FILENAME), 'utf-8');
    return JSON.parse(raw) as MigrationConfig;
  } catch {
    return null;
  }
}

/**
 * Save a MigrationConfig to a directory, updating the `updatedAt` timestamp.
 */
export function saveConfig(dir: string, config: MigrationConfig): void {
  const updated: MigrationConfig = { ...config, updatedAt: new Date().toISOString() };
  writeFileSync(join(dir, CONFIG_FILENAME), JSON.stringify(updated, null, 2) + '\n', 'utf-8');
}
