/**
 * Conversation Built-in Commands Tests
 */

import { describe, it, expect, vi } from 'vitest';
import {
  handleBuiltinCommand,
  type BuiltinCommandResult,
  type CommandContext
} from '../../src/conversation/commands.js';

// Create minimal mock command context
function createMockContext(overrides: Partial<CommandContext> = {}): CommandContext {
  return {
    commands: [],
    mcpServers: {},
    contextManager: {
      getMetrics: () => ({ inputTokens: 0, outputTokens: 0, totalCost: 0 }),
      addUsage: vi.fn(),
      reset: vi.fn()
    } as unknown as CommandContext['contextManager'],
    currentModel: 'claude-opus-4-5-20251101',
    thinkingEnabled: false,
    permissionModeLabel: '',
    formatStatus: () => 'Status: OK',
    formatContext: () => 'Context: 0 tokens',
    formatCost: () => 'Cost: $0.00',
    sessionService: undefined,
    sessionId: undefined,
    ...overrides
  };
}

describe('handleBuiltinCommand', () => {
  describe('session commands', () => {
    it('should handle /sessions command without service', () => {
      const context = createMockContext();
      const result = handleBuiltinCommand('sessions', '', context);

      expect(result).not.toBeNull();
      expect(result?.message.content).toContain('Session service not available');
    });

    it('should handle /sessions command with empty list', () => {
      const mockService = {
        list: vi.fn().mockReturnValue([])
      };

      const context = createMockContext({
        sessionService: mockService as unknown as CommandContext['sessionService']
      });
      const result = handleBuiltinCommand('sessions', '', context);

      expect(result).not.toBeNull();
      expect(result?.message.content).toContain('No sessions found');
    });

    it('should handle /sessions command with sessions', () => {
      const mockSessions = [
        {
          id: 'session-1',
          name: 'Test Session',
          initialPrompt: 'Test prompt',
          lastActiveAt: new Date(),
          messageCount: 5
        }
      ];

      const mockService = {
        list: vi.fn().mockReturnValue(mockSessions)
      };

      const context = createMockContext({
        sessionService: mockService as unknown as CommandContext['sessionService']
      });
      const result = handleBuiltinCommand('sessions', '', context);

      expect(result).not.toBeNull();
      expect(result?.message.content).toContain('Sessions:');
      expect(result?.message.content).toContain('session-1'.slice(0, 8));
    });

    it('should handle /resume command', () => {
      const context = createMockContext();
      const result = handleBuiltinCommand('resume', '', context);

      expect(result).not.toBeNull();
      expect(result?.message.content).toContain('Opening session picker');
      expect(result?.action?.type).toBe('showSessionPicker');
    });

    it('should handle /rename command without session', () => {
      const context = createMockContext();
      const result = handleBuiltinCommand('rename', 'New Name', context);

      expect(result).not.toBeNull();
      expect(result?.message.content).toContain('No active session');
    });

    it('should handle /rename command without name', () => {
      const context = createMockContext({ sessionId: 'session-123' });
      const result = handleBuiltinCommand('rename', '', context);

      expect(result).not.toBeNull();
      expect(result?.message.content).toContain('Usage: /rename');
    });

    it('should handle /rename command with name', () => {
      const context = createMockContext({ sessionId: 'session-123' });
      const result = handleBuiltinCommand('rename', 'My Project', context);

      expect(result).not.toBeNull();
      expect(result?.message.content).toContain('Session renamed');
      expect(result?.message.content).toContain('My Project');
      expect(result?.action?.type).toBe('renameSession');
      if (result?.action?.type === 'renameSession') {
        expect(result.action.name).toBe('My Project');
      }
    });
  });

  describe('other commands', () => {
    it('should handle /clear command', () => {
      const context = createMockContext();
      const result = handleBuiltinCommand('clear', '', context);

      expect(result).not.toBeNull();
      expect(result?.action?.type).toBe('clearHistory');
    });

    it('should return null for unknown command', () => {
      const context = createMockContext();
      const result = handleBuiltinCommand('unknown', '', context);

      expect(result).toBeNull();
    });

    it('should handle /status command', () => {
      const context = createMockContext({
        formatStatus: () => 'Test Status'
      });
      const result = handleBuiltinCommand('status', '', context);

      expect(result).not.toBeNull();
      // Status now includes more comprehensive info, check it contains the formatStatus output
      expect(result?.message.content).toContain('Test Status');
      expect(result?.message.content).toContain('PIV Loop CLI Status');
    });

    it('should handle /context command', () => {
      const context = createMockContext({
        formatContext: () => 'Context: 1000 tokens'
      });
      const result = handleBuiltinCommand('context', '', context);

      expect(result).not.toBeNull();
      expect(result?.message.content).toBe('Context: 1000 tokens');
    });

    it('should handle /cost command', () => {
      const context = createMockContext({
        formatCost: () => 'Cost: $1.50'
      });
      const result = handleBuiltinCommand('cost', '', context);

      expect(result).not.toBeNull();
      expect(result?.message.content).toBe('Cost: $1.50');
    });
  });

  describe('model and thinking commands', () => {
    it('should handle /model command without args (list)', () => {
      const context = createMockContext();
      const result = handleBuiltinCommand('model', '', context);

      expect(result).not.toBeNull();
      // Should show model list
      expect(result?.message.content).toContain('Model');
    });

    it('should handle /model command with model name', () => {
      const context = createMockContext();
      const result = handleBuiltinCommand('model', 'sonnet', context);

      expect(result).not.toBeNull();
      expect(result?.message.content).toContain('Model changed');
      expect(result?.action?.type).toBe('setModel');
    });

    it('should handle /think toggle', () => {
      const context = createMockContext({ thinkingEnabled: false });
      const result = handleBuiltinCommand('think', '', context);

      expect(result).not.toBeNull();
      expect(result?.action?.type).toBe('toggleThinking');
    });

    it('should handle /think on', () => {
      const context = createMockContext();
      const result = handleBuiltinCommand('think', 'on', context);

      expect(result).not.toBeNull();
      expect(result?.message.content).toContain('enabled');
      expect(result?.action?.type).toBe('setThinking');
      if (result?.action?.type === 'setThinking') {
        expect(result.action.enabled).toBe(true);
      }
    });

    it('should handle /think off', () => {
      const context = createMockContext();
      const result = handleBuiltinCommand('think', 'off', context);

      expect(result).not.toBeNull();
      expect(result?.message.content).toContain('disabled');
      expect(result?.action?.type).toBe('setThinking');
      if (result?.action?.type === 'setThinking') {
        expect(result.action.enabled).toBe(false);
      }
    });
  });
});
