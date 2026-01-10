/**
 * Caching Behavior Tests
 * Tests for command and MCP config caching
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { COMMAND_CACHE_TTL, MCP_CACHE_TTL } from '../../src/constants.js';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  readFileSync: vi.fn()
}));

describe('Command Caching', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    const { clearCommandCache } = await import('../../src/features/commands.js');
    clearCommandCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should return cached commands within TTL', async () => {
    const { existsSync, readdirSync, readFileSync } = await import('fs');
    const { discoverAllCommands, clearCommandCache } = await import('../../src/features/commands.js');

    clearCommandCache();

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readdirSync).mockReturnValue([
      { name: 'test.md', isFile: () => true, isDirectory: () => false }
    ] as unknown as ReturnType<typeof readdirSync>);
    vi.mocked(readFileSync).mockReturnValue('---\ndescription: Test\n---\nContent');

    // First call - populates cache
    const first = discoverAllCommands();
    const callCount1 = vi.mocked(readdirSync).mock.calls.length;

    // Advance time within TTL
    vi.advanceTimersByTime(COMMAND_CACHE_TTL - 1000);

    // Second call - should use cache
    const second = discoverAllCommands();
    const callCount2 = vi.mocked(readdirSync).mock.calls.length;

    expect(callCount2).toBe(callCount1); // No new calls
    expect(first.length).toBe(second.length);
  });

  it('should refresh cache after TTL expires', async () => {
    const { existsSync, readdirSync, readFileSync } = await import('fs');
    const { discoverAllCommands, clearCommandCache } = await import('../../src/features/commands.js');

    clearCommandCache();

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readdirSync).mockReturnValue([
      { name: 'test.md', isFile: () => true, isDirectory: () => false }
    ] as unknown as ReturnType<typeof readdirSync>);
    vi.mocked(readFileSync).mockReturnValue('---\ndescription: Test\n---\nContent');

    // First call
    discoverAllCommands();
    const callCount1 = vi.mocked(readdirSync).mock.calls.length;

    // Advance time past TTL
    vi.advanceTimersByTime(COMMAND_CACHE_TTL + 1000);

    // Second call - should refresh
    discoverAllCommands();
    const callCount2 = vi.mocked(readdirSync).mock.calls.length;

    expect(callCount2).toBeGreaterThan(callCount1);
  });

  it('should clear cache explicitly', async () => {
    const { existsSync, readdirSync, readFileSync } = await import('fs');
    const { discoverAllCommands, clearCommandCache } = await import('../../src/features/commands.js');

    clearCommandCache();

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readdirSync).mockReturnValue([]);
    vi.mocked(readFileSync).mockReturnValue('');

    // First call
    discoverAllCommands();
    const callCount1 = vi.mocked(readdirSync).mock.calls.length;

    // Clear and call again immediately
    clearCommandCache();
    discoverAllCommands();
    const callCount2 = vi.mocked(readdirSync).mock.calls.length;

    expect(callCount2).toBeGreaterThan(callCount1);
  });

  it('should handle cache with different additional paths', async () => {
    const { existsSync, readdirSync, readFileSync } = await import('fs');
    const { discoverAllCommands, clearCommandCache } = await import('../../src/features/commands.js');

    clearCommandCache();

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readdirSync).mockReturnValue([]);
    vi.mocked(readFileSync).mockReturnValue('');

    // First call with no additional paths
    discoverAllCommands([]);
    const callCount1 = vi.mocked(readdirSync).mock.calls.length;

    // Call with different additional paths - should refresh
    discoverAllCommands(['/different/path']);
    const callCount2 = vi.mocked(readdirSync).mock.calls.length;

    expect(callCount2).toBeGreaterThan(callCount1);
  });
});

describe('MCP Config Caching', () => {
  beforeEach(async () => {
    vi.useFakeTimers();
    const { clearMcpCache } = await import('../../src/features/mcp.js');
    clearMcpCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should cache MCP config within TTL', async () => {
    const { existsSync, readFileSync } = await import('fs');
    const { loadMcpConfig, clearMcpCache } = await import('../../src/features/mcp.js');

    clearMcpCache();

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
      mcpServers: { test: { type: 'http', url: 'http://test.com' } }
    }));

    // First call
    const first = loadMcpConfig('/project');
    const callCount1 = vi.mocked(readFileSync).mock.calls.length;

    // Within TTL
    vi.advanceTimersByTime(MCP_CACHE_TTL - 1000);

    // Second call - cached
    const second = loadMcpConfig('/project');
    const callCount2 = vi.mocked(readFileSync).mock.calls.length;

    expect(callCount2).toBe(callCount1);
    expect(first).toEqual(second);
  });

  it('should return copy of cached config (defensive)', async () => {
    const { existsSync, readFileSync } = await import('fs');
    const { loadMcpConfig, clearMcpCache } = await import('../../src/features/mcp.js');

    clearMcpCache();

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
      mcpServers: { test: { type: 'http', url: 'http://test.com' } }
    }));

    const first = loadMcpConfig('/project');
    const second = loadMcpConfig('/project');

    // Should be equal but not same reference
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
  });

  it('should refresh cache after TTL expires', async () => {
    const { existsSync, readFileSync } = await import('fs');
    const { loadMcpConfig, clearMcpCache } = await import('../../src/features/mcp.js');

    clearMcpCache();

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
      mcpServers: { test: { type: 'http', url: 'http://test.com' } }
    }));

    // First call
    loadMcpConfig('/project');
    const callCount1 = vi.mocked(readFileSync).mock.calls.length;

    // Past TTL
    vi.advanceTimersByTime(MCP_CACHE_TTL + 1000);

    // Second call - should refresh
    loadMcpConfig('/project');
    const callCount2 = vi.mocked(readFileSync).mock.calls.length;

    expect(callCount2).toBeGreaterThan(callCount1);
  });

  it('should cache per project path', async () => {
    const { existsSync, readFileSync } = await import('fs');
    const { loadMcpConfig, clearMcpCache } = await import('../../src/features/mcp.js');

    clearMcpCache();

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
      mcpServers: { test: { type: 'http', url: 'http://test.com' } }
    }));

    // First project
    loadMcpConfig('/project1');
    const callCount1 = vi.mocked(readFileSync).mock.calls.length;

    // Different project - should not use cache
    loadMcpConfig('/project2');
    const callCount2 = vi.mocked(readFileSync).mock.calls.length;

    expect(callCount2).toBeGreaterThan(callCount1);
  });

  it('should clear cache explicitly', async () => {
    const { existsSync, readFileSync } = await import('fs');
    const { loadMcpConfig, clearMcpCache } = await import('../../src/features/mcp.js');

    clearMcpCache();

    vi.mocked(existsSync).mockReturnValue(true);
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
      mcpServers: {}
    }));

    // First call
    loadMcpConfig('/project');
    const callCount1 = vi.mocked(readFileSync).mock.calls.length;

    // Clear and call again
    clearMcpCache();
    loadMcpConfig('/project');
    const callCount2 = vi.mocked(readFileSync).mock.calls.length;

    expect(callCount2).toBeGreaterThan(callCount1);
  });
});

describe('Cache Constants', () => {
  it('should have reasonable TTL values', () => {
    expect(COMMAND_CACHE_TTL).toBeGreaterThan(0);
    expect(COMMAND_CACHE_TTL).toBeLessThanOrEqual(60000); // Max 1 minute

    expect(MCP_CACHE_TTL).toBeGreaterThan(0);
    expect(MCP_CACHE_TTL).toBeLessThanOrEqual(120000); // Max 2 minutes
  });

  it('should have MCP_CACHE_TTL >= COMMAND_CACHE_TTL', () => {
    // MCP config changes less frequently
    expect(MCP_CACHE_TTL).toBeGreaterThanOrEqual(COMMAND_CACHE_TTL);
  });

  it('should have sensible default values', () => {
    // Command cache: 30 seconds
    expect(COMMAND_CACHE_TTL).toBe(30000);

    // MCP cache: 60 seconds
    expect(MCP_CACHE_TTL).toBe(60000);
  });
});
