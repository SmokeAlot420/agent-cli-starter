# Plan: Publish agent-sdk-cli-template to npm

> **"Ship your own Claude Code"** - The white-label CLI template for Claude Agent SDK

## Overview

Transform `claude-cli-template` into a publishable npm package called `agent-sdk-cli-template` with scaffolding support. Users run `npx agent-sdk-cli-template my-bot` to create a new branded CLI project.

**Methodology:** FBS (Fork → Brand → Ship)

---

## Files to Create

| File | Purpose |
|------|---------|
| `bin/create.js` | Scaffolding entry point - handles `npx agent-sdk-cli-template <name>` |
| `src/scaffold/index.ts` | Core scaffolding logic (copy, transform, print) |
| `src/scaffold/templates.ts` | Template file definitions and transformations |
| `template/` | Clean template files to copy (subset of project) |
| `.npmignore` | Exclude dev files from npm package |

## Files to Modify

| File | Changes |
|------|---------|
| `package.json` | New name, description, keywords, bin entries, files, exports |
| `README.md` | Complete marketing overhaul |
| `src/branding.ts` | Update comments for scaffolded projects |

---

## Implementation Steps

### Phase 1: Package Identity (15 min)

#### Step 1.1: Update package.json

```json
{
  "name": "agent-sdk-cli-template",
  "version": "1.0.0",
  "description": "Ship your own Claude Code. The white-label CLI template for Claude Agent SDK.",
  "keywords": [
    "claude",
    "agent",
    "sdk",
    "cli",
    "template",
    "white-label",
    "terminal",
    "anthropic",
    "ai",
    "chatbot",
    "assistant"
  ],
  "author": "SmokeAlot420",
  "repository": {
    "type": "git",
    "url": "https://github.com/SmokeAlot420/claude-cli-template"
  },
  "homepage": "https://github.com/SmokeAlot420/claude-cli-template#readme",
  "bugs": {
    "url": "https://github.com/SmokeAlot420/claude-cli-template/issues"
  },
  "bin": {
    "agent-sdk-cli-template": "./bin/create.js",
    "fbs": "./bin/cli.js"
  },
  "files": [
    "dist/",
    "bin/",
    "template/",
    ".claude/commands/",
    ".claude/sections/",
    "README.md",
    "CLAUDE.md"
  ],
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./branding": {
      "types": "./dist/branding.d.ts",
      "import": "./dist/branding.js"
    }
  }
}
```

**Key changes:**
- `name`: `claude-cli-template` → `agent-sdk-cli-template`
- `bin`: Add `agent-sdk-cli-template` pointing to new `bin/create.js`
- `files`: Specify exactly what goes in npm package
- `exports`: Proper ESM exports for library usage

---

### Phase 2: Template Directory (20 min)

#### Step 2.1: Create `template/` directory

This is a **clean copy** of the project that gets scaffolded. NOT the whole repo.

```
template/
├── src/
│   ├── branding.ts.template      # Has {{PROJECT_NAME}} placeholders
│   ├── cli.ts
│   ├── index.ts
│   └── ... (all src files)
├── bin/
│   └── cli.js
├── .claude/
│   └── commands/
│       └── ... (core commands only)
├── package.json.template         # Has {{PROJECT_NAME}} placeholders
├── tsconfig.json
├── CLAUDE.md.template
└── README.md.template
```

#### Step 2.2: Create template files with placeholders

**`template/package.json.template`:**
```json
{
  "name": "{{PROJECT_NAME}}",
  "version": "0.1.0",
  "description": "{{PROJECT_DESCRIPTION}}",
  "type": "module",
  "main": "dist/index.js",
  "bin": {
    "{{CLI_COMMAND}}": "./bin/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "start": "tsx src/cli.ts",
    "dev": "tsx --watch src/cli.ts"
  },
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.2.2",
    "better-sqlite3": "^12.5.0",
    "gray-matter": "^4.0.3",
    "ink": "^5.0.1",
    "ink-select-input": "^6.2.0",
    "ink-spinner": "^5.0.0",
    "ink-text-input": "^6.0.0",
    "react": "^18.2.0",
    "typescript": "^5.9.3",
    "uuid": "^13.0.0",
    "zod": "^4.3.5"
  },
  "devDependencies": {
    "@types/better-sqlite3": "^7.6.13",
    "@types/node": "^25.0.3",
    "@types/react": "^18.2.0",
    "@types/uuid": "^10.0.0",
    "tsx": "^4.21.0"
  }
}
```

