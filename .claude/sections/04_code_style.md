# Code Style

## TypeScript Rules

**Strict Mode Enforced**
- `strict: true` in tsconfig.json
- All functions must have return types
- All parameters must have types
- No implicit `any`

## Naming Conventions

- **Files**: `kebab-case.ts` or `PascalCase.tsx` for React components
- **Functions**: `camelCase`
- **Classes/Types/Interfaces**: `PascalCase`
- **Constants**: `SCREAMING_SNAKE_CASE`
- **React Hooks**: `useXxxName`

## ESM Imports

Always use `.js` extension for local imports:
```typescript
// Correct
import { something } from './module.js';
import { Component } from './Component.js';

// Wrong - will fail at runtime
import { something } from './module';
```

## Type Annotations

```typescript
// Functions - always annotate params and return
function processData(input: string, options?: Options): Result {
  // ...
}

// Arrow functions
const handler = (event: Event): void => {
  // ...
};

// Variables when type isn't obvious
const config: AgentConfig = { ... };
```

## Interface vs Type

- Use `interface` for object shapes that might be extended
- Use `type` for unions, intersections, and mapped types

```typescript
// Interface for extendable shapes
interface AgentOptions {
  model?: string;
  maxTurns?: number;
}

// Type for unions
type MessageType = 'text' | 'tool_use' | 'tool_result';
```

## React Hook Pattern

```typescript
export interface UseXxxOptions {
  // Options interface
}

export interface UseXxxReturn {
  // Return type interface
}

export function useXxx(options: UseXxxOptions = {}): UseXxxReturn {
  // Implementation
  return { ... };
}

export default useXxx;
```
