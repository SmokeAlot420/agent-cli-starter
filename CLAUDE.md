# Claude CLI Template

## Overview

This is a template for building your own Claude Code CLI. Customize `src/branding.ts` to make it yours.

## Quick Start

1. Edit `src/branding.ts` with your branding
2. Run `npm start` to test
3. Customize commands in `.claude/commands/`

## Code Style

- TypeScript strict mode
- ESM imports with `.js` extension
- React hooks pattern for UI

## Commands

```bash
npm run build      # Compile TypeScript
npm run typecheck  # Type check
npm test           # Run tests
npm start          # Dev mode
```

## Customization Points

- `src/branding.ts` - All branding configuration
- `.claude/commands/` - Add custom slash commands
- `src/ui/components/` - Modify UI components
