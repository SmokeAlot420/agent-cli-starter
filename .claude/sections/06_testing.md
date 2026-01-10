# Testing

## Overview

- **Test Framework**: Vitest
- **Test Location**: `tests/` directory mirrors `src/` structure

## Commands

```bash
# Run all tests
npm test

# Run with verbose output
npm test -- --reporter=verbose

# Run specific test file
npm test -- tests/services/sessions.test.ts

# Run tests matching pattern
npm test -- --grep "session"

# Watch mode
npm test -- --watch
```

## Test File Structure

```
tests/
├── conversation/     # Agent and streaming tests
├── features/         # Commands, MCP tests
├── services/         # Session service tests
├── ui/               # Component and hook tests
│   ├── components.test.tsx
│   └── hooks.test.ts
└── cli.test.ts       # CLI flag parsing tests
```

## Test Patterns

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something specific', () => {
    // Arrange
    const input = createTestInput();

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it('should handle error case', () => {
    expect(() => functionUnderTest(badInput)).toThrow();
  });
});
```

## What to Test

- **Unit tests**: Individual functions, utilities
- **Component tests**: React components render correctly
- **Hook tests**: Custom hooks return expected values
- **Integration tests**: Multi-component workflows
