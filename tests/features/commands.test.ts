/**
 * Commands Feature Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  parseCommand,
  discoverCommandsInDir,
  getCommand,
  expandCommandTemplate,
  executeCommand,
  formatCommandList,
  clearCommandCache,
  BUILTIN_COMMANDS,
  type SlashCommand
} from '../../src/features/commands.js';

// Mock fs module
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
  readFileSync: vi.fn()
}));

describe('Commands Feature', () => {
  beforeEach(() => {
    clearCommandCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('parseCommand', () => {
    it('should parse simple command', () => {
      const result = parseCommand('/commit');

      expect(result).toEqual({
        command: 'commit',
        args: '',
        argList: []
      });
    });

    it('should parse command with arguments', () => {
      const result = parseCommand('/plan Add user authentication');

      expect(result).toEqual({
        command: 'plan',
        args: 'Add user authentication',
        argList: ['Add', 'user', 'authentication']
      });
    });

    it('should parse namespaced command', () => {
      const result = parseCommand('/core/plan feature');

      expect(result).toEqual({
        command: 'core/plan',
        args: 'feature',
        argList: ['feature']
      });
    });

    it('should return null for non-command input', () => {
      expect(parseCommand('hello')).toBeNull();
      expect(parseCommand('')).toBeNull();
      expect(parseCommand('  ')).toBeNull();
    });

    it('should handle leading/trailing whitespace', () => {
      const result = parseCommand('  /help  ');

      expect(result).toEqual({
        command: 'help',
        args: '',
        argList: []
      });
    });

    it('should handle multiple spaces between args', () => {
      const result = parseCommand('/exec  arg1    arg2');

      expect(result).toEqual({
        command: 'exec',
        args: 'arg1    arg2',
        argList: ['arg1', 'arg2']
      });
    });
  });

  describe('discoverCommandsInDir', () => {
    it('should return empty array for non-existent directory', async () => {
      const { existsSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(false);

      const result = discoverCommandsInDir('/nonexistent', 'user');

      expect(result).toEqual([]);
    });

    it('should discover .md files as commands', async () => {
      const { existsSync, readdirSync, readFileSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdirSync).mockReturnValue([
        { name: 'test.md', isFile: () => true, isDirectory: () => false }
      ] as unknown as ReturnType<typeof readdirSync>);
      vi.mocked(readFileSync).mockReturnValue('---\ndescription: Test command\n---\nCommand content');

      const result = discoverCommandsInDir('/commands', 'user');

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('test');
      expect(result[0].description).toBe('Test command');
      expect(result[0].sourceType).toBe('user');
    });

    it('should handle nested directories', async () => {
      const { existsSync, readdirSync, readFileSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdirSync).mockImplementation((path) => {
        if (path === '/commands') {
          return [
            { name: 'subdir', isFile: () => false, isDirectory: () => true }
          ] as unknown as ReturnType<typeof readdirSync>;
        }
        return [
          { name: 'nested.md', isFile: () => true, isDirectory: () => false }
        ] as unknown as ReturnType<typeof readdirSync>;
      });
      vi.mocked(readFileSync).mockReturnValue('Nested command');

      const result = discoverCommandsInDir('/commands', 'project');

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('subdir/nested');
    });

    it('should skip non-md files', async () => {
      const { existsSync, readdirSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdirSync).mockReturnValue([
        { name: 'readme.txt', isFile: () => true, isDirectory: () => false },
        { name: 'script.js', isFile: () => true, isDirectory: () => false }
      ] as unknown as ReturnType<typeof readdirSync>);

      const result = discoverCommandsInDir('/commands', 'builtin');

      expect(result).toEqual([]);
    });

    it('should parse frontmatter metadata', async () => {
      const { existsSync, readdirSync, readFileSync } = await import('fs');
      vi.mocked(existsSync).mockReturnValue(true);
      vi.mocked(readdirSync).mockReturnValue([
        { name: 'cmd.md', isFile: () => true, isDirectory: () => false }
      ] as unknown as ReturnType<typeof readdirSync>);
      vi.mocked(readFileSync).mockReturnValue(`---
description: My command
argument-hint: <feature>
model: opus
---
Command body`);

      const result = discoverCommandsInDir('/commands', 'user');

      expect(result[0].metadata.description).toBe('My command');
      expect(result[0].metadata.argumentHint).toBe('<feature>');
      expect(result[0].metadata.model).toBe('opus');
    });
  });

  describe('getCommand', () => {
    const mockCommands: SlashCommand[] = [
      {
        name: 'test',
        description: 'Test command',
        source: '/path/test.md',
        sourceType: 'user',
        content: 'test content',
        metadata: {}
      },
      {
        name: 'other',
        description: 'Other command',
        source: '/path/other.md',
        sourceType: 'project',
        content: 'other content',
        metadata: {}
      }
    ];

    it('should find command by name', () => {
      const result = getCommand('test', mockCommands);

      expect(result?.name).toBe('test');
      expect(result?.description).toBe('Test command');
    });

    it('should return null for unknown command', () => {
      const result = getCommand('nonexistent', mockCommands);

      expect(result).toBeNull();
    });
  });

  describe('expandCommandTemplate', () => {
    it('should replace $ARGUMENTS with all args', () => {
      const result = expandCommandTemplate(
        'Do this: $ARGUMENTS',
        'arg1 arg2 arg3',
        ['arg1', 'arg2', 'arg3']
      );

      expect(result).toBe('Do this: arg1 arg2 arg3');
    });

    it('should replace numbered placeholders', () => {
      const result = expandCommandTemplate(
        'First: $1, Second: $2',
        'hello world',
        ['hello', 'world']
      );

      expect(result).toBe('First: hello, Second: world');
    });

    it('should remove unused placeholders', () => {
      const result = expandCommandTemplate(
        'First: $1, Second: $2, Third: $3',
        'only',
        ['only']
      );

      expect(result).toBe('First: only, Second: , Third:');
    });

    it('should handle multiple occurrences', () => {
      const result = expandCommandTemplate(
        '$ARGUMENTS and $ARGUMENTS again',
        'test',
        ['test']
      );

      expect(result).toBe('test and test again');
    });

    it('should trim result', () => {
      const result = expandCommandTemplate(
        '  content  ',
        '',
        []
      );

      expect(result).toBe('content');
    });
  });

  describe('executeCommand', () => {
    const mockCommands: SlashCommand[] = [
      {
        name: 'greet',
        description: 'Greet someone',
        source: '/path/greet.md',
        sourceType: 'user',
        content: 'Hello $1! How are you?',
        metadata: { argumentHint: 'name' }
      }
    ];

    it('should execute command and expand template', () => {
      const result = executeCommand('greet', 'World', mockCommands);

      expect(result?.prompt).toBe('Hello World! How are you?');
      expect(result?.metadata.argumentHint).toBe('name');
    });

    it('should return null for unknown command', () => {
      const result = executeCommand('unknown', 'args', mockCommands);

      expect(result).toBeNull();
    });
  });

  describe('formatCommandList', () => {
    it('should format commands grouped by source type', () => {
      const commands: SlashCommand[] = [
        { name: 'builtin1', description: 'Built-in 1', source: '', sourceType: 'builtin', content: '', metadata: {} },
        { name: 'user1', description: 'User 1', source: '', sourceType: 'user', content: '', metadata: {} },
        { name: 'project1', description: 'Project 1', source: '', sourceType: 'project', content: '', metadata: {} }
      ];

      const result = formatCommandList(commands);

      expect(result).toContain('Available Commands:');
      expect(result).toContain('Builtin:');
      expect(result).toContain('User:');
      expect(result).toContain('Project:');
      expect(result).toContain('/builtin1');
      expect(result).toContain('/user1');
      expect(result).toContain('/project1');
    });

    it('should include argument hints', () => {
      const commands: SlashCommand[] = [
        {
          name: 'test',
          description: 'Test command',
          source: '',
          sourceType: 'user',
          content: '',
          metadata: { argumentHint: 'feature' }
        }
      ];

      const result = formatCommandList(commands);

      expect(result).toContain('/test <feature>');
    });

    it('should sort commands alphabetically within groups', () => {
      const commands: SlashCommand[] = [
        { name: 'zebra', description: 'Z', source: '', sourceType: 'user', content: '', metadata: {} },
        { name: 'alpha', description: 'A', source: '', sourceType: 'user', content: '', metadata: {} },
        { name: 'beta', description: 'B', source: '', sourceType: 'user', content: '', metadata: {} }
      ];

      const result = formatCommandList(commands);
      const lines = result.split('\n');
      const userCommands = lines.filter(l => l.includes('/'));

      // Alpha should come before Beta which comes before Zebra
      const alphaIdx = userCommands.findIndex(l => l.includes('/alpha'));
      const betaIdx = userCommands.findIndex(l => l.includes('/beta'));
      const zebraIdx = userCommands.findIndex(l => l.includes('/zebra'));

      expect(alphaIdx).toBeLessThan(betaIdx);
      expect(betaIdx).toBeLessThan(zebraIdx);
    });
  });

  describe('BUILTIN_COMMANDS', () => {
    it('should have plan command', () => {
      expect(BUILTIN_COMMANDS.plan).toBeDefined();
      expect(BUILTIN_COMMANDS.plan.description).toBeDefined();
      expect(BUILTIN_COMMANDS.plan.content).toContain('$ARGUMENTS');
    });

    it('should have execute command', () => {
      expect(BUILTIN_COMMANDS.execute).toBeDefined();
      expect(BUILTIN_COMMANDS.execute.content).toContain('PIV');
    });

    it('should have validate command', () => {
      expect(BUILTIN_COMMANDS.validate).toBeDefined();
    });

    it('should have review command', () => {
      expect(BUILTIN_COMMANDS.review).toBeDefined();
    });

    it('should have commit command', () => {
      expect(BUILTIN_COMMANDS.commit).toBeDefined();
      expect(BUILTIN_COMMANDS.commit.content).toContain('conventional');
    });

    it('should have clear command', () => {
      expect(BUILTIN_COMMANDS.clear).toBeDefined();
    });

    it('should have help command', () => {
      expect(BUILTIN_COMMANDS.help).toBeDefined();
    });
  });
});
