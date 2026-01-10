# Development Commands

## NPM Scripts

```bash
# Build TypeScript to dist/
npm run build

# Type check without emitting
npm run typecheck

# Run all tests
npm test

# Start dev mode (tsx, no build needed)
npm start

# Lint (if configured)
npm run lint
```

## CLI Usage

After building, run the CLI:

```bash
# Via npm
npm start

# Or directly
node dist/cli.js

# With flags
node dist/cli.js --help
node dist/cli.js --verbose
node dist/cli.js --continue    # Resume last session
node dist/cli.js --resume <id> # Resume specific session
```

## CLI Flags

| Flag | Short | Description |
|------|-------|-------------|
| `--help` | `-h` | Show help |
| `--version` | `-v` | Show version |
| `--verbose` | `-V` | Enable verbose output |
| `--continue` | `-c` | Resume most recent session |
| `--resume <id>` | `-r` | Resume specific session |
| `--model <name>` | `-m` | Set model (opus, sonnet, haiku) |

## Development Workflow

1. **Make changes** in `src/`
2. **Build**: `npm run build`
3. **Test**: `npm test`
4. **Run**: `npm start`

Or use watch mode:
```bash
# In one terminal
npx tsc --watch

# In another terminal
node dist/cli.js
```

## Debugging

Enable verbose mode for detailed output:
```bash
node dist/cli.js -V
```

Check console output for:
- Tool calls and results
- Stream events
- Error details
