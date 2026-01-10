# Core Principles

## Mission: Fork, Build, Ship

This template enables developers to create their own Claude Code CLI:
- **Fork** - Clone and customize the template
- **Build** - Add your branding, commands, and features
- **Ship** - Release as your own product

Open-source spirit: Contribute improvements back to the community.

## Development Philosophy

**KISS** (Keep It Simple, Stupid)
- Prefer simple, readable solutions over clever abstractions
- If it's hard to explain, it's probably too complex

**YAGNI** (You Aren't Gonna Need It)
- Don't build features until they're actually needed
- Avoid speculative generalization

**Claude Code Parity**
- Match Claude Code's UX and capabilities where possible
- Use the same keyboard shortcuts (Escape to interrupt, Ctrl+C to exit)
- Follow established CLI patterns users already know

## Non-Negotiable Rules

**TYPE SAFETY IS CRITICAL**
- TypeScript strict mode is enforced
- All functions, methods, and variables MUST have type annotations
- No `any` types without explicit justification
- Run `npm run typecheck` before committing

**ESM MODULES**
- All imports use `.js` extension (required for ESM)
- No CommonJS (`require`) usage

**TESTING**
- All new features need tests
- Run `npm test` before committing
