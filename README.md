# cafmm — CAF Migrate & Modernize

**Scaffold GitHub Copilot migration agents for Java/.NET → Azure modernization.**

cafmm distributes a complete set of custom agents, prompts, and skills for migrating legacy Java and .NET applications to Azure — installed via npm, scaffolded with one command, powered by GitHub Copilot.

## Quick Start

```bash
# Install globally
npm install -g @robertoborges/cafmm

# Navigate to your legacy project
cd my-legacy-app

# Scaffold + launch agent
cafmm init
```

Or use npx without installing:

```bash
npx @robertoborges/cafmm init
```

## Commands

| Command | Description |
|---------|-------------|
| `cafmm init` | Scaffold agents, prompts, skills into your repo, then launch Copilot |
| `cafmm` | Launch Copilot CLI with the cafmm agent |
| `cafmm status` | Show migration progress across all phases |
| `cafmm upgrade` | Update CLI-owned templates to latest version |
| `cafmm doctor` | Check prerequisites (az, azd, docker, dotnet/java) |
| `cafmm assess` | Show assessment guidance |

## What Gets Scaffolded

Running `cafmm init` creates:

```
your-repo/
├── .github/
│   ├── agents/
│   │   └── cafmm.agent.md                             # Custom Copilot agent
│   ├── prompts/                                        # Phase-guided workflows
│   │   ├── phase0-multi-repo-assessment.prompt.md
│   │   ├── phase1-planandassess.prompt.md
│   │   ├── phase2-migratecode.prompt.md
│   │   ├── phase3-generateinfra.prompt.md
│   │   ├── phase4-deploytoazure.prompt.md
│   │   ├── phase5-setupcicd.prompt.md
│   │   └── getstatus.prompt.md
│   ├── skills/                                         # Auto-selected based on detection
│   │   ├── dotnet-modernization/
│   │   ├── java-modernization/
│   │   ├── wcf-to-rest-migration/
│   │   ├── config-transformation/
│   │   ├── business-logic-mapping/
│   │   ├── migration-unit-testing/
│   │   ├── azure-containerization/
│   │   └── azure-infrastructure/
│   ├── hooks/                                          # Security & lifecycle hooks
│   │   ├── security.json
│   │   ├── validation.json
│   │   ├── session-lifecycle.json
│   │   └── scripts/
│   └── copilot-instructions.md
└── migration.config.json
```

## Migration Phases

| Phase | Name | What Happens |
|-------|------|-------------|
| 0 | Multi-Repo Assessment | Analyze multiple interconnected repositories |
| 1 | Plan & Assess | Discover frameworks, assess risks, create migration plan |
| 2 | Code Migration | Upgrade code (.NET 10 / Spring Boot 3.x), preserve business logic |
| 3 | Generate Infrastructure | Create Bicep or Terraform templates for Azure |
| 4 | Deploy to Azure | Deploy with Azure Developer CLI (azd) |
| 5 | Setup CI/CD | Configure GitHub Actions or Azure DevOps pipelines |

## Supported Technologies

| Source | Target |
|--------|--------|
| .NET Framework 2.x–4.8 | .NET 10 LTS |
| ASP.NET WebForms / MVC | ASP.NET Core |
| WCF (SOAP) | REST APIs |
| Java 8/11 + Spring Boot 2.x | Java 21 + Spring Boot 3.x |
| Java EE (EJB, JPA) | Spring Boot 3.x |

## Requirements

- Node.js >= 22.5.0
- GitHub Copilot CLI
- Azure CLI / Azure Developer CLI (for deployment)

Run `cafmm doctor` to check your environment.

## About

**cafmm** stands for **CAF Migrate & Modernize** — built for the Microsoft Cloud Adoption Framework to help organizations migrate and modernize legacy applications to Azure.

## License

MIT