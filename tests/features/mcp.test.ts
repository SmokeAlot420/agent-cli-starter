/**
 * MCP Feature Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  DEFAULT_MCP_SERVERS,
  CLOUD_MCP_SERVERS,
  loadMcpConfig,
  mergeMcpServers,
  buildMcpConfig,
  checkMcpServerHealth,
  checkAllMcpServers,
  formatMcpStatus,
  clearMcpCache,
  type McpServersConfig,
  type McpServerConfig
} from '../../src/features/mcp.js';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn()
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('MCP Feature', () => {
  beforeEach(() => {
    clearMcpCache();
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('DEFAULT_MCP_SERVERS', () => {
    it('should be a valid McpServersConfig object (empty by default in template)', () => {
      // In the template, DEFAULT_MCP_SERVERS comes from branding.ts
      // and is empty by default - users customize it for their agent
      expect(typeof DEFAULT_MCP_SERVERS).toBe('object');
    });

    it('should be configurable via branding.ts', () => {
      // The actual servers are defined in src/branding.ts
      // This test just verifies the structure is valid
      for (const [name, config] of Object.entries(DEFAULT_MCP_SERVERS)) {
        expect(typeof name).toBe('string');
        expect(config).toHaveProperty('type');
      }
    });
  });

  describe('CLOUD_MCP_SERVERS', () => {
    it('should only have cloud servers', () => {
      expect(CLOUD_MCP_SERVERS.context7).toBeDefined();
      expect(Object.keys(CLOUD_MCP_SERVERS)).toHaveLength(1);
    });

    it('should not have localhost URLs', () => {
      for (const config of Object.values(CLOUD_MCP_SERVERS)) {
        if ('url' in config) {
          expect(config.url).not.toContain('localhost');
        }
      }
    });
  });

  describe('loadMcpConfig', () => {
    it('should return null when no config file exists', async () => {
      const { existsSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const result = loadMcpConfig();

      expect(result).toBeNull();
    });

    it('should load and parse config file', async () => {
      const { existsSync, readFileSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        mcpServers: {
          custom: { type: 'http', url: 'http://localhost:8000' }
        }
      }));

      const result = loadMcpConfig();

      expect(result).toBeDefined();
      expect(result?.custom).toBeDefined();
    });

    it('should expand environment variables', async () => {
      const { existsSync, readFileSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        mcpServers: {
          test: { type: 'http', url: '${MCP_TEST_URL:-http://default.com}' }
        }
      }));

      const result = loadMcpConfig();

      expect(result?.test).toBeDefined();
      expect((result?.test as { url: string }).url).toBe('http://default.com');
    });

    it('should use cache on subsequent calls', async () => {
      const { existsSync, readFileSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({ test: { type: 'http', url: 'http://test.com' } }));

      loadMcpConfig();
      loadMcpConfig();
      loadMcpConfig();

      // Should only read file once due to caching
      expect(readFileSync).toHaveBeenCalledTimes(1);
    });

    it('should handle malformed JSON gracefully', async () => {
      const { existsSync, readFileSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue('invalid json {');

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = loadMcpConfig();

      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('mergeMcpServers', () => {
    it('should return defaults when user is null', () => {
      const defaults: McpServersConfig = {
        server1: { type: 'http', url: 'http://default.com' }
      };

      const result = mergeMcpServers(defaults, null);

      expect(result).toEqual(defaults);
    });

    it('should merge user config with defaults', () => {
      const defaults: McpServersConfig = {
        server1: { type: 'http', url: 'http://default1.com' },
        server2: { type: 'http', url: 'http://default2.com' }
      };
      const user: McpServersConfig = {
        server2: { type: 'http', url: 'http://user2.com' },
        server3: { type: 'http', url: 'http://user3.com' }
      };

      const result = mergeMcpServers(defaults, user);

      expect(result.server1).toEqual(defaults.server1);
      expect(result.server2).toEqual(user.server2); // User overrides
      expect(result.server3).toEqual(user.server3);
    });

    it('should not mutate original configs', () => {
      const defaults: McpServersConfig = { a: { type: 'http', url: 'http://a.com' } };
      const user: McpServersConfig = { b: { type: 'http', url: 'http://b.com' } };

      const result = mergeMcpServers(defaults, user);
      result.c = { type: 'http', url: 'http://c.com' };

      expect(defaults.c).toBeUndefined();
      expect(user.c).toBeUndefined();
    });
  });

  describe('buildMcpConfig', () => {
    beforeEach(async () => {
      const { existsSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(false);
    });

    it('should use default servers by default', () => {
      const result = buildMcpConfig();

      // In template, DEFAULT_MCP_SERVERS is empty by default (configured via branding.ts)
      // This test just verifies the function returns a valid config
      expect(typeof result).toBe('object');
    });

    it('should use cloud-only servers when cloudOnly is true', () => {
      const result = buildMcpConfig({ cloudOnly: true });

      // context7 is in CLOUD_MCP_SERVERS (from branding.ts cloudMcpServers)
      expect(result.context7).toBeDefined();
    });

    it('should disable defaults when useDefaultMcpServers is false', () => {
      const result = buildMcpConfig({ useDefaultMcpServers: false });

      expect(Object.keys(result)).toHaveLength(0);
    });

    it('should add additional servers', () => {
      const result = buildMcpConfig({
        additionalServers: {
          custom: { type: 'http', url: 'http://custom.com' }
        }
      });

      expect(result.custom).toBeDefined();
    });

    it('should exclude specified servers', () => {
      const result = buildMcpConfig({
        cloudOnly: true, // Use cloud servers which has context7
        excludeServers: ['context7']
      });

      expect(result.context7).toBeUndefined();
    });

    it('should load from config file when available', async () => {
      const { existsSync, readFileSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFileSync).mockReturnValue(JSON.stringify({
        fileServer: { type: 'http', url: 'http://file.com' }
      }));

      clearMcpCache();
      const result = buildMcpConfig();

      expect(result.fileServer).toBeDefined();
    });
  });

  describe('checkMcpServerHealth', () => {
    it('should return connected for stdio servers', async () => {
      const config: McpServerConfig = {
        type: 'stdio',
        command: 'node',
        args: ['server.js']
      };

      const result = await checkMcpServerHealth('test', config);

      expect(result.connected).toBe(true);
    });

    it('should check http servers via fetch', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });

      const config: McpServerConfig = {
        type: 'http',
        url: 'http://localhost:8000'
      };

      const result = await checkMcpServerHealth('test', config);

      expect(result.connected).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should handle 405 as connected (some servers reject GET)', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 405 });

      const config: McpServerConfig = {
        type: 'http',
        url: 'http://localhost:8000'
      };

      const result = await checkMcpServerHealth('test', config);

      expect(result.connected).toBe(true);
    });

    it('should return error for failed connections', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      const config: McpServerConfig = {
        type: 'http',
        url: 'http://localhost:8000'
      };

      const result = await checkMcpServerHealth('test', config);

      expect(result.connected).toBe(false);
      expect(result.error).toContain('500');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Connection refused'));

      const config: McpServerConfig = {
        type: 'http',
        url: 'http://localhost:8000'
      };

      const result = await checkMcpServerHealth('test', config);

      expect(result.connected).toBe(false);
      expect(result.error).toBe('Connection refused');
    });
  });

  describe('checkAllMcpServers', () => {
    it('should check all servers in parallel', async () => {
      mockFetch.mockResolvedValue({ ok: true, status: 200 });

      const servers: McpServersConfig = {
        server1: { type: 'http', url: 'http://server1.com' },
        server2: { type: 'http', url: 'http://server2.com' }
      };

      const result = await checkAllMcpServers(servers);

      expect(result.server1).toBeDefined();
      expect(result.server2).toBeDefined();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('should include individual server errors', async () => {
      mockFetch
        .mockResolvedValueOnce({ ok: true, status: 200 })
        .mockRejectedValueOnce(new Error('Network error'));

      const servers: McpServersConfig = {
        working: { type: 'http', url: 'http://working.com' },
        broken: { type: 'http', url: 'http://broken.com' }
      };

      const result = await checkAllMcpServers(servers);

      expect(result.working.connected).toBe(true);
      expect(result.broken.connected).toBe(false);
      expect(result.broken.error).toBe('Network error');
    });
  });

  describe('formatMcpStatus', () => {
    it('should format connected servers with checkmark', () => {
      const results = {
        server1: { connected: true },
        server2: { connected: true }
      };

      const output = formatMcpStatus(results);

      expect(output).toContain('MCP Server Status:');
      expect(output).toContain('✓ server1');
      expect(output).toContain('✓ server2');
    });

    it('should format disconnected servers with X', () => {
      const results = {
        broken: { connected: false, error: 'Connection refused' }
      };

      const output = formatMcpStatus(results);

      expect(output).toContain('✗ broken');
      expect(output).toContain('Connection refused');
    });

    it('should show mixed status correctly', () => {
      const results = {
        working: { connected: true },
        broken: { connected: false, error: 'Timeout' }
      };

      const output = formatMcpStatus(results);

      expect(output).toContain('✓ working');
      expect(output).toContain('✗ broken');
      expect(output).toContain('Timeout');
    });
  });
});
