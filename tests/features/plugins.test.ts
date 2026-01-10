/**
 * Plugins Feature Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parsePluginSource,
  loadPluginManifest,
  loadPlugin,
  getInstalledPlugins,
  formatPluginList,
  listInstalledPluginNames,
  PluginManager,
  PLUGINS_DIR,
  type PluginManifest,
  type LoadedPlugin
} from '../../src/features/plugins.js';

// Mock fs module (sync functions only)
vi.mock('fs', () => ({
  existsSync: vi.fn()
}));

// Mock fs/promises module
vi.mock('fs/promises', () => ({
  mkdir: vi.fn(),
  readFile: vi.fn(),
  writeFile: vi.fn(),
  rm: vi.fn(),
  readdir: vi.fn()
}));

// Mock child_process
vi.mock('child_process', () => ({
  spawnSync: vi.fn()
}));

// Mock commands module
vi.mock('../../src/features/commands.js', () => ({
  discoverCommandsInDir: vi.fn(() => [])
}));

// Mock mcp module
vi.mock('../../src/features/mcp.js', () => ({
  loadMcpConfig: vi.fn(() => null)
}));

describe('Plugins Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('parsePluginSource', () => {
    it('should parse local paths starting with ./', () => {
      const result = parsePluginSource('./my-plugin');

      expect(result).toEqual({
        type: 'local',
        path: './my-plugin'
      });
    });

    it('should parse local paths starting with /', () => {
      const result = parsePluginSource('/absolute/path/plugin');

      expect(result).toEqual({
        type: 'local',
        path: '/absolute/path/plugin'
      });
    });

    it('should parse Windows paths', () => {
      const result = parsePluginSource('C:\\Users\\test\\plugin');

      expect(result).toEqual({
        type: 'local',
        path: 'C:\\Users\\test\\plugin'
      });
    });

    it('should parse github: shorthand', () => {
      const result = parsePluginSource('github:owner/repo');

      expect(result).toEqual({
        type: 'github',
        owner: 'owner',
        repo: 'repo',
        ref: undefined
      });
    });

    it('should parse github: shorthand with ref', () => {
      const result = parsePluginSource('github:owner/repo#v1.0.0');

      expect(result).toEqual({
        type: 'github',
        owner: 'owner',
        repo: 'repo',
        ref: 'v1.0.0'
      });
    });

    it('should parse GitHub URL', () => {
      const result = parsePluginSource('https://github.com/myorg/myplugin');

      expect(result).toEqual({
        type: 'github',
        owner: 'myorg',
        repo: 'myplugin',
        ref: undefined
      });
    });

    it('should parse GitHub URL with .git suffix', () => {
      const result = parsePluginSource('https://github.com/owner/repo.git');

      expect(result).toEqual({
        type: 'github',
        owner: 'owner',
        repo: 'repo',
        ref: undefined
      });
    });

    it('should fall back to registry for plain names', () => {
      const result = parsePluginSource('my-plugin');

      expect(result).toEqual({
        type: 'registry',
        name: 'my-plugin'
      });
    });
  });

  describe('loadPluginManifest', () => {
    it('should return null when manifest does not exist', async () => {
      const { existsSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const result = await loadPluginManifest('/plugin');

      expect(result).toBeNull();
    });

    it('should load and parse manifest', async () => {
      const { existsSync } = await import('fs');
      const { readFile } = await import('fs/promises');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin'
      }));

      const result = await loadPluginManifest('/plugin');

      expect(result).toEqual({
        name: 'test-plugin',
        version: '1.0.0',
        description: 'A test plugin'
      });
    });

    it('should return null for invalid JSON', async () => {
      const { existsSync } = await import('fs');
      const { readFile } = await import('fs/promises');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue('invalid json {');

      const result = await loadPluginManifest('/plugin');

      expect(result).toBeNull();
    });
  });

  describe('loadPlugin', () => {
    it('should return null when manifest not found', async () => {
      const { existsSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const result = await loadPlugin('/plugin', 'source');

      expect(result).toBeNull();
    });

    it('should load plugin with manifest', async () => {
      const { existsSync } = await import('fs');
      const { readFile } = await import('fs/promises');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({
        name: 'my-plugin',
        version: '2.0.0',
        description: 'My plugin'
      }));

      const result = await loadPlugin('/plugin', 'github:owner/repo');

      expect(result).not.toBeNull();
      expect(result?.manifest.name).toBe('my-plugin');
      expect(result?.source).toBe('github:owner/repo');
      expect(result?.enabled).toBe(true);
    });
  });

  describe('getInstalledPlugins', () => {
    it('should return empty object when registry file does not exist', async () => {
      const { existsSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const result = await getInstalledPlugins();

      expect(result).toEqual({});
    });

    it('should load plugins registry', async () => {
      const { existsSync } = await import('fs');
      const { readFile } = await import('fs/promises');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readFile).mockResolvedValue(JSON.stringify({
        'plugin-a': { source: './local', enabled: true },
        'plugin-b': { source: 'github:owner/repo', enabled: false }
      }));

      const result = await getInstalledPlugins();

      expect(result).toHaveProperty('plugin-a');
      expect(result).toHaveProperty('plugin-b');
      expect(result['plugin-a'].enabled).toBe(true);
      expect(result['plugin-b'].enabled).toBe(false);
    });
  });

  describe('formatPluginList', () => {
    it('should show message when no plugins installed', () => {
      const result = formatPluginList([]);

      expect(result).toContain('No plugins installed');
      expect(result).toContain('Install plugins with');
    });

    it('should format plugin list', () => {
      const plugins: LoadedPlugin[] = [
        {
          manifest: {
            name: 'test-plugin',
            version: '1.0.0',
            description: 'A test plugin',
            author: 'Test Author'
          },
          path: '/plugins/test',
          source: 'github:owner/repo',
          commands: [{ name: 'cmd1', description: 'desc', source: '', sourceType: 'plugin', content: '', metadata: {} }],
          mcpServers: { server1: { type: 'http', url: 'http://localhost' } },
          enabled: true
        }
      ];

      const result = formatPluginList(plugins);

      expect(result).toContain('Installed Plugins');
      expect(result).toContain('✓ test-plugin');
      expect(result).toContain('v1.0.0');
      expect(result).toContain('A test plugin');
      expect(result).toContain('1 commands');
      expect(result).toContain('1 MCP servers');
      expect(result).toContain('Test Author');
    });

    it('should show disabled status', () => {
      const plugins: LoadedPlugin[] = [
        {
          manifest: {
            name: 'disabled-plugin',
            version: '1.0.0',
            description: 'Disabled'
          },
          path: '/plugins/disabled',
          source: 'local',
          commands: [],
          mcpServers: {},
          enabled: false
        }
      ];

      const result = formatPluginList(plugins);

      expect(result).toContain('○ disabled-plugin');
    });
  });

  describe('listInstalledPluginNames', () => {
    it('should return empty array when plugins dir does not exist', async () => {
      const { existsSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const result = await listInstalledPluginNames();

      expect(result).toEqual([]);
    });

    it('should list directory names', async () => {
      const { existsSync } = await import('fs');
      const { readdir } = await import('fs/promises');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdir).mockResolvedValue([
        { name: 'plugin-a', isDirectory: () => true },
        { name: 'plugin-b', isDirectory: () => true },
        { name: 'file.txt', isDirectory: () => false }
      ] as unknown as Awaited<ReturnType<typeof readdir>>);

      const result = await listInstalledPluginNames();

      expect(result).toEqual(['plugin-a', 'plugin-b']);
    });
  });

  describe('PluginManager', () => {
    let manager: PluginManager;

    beforeEach(async () => {
      const { existsSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(false);
      manager = new PluginManager();
    });

    describe('install', () => {
      it('should fail for non-existent local path', async () => {
        const { existsSync } = await import('fs');
        vi.mocked(existsSync).mockReturnValue(false);

        const result = await manager.install('./nonexistent');

        expect(result.success).toBe(false);
        expect(result.error).toContain('Path not found');
      });

      it('should fail for local path without manifest', async () => {
        const { existsSync } = await import('fs');
        vi.mocked(existsSync).mockImplementation((path) => {
          return String(path).endsWith('./local-plugin');
        });

        const result = await manager.install('./local-plugin');

        expect(result.success).toBe(false);
        expect(result.error).toContain('No plugin manifest');
      });

      it('should return error for registry plugins (not implemented)', async () => {
        const result = await manager.install('some-plugin');

        expect(result.success).toBe(false);
        expect(result.error).toContain('not yet implemented');
      });
    });

    describe('uninstall', () => {
      it('should fail for non-installed plugin', async () => {
        const { existsSync } = await import('fs');
        vi.mocked(existsSync).mockReturnValue(false);

        const result = await manager.uninstall('nonexistent');

        expect(result.success).toBe(false);
        expect(result.error).toContain('not installed');
      });
    });

    describe('enable/disable', () => {
      it('should return false for non-installed plugin', async () => {
        const { existsSync } = await import('fs');
        vi.mocked(existsSync).mockReturnValue(false);

        expect(await manager.enable('nonexistent')).toBe(false);
        expect(await manager.disable('nonexistent')).toBe(false);
      });
    });

    describe('list', () => {
      it('should return empty array when no plugins loaded', () => {
        const result = manager.list();

        expect(result).toEqual([]);
      });
    });

    describe('get', () => {
      it('should return undefined for unknown plugin', () => {
        const result = manager.get('unknown');

        expect(result).toBeUndefined();
      });
    });

    describe('getAllCommands', () => {
      it('should return empty array when no plugins', () => {
        const result = manager.getAllCommands();

        expect(result).toEqual([]);
      });
    });

    describe('getAllMcpServers', () => {
      it('should return empty object when no plugins', () => {
        const result = manager.getAllMcpServers();

        expect(result).toEqual({});
      });
    });
  });

  describe('PLUGINS_DIR', () => {
    it('should be in home directory', () => {
      expect(PLUGINS_DIR).toContain('.claude');
      expect(PLUGINS_DIR).toContain('plugins');
    });
  });

  describe('GitHub validation (security)', () => {
    it('should reject invalid GitHub owner names', async () => {
      const { existsSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const manager = new PluginManager();
      const result = await manager.install('github:owner;rm -rf /repo');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid GitHub owner');
    });

    it('should reject invalid GitHub repo names', async () => {
      const { existsSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const manager = new PluginManager();
      const result = await manager.install('github:valid-owner/repo$(malicious)');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid GitHub repo');
    });

    it('should reject invalid Git refs', async () => {
      const { existsSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const manager = new PluginManager();
      const result = await manager.install('github:owner/repo#ref;echo pwned');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid Git ref');
    });
  });
});
