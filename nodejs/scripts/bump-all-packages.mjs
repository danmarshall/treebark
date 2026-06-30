#!/usr/bin/env node

/*
 * Bump all workspace package versions in one command.
 *
 * How this was called for the tabindex release:
 *   npm run bump:all -- minor
 *
 * Why that command:
 *   - "minor" is the correct SemVer level for a new backward-compatible feature.
 *   - This script updates every package.json version in the workspace packages/* set.
 *   - By default it also updates the root workspace package.json version.
 *
 * Recommended workflow:
 *   1) Preview changes first:
 *        npm run bump:all -- minor --dry-run
 *   2) Apply changes:
 *        npm run bump:all -- minor
 *   3) If needed, exclude root package.json:
 *        npm run bump:all -- minor --no-root
 *
 * Accepted bump levels:
 *   - patch: bug-fix only release
 *   - minor: feature release (non-breaking)
 *   - major: breaking change release
 */

import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const rootPkgPath = path.join(rootDir, 'package.json');

function printUsage() {
  console.log(`Usage: node scripts/bump-all-packages.mjs <patch|minor|major> [--dry-run] [--no-root]\n\nExamples:\n  node scripts/bump-all-packages.mjs patch\n  node scripts/bump-all-packages.mjs minor --dry-run\n  npm run bump:all -- patch`);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  const level = args.find((arg) => !arg.startsWith('-'));
  const dryRun = args.includes('--dry-run');
  const includeRoot = !args.includes('--no-root');

  if (!level || !['patch', 'minor', 'major'].includes(level)) {
    printUsage();
    throw new Error('You must provide one of: patch, minor, major');
  }

  return { level, dryRun, includeRoot };
}

function bumpVersion(version, level) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    throw new Error(`Unsupported version format: ${version}`);
  }

  let major = Number(match[1]);
  let minor = Number(match[2]);
  let patch = Number(match[3]);

  if (level === 'major') {
    major += 1;
    minor = 0;
    patch = 0;
  } else if (level === 'minor') {
    minor += 1;
    patch = 0;
  } else {
    patch += 1;
  }

  return `${major}.${minor}.${patch}`;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function getWorkspacePackageJsonPaths(rootPkg) {
  const workspaces = Array.isArray(rootPkg.workspaces) ? rootPkg.workspaces : [];
  const pkgPaths = [];

  for (const workspacePattern of workspaces) {
    if (!workspacePattern.endsWith('/*')) {
      throw new Error(`Unsupported workspace pattern: ${workspacePattern}`);
    }

    const relDir = workspacePattern.slice(0, -2);
    const absDir = path.join(rootDir, relDir);

    if (!fs.existsSync(absDir)) {
      continue;
    }

    const entries = fs.readdirSync(absDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const pkgJsonPath = path.join(absDir, entry.name, 'package.json');
      if (fs.existsSync(pkgJsonPath)) {
        pkgPaths.push(pkgJsonPath);
      }
    }
  }

  return pkgPaths;
}

function main() {
  const { level, dryRun, includeRoot } = parseArgs(process.argv);

  if (!fs.existsSync(rootPkgPath)) {
    throw new Error(`No package.json found in ${rootDir}`);
  }

  const rootPkg = readJson(rootPkgPath);
  const targets = getWorkspacePackageJsonPaths(rootPkg);

  if (includeRoot) {
    targets.unshift(rootPkgPath);
  }

  if (targets.length === 0) {
    throw new Error('No package.json files found to bump.');
  }

  const changes = [];

  for (const pkgPath of targets) {
    const pkg = readJson(pkgPath);
    if (!pkg.version) {
      continue;
    }

    const nextVersion = bumpVersion(pkg.version, level);
    changes.push({
      name: pkg.name || path.dirname(pkgPath),
      file: path.relative(rootDir, pkgPath),
      from: pkg.version,
      to: nextVersion,
    });

    if (!dryRun) {
      pkg.version = nextVersion;
      writeJson(pkgPath, pkg);
    }
  }

  if (changes.length === 0) {
    console.log('No version fields found in target package.json files.');
    return;
  }

  console.log(dryRun ? 'Dry run - no files changed.\n' : 'Versions bumped.\n');
  for (const change of changes) {
    console.log(`${change.name}: ${change.from} -> ${change.to} (${change.file})`);
  }
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
