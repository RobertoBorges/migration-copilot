export type SourceFramework =
  | 'dotnet-framework' // .NET Framework 2.x-4.8
  | 'dotnet-core' // .NET Core / .NET 5+
  | 'java-ee' // Java EE / Jakarta EE
  | 'java-spring' // Spring Boot
  | 'asp-classic' // Classic ASP (VBScript)
  | 'wcf'; // Windows Communication Foundation

export type AzurePlatform = 'app-service' | 'container-apps' | 'aks';
export type IaCTool = 'bicep' | 'terraform';
export type DatabaseTarget = 'azure-sql' | 'cosmos-db' | 'postgresql';

export type MigrationPhase = 0 | 1 | 2 | 3 | 4 | 5;

export type SkillId =
  | 'azure-containerization'
  | 'azure-infrastructure'
  | 'business-logic-mapping'
  | 'config-transformation'
  | 'dotnet-modernization'
  | 'java-modernization'
  | 'migration-unit-testing'
  | 'wcf-to-rest-migration';

export interface DetectionResult {
  frameworks: SourceFramework[];
  projectFiles: string[]; // paths to .csproj, pom.xml, etc.
  configFiles: string[]; // paths to web.config, app.config, etc.
  frameworkVersion?: string; // e.g., "4.5.1", "3.5", "1.8"
  hasWcf: boolean;
  hasDocker: boolean;
  language: 'csharp' | 'java' | 'vbscript' | 'unknown';
}

export interface MigrationConfig {
  version: number; // schema version (1)
  source: {
    framework: SourceFramework;
    frameworkVersion?: string;
    language: string;
  };
  target: {
    platform: AzurePlatform;
    iac: IaCTool;
    database: DatabaseTarget;
    containerize: boolean;
  };
  skills: SkillId[];
  createdAt: string; // ISO 8601
  updatedAt: string;
}

export interface PhaseStatus {
  phase: MigrationPhase;
  name: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'skipped';
  completedAt?: string;
}

export interface MigrationStatus {
  phases: PhaseStatus[];
  overallProgress: number; // 0-100
  currentPhase: MigrationPhase;
}
