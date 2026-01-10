/**
 * Session Picker Tests
 */

import { describe, it, expect } from 'vitest';
import type { SessionListItem } from '../../src/types/index.js';

// Mock sessions for testing
const mockSessions: SessionListItem[] = [
  {
    id: 'session-1',
    name: 'Feature Development',
    initialPrompt: 'Help me build a new feature',
    projectPath: '/test/project',
    projectHash: 'abc123',
    gitBranch: 'main',
    messageCount: 15,
    createdAt: new Date('2024-01-01'),
    lastActiveAt: new Date('2024-01-02')
  },
  {
    id: 'session-2',
    name: undefined,
    initialPrompt: 'Fix the authentication bug in login flow',
    projectPath: '/test/project',
    projectHash: 'abc123',
    gitBranch: 'fix/auth',
    messageCount: 8,
    createdAt: new Date('2024-01-01'),
    lastActiveAt: new Date('2024-01-01')
  },
  {
    id: 'session-3',
    name: 'Refactoring',
    initialPrompt: 'Refactor the database layer',
    projectPath: '/test/project',
    projectHash: 'abc123',
    messageCount: 42,
    createdAt: new Date('2023-12-15'),
    lastActiveAt: new Date('2023-12-20')
  }
];

describe('useSessionPicker', () => {
  it('should export useSessionPicker function', async () => {
    const module = await import('../../src/ui/hooks/useSessionPicker.js');
    expect(typeof module.useSessionPicker).toBe('function');
  });

  it('should export formatTimeAgo function', async () => {
    const module = await import('../../src/ui/hooks/useSessionPicker.js');
    expect(typeof module.formatTimeAgo).toBe('function');
  });

  it('should have correct return type shape', async () => {
    const module = await import('../../src/ui/hooks/useSessionPicker.js');
    // Type check is compile-time, this validates the module exports
    expect(module.useSessionPicker).toBeDefined();
  });
});

describe('formatTimeAgo', () => {
  it('should format recent times as just now', async () => {
    const { formatTimeAgo } = await import('../../src/ui/hooks/useSessionPicker.js');
    const now = new Date();
    expect(formatTimeAgo(now)).toBe('just now');
  });

  it('should format minutes correctly', async () => {
    const { formatTimeAgo } = await import('../../src/ui/hooks/useSessionPicker.js');
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(formatTimeAgo(fiveMinAgo)).toBe('5m ago');
  });

  it('should format hours correctly', async () => {
    const { formatTimeAgo } = await import('../../src/ui/hooks/useSessionPicker.js');
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(formatTimeAgo(twoHoursAgo)).toBe('2h ago');
  });

  it('should format days correctly', async () => {
    const { formatTimeAgo } = await import('../../src/ui/hooks/useSessionPicker.js');
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatTimeAgo(threeDaysAgo)).toBe('3d ago');
  });
});

describe('SessionPicker component', () => {
  it('should export SessionPicker component', async () => {
    const module = await import('../../src/ui/components/SessionPicker.js');
    expect(module.SessionPicker).toBeDefined();
  });

  it('should export SessionPickerProps type', async () => {
    // Type exports are compile-time checked
    const module = await import('../../src/ui/components/SessionPicker.js');
    expect(module.SessionPicker).toBeDefined();
  });
});

describe('Session types', () => {
  it('should have valid SessionListItem structure', () => {
    const session: SessionListItem = mockSessions[0];
    expect(session.id).toBeDefined();
    expect(session.initialPrompt).toBeDefined();
    expect(session.projectPath).toBeDefined();
    expect(session.messageCount).toBeGreaterThanOrEqual(0);
    expect(session.createdAt).toBeInstanceOf(Date);
    expect(session.lastActiveAt).toBeInstanceOf(Date);
  });

  it('should allow optional name', () => {
    const sessionWithName = mockSessions[0];
    const sessionWithoutName = mockSessions[1];

    expect(sessionWithName.name).toBe('Feature Development');
    expect(sessionWithoutName.name).toBeUndefined();
  });

  it('should allow optional gitBranch', () => {
    const sessionWithBranch = mockSessions[0];
    const sessionWithoutBranch = mockSessions[2];

    expect(sessionWithBranch.gitBranch).toBe('main');
    expect(sessionWithoutBranch.gitBranch).toBeUndefined();
  });
});