**`template/src/branding.ts.template`:**
```typescript
/**
 * 🎨 YOUR BRANDING - Customize this file!
 *
 * This is the ONLY file you need to edit to brand your CLI.
 */

import type { McpServersConfig } from './features/mcp.js';

export interface BrandingConfig {
  productName: string;
  tagline: string;
  subtitle: string;
  logo: string;
  logoColor: string;
  promptPrefix: string;
  cliCommand: string;
  systemPrompt: string;
  defaultMcpServers: McpServersConfig;
  cloudMcpServers: McpServersConfig;
}

export const BRANDING: BrandingConfig = {
  // 👇 CUSTOMIZE THESE VALUES 👇

  productName: '{{PRODUCT_NAME}}',

  tagline: '{{TAGLINE}}',

  subtitle: '',

  logo: `
  ╔═══════════════════════════════════╗
  ║     {{PRODUCT_NAME_UPPER}}        ║
  ║     Your AI-Powered CLI           ║
  ╚═══════════════════════════════════╝`,

  logoColor: 'cyan',

  promptPrefix: '{{CLI_COMMAND}}',

  cliCommand: '{{CLI_COMMAND}}',

  systemPrompt: `
## Your Identity

You are {{PRODUCT_NAME}}, an AI assistant powered by Claude.

## Guidelines

- Be helpful and professional
- Explain what you're doing
- Ask for clarification when needed
`,

  defaultMcpServers: {},

  cloudMcpServers: {}
};

export const {
  productName,
  tagline,
  subtitle,
  logo,
  logoColor,
  promptPrefix,
  cliCommand,
  systemPrompt,
  defaultMcpServers,
  cloudMcpServers
} = BRANDING;
```

---

### Phase 3: Scaffolding Logic (30 min)

#### Step 3.1: Create `bin/create.js`

```javascript
#!/usr/bin/env node

/**
 * agent-sdk-cli-template scaffolder
 *
 * Usage: npx agent-sdk-cli-template <project-name>
 *
 * Creates a new CLI project with your branding.
 */

import { existsSync, mkdirSync, cpSync, readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
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

function log(msg) { console.log(msg); }
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
Ship your own Claude Code.

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

  const vars = getNameVariants(projectName);

  console.log(`
${colors.cyan}${colors.bright}
   ┌─────────────────────────────────────────┐
   │  agent-sdk-cli-template                 │
   │  Ship your own Claude Code.             │
   └─────────────────────────────────────────┘
${colors.reset}`);

  info(`Creating ${colors.bright}${vars.pascal}${colors.reset} in ${targetDir}`);
  console.log();

  // Copy template
  copyTemplate(TEMPLATE_DIR, targetDir, vars);
  success('Project files created');

  // Copy .claude directory
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
```

---

### Phase 4: README Overhaul (15 min)

#### Step 4.1: New README.md

```markdown
<div align="center">

# agent-sdk-cli-template

### Ship your own Claude Code.

The white-label CLI template for Claude Agent SDK.

[![npm version](https://badge.fury.io/js/agent-sdk-cli-template.svg)](https://www.npmjs.com/package/agent-sdk-cli-template)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## What is this?

**You know Claude Code?** The AI coding assistant everyone loves?

**What if you could ship that—but with YOUR brand, YOUR name, YOUR logo?**

`agent-sdk-cli-template` gives you a production-ready CLI template built on the Claude Agent SDK. Full terminal UI, session management, slash commands—all customizable.

**Fork it. Brand it. Ship it.**

---

## Quick Start

```bash
npx agent-sdk-cli-template my-bot
cd my-bot
npm install

# Customize your branding
# Edit src/branding.ts

