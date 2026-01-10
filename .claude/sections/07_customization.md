# Customization

This section covers the main customization points for making this template your own.

## Branding (`src/branding.ts`)

The primary customization file. Edit this to change:

```typescript
export const BRANDING = {
  name: 'Your CLI Name',
  tagline: 'Your tagline here',
  version: '1.0.0',

  // ASCII art logo (optional)
  logo: `
    Your ASCII Art Here
  `,

  // Colors (Ink/Chalk color names)
  colors: {
    primary: 'cyan',
    secondary: 'gray',
    accent: 'magenta'
  }
};
```

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

Append to the system prompt in `src/conversation/constants.ts`:

```typescript
export const SYSTEM_PROMPT_APPEND = `
Your custom instructions here.
`;
```
