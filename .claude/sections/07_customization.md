# Customization

This section covers the main customization points for making this template your own.

## Branding

### Option 1: Direct Edit (Fork Template)

If you fork the template, edit `src/branding.ts`:

```typescript
export const BRANDING: BrandingConfig = {
  productName: 'Your CLI Name',
  tagline: 'Your tagline here',
  logo: `Your ASCII Art`,
  systemPromptAppend: 'Custom instructions...'
};
```

### Option 2: BrandingContext (Use as Dependency)

If using the template as a dependency, pass branding via props:

```typescript
// your-project/src/branding.ts
import type { BrandingConfig } from 'claude-cli-template';

export const MY_BRANDING: BrandingConfig = {
  productName: 'My CLI',
  tagline: 'My tagline',
  logo: `My ASCII Logo`,
  systemPromptAppend: 'My custom instructions'
};

// your-project/src/cli.ts
import { App } from 'claude-cli-template';
import { MY_BRANDING } from './branding.js';

render(React.createElement(App, {
  branding: MY_BRANDING,
  // ...other props
}));
```

The `BrandingConfig` interface:
```typescript
interface BrandingConfig {
  productName: string;
  tagline: string;
  logo?: string;
  systemPromptAppend?: string;
}
```

Components use `useBranding()` hook to access branding.

## Slash Commands (`.claude/commands/`)

Add custom slash commands as markdown files:

```markdown
---
name: mycommand
description: What this command does
---

$ARGUMENTS

Your prompt template here. Use $ARGUMENTS for user input.
```

Commands are auto-discovered from `.claude/commands/` directory.

## MCP Servers

Configure MCP servers in `.claude/settings.json`:

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"]
    },
    "custom": {
      "command": "node",
      "args": ["./my-mcp-server.js"]
    }
  }
}
```

## UI Components (`src/ui/components/`)

Customize the terminal UI:
- `Header.tsx` - Top bar with logo/branding
- `StatusBar.tsx` - Bottom status indicators
- `InputPrompt.tsx` - User input styling

## Permission Modes

Available modes (cycle with Shift+Tab):
- `default` - Ask for each tool use
- `acceptEdits` - Auto-approve file edits
- `bypassPermissions` - Auto-approve everything
- `plan` - Read-only planning mode

## System Prompt

Add custom system prompt instructions via branding:

```typescript
const BRANDING: BrandingConfig = {
  // ...
  systemPromptAppend: `
Your custom instructions here.
These are appended to the base system prompt.
`
};
```
