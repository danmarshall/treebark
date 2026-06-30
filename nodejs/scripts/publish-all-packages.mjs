#!/usr/bin/env node

/*
 * Publish all non-private workspace packages in dependency order.
 *
 * Near-term release approach:
 *   - Keep manual local publishes with this script while release volume is small.
 *
 * Later improvement plan:
 *   - Migrate to Changesets for version orchestration + changelogs.
 *   - Publish from CI (GitHub Actions) instead of local machines.
 *   - Keep this script as a fallback/manual recovery path.
 *
 * Typical release flow:
 *   1) npm run publish:all -- --dry-run
 *   2) npm run publish:all -- --otp 123456
 *
 * Optional flags:
 *   --dry-run          Validate what would be published without uploading.
 *   --otp <code>       Pass one-time password for npm 2FA writes.
 *   --tag <tag>        Publish under a dist-tag (default: latest).
 *   --access <value>   npm access level (default: public).
 *   --ignore-scripts   Skip lifecycle scripts during npm publish.
 *   --skip-existing    Skip packages already published at the same version (default).
 *   --no-skip-existing Fail if an exact version already exists on npm.
 *   --continue-on-error Continue publishing remaining packages after an error.
 *   --skip-whoami      Skip npm auth precheck.
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const rootDir = process.cwd();
const rootPkgPath = path.join(rootDir, 'package.json');

function printUsage() {
  console.log(`Usage: node scripts/publish-all-packages.mjs [--dry-run] [--otp <code>] [--tag <tag>] [--access <public|restricted>] [--ignore-scripts] [--skip-existing|--no-skip-existing] [--continue-on-error] [--skip-whoami]\n\nExamples:\n  node scripts/publish-all-packages.mjs --dry-run\n  node scripts/publish-all-packages.mjs --otp 123456\n  node scripts/publish-all-packages.mjs --dry-run --ignore-scripts --skip-whoami\n  node scripts/publish-all-packages.mjs --otp 123456 --continue-on-error\n  npm run publish:all -- --dry-run`);
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const out = {
    dryRun: false,
    otp: undefined,
    tag: 'latest',
    access: 'public',
    ignoreScripts: false,
    skipExisting: true,
    continueOnError: false,
    skipWhoami: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    }

    if (arg === '--dry-run') {
      out.dryRun = true;
      continue;
    }

    if (arg === '--skip-whoami') {
      out.skipWhoami = true;
      continue;
    }

    if (arg === '--ignore-scripts') {
      out.ignoreScripts = true;
      continue;
    }

    if (arg === '--skip-existing') {
      out.skipExisting = true;
      continue;
    }

    if (arg === '--no-skip-existing') {
      out.skipExisting = false;
      continue;
    }

    if (arg === '--continue-on-error') {
      out.continueOnError = true;
      continue;
    }

    if (arg === '--otp') {
      out.otp = args[i + 1];
      i += 1;
      continue;
    }

    if (arg.startsWith('--otp=')) {
      out.otp = arg.slice('--otp='.length);
      continue;
    }

    if (arg === '--tag') {
      out.tag = args[i + 1];
      i += 1;
      continue;
    }

    if (arg.startsWith('--tag=')) {
      out.tag = arg.slice('--tag='.length);
      continue;
    }

    if (arg === '--access') {
      out.access = args[i + 1];
      i += 1;
      continue;
    }

    if (arg.startsWith('--access=')) {
      out.access = arg.slice('--access='.length);
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!out.tag) {
    throw new Error('--tag requires a value');
  }

  if (!out.access) {
    throw new Error('--access requires a value');
  }

  if (out.otp === '') {
    throw new Error('--otp requires a value');
  }

  return out;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
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

function getLocalDependencyNames(pkg, workspaceNames) {
  const groups = [
    pkg.dependencies || {},
    pkg.optionalDependencies || {},
  ];
  const names = [];

  for (const group of groups) {
    for (const [depName] of Object.entries(group)) {
      if (workspaceNames.has(depName)) {
        names.push(depName);
      }
    }
  }

  return names;
}

function topoSort(packages) {
  const byName = new Map(packages.map((pkg) => [pkg.name, pkg]));
  const indegree = new Map(packages.map((pkg) => [pkg.name, 0]));
  const graph = new Map(packages.map((pkg) => [pkg.name, []]));

  for (const pkg of packages) {
    for (const depName of pkg.localDependencies) {
      if (!byName.has(depName)) {
        continue;
      }
      graph.get(depName).push(pkg.name);
      indegree.set(pkg.name, indegree.get(pkg.name) + 1);
    }
  }

  const queue = [];
  for (const [name, degree] of indegree.entries()) {
    if (degree === 0) {
      queue.push(name);
    }
  }

  queue.sort();

  const ordered = [];
  while (queue.length > 0) {
    const name = queue.shift();
    ordered.push(byName.get(name));

    for (const neighbor of graph.get(name)) {
      indegree.set(neighbor, indegree.get(neighbor) - 1);
      if (indegree.get(neighbor) === 0) {
        queue.push(neighbor);
        queue.sort();
      }
    }
  }

  if (ordered.length !== packages.length) {
    const unresolved = [];
    for (const [name, degree] of indegree.entries()) {
      if (degree > 0) {
        unresolved.push(name);
      }
    }
    throw new Error(`Cannot resolve publish order; dependency cycle detected among: ${unresolved.join(', ')}`);
  }

  return ordered;
}

function resolveCommand(command, args) {
  if (command === 'npm' && process.env.npm_execpath && fs.existsSync(process.env.npm_execpath)) {
    return {
      command: process.execPath,
      args: [process.env.npm_execpath, ...args],
    };
  }

  return {
    command: process.platform === 'win32' && command === 'npm' ? 'npm.cmd' : command,
    args,
  };
}

function runCommand(command, args, cwd) {
  const resolved = resolveCommand(command, args);
  const result = spawnSync(resolved.command, resolved.args, {
    cwd,
    stdio: 'inherit',
    shell: false,
  });

  if (result.error) {
    throw new Error(`Command launch failed (${cwd}): ${command} ${args.join(' ')} (${result.error.message})`);
  }

  if (result.status !== 0) {
    throw new Error(`Command failed (${cwd}): ${command} ${args.join(' ')}`);
  }
}

function runCommandCapture(command, args, cwd) {
  const resolved = resolveCommand(command, args);
  const result = spawnSync(resolved.command, resolved.args, {
    cwd,
    encoding: 'utf8',
    shell: false,
  });

  return {
    status: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    error: result.error,
  };
}

function isVersionPublished(pkg, cwd) {
  const result = runCommandCapture('npm', ['view', `${pkg.name}@${pkg.version}`, 'version', '--json'], cwd);
  if (result.error) {
    throw new Error(`Failed to check npm registry for ${pkg.name}@${pkg.version}: ${result.error.message}`);
  }

  if (result.status !== 0) {
    return false;
  }

  const out = result.stdout.trim();
  if (!out) {
    return false;
  }

  try {
    const parsed = JSON.parse(out);
    if (Array.isArray(parsed)) {
      return parsed.includes(pkg.version);
    }
    return parsed === pkg.version;
  } catch {
    return out.replaceAll('"', '') === pkg.version;
  }
}

function main() {
  const options = parseArgs(process.argv);

  if (!fs.existsSync(rootPkgPath)) {
    throw new Error(`No package.json found in ${rootDir}`);
  }

  const rootPkg = readJson(rootPkgPath);
  const packageJsonPaths = getWorkspacePackageJsonPaths(rootPkg);

  const allPackages = packageJsonPaths.map((pkgPath) => {
    const pkg = readJson(pkgPath);
    return {
      name: pkg.name,
      version: pkg.version,
      private: Boolean(pkg.private),
      dir: path.dirname(pkgPath),
      relFile: path.relative(rootDir, pkgPath),
      pkg,
    };
  });

  const publishable = allPackages.filter((pkg) => !pkg.private);
  if (publishable.length === 0) {
    console.log('No non-private workspace packages found to publish.');
    return;
  }

  const workspaceNames = new Set(publishable.map((pkg) => pkg.name));
  for (const pkg of publishable) {
    pkg.localDependencies = getLocalDependencyNames(pkg.pkg, workspaceNames);
  }

  const ordered = topoSort(publishable);

  if (!options.skipWhoami) {
    console.log('Checking npm authentication with whoami...\n');
    runCommand('npm', ['whoami'], rootDir);
    console.log('');
  }

  console.log(options.dryRun ? 'Dry run mode: no packages will be published.\n' : 'Publishing packages to npm.\n');
  console.log('Publish order:');
  for (const pkg of ordered) {
    console.log(`- ${pkg.name}@${pkg.version} (${path.relative(rootDir, pkg.dir)})`);
  }
  console.log('');

  const failures = [];
  const skipped = [];

  for (const pkg of ordered) {
    if (options.skipExisting && isVersionPublished(pkg, rootDir)) {
      console.log(`Skipping ${pkg.name}@${pkg.version}: version already exists on npm.`);
      skipped.push(`${pkg.name}@${pkg.version}`);
      console.log('');
      continue;
    }

    const args = ['publish', '--tag', options.tag, '--access', options.access];
    if (options.dryRun) {
      args.push('--dry-run');
    }
    if (options.ignoreScripts) {
      args.push('--ignore-scripts');
    }
    if (options.otp) {
      args.push('--otp', options.otp);
    }

    try {
      console.log(`Publishing ${pkg.name}@${pkg.version}...`);
      runCommand('npm', args, pkg.dir);
      console.log('');
    } catch (error) {
      failures.push({
        name: pkg.name,
        version: pkg.version,
        message: error.message,
      });

      if (!options.continueOnError) {
        throw error;
      }

      console.error(`Publish failed for ${pkg.name}@${pkg.version}: ${error.message}`);
      console.log('Continuing due to --continue-on-error.\n');
    }
  }

  if (skipped.length > 0) {
    console.log(`Skipped already-published versions: ${skipped.join(', ')}`);
  }

  if (failures.length > 0) {
    const summary = failures.map((f) => `${f.name}@${f.version}`).join(', ');
    throw new Error(`Publish finished with failures: ${summary}`);
  }

  console.log(options.dryRun ? 'Dry run completed.' : 'Publish completed.');
}

try {
  main();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
