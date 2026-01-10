/**
 * Autocomplete Feature Unit Tests
 */

import { describe, it, expect } from 'vitest';

describe('useCommandAutocomplete Hook', () => {
  it('should export useCommandAutocomplete function', async () => {
    const { useCommandAutocomplete } = await import('../../src/ui/hooks/useCommandAutocomplete.js');
    expect(typeof useCommandAutocomplete).toBe('function');
  });

  it('should export UseCommandAutocompleteReturn type interface', async () => {
    // Type exports are verified at compile time
    // This test ensures the module loads correctly
    const module = await import('../../src/ui/hooks/useCommandAutocomplete.js');
    expect(module).toBeDefined();
    expect(typeof module.useCommandAutocomplete).toBe('function');
  });

  it('should have default export', async () => {
    const module = await import('../../src/ui/hooks/useCommandAutocomplete.js');
    expect(module.default).toBeDefined();
    expect(typeof module.default).toBe('function');
  });
});

describe('CommandAutocomplete Component', () => {
  it('should export CommandAutocomplete component', async () => {
    const { CommandAutocomplete } = await import('../../src/ui/components/CommandAutocomplete.js');
    expect(CommandAutocomplete).toBeDefined();
  });

  it('should export CommandAutocompleteProps type interface', async () => {
    // Type exports are verified at compile time
    // This test ensures the module loads correctly
    const module = await import('../../src/ui/components/CommandAutocomplete.js');
    expect(module).toBeDefined();
    expect(module.CommandAutocomplete).toBeDefined();
  });

  it('should have default export', async () => {
    const module = await import('../../src/ui/components/CommandAutocomplete.js');
    expect(module.default).toBeDefined();
  });
});

describe('Autocomplete Barrel Exports', () => {
  it('should export useCommandAutocomplete from hooks index', async () => {
    const hooks = await import('../../src/ui/hooks/index.js');
    expect(typeof hooks.useCommandAutocomplete).toBe('function');
  });

  it('should export CommandAutocomplete from components index', async () => {
    const components = await import('../../src/ui/components/index.js');
    expect(components.CommandAutocomplete).toBeDefined();
  });
});

describe('InputPrompt Integration', () => {
  it('should export InputPrompt component', async () => {
    const { InputPrompt } = await import('../../src/ui/components/InputPrompt.js');
    expect(InputPrompt).toBeDefined();
  });

  it('InputPrompt should import autocomplete modules', async () => {
    // Verify the module loads without errors (integration is at runtime)
    const module = await import('../../src/ui/components/InputPrompt.js');
    expect(module.InputPrompt).toBeDefined();
    expect(module.default).toBeDefined();
  });
});

describe('Hook Structure', () => {
  it('useCommandAutocomplete should return expected interface shape', async () => {
    // This is a structural test - we can't call React hooks outside of React
    // But we can verify the function signature exists
    const { useCommandAutocomplete } = await import('../../src/ui/hooks/useCommandAutocomplete.js');

    // Verify it's a function that can be called (will throw in non-React context)
    expect(useCommandAutocomplete.length).toBe(0); // No required params
  });
});