npm run build
npm link
my-bot --help  # 🚀 Your CLI is live!
```

---

## What You Get

| Feature | Description |
|---------|-------------|
| **Full Terminal UI** | Beautiful Ink/React-based interface |
| **Session Persistence** | SQLite-backed conversation history |
| **Slash Commands** | 27+ built-in commands with autocomplete |
| **MCP Integration** | Connect external tools and services |
| **Permission Prompts** | User-controlled tool access |
| **Your Branding** | One file to customize everything |

---

## The FBS Methodology

### Fork
```bash
npx agent-sdk-cli-template my-product
```

### Brand
Edit `src/branding.ts`:
```typescript
export const BRANDING: BrandingConfig = {
  productName: 'SupportBot',
  tagline: 'AI-Powered Customer Support',
  cliCommand: 'supportbot',
  logo: `YOUR ASCII ART`,
  systemPrompt: `You are a helpful support agent...`,
};
```

### Ship
```bash
npm run build
npm link          # Local testing
npm publish       # Ship to the world
```

---

## Project Structure

```
my-bot/
├── src/
│   ├── branding.ts      # ← YOUR BRANDING HERE
│   ├── cli.ts           # CLI entry point
│   ├── conversation/    # Agent wrapper
│   ├── ui/              # Terminal components
│   └── features/        # Commands, MCP, plugins
├── .claude/
│   └── commands/        # Slash commands
├── bin/
│   └── cli.js           # Launcher
└── package.json
```

---

## Customization

### Branding (Required)

The only file you NEED to edit is `src/branding.ts`:

```typescript
export const BRANDING: BrandingConfig = {
  productName: 'My CLI',        // Display name
  tagline: 'My tagline',        // Shown in header
  cliCommand: 'mycli',          // Global command name
  logo: `ASCII ART`,            // Your logo
  logoColor: 'cyan',            // Logo color
  systemPrompt: `...`,          // Claude's personality
  defaultMcpServers: {},        // MCP servers to include
};
```

### Package.json (Required)

Update the `bin` entry to match your `cliCommand`:

```json
{
  "bin": {
    "mycli": "./bin/cli.js"
  }
}
```

### Slash Commands (Optional)

Add custom commands in `.claude/commands/`:

```markdown
---
name: mycommand
description: What this does
---

Your prompt template here.

$ARGUMENTS
```

---

## Built-in Commands

### Core
`/clear` `/commit` `/compact` `/config` `/context` `/cost` `/export` `/help` `/mcp` `/memory` `/model` `/resume` `/status` `/think` `/todos`

### Power Tools
`/prime` `/plan` `/execute` `/validate` `/review` `/create-prd`

---

## Requirements

- Node.js 18+
- Anthropic API Key (`ANTHROPIC_API_KEY`)

---

## Using as a Library

You can also use this template as a dependency:

```bash
npm install agent-sdk-cli-template
```

```typescript
import { App, BRANDING, ConversationalAgent } from 'agent-sdk-cli-template';

// Use components with your own branding
```

---

## License

MIT

---

<div align="center">

**Built on the [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk-typescript)**

*Ship your own Claude Code today.*

</div>
```

---

### Phase 5: npm Ignore & Files (5 min)

#### Step 5.1: Create `.npmignore`

```
# Development
.git/
.github/
.vscode/
.idea/

# Source (dist is published)
src/
tests/
*.test.ts
*.test.tsx

# Config
.eslintrc*
eslint.config.js
vitest.config.ts
tsconfig.json

# Build artifacts
*.tsbuildinfo
coverage/

# Project specific
.agents/
.env*
*.log

# Keep these (redundant with files field but explicit)
!dist/
!bin/
!template/
!.claude/
!README.md
!CLAUDE.md
!package.json
```

---

### Phase 6: Template Directory Population (20 min)

#### Step 6.1: Copy clean source files to `template/`

Files to include in `template/`:

```
template/
├── src/                    # Copy all of src/ EXCEPT scaffold/
│   ├── branding.ts.template  # Template version with placeholders
│   ├── cli.ts
│   ├── index.ts
│   ├── constants.ts
│   ├── conversation/
│   ├── features/
│   ├── services/
│   ├── types/
│   ├── ui/
│   └── utils/
├── bin/
│   └── cli.js              # Smart launcher (unchanged)
├── package.json.template   # Template with placeholders
├── tsconfig.json           # TypeScript config (unchanged)
├── README.md.template      # Simple getting started README
└── CLAUDE.md.template      # Project instructions template
```

