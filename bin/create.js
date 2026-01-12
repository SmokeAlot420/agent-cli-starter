#!/usr/bin/env node

/**
 * agent-sdk-cli-template scaffolder
 *
 * Usage: npx agent-sdk-cli-template <project-name>
 *
 * Creates a new CLI project with your branding.
 */

import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATE_DIR = join(__dirname, '..', 'template');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

function success(msg) { console.log(`${colors.green}✓${colors.reset} ${msg}`); }
function info(msg) { console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`); }
function error(msg) { console.log(`${colors.red}✗${colors.reset} ${msg}`); }

/**
 * Convert project name to various formats
 */
function getNameVariants(name) {
  const kebab = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const pascal = kebab.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  const upper = kebab.toUpperCase().replace(/-/g, ' ');
  return { kebab, pascal, upper };
}

/**
 * Replace template placeholders in content
 */
function replaceTemplateVars(content, vars) {
  return content
    .replace(/\{\{PROJECT_NAME\}\}/g, vars.kebab)
    .replace(/\{\{PRODUCT_NAME\}\}/g, vars.pascal)
    .replace(/\{\{PRODUCT_NAME_UPPER\}\}/g, vars.upper)
    .replace(/\{\{CLI_COMMAND\}\}/g, vars.kebab)
    .replace(/\{\{TAGLINE\}\}/g, vars.tagline || 'Your AI-Powered CLI')
    .replace(/\{\{PROJECT_DESCRIPTION\}\}/g, vars.description || `${vars.pascal} - AI-powered CLI`);
}

/**
 * Copy directory recursively, processing .template files
 */
function copyTemplate(src, dest, vars) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    let destName = entry.name.replace(/\.template$/, '');
    const destPath = join(dest, destName);

    if (entry.isDirectory()) {
      copyTemplate(srcPath, destPath, vars);
    } else {
      let content = readFileSync(srcPath, 'utf-8');

      // Process template files
      if (entry.name.endsWith('.template') ||
          entry.name.endsWith('.json') ||
          entry.name.endsWith('.ts') ||
          entry.name.endsWith('.tsx') ||
          entry.name.endsWith('.md')) {
        content = replaceTemplateVars(content, vars);
      }

      writeFileSync(destPath, content);
    }
  }
}

/**
 * Main scaffolding function
 */
async function main() {
  const args = process.argv.slice(2);

  // Show help
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
${colors.cyan}${colors.bright}agent-sdk-cli-template${colors.reset}
Brand your Agent SDK.

${colors.bright}Usage:${colors.reset}
  npx agent-sdk-cli-template <project-name>
  npx agent-sdk-cli-template my-bot
  npx agent-sdk-cli-template support-assistant

${colors.bright}Options:${colors.reset}
  -h, --help     Show this help message
  -v, --version  Show version

${colors.bright}What you get:${colors.reset}
  • Full terminal UI (Ink/React)
  • Session persistence (SQLite)
  • Slash command system
  • MCP server integration
  • Your branding, your product

${colors.bright}After scaffolding:${colors.reset}
  cd <project-name>
  npm install
  # Edit src/branding.ts with your branding
  npm run build
  npm link
  <your-command> --help
`);
    process.exit(0);
  }

  // Show version
  if (args.includes('--version') || args.includes('-v')) {
    const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
    console.log(pkg.version);
    process.exit(0);
  }

  const projectName = args[0];

  // Validate project name
  if (!projectName || !/^[a-zA-Z][a-zA-Z0-9-_]*$/.test(projectName)) {
    error('Invalid project name. Use letters, numbers, hyphens, and underscores.');
    error('Example: npx agent-sdk-cli-template my-awesome-bot');
    process.exit(1);
  }

  const targetDir = join(process.cwd(), projectName);

  // Check if directory exists
  if (existsSync(targetDir)) {
    error(`Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  // Check if template directory exists
  if (!existsSync(TEMPLATE_DIR)) {
    error('Template directory not found. Package may be corrupted.');
    error('Try reinstalling: npm install -g agent-sdk-cli-template');
    process.exit(1);
  }

  const vars = getNameVariants(projectName);

  console.log(`
${colors.cyan}${colors.bright}
   ┌─────────────────────────────────────────┐
   │  agent-sdk-cli-template                 │
   │  Brand your Agent SDK.                  │
   └─────────────────────────────────────────┘
${colors.reset}`);

  info(`Creating ${colors.bright}${vars.pascal}${colors.reset} in ${targetDir}`);
  console.log();

  // Copy template
  copyTemplate(TEMPLATE_DIR, targetDir, vars);
  success('Project files created');

  // Copy .claude directory from package
  const claudeDir = join(__dirname, '..', '.claude');
  if (existsSync(claudeDir)) {
    cpSync(claudeDir, join(targetDir, '.claude'), { recursive: true });
    success('Slash commands copied');
  }

  console.log(`
${colors.green}${colors.bright}Success!${colors.reset} Created ${colors.cyan}${vars.pascal}${colors.reset}

${colors.bright}Next steps:${colors.reset}

  ${colors.cyan}cd ${projectName}${colors.reset}
  ${colors.cyan}npm install${colors.reset}

  ${colors.yellow}# Customize your branding${colors.reset}
  ${colors.cyan}Edit src/branding.ts${colors.reset}

  ${colors.yellow}# Build and link globally${colors.reset}
  ${colors.cyan}npm run build${colors.reset}
  ${colors.cyan}npm link${colors.reset}

  ${colors.yellow}# Run your CLI!${colors.reset}
  ${colors.cyan}${vars.kebab} --help${colors.reset}

${colors.bright}Documentation:${colors.reset}
  https://github.com/SmokeAlot420/claude-cli-template

${colors.bright}Happy shipping! 🚀${colors.reset}
`);
}

main().catch(err => {
  error(err.message);
  process.exit(1);
});
