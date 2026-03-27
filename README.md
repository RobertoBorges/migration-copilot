# Migration Copilot CLI

**Scaffold GitHub Copilot migration agents for Java/.NET → Azure modernization.**

Migration Copilot distributes a complete set of custom agents, prompts, and skills for migrating legacy Java and .NET applications to Azure — installed via npm, scaffolded with one command.

## Quick Start

```bash
# Install globally
npm install -g @migration-copilot/cli

# Navigate to your legacy project
cd my-legacy-app

# Scaffold migration agents
migrate-copilot init

# Open Copilot Chat and use the agent
# @Code-Migration-Modernization
```

Or use npx without installing:

```bash
npx @migration-copilot/cli init
```

## Commands

| Command | Description |
|---------|-------------|
| `migrate-copilot init` | Scaffold migration agents, prompts, and skills into your repo |
| `migrate-copilot assess` | Guide through Phase 1 assessment |
| `migrate-copilot status` | Show migration progress across all phases |
| `migrate-copilot upgrade` | Update CLI-owned templates to latest version |
| `migrate-copilot doctor` | Check prerequisites (az, azd, docker, dotnet/java) |

## What Gets Scaffolded

Running `migrate-copilot init` creates:

```
your-repo/
├── .github/
│   ├── agents/
│   │   └── Code-Migration-Modernization.agent.md    # Custom Copilot agent
│   ├── prompts/
│   │   ├── Phase0-Multi-repo-assessment.prompt.md   # Multi-repo assessment
│   │   ├── Phase1-PlanAndAssess.prompt.md            # Planning & assessment
│   │   ├── Phase2-MigrateCode.prompt.md              # Code migration
│   │   ├── Phase3-GenerateInfra.prompt.md             # Infrastructure as Code
│   │   ├── Phase4-DeployToAzure.prompt.md             # Azure deployment
│   │   ├── Phase5-SetupCICD.prompt.md                 # CI/CD setup
│   │   └── GetStatus.prompt.md                        # Check progress
│   ├── skills/                                        # Auto-selected based on detection
│   │   ├── dotnet-modernization/                      # .NET Framework → .NET 10
│   │   ├── java-modernization/                        # Java EE → Spring Boot 3.x
│   │   ├── wcf-to-rest-migration/                     # WCF → REST APIs
│   │   ├── config-transformation/                     # web.config → appsettings.json
│   │   ├── business-logic-mapping/                    # Preserve business logic
│   │   ├── migration-unit-testing/                    # Validation tests
│   │   ├── azure-containerization/                    # Docker & containers
│   │   └── azure-infrastructure/                      # Bicep/Terraform IaC
│   └── copilot-instructions.md                        # Migration context
└── migration.config.json                              # Your migration preferences
```

## Migration Phases

The migration agent guides you through 6 phases:

| Phase | Name | What Happens |
|-------|------|-------------|
| 0 | Multi-Repo Assessment | Analyze multiple interconnected repositories |
| 1 | Plan & Assess | Discover frameworks, assess risks, create migration plan |
| 2 | Code Migration | Upgrade code (.NET 10 / Spring Boot 3.x), preserve business logic |
| 3 | Generate Infrastructure | Create Bicep or Terraform templates for Azure |
| 4 | Deploy to Azure | Deploy with Azure Developer CLI (azd) |
| 5 | Setup CI/CD | Configure GitHub Actions or Azure DevOps pipelines |

## Supported Source Technologies

| Technology | Migration Target |
|-----------|-----------------|
| .NET Framework 2.x–4.8 | .NET 10 LTS |
| ASP.NET WebForms / MVC | ASP.NET Core |
| WCF (SOAP) | ASP.NET Core REST APIs |
| Classic ASP (VBScript) | ASP.NET Core |
| Java 8/11 + Spring Boot 2.x | Java 21 + Spring Boot 3.x |
| Java EE (EJB, JPA) | Spring Boot 3.x |

## Azure Target Platforms

| Platform | Best For | Complexity |
|----------|----------|-----------|
| **App Service** | Simple web apps/APIs | Low |
| **Container Apps** | Microservices, event-driven | Medium |
| **AKS** | Complex orchestration, full K8s | High |

## Auto-Detection

The CLI automatically detects your framework by scanning for:
- `.csproj` / `.sln` files (parses TargetFramework)
- `pom.xml` / `build.gradle` (checks for Spring Boot)
- `web.config` with `<system.serviceModel>` (WCF detection)
- `.asp` files (Classic ASP)
- `Dockerfile` (existing containerization)

Based on detection, only relevant skills are installed.

## Upgrading

When a new version of Migration Copilot is released:

```bash
npm install -g @migration-copilot/cli@latest
migrate-copilot upgrade
```

This updates CLI-owned files (agent, prompts, skills) while preserving your `migration.config.json` and any customizations.

## Requirements

- Node.js >= 22.5.0
- Azure CLI (`az`) — for deployment phases
- Azure Developer CLI (`azd`) — for deployment phases
- Docker — if containerization is selected
- .NET SDK / Java SDK — depending on your source technology

Run `migrate-copilot doctor` to check your environment.

## License

MIT