**NOT included:**
- `node_modules/`
- `dist/`
- `.git/`
- `tests/`
- `.agents/`
- `template/` (no recursion!)
- `bin/create.js` (scaffolder itself)

---

### Phase 7: Testing (15 min)

#### Step 7.1: Local scaffolding test

```bash
# Build the package
npm run build

# Test scaffolding locally
node bin/create.js test-project

# Verify scaffolded project
cd test-project
npm install
npm run build
node dist/cli.js --help

# Clean up
cd ..
rm -rf test-project
```

#### Step 7.2: npm pack test

```bash
# Create tarball without publishing
npm pack

# Inspect contents
tar -tzf agent-sdk-cli-template-1.0.0.tgz

# Verify expected files are included
# - dist/
# - bin/
# - template/
# - .claude/commands/
# - README.md
# - package.json
```

#### Step 7.3: Test from tarball

```bash
# Install from local tarball
npm install -g agent-sdk-cli-template-1.0.0.tgz

# Run scaffolder
agent-sdk-cli-template test-from-tarball

# Verify
cd test-from-tarball
npm install
npm run build
./bin/cli.js --version
```

---

### Phase 8: Publish (5 min)

#### Step 8.1: Pre-publish checklist

- [ ] `npm run typecheck` passes
- [ ] `npm run build` succeeds
- [ ] `npm test` passes
- [ ] Local scaffolding test works
- [ ] `npm pack` includes correct files
- [ ] README looks good
- [ ] package.json has correct metadata

#### Step 8.2: Publish to npm

```bash
# Login if needed
npm login

# Publish
npm publish

# Verify on npmjs.com
# https://www.npmjs.com/package/agent-sdk-cli-template
```

#### Step 8.3: Test from npm

```bash
# Install from npm
npx agent-sdk-cli-template@latest my-test-bot

# Verify it works
cd my-test-bot
npm install
npm run build
```

---

## Verification Checklist

### Scaffolding Works
- [ ] `npx agent-sdk-cli-template my-bot` creates directory
- [ ] All files are copied correctly
- [ ] Placeholders are replaced with project name
- [ ] `package.json` has correct name and bin entry
- [ ] `branding.ts` has customized values

### Scaffolded Project Works
- [ ] `npm install` succeeds
- [ ] `npm run build` succeeds
- [ ] `node dist/cli.js --help` shows branded help
- [ ] `node dist/cli.js --version` shows branded version
- [ ] Interactive mode works
- [ ] Slash commands work

### npm Package Works
- [ ] Package published successfully
- [ ] `npm info agent-sdk-cli-template` shows correct metadata
- [ ] `npx agent-sdk-cli-template` downloads and runs
- [ ] Keywords show up in npm search

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Template files out of sync with source | Create script to sync template/ from src/ |
| Scaffolded project missing dependencies | Test npm install in CI |
| Binary permissions issues | Ensure shebang in create.js, set +x |
| Large package size | Use .npmignore, verify with `npm pack` |
| Breaking existing forks | Keep backward compatibility, version bump |

---

## Task Summary

| Phase | Time | Tasks |
|-------|------|-------|
| 1. Package Identity | 15 min | Update package.json metadata |
| 2. Template Directory | 20 min | Create template/ with placeholders |
| 3. Scaffolding Logic | 30 min | Create bin/create.js |
| 4. README Overhaul | 15 min | Marketing-focused README |
| 5. npm Ignore | 5 min | .npmignore file |
| 6. Template Population | 20 min | Copy/adapt source files |
| 7. Testing | 15 min | Local + pack + tarball tests |
| 8. Publish | 5 min | npm publish + verify |
| **Total** | **~2 hours** | |

---

## Success Criteria

- [ ] `npx agent-sdk-cli-template my-bot` creates working project
- [ ] Scaffolded project: `npm install && npm run build && npm start` works
- [ ] Package published to npm as `agent-sdk-cli-template`
- [ ] README clearly communicates "Ship your own Claude Code"
- [ ] SEO keywords in place for discoverability
- [ ] Existing `fbs` command still works (backward compatible)
