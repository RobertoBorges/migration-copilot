import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { DetectionResult, SourceFramework } from './types.js';

/**
 * Scan a directory tree and return all file paths relative to `rootDir`.
 */
function listFiles(rootDir: string): string[] {
  const entries = readdirSync(rootDir, { recursive: true, withFileTypes: false }) as string[];
  return entries.map((entry) => entry.replace(/\\/g, '/'));
}

function readText(rootDir: string, relPath: string): string {
  return readFileSync(join(rootDir, relPath), 'utf-8');
}

/**
 * Parse a .csproj file and determine the target framework.
 * Returns 'dotnet-framework' for net4x / v4.x, 'dotnet-core' for net5+ / netcoreapp, etc.
 */
function parseCsprojFramework(
  content: string,
): { framework: SourceFramework; version: string | undefined } {
  // SDK-style: <TargetFramework>net8.0</TargetFramework>
  const sdkMatch = content.match(/<TargetFramework>([\w.]+)<\/TargetFramework>/i);
  if (sdkMatch) {
    const tfm = sdkMatch[1].toLowerCase();
    if (tfm.startsWith('netcoreapp') || /^net\d+\.\d+$/.test(tfm) || /^net\d+$/.test(tfm)) {
      const ver = tfm.replace('netcoreapp', '').replace('net', '');
      return { framework: 'dotnet-core', version: ver };
    }
    if (tfm.startsWith('net') && !tfm.startsWith('netstandard')) {
      const ver = tfm.replace('net', '').replace(/(\d)(\d)(\d?)/, '$1.$2.$3').replace(/\.$/, '');
      return { framework: 'dotnet-framework', version: ver };
    }
  }

  // Legacy-style: <TargetFrameworkVersion>v4.5.1</TargetFrameworkVersion>
  const legacyMatch = content.match(/<TargetFrameworkVersion>v([\d.]+)<\/TargetFrameworkVersion>/i);
  if (legacyMatch) {
    return { framework: 'dotnet-framework', version: legacyMatch[1] };
  }

  return { framework: 'dotnet-framework', version: undefined };
}

/**
 * Detect whether a pom.xml references Spring Boot (parent or dependency).
 */
function isSpringBoot(pomContent: string): boolean {
  return (
    pomContent.includes('spring-boot-starter-parent') ||
    pomContent.includes('spring-boot-starter')
  );
}

/**
 * Auto-detect the source framework(s) present in a project directory.
 */
export function detectFrameworks(rootDir: string): DetectionResult {
  const allFiles = listFiles(rootDir);

  const frameworks = new Set<SourceFramework>();
  const projectFiles: string[] = [];
  const configFiles: string[] = [];
  let frameworkVersion: string | undefined;
  let hasWcf = false;
  let hasDocker = false;
  let language: DetectionResult['language'] = 'unknown';

  // --- .csproj files ---
  const csprojFiles = allFiles.filter((f) => f.endsWith('.csproj'));
  for (const f of csprojFiles) {
    projectFiles.push(f);
    const content = readText(rootDir, f);
    const parsed = parseCsprojFramework(content);
    frameworks.add(parsed.framework);
    if (parsed.version) {
      frameworkVersion = parsed.version;
    }
    language = 'csharp';
  }

  // --- .sln files ---
  const slnFiles = allFiles.filter((f) => f.endsWith('.sln'));
  for (const f of slnFiles) {
    projectFiles.push(f);
    if (language === 'unknown') {
      language = 'csharp';
    }
  }

  // --- pom.xml ---
  const pomFiles = allFiles.filter((f) => f.endsWith('pom.xml'));
  for (const f of pomFiles) {
    projectFiles.push(f);
    const content = readText(rootDir, f);
    if (isSpringBoot(content)) {
      frameworks.add('java-spring');
    } else {
      frameworks.add('java-ee');
    }
    language = 'java';

    // Try to extract Java version
    const javaVerMatch = content.match(/<java\.version>([\d.]+)<\/java\.version>/);
    if (javaVerMatch) {
      frameworkVersion = javaVerMatch[1];
    }
  }

  // --- build.gradle ---
  const gradleFiles = allFiles.filter(
    (f) => f.endsWith('build.gradle') || f.endsWith('build.gradle.kts'),
  );
  for (const f of gradleFiles) {
    projectFiles.push(f);
    const content = readText(rootDir, f);
    if (content.includes('spring-boot') || content.includes('org.springframework.boot')) {
      frameworks.add('java-spring');
    } else if (!frameworks.has('java-spring')) {
      frameworks.add('java-ee');
    }
    language = 'java';
  }

  // --- Classic ASP ---
  const aspFiles = allFiles.filter((f) => f.toLowerCase().endsWith('.asp'));
  if (aspFiles.length > 0) {
    frameworks.add('asp-classic');
    language = 'vbscript';
    for (const f of aspFiles) {
      projectFiles.push(f);
    }
  }

  // --- web.config / app.config ---
  const webConfigs = allFiles.filter(
    (f) => f.toLowerCase().endsWith('web.config') || f.toLowerCase().endsWith('app.config'),
  );
  for (const f of webConfigs) {
    configFiles.push(f);
    const content = readText(rootDir, f);
    if (content.includes('<system.serviceModel>') || content.includes('<system.serviceModel ')) {
      hasWcf = true;
      frameworks.add('wcf');
    }
  }

  // --- Other config files ---
  const otherConfigs = allFiles.filter(
    (f) =>
      f.toLowerCase().endsWith('appsettings.json') ||
      f.toLowerCase().endsWith('application.properties') ||
      f.toLowerCase().endsWith('application.yml') ||
      f.toLowerCase().endsWith('application.yaml'),
  );
  for (const f of otherConfigs) {
    configFiles.push(f);
  }

  // --- Dockerfile ---
  const dockerFiles = allFiles.filter(
    (f) => f.toLowerCase().endsWith('dockerfile') || f.toLowerCase() === 'dockerfile',
  );
  if (dockerFiles.length > 0) {
    hasDocker = true;
  }

  return {
    frameworks: [...frameworks],
    projectFiles,
    configFiles,
    frameworkVersion,
    hasWcf,
    hasDocker,
    language,
  };
}
