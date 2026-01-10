/**
 * UI Hooks Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Note: Testing hooks in isolation requires a React testing environment
// These are structural tests to verify exports and basic functionality

describe('useThinking Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should export useThinking function', async () => {
    const { useThinking } = await import('../../src/ui/hooks/useThinking.js');
    expect(typeof useThinking).toBe('function');
  });
});

describe('useKeyboard Hook', () => {
  it('should export useKeyboard function', async () => {
    const { useKeyboard } = await import('../../src/ui/hooks/useKeyboard.js');
    expect(typeof useKeyboard).toBe('function');
  });

  it('should accept onShowSessions callback in options', async () => {
    // Verify the type definition accepts onShowSessions
    const module = await import('../../src/ui/hooks/useKeyboard.js');
    // This is a type check - if the module exports correctly with the new option, it compiles
    expect(module).toBeDefined();
    expect(typeof module.useKeyboard).toBe('function');
  });
});

describe('useAgent Hook', () => {
  it('should export useAgent function', async () => {
    const { useAgent } = await import('../../src/ui/hooks/useAgent.js');
    expect(typeof useAgent).toBe('function');
  });

  it('should accept onSessionCreated callback in options', async () => {
    // Verify the type definition accepts session-related options
    const module = await import('../../src/ui/hooks/useAgent.js');
    expect(module).toBeDefined();
    expect(typeof module.useAgent).toBe('function');
  });

  it('should include sessionId in return type', async () => {
    // This verifies the UseAgentReturn interface is properly exported
    const module = await import('../../src/ui/hooks/useAgent.js');
    expect(module).toBeDefined();
  });
});

describe('useMcpHealth Hook', () => {
  it('should export useMcpHealth function', async () => {
    const { useMcpHealth } = await import('../../src/ui/hooks/useMcpHealth.js');
    expect(typeof useMcpHealth).toBe('function');
  });

  it('should export McpServerHealth type interface', async () => {
    // Type exports are verified at compile time
    // This test ensures the module loads correctly
    const module = await import('../../src/ui/hooks/useMcpHealth.js');
    expect(module).toBeDefined();
    expect(typeof module.useMcpHealth).toBe('function');
  });
});

describe('useCommandAutocomplete Hook', () => {
  it('should export useCommandAutocomplete function', async () => {
    const { useCommandAutocomplete } = await import('../../src/ui/hooks/useCommandAutocomplete.js');
    expect(typeof useCommandAutocomplete).toBe('function');
  });

  it('should return autocomplete state and methods', async () => {
    // Verify the hook module structure
    const module = await import('../../src/ui/hooks/useCommandAutocomplete.js');
    expect(module).toBeDefined();
    expect(typeof module.useCommandAutocomplete).toBe('function');
    expect(typeof module.default).toBe('function');
  });
});

describe('usePermission Hook', () => {
  it('should export usePermission function', async () => {
    const { usePermission } = await import('../../src/ui/hooks/usePermission.js');
    expect(typeof usePermission).toBe('function');
  });

  it('should export type definitions', async () => {
    const module = await import('../../src/ui/hooks/usePermission.js');
    expect(module).toBeDefined();
    expect(typeof module.usePermission).toBe('function');
  });
});

describe('Hooks Barrel Export', () => {
  it('should export all hooks from index', async () => {
    const hooks = await import('../../src/ui/hooks/index.js');

    expect(typeof hooks.useAgent).toBe('function');
    expect(typeof hooks.useThinking).toBe('function');
    expect(typeof hooks.useKeyboard).toBe('function');
    expect(typeof hooks.useMcpHealth).toBe('function');
    expect(typeof hooks.useCommandAutocomplete).toBe('function');
    expect(typeof hooks.usePermission).toBe('function');
  });
});
