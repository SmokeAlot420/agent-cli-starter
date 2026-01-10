#!/usr/bin/env node

/**
 * Smart CLI Launcher
 *
 * Automatically rebuilds only when source files have changed.
 * Uses timestamp comparison for intelligent caching.
 *
 * Usage: agent [args...]
 */

import { spawn } from 'child_process';
import { existsSync, statSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ESM __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const root = join(__dirname, '..');

/**
 * Get the newest modification time from a directory (recursive)
 * @param {string} dir - Directory to scan
 * @param {string[]} extensions - File extensions to check
 * @returns {number} - Newest mtime in milliseconds, or 0 if no files found
 */
export function getNewestMtime(dir, extensions = ['.ts', '.tsx']) {
  let newest = 0;

  try {
    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dir, entry.name);

      if (entry.isDirectory() && entry.name !== 'node_modules') {
        const dirNewest = getNewestMtime(fullPath, extensions);
        if (dirNewest > newest) newest = dirNewest;
      } else if (entry.isFile()) {
        const ext = entry.name.slice(entry.name.lastIndexOf('.'));
        if (extensions.includes(ext)) {
          const mtime = statSync(fullPath).mtimeMs;
          if (mtime > newest) newest = mtime;
        }
      }
    }
  } catch {
    // Directory doesn't exist or can't be read
  }

  return newest;
}

/**
 * Check if dist needs rebuilding
 * @returns {{ needed: boolean, reason?: string }}
 */
export function needsRebuild() {
  const distCli = join(root, 'dist', 'cli.js');

  // No dist? Definitely need to build
  if (!existsSync(distCli)) {
    return { needed: true, reason: 'dist/cli.js not found' };
  }

  const distTime = statSync(distCli).mtimeMs;
  const srcNewest = getNewestMtime(join(root, 'src'));

  if (srcNewest > distTime) {
    return { needed: true, reason: 'source files newer than dist' };
  }

  return { needed: false };
}

/**
 * Run a command and wait for it to complete
 * @param {string} cmd - Command to run
 * @param {string[]} args - Command arguments
 * @param {object} options - Spawn options
 * @returns {Promise<void>}
 */
function runCommand(cmd, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      stdio: 'inherit',
      shell: true,
      cwd: root,
      ...options
    });

    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`Command failed with code ${code}`));
    });

    child.on('error', reject);
  });
}

/**
 * Main entry point
 */
async function main() {
  const rebuildCheck = needsRebuild();

  if (rebuildCheck.needed) {
    console.log(`\x1b[33m⚡ Rebuilding (${rebuildCheck.reason})...\x1b[0m`);

    try {
      await runCommand('npm', ['run', 'build']);
      console.log('\x1b[32m✓ Build complete\x1b[0m\n');
    } catch (err) {
      console.error('\x1b[31m✗ Build failed\x1b[0m');
      process.exit(1);
    }
  }

  // Run the CLI with all passed arguments
  const cliPath = join(root, 'dist', 'cli.js');
  const child = spawn('node', [cliPath, ...process.argv.slice(2)], {
    stdio: 'inherit',
    cwd: process.cwd()
  });

  child.on('close', code => process.exit(code ?? 0));
  child.on('error', err => {
    console.error('Failed to start CLI:', err.message);
    process.exit(1);
  });
}

// Only run main if this is the entry point (not imported for testing)
if (process.argv[1] === __filename || process.argv[1]?.endsWith('cli.js')) {
  main().catch(err => {
    console.error('Launcher error:', err.message);
    process.exit(1);
  });
}
