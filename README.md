# claude-cli-template

> **Fork. Brand. Ship.**

Build your own Claude Code CLI in 5 minutes.

The [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk) gives you the AI engine.
This template gives you the production-ready terminal UI.

## What You Get

- Full Terminal UI (Ink/React-based)
- Session Persistence (SQLite)
- Slash Command System with Autocomplete
- MCP Server Integration
- Permission Prompts (Y/A/N)
- Thinking Indicators
- **Your Branding, Your Agent**

## Quick Start

```bash
# Clone this template
git clone https://github.com/YOUR_USERNAME/claude-cli-template my-agent
cd my-agent

# Install dependencies
npm install

# Set your API key
export ANTHROPIC_API_KEY=your-key

# Run it!
npm start
```

## Customize Your Agent

Edit `src/branding.ts`:

```typescript
export const BRANDING: BrandingConfig = {
  productName: 'SupportBot',
  tagline: 'AI-Powered Customer Support',
  logo: `YOUR ASCII ART HERE`,
  systemPrompt: `You are a helpful customer service agent...`,
  // ...
};
```

## Included Commands

### Core (Claude Code Parity)
`/clear` `/commit` `/compact` `/config` `/context` `/cost` `/export` `/help` `/mcp` `/memory` `/model` `/resume` `/status` `/think` `/todos`

### Power Tools
`/prime` `/plan` `/execute` `/validate` `/review` `/create-prd`

## Project Structure

```
my-agent/
├── src/
│   ├── branding.ts         # ← CUSTOMIZE HERE
│   ├── cli.ts              # CLI entry point
│   ├── conversation/       # Agent wrapper
│   ├── ui/                 # Terminal components
│   ├── services/           # Session management
│   └── features/           # Commands, MCP, plugins
├── .claude/
│   └── commands/           # Slash commands
└── bin/
    └── cli.js              # Launcher
```

## Requirements

- Node.js 18+
- Anthropic API Key

## License

MIT

---

Built on the [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk)
