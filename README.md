<div align="center">

# agent-sdk-cli-template

### Name your Agent SDK.

Your starter CLI template for Claude Agent SDK.

[![npm version](https://badge.fury.io/js/agent-sdk-cli-template.svg)](https://www.npmjs.com/package/agent-sdk-cli-template)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

## What is this?

**You know Claude Code?** The AI coding assistant everyone loves?

**What if you could put YOUR brand on Claude's power?**

`agent-sdk-cli-template` gives you a production-ready CLI template built on the Claude Agent SDK. Full terminal UI, session management, slash commands—all customizable.

**Fork it. Name it. Ship it.**

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

*Brand your Agent SDK today.*

</div>
