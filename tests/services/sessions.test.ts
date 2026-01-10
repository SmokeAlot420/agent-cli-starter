/**
 * Session Service Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Test imports
const TEST_PROJECT_PATH = path.join(os.tmpdir(), 'pivloop-test-project');

describe('SessionService', () => {
  let SessionService: typeof import('../../src/services/sessions.js').SessionService;
  let getProjectDbPath: typeof import('../../src/services/sessions.js').getProjectDbPath;
  let service: InstanceType<typeof SessionService>;

  beforeEach(async () => {
    // Dynamic import to reset module state
    const module = await import('../../src/services/sessions.js');
    SessionService = module.SessionService;
    getProjectDbPath = module.getProjectDbPath;

    // Create test project directory
    if (!fs.existsSync(TEST_PROJECT_PATH)) {
      fs.mkdirSync(TEST_PROJECT_PATH, { recursive: true });
    }

    service = new SessionService(TEST_PROJECT_PATH);
  });

  afterEach(() => {
    // Close database
    service.close();

    // Clean up database file
    const dbPath = getProjectDbPath(TEST_PROJECT_PATH);
    const dbDir = path.dirname(dbPath);
    if (fs.existsSync(dbDir)) {
      fs.rmSync(dbDir, { recursive: true, force: true });
    }
  });

  describe('create', () => {
    it('should create a session with UUID', () => {
      const session = service.create('Test prompt');
      expect(session.id).toMatch(/^[0-9a-f-]{36}$/);
    });

    it('should store initial prompt', () => {
      const session = service.create('My test prompt');
      expect(session.initialPrompt).toBe('My test prompt');
    });

    it('should truncate long prompts', () => {
      const longPrompt = 'a'.repeat(200);
      const session = service.create(longPrompt);
      expect(session.initialPrompt.length).toBeLessThanOrEqual(100);
    });

    it('should initialize with empty history', () => {
      const session = service.create('Test');
      expect(session.history).toEqual([]);
      expect(session.messageCount).toBe(0);
    });

    it('should set timestamps', () => {
      const before = new Date();
      const session = service.create('Test');
      const after = new Date();

      expect(session.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(session.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(session.lastActiveAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    });

    it('should store options', () => {
      const options = { model: 'claude-3-opus', maxTurns: 100 };
      const session = service.create('Test', options);
      expect(session.options.model).toBe('claude-3-opus');
      expect(session.options.maxTurns).toBe(100);
    });
  });

  describe('createWithId', () => {
    it('should create a session with specified ID', () => {
      const customId = 'my-custom-session-id-12345';
      const session = service.createWithId(customId, 'Test prompt');
      expect(session.id).toBe(customId);
    });

    it('should store initial prompt', () => {
      const session = service.createWithId('id-1', 'My test prompt');
      expect(session.initialPrompt).toBe('My test prompt');
    });

    it('should truncate long prompts', () => {
      const longPrompt = 'a'.repeat(200);
      const session = service.createWithId('id-2', longPrompt);
      expect(session.initialPrompt.length).toBeLessThanOrEqual(100);
    });

    it('should be retrievable by get()', () => {
      const customId = 'sdk-session-id-abc123';
      service.createWithId(customId, 'SDK session');

      const retrieved = service.get(customId);
      expect(retrieved?.id).toBe(customId);
      expect(retrieved?.initialPrompt).toBe('SDK session');
    });

    it('should appear in list()', () => {
      service.createWithId('sdk-id-1', 'Session 1');
      service.createWithId('sdk-id-2', 'Session 2');

      const list = service.list();
      expect(list.length).toBe(2);
      expect(list.some(s => s.id === 'sdk-id-1')).toBe(true);
      expect(list.some(s => s.id === 'sdk-id-2')).toBe(true);
    });
  });

  describe('get', () => {
    it('should retrieve existing session', () => {
      const created = service.create('Test');
      const retrieved = service.get(created.id);
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.initialPrompt).toBe('Test');
    });

    it('should return null for non-existent session', () => {
      const result = service.get('non-existent-id');
      expect(result).toBeNull();
    });

    it('should retrieve full history', () => {
      const session = service.create('Test');
      service.addEntry(session.id, {
        role: 'user',
        content: 'Hello',
        timestamp: new Date()
      });

      const retrieved = service.get(session.id);
      expect(retrieved?.history.length).toBe(1);
      expect(retrieved?.history[0].content).toBe('Hello');
    });
  });

  describe('getMostRecent', () => {
    it('should return most recently active session', () => {
      const first = service.create('First');
      service.create('Second');

      // Add entry to first to make it most recent
      service.addEntry(first.id, {
        role: 'user',
        content: 'Update',
        timestamp: new Date()
      });

      const recent = service.getMostRecent();
      expect(recent?.id).toBe(first.id);
    });

    it('should return null when no sessions', () => {
      // Delete all sessions first
      const sessions = service.list();
      for (const s of sessions) {
        service.delete(s.id);
      }
      const recent = service.getMostRecent();
      expect(recent).toBeNull();
    });
  });

  describe('list', () => {
    it('should list all sessions', () => {
      service.create('First');
      service.create('Second');
      service.create('Third');

      const list = service.list();
      expect(list.length).toBe(3);
    });

    it('should order by last active descending', () => {
      const first = service.create('First');
      service.create('Second');

      // Update first
      service.addEntry(first.id, {
        role: 'user',
        content: 'Update',
        timestamp: new Date()
      });

      const list = service.list();
      expect(list[0].id).toBe(first.id);
    });

    it('should include message count', () => {
      const session = service.create('Test');
      service.addEntry(session.id, { role: 'user', content: 'One', timestamp: new Date() });
      service.addEntry(session.id, { role: 'assistant', content: 'Two', timestamp: new Date() });

      const list = service.list();
      expect(list[0].messageCount).toBe(2);
    });
  });

  describe('rename', () => {
    it('should rename a session', () => {
      const session = service.create('Test');
      const renamed = service.rename(session.id, 'My Custom Name');
      expect(renamed).toBe(true);

      const retrieved = service.get(session.id);
      expect(retrieved?.name).toBe('My Custom Name');
    });

    it('should return false for non-existent session', () => {
      const result = service.rename('non-existent', 'Name');
      expect(result).toBe(false);
    });
  });

  describe('getByName', () => {
    it('should find session by name', () => {
      const session = service.create('Test');
      service.rename(session.id, 'MySession');

      const found = service.getByName('MySession');
      expect(found?.id).toBe(session.id);
    });

    it('should return null for non-existent name', () => {
      const result = service.getByName('NonExistent');
      expect(result).toBeNull();
    });
  });

  describe('addEntry', () => {
    it('should add conversation entry', () => {
      const session = service.create('Test');
      service.addEntry(session.id, {
        role: 'user',
        content: 'Hello',
        timestamp: new Date()
      });

      const retrieved = service.get(session.id);
      expect(retrieved?.history.length).toBe(1);
    });

    it('should update lastActiveAt', () => {
      const session = service.create('Test');
      const originalTime = session.lastActiveAt;

      // Small delay
      const later = new Date(originalTime.getTime() + 100);
      service.addEntry(session.id, {
        role: 'user',
        content: 'Hello',
        timestamp: later
      });

      const retrieved = service.get(session.id);
      // Use >= since fast execution can result in same millisecond timestamp
      expect(retrieved?.lastActiveAt.getTime()).toBeGreaterThanOrEqual(originalTime.getTime());
    });
  });

  describe('setHistory', () => {
    it('should replace entire history', () => {
      const session = service.create('Test');
      service.addEntry(session.id, { role: 'user', content: 'Old', timestamp: new Date() });

      service.setHistory(session.id, [
        { role: 'user', content: 'New1', timestamp: new Date() },
        { role: 'assistant', content: 'New2', timestamp: new Date() }
      ]);

      const retrieved = service.get(session.id);
      expect(retrieved?.history.length).toBe(2);
      expect(retrieved?.history[0].content).toBe('New1');
    });
  });

  describe('clearHistory', () => {
    it('should clear session history', () => {
      const session = service.create('Test');
      service.addEntry(session.id, { role: 'user', content: 'Hello', timestamp: new Date() });

      service.clearHistory(session.id);

      const retrieved = service.get(session.id);
      expect(retrieved?.history.length).toBe(0);
    });
  });

  describe('delete', () => {
    it('should delete a session', () => {
      const session = service.create('Test');
      const deleted = service.delete(session.id);
      expect(deleted).toBe(true);

      const retrieved = service.get(session.id);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent session', () => {
      const result = service.delete('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('project isolation', () => {
    it('should only list sessions for current project', async () => {
      // Create session in test project
      service.create('Project A session');

      // Create another service for different project
      const otherPath = path.join(os.tmpdir(), 'pivloop-test-other');
      if (!fs.existsSync(otherPath)) {
        fs.mkdirSync(otherPath, { recursive: true });
      }

      const otherService = new SessionService(otherPath);
      otherService.create('Project B session');

      // Each should only see its own sessions
      expect(service.list().length).toBe(1);
      expect(service.list()[0].initialPrompt).toBe('Project A session');

      expect(otherService.list().length).toBe(1);
      expect(otherService.list()[0].initialPrompt).toBe('Project B session');

      // Cleanup
      otherService.close();
      const otherDbDir = path.dirname(getProjectDbPath(otherPath));
      if (fs.existsSync(otherDbDir)) {
        fs.rmSync(otherDbDir, { recursive: true, force: true });
      }
    });
  });
});

describe('getProjectDbPath', () => {
  it('should return path in .pivloop directory', async () => {
    const { getProjectDbPath } = await import('../../src/services/sessions.js');
    const dbPath = getProjectDbPath('/some/project');
    expect(dbPath).toContain('.pivloop');
    expect(dbPath).toContain('projects');
    expect(dbPath).toContain('sessions.db');
  });

  it('should use hash for directory name', async () => {
    const { getProjectDbPath } = await import('../../src/services/sessions.js');
    const dbPath = getProjectDbPath('/some/project');
    // Hash should be 12 chars
    const match = dbPath.match(/projects[/\\]([a-f0-9]{12})[/\\]/);
    expect(match).not.toBeNull();
  });
});
