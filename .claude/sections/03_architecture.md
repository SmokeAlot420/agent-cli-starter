# Architecture

## Directory Structure

```
src/
├── conversation/        # ConversationalAgent modules
│   ├── index.ts         # Main ConversationalAgent class
│   ├── agent.ts         # Core agent implementation
│   ├── streaming.ts     # Stream processing utilities
│   ├── commands.ts      # Built-in command handlers
│   ├── mcp-manager.ts   # MCP server management
│   └── types.ts         # Type definitions
├── features/            # Feature modules
│   ├── commands.ts      # Slash command system
│   ├── mcp.ts           # MCP server configuration
│   ├── context.ts       # Context/token tracking
│   └── models.ts        # Model resolution
├── services/            # Service layer
│   └── sessions.ts      # SQLite session management
├── ui/                  # Ink-based terminal UI
│   ├── App.tsx          # Main application component
│   ├── components/      # UI components
│   │   ├── Header.tsx
│   │   ├── StatusBar.tsx
│   │   ├── InputPrompt.tsx
│   │   ├── MessageStream.tsx
│   │   └── ...
│   └── hooks/           # React hooks
│       ├── useAgent.ts
│       ├── useKeyboard.ts
│       └── ...
├── types/               # Shared TypeScript types
├── branding.ts          # Customization point (YOUR BRANDING)
├── cli.ts               # CLI entry point
└── constants.ts         # Configuration constants
```

## Key Components

### ConversationalAgent
Main SDK wrapper in `src/conversation/`:
- Wraps `@anthropic-ai/claude-agent-sdk`
- Manages session state and history
- Handles tool permissions
- Streams responses to UI

### SessionService
SQLite-based persistence in `src/services/sessions.ts`:
- Session metadata storage
- Message persistence for resume
- Works with SDK's session management

### UI Layer (Ink/React)
Terminal UI in `src/ui/`:
- `App.tsx` - Main component
- `useAgent` hook - Agent state management
- Components: Header, StatusBar, MessageStream, InputPrompt
