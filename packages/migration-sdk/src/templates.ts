import type { MigrationConfig } from './types.js';

export type TemplateOwnership = 'cli-owned' | 'user-owned';

export interface TemplateEntry {
  source: string; // path relative to templates/ in the npm package
  target: string; // path relative to user's repo root
  ownership: TemplateOwnership;
  condition?: (config: MigrationConfig) => boolean;
}

// --- Helpers for condition predicates ---

function isDotnet(config: MigrationConfig): boolean {
  return config.source.framework === 'dotnet-framework' || config.source.framework === 'dotnet-core';
}

function isJava(config: MigrationConfig): boolean {
  return config.source.framework === 'java-spring' || config.source.framework === 'java-ee';
}

function hasSkill(skillId: string): (config: MigrationConfig) => boolean {
  return (config) => config.skills.includes(skillId as MigrationConfig['skills'][number]);
}

function needsContainer(config: MigrationConfig): boolean {
  return config.target.containerize;
}

// --- Template manifest ---

export const TEMPLATE_MANIFEST: readonly TemplateEntry[] = [
  // ── Agent ──
  {
    source: 'agents/migrate-copilot.agent.md',
    target: '.github/agents/migrate-copilot.agent.md',
    ownership: 'cli-owned',
  },

  // ── Prompts ──
  {
    source: 'prompts/GetStatus.prompt.md',
    target: '.github/prompts/GetStatus.prompt.md',
    ownership: 'cli-owned',
  },
  {
    source: 'prompts/Phase0-Multi-repo-assessment.prompt.md',
    target: '.github/prompts/Phase0-Multi-repo-assessment.prompt.md',
    ownership: 'cli-owned',
  },
  {
    source: 'prompts/Phase1-PlanAndAssess.prompt.md',
    target: '.github/prompts/Phase1-PlanAndAssess.prompt.md',
    ownership: 'cli-owned',
  },
  {
    source: 'prompts/Phase2-MigrateCode.prompt.md',
    target: '.github/prompts/Phase2-MigrateCode.prompt.md',
    ownership: 'cli-owned',
  },
  {
    source: 'prompts/Phase3-GenerateInfra.prompt.md',
    target: '.github/prompts/Phase3-GenerateInfra.prompt.md',
    ownership: 'cli-owned',
  },
  {
    source: 'prompts/Phase4-DeployToAzure.prompt.md',
    target: '.github/prompts/Phase4-DeployToAzure.prompt.md',
    ownership: 'cli-owned',
  },
  {
    source: 'prompts/Phase5-SetupCICD.prompt.md',
    target: '.github/prompts/Phase5-SetupCICD.prompt.md',
    ownership: 'cli-owned',
  },

  // ── Skills ──

  // azure-containerization (conditional: needs containerization)
  {
    source: 'skills/azure-containerization',
    target: '.github/skills/azure-containerization',
    ownership: 'cli-owned',
    condition: hasSkill('azure-containerization'),
  },

  // azure-infrastructure (always)
  {
    source: 'skills/azure-infrastructure',
    target: '.github/skills/azure-infrastructure',
    ownership: 'cli-owned',
  },

  // business-logic-mapping (conditional: dotnet or java)
  {
    source: 'skills/business-logic-mapping',
    target: '.github/skills/business-logic-mapping',
    ownership: 'cli-owned',
    condition: hasSkill('business-logic-mapping'),
  },

  // config-transformation (conditional: dotnet or java)
  {
    source: 'skills/config-transformation',
    target: '.github/skills/config-transformation',
    ownership: 'cli-owned',
    condition: hasSkill('config-transformation'),
  },

  // dotnet-modernization (conditional: dotnet)
  {
    source: 'skills/dotnet-modernization',
    target: '.github/skills/dotnet-modernization',
    ownership: 'cli-owned',
    condition: hasSkill('dotnet-modernization'),
  },

  // java-modernization (conditional: java)
  {
    source: 'skills/java-modernization',
    target: '.github/skills/java-modernization',
    ownership: 'cli-owned',
    condition: hasSkill('java-modernization'),
  },

  // migration-unit-testing (conditional: dotnet or java)
  {
    source: 'skills/migration-unit-testing',
    target: '.github/skills/migration-unit-testing',
    ownership: 'cli-owned',
    condition: hasSkill('migration-unit-testing'),
  },

  // wcf-to-rest-migration (conditional: WCF detected)
  {
    source: 'skills/wcf-to-rest-migration',
    target: '.github/skills/wcf-to-rest-migration',
    ownership: 'cli-owned',
    condition: hasSkill('wcf-to-rest-migration'),
  },

  // ── Copilot instructions ──
  {
    source: 'copilot-instructions.md',
    target: '.github/copilot-instructions.md',
    ownership: 'cli-owned',
  },

  // ── Migration config (user-owned) ──
  {
    source: 'migration.config.json',
    target: 'migration.config.json',
    ownership: 'user-owned',
  },
] as const;
