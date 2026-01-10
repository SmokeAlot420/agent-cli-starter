/**
 * MCP Manager Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { McpManager } from '../../src/conversation/mcp-manager.js';

// Mock the mcp module
vi.mock('../../src/features/mcp.js', () => ({
  buildMcpConfig: vi.fn(() => ({
    defaultServer: { type: 'stdio', command: 'default' }
  }))
}));

describe('McpManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default servers', () => {
    const manager = new McpManager();
    const servers = manager.getServers();

    expect(servers).toHaveProperty('defaultServer');
    expect(manager.hasServers()).toBe(true);
  });

  it('should add a new server', () => {
    const manager = new McpManager();
    manager.addServer('newServer', { type: 'stdio', command: 'test' });

    const servers = manager.getServers();
    expect(servers).toHaveProperty('newServer');
    expect(servers.newServer).toEqual({ type: 'stdio', command: 'test' });
  });

  it('should remove an existing server', () => {
    const manager = new McpManager();
    manager.addServer('toRemove', { type: 'stdio', command: 'test' });

    const result = manager.removeServer('toRemove');
    expect(result).toBe(true);
    expect(manager.getServers()).not.toHaveProperty('toRemove');
  });

  it('should return false when removing non-existent server', () => {
    const manager = new McpManager();
    const result = manager.removeServer('nonExistent');
    expect(result).toBe(false);
  });

  it('should return a copy of servers (not reference)', () => {
    const manager = new McpManager();
    const servers1 = manager.getServers();
    const servers2 = manager.getServers();

    expect(servers1).not.toBe(servers2);
    expect(servers1).toEqual(servers2);
  });

  it('should report correct server count', () => {
    const manager = new McpManager();
    const initialCount = manager.getServerCount();

    manager.addServer('extra', { type: 'stdio', command: 'test' });
    expect(manager.getServerCount()).toBe(initialCount + 1);
  });

  it('should reload configuration', () => {
    const manager = new McpManager();
    manager.addServer('tempServer', { type: 'stdio', command: 'temp' });

    manager.reload();

    // After reload, temp server should be gone (buildMcpConfig is called again)
    expect(manager.getServers()).not.toHaveProperty('tempServer');
  });

  it('should report hasServers as false when empty', async () => {
    // Need to mock empty config for this test
    const { buildMcpConfig } = await import('../../src/features/mcp.js');
    vi.mocked(buildMcpConfig).mockReturnValueOnce({});

    const manager = new McpManager();
    expect(manager.hasServers()).toBe(false);
  });

  it('should report server count as 0 when empty', async () => {
    const { buildMcpConfig } = await import('../../src/features/mcp.js');
    vi.mocked(buildMcpConfig).mockReturnValueOnce({});

    const manager = new McpManager();
    expect(manager.getServerCount()).toBe(0);
  });

  it('should pass options to buildMcpConfig', async () => {
    const { buildMcpConfig } = await import('../../src/features/mcp.js');

    const options = {
      useDefaultMcpServers: true,
      cloudOnly: false,
      mcpConfigPath: '/custom/path'
    };

    new McpManager(options);

    expect(buildMcpConfig).toHaveBeenCalledWith(options);
  });

  it('should handle multiple add operations', () => {
    const manager = new McpManager();

    manager.addServer('server1', { type: 'stdio', command: 'cmd1' });
    manager.addServer('server2', { type: 'stdio', command: 'cmd2' });
    manager.addServer('server3', { type: 'stdio', command: 'cmd3' });

    const servers = manager.getServers();
    expect(servers).toHaveProperty('server1');
    expect(servers).toHaveProperty('server2');
    expect(servers).toHaveProperty('server3');
    expect(manager.getServerCount()).toBe(4); // 3 added + 1 default
  });

  it('should handle multiple remove operations', () => {
    const manager = new McpManager();

    manager.addServer('server1', { type: 'stdio', command: 'cmd1' });
    manager.addServer('server2', { type: 'stdio', command: 'cmd2' });

    expect(manager.removeServer('server1')).toBe(true);
    expect(manager.removeServer('server2')).toBe(true);
    expect(manager.removeServer('server1')).toBe(false); // Already removed

    const servers = manager.getServers();
    expect(servers).not.toHaveProperty('server1');
    expect(servers).not.toHaveProperty('server2');
  });

  it('should overwrite server with same name', () => {
    const manager = new McpManager();

    manager.addServer('myServer', { type: 'stdio', command: 'original' });
    manager.addServer('myServer', { type: 'stdio', command: 'updated' });

    const servers = manager.getServers();
    expect(servers.myServer).toEqual({ type: 'stdio', command: 'updated' });
  });
});
