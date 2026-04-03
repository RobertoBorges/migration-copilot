# cafmm — CAF Migrate & Modernize

**Scaffold GitHub Copilot migration agents for Java/.NET → Azure modernization.**

cafmm distributes a complete set of custom agents, prompts, and skills for migrating legacy Java and .NET applications to Azure — installed via npm, scaffolded with one command, powered by GitHub Copilot.

Built for the **Microsoft Cloud Adoption Framework (CAF)** to help organizations migrate and modernize legacy applications to Azure.

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

## What Happens When You Run `cafmm init`

```
$ cafmm init

🚀 cafmm — CAF Migrate & Modernize — Java/.NET → Azure

🔍 Scanning repository...
   Found: .NET Framework 4.5.1 (C#) — 4 project file(s)
   ⚡ WCF services detected

? Target Azure platform:  App Service (recommended)
? Infrastructure as Code: Bicep (recommended)
? Database:               Azure SQL Database (recommended)

✅ Created migration.config.json

📁 Scaffolded files:
   ✅ .github/agents/cafmm.agent.md
   ✅ .github/prompts/phase1-planandassess.prompt.md
   ✅ .github/prompts/phase2-migratecode.prompt.md
   ...14 more files...
   ✅ .github/skills/dotnet-modernization
   ✅ .github/skills/wcf-to-rest-migration
   ✅ .github/hooks/security.json

🚀 Launching cafmm agent...
```

