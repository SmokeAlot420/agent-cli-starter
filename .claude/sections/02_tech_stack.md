# Tech Stack

## Core Technologies

- **TypeScript** 5.x with strict mode
- **Node.js** 20+ with ESM modules
- **@anthropic-ai/claude-agent-sdk** - Claude Code SDK
- **Ink** 5.x - React for CLI interfaces
- **React** 18.x - UI component framework
- **better-sqlite3** - Session persistence

## Key Dependencies

```json
{
  "dependencies": {
    "@anthropic-ai/claude-agent-sdk": "^0.2.2",
    "ink": "^5.0.1",
    "react": "^18.3.1",
    "better-sqlite3": "^11.7.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "typescript": "^5.7.2",
    "vitest": "^2.1.8",
    "@types/node": "^22.10.2",
    "@types/react": "^18.3.12",
    "@types/better-sqlite3": "^7.6.12"
  }
}
```

## Build Tools

- **tsc** - TypeScript compiler
- **tsx** - TypeScript execution (dev mode)
- **vitest** - Test runner
- **ESLint** - Linting (optional)

## Runtime Requirements

- Node.js 20+ required
- ESM modules (`"type": "module"` in package.json)
- All imports use `.js` extension