The CLI auto-detects your framework, asks 3 questions, scaffolds everything, then drops you directly into GitHub Copilot with the agent loaded.

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
│   │   ├── dotnet-modernization/                       # .NET Framework → .NET 10
│   │   ├── java-modernization/                         # Java EE → Spring Boot 3.x
│   │   ├── wcf-to-rest-migration/                      # WCF SOAP → REST APIs
│   │   ├── config-transformation/                      # web.config → appsettings.json
│   │   ├── business-logic-mapping/                     # Preserve business logic
│   │   ├── migration-unit-testing/                     # Validation & regression tests
│   │   ├── azure-containerization/                     # Docker & Container Apps
│   │   └── azure-infrastructure/                       # Bicep / Terraform IaC
│   ├── hooks/                                          # Agent lifecycle hooks
│   │   ├── security.json                               # Block secrets & dangerous commands
│   │   ├── validation.json                             # Auto-validate IaC edits
│   │   ├── session-lifecycle.json                      # Context injection & audit trail
│   │   └── scripts/                                    # Hook implementations (PS + Bash)
│   └── copilot-instructions.md                         # Migration context for all Copilot interactions
└── migration.config.json                               # Your migration preferences (user-owned)
```

## Migration Phases

The cafmm agent guides you through a structured 6-phase migration:

| Phase | Name | What Happens |
|-------|------|-------------|
| 0 | Multi-Repo Assessment | Analyze multiple interconnected repositories (optional, for enterprise) |
| 1 | Plan & Assess | Discover frameworks, assess risks, create migration plan and reports |
| 2 | Code Migration | Upgrade code to .NET 10 / Spring Boot 3.x, preserve all business logic |
| 3 | Generate Infrastructure | Create Bicep or Terraform templates for Azure deployment |
| 4 | Deploy to Azure | Deploy with Azure Developer CLI (azd), validate and test |
| 5 | Setup CI/CD | Configure GitHub Actions or Azure DevOps pipelines |

Progress is tracked in `reports/Report-Status.md` — use `cafmm status` to check anytime.

## Auto-Detection

The CLI automatically detects your framework by scanning for:

| Indicator | Detection |
|-----------|-----------|
| `.csproj` / `.sln` | .NET (parses `TargetFramework` / `TargetFrameworkVersion`) |
| `pom.xml` | Java (checks for `spring-boot-starter` → Spring Boot vs Java EE) |
| `build.gradle` | Java (checks for `org.springframework.boot`) |
| `web.config` + `<system.serviceModel>` | WCF services |
| `.asp` files | Classic ASP (VBScript) |
| `Dockerfile` | Existing containerization |

Based on detection, **only relevant skills are installed**:

| Detected Framework | Skills Installed |
|-------------------|-----------------|
| .NET Framework | dotnet-modernization, config-transformation, business-logic-mapping, migration-unit-testing |
| .NET + WCF | Above + wcf-to-rest-migration |
| Java / Spring Boot | java-modernization, config-transformation, business-logic-mapping, migration-unit-testing |
| Container Apps / AKS target | Above + azure-containerization |
| Always | azure-infrastructure |

## Supported Technologies

| Source | Target |
|--------|--------|
| .NET Framework 2.x–4.8 | .NET 10 LTS |
| .NET Core 2.1 / 3.1 | .NET 10 LTS |
| ASP.NET WebForms / MVC | ASP.NET Core (Razor Pages / MVC) |
| WCF (SOAP) | ASP.NET Core REST APIs with OpenAPI |
| Classic ASP (VBScript) | ASP.NET Core |
| Java 8/11 + Spring Boot 2.x | Java 21 + Spring Boot 3.x |
| Java EE (EJB, JPA, JAAS) | Spring Boot 3.x |

## Azure Target Platforms

| Platform | Best For | Complexity |
|----------|----------|-----------|
| **App Service** | Simple web apps, APIs, quick deployment | Low |
| **Container Apps** | Microservices, event-driven, serverless containers | Medium |
| **AKS** | Complex orchestration, full Kubernetes control | High |

## Agent Lifecycle Hooks

cafmm includes security and automation hooks that run at the OS level:

| Hook | What It Does |
|------|-------------|
| **Secret Blocking** | Prevents hardcoded passwords, API keys, connection strings, SAS tokens from being committed |
| **Dangerous Command Blocking** | Blocks `rm -rf`, `terraform destroy`, `DROP TABLE`, `git push --force`, etc. |
| **Auto-Validation** | Reminds to validate after editing `.bicep`, `.tf`, `.csproj`, or `Dockerfile` |
| **Context Injection** | Loads current migration phase, target platform, and detected tech on session start |
| **Audit Trail** | Appends session timestamps to Report-Status.md for compliance tracking |

## Upgrading

When a new version is released:

```bash
npm install -g @robertoborges/cafmm@latest
cafmm upgrade
```

This updates **CLI-owned files** (agent, prompts, skills, hooks) while preserving your `migration.config.json` and any customizations you've made.

### File Ownership

| Ownership | Files | On Upgrade |
|-----------|-------|-----------|
| **CLI-owned** | Agent, prompts, skills, hooks, copilot-instructions | Overwritten with latest |
| **User-owned** | migration.config.json, reports/ | Never touched |

## Requirements

| Tool | Required | Notes |
|------|----------|-------|
| Node.js >= 22.5.0 | ✅ Yes | Runtime for cafmm CLI |
| GitHub Copilot CLI | ✅ Yes | Agent execution environment |
| Azure CLI (`az`) | Recommended | For deployment phases |
| Azure Developer CLI (`azd`) | Recommended | For `azd up` deployment |
| Docker | If containerizing | For Container Apps / AKS targets |
| .NET SDK | If .NET detected | For building migrated .NET apps |
| Java SDK | If Java detected | For building migrated Java apps |

Run `cafmm doctor` to check your environment:

```
$ cafmm doctor

🩺 cafmm — CAF Migrate & Modernize — Environment Check

   ✓ Node.js: v25.9.0
   ✓ Azure CLI (az): v2.80.0
   ✓ Azure Developer CLI (azd): v1.23.13
   ✓ Docker: v29.3.0
   ✓ .NET SDK: v10.0.104
   ⚠ Java: not found (recommended)

All checks passed! Your environment is ready.
```

## Project Structure

```
cafmm/
├── packages/
│   ├── migration-cli/          # CLI package (@robertoborges/cafmm)
│   │   ├── src/commands/       # init, status, doctor, upgrade, assess, run
│   │   └── templates/          # Agent, prompts, skills, hooks shipped with npm
│   └── migration-sdk/          # SDK package (@robertoborges/cafmm-sdk)
│       └── src/                # Detection, config, types, template manifest
├── scripts/                    # Build-time template sync & version bump
├── .github/workflows/          # CI + npm publish workflows
└── package.json                # Workspace root
```

## About

**cafmm** stands for **CAF Migrate & Modernize** — built for the Microsoft Cloud Adoption Framework to help organizations migrate and modernize legacy applications to Azure.

## License

MIT