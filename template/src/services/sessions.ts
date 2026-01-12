/**
 * Session Service - Local SQLite session storage for PIV Loop CLI
 *
 * Storage: ~/.pivloop/projects/<project-hash>/sessions.db
 * Each project directory gets its own session database.
 */

import Database from 'better-sqlite3';
import type { Database as DatabaseType } from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import type { PIVSession, SessionOptions, ConversationEntry, SessionListItem } from '../types/index.js';
import type { ConversationMessage } from '../conversation.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger({}, { domain: 'sessions' });

/**
 * Get the PIV Loop data directory
 */
function getPivLoopDir(): string {
  return path.join(os.homedir(), '.pivloop');
}

/**
 * Hash a project path to create a filesystem-safe directory name
 */
function hashProjectPath(projectPath: string): string {
  const normalized = path.resolve(projectPath).toLowerCase();
  return crypto.createHash('md5').update(normalized).digest('hex').slice(0, 12);
}

/**
 * Get database path for a project
 */
export function getProjectDbPath(projectPath: string): string {
  const pivDir = getPivLoopDir();
  const hash = hashProjectPath(projectPath);
  return path.join(pivDir, 'projects', hash, 'sessions.db');
}

/**
 * Session Service - manages local session storage
 */
export class SessionService {
  private db: DatabaseType;
  private projectPath: string;
  private projectHash: string;

  constructor(projectPath: string) {
    this.projectPath = path.resolve(projectPath);
    this.projectHash = hashProjectPath(this.projectPath);

    const dbPath = getProjectDbPath(this.projectPath);
    const dbDir = path.dirname(dbPath);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
      logger.info('sessions.directory_created', { path: dbDir });
    }

    // Create project info file
    const infoPath = path.join(dbDir, '.project-info');
    if (!fs.existsSync(infoPath)) {
      fs.writeFileSync(infoPath, JSON.stringify({
        path: this.projectPath,
        hash: this.projectHash,
        createdAt: new Date().toISOString()
      }, null, 2));
    }

    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initSchema();

    logger.info('sessions.initialized', {
      projectPath: this.projectPath,
      dbPath
    });
  }

  private initSchema(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        name TEXT,
        initial_prompt TEXT NOT NULL,
        project_path TEXT NOT NULL,
        project_hash TEXT NOT NULL,
        git_branch TEXT,
        options TEXT NOT NULL,
        history TEXT NOT NULL,
        is_processing INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        last_active_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_sessions_last_active
        ON sessions(last_active_at DESC);

      CREATE INDEX IF NOT EXISTS idx_sessions_project_hash
        ON sessions(project_hash);
    `);

    // Migration: Add ui_messages column for storing ConversationMessage[] for display
    // This is separate from 'history' which stores ConversationEntry[] for SDK context
    try {
      this.db.exec(`ALTER TABLE sessions ADD COLUMN ui_messages TEXT DEFAULT '[]'`);
      logger.info('sessions.migration', { column: 'ui_messages', status: 'added' });
    } catch {
      // Column already exists - ignore error
    }
  }

  /**
   * Create a new session
   */
  create(initialPrompt: string, options: SessionOptions = {}): PIVSession {
    const id = uuidv4();
    const now = new Date();

    const session: PIVSession = {
      id,
      name: undefined,
      initialPrompt: initialPrompt.slice(0, 100), // Truncate for display
      projectPath: this.projectPath,
      projectHash: this.projectHash,
      gitBranch: this.getGitBranch(),
      messageCount: 0,
      createdAt: now,
      lastActiveAt: now,
      options,
      history: [],
      isProcessing: false
    };

    const stmt = this.db.prepare(`
      INSERT INTO sessions (
        id, name, initial_prompt, project_path, project_hash, git_branch,
        options, history, is_processing, created_at, last_active_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      session.id,
      session.name ?? null,
      session.initialPrompt,
      session.projectPath,
      session.projectHash,
      session.gitBranch ?? null,
      JSON.stringify(session.options),
      JSON.stringify(session.history),
      0,
      now.toISOString(),
      now.toISOString()
    );

    logger.info('sessions.created', { sessionId: id, projectPath: this.projectPath });
    return session;
  }

  /**
   * Create a session with a known ID (from SDK's system.init)
   * Used when SDK provides the session_id and we just store metadata
   *
   * Note: When resuming with forkSession: false (default), SDK returns the
   * SAME session_id. This method handles that case by returning the existing
   * session instead of trying to insert a duplicate.
   */
  createWithId(id: string, initialPrompt: string, options: SessionOptions = {}): PIVSession {
    // Check if session already exists (handles resume case with same session_id)
    const existing = this.get(id);
    if (existing) {
      // Update last_active_at to mark session as resumed
      const stmt = this.db.prepare(`
        UPDATE sessions SET last_active_at = ? WHERE id = ?
      `);
      stmt.run(new Date().toISOString(), id);
      logger.info('sessions.resumed', { sessionId: id, projectPath: this.projectPath });
      return existing;
    }

    // Create new session (first time creation)
    const now = new Date();

    const session: PIVSession = {
      id,
      name: undefined,
      initialPrompt: initialPrompt.slice(0, 100), // Truncate for display
      projectPath: this.projectPath,
      projectHash: this.projectHash,
      gitBranch: this.getGitBranch(),
      messageCount: 0,
      createdAt: now,
      lastActiveAt: now,
      options,
      history: [],
      isProcessing: false
    };

    const stmt = this.db.prepare(`
      INSERT INTO sessions (
        id, name, initial_prompt, project_path, project_hash, git_branch,
        options, history, is_processing, created_at, last_active_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      session.id,
      session.name ?? null,
      session.initialPrompt,
      session.projectPath,
      session.projectHash,
      session.gitBranch ?? null,
      JSON.stringify(session.options),
      JSON.stringify(session.history),
      0,
      now.toISOString(),
      now.toISOString()
    );

    logger.info('sessions.created_with_id', { sessionId: id, projectPath: this.projectPath });
    return session;
  }

  /**
   * Get a session by ID
   */
  get(id: string): PIVSession | null {
    const stmt = this.db.prepare('SELECT * FROM sessions WHERE id = ?');
    const row = stmt.get(id) as SessionRow | undefined;

    if (!row) return null;
    return this.rowToSession(row);
  }

  /**
   * Get the most recent session
   */
  getMostRecent(): PIVSession | null {
    const stmt = this.db.prepare(`
      SELECT * FROM sessions
      WHERE project_hash = ?
      ORDER BY last_active_at DESC
      LIMIT 1
    `);
    const row = stmt.get(this.projectHash) as SessionRow | undefined;

    if (!row) return null;
    return this.rowToSession(row);
  }

  /**
   * Get a session by name
   */
  getByName(name: string): PIVSession | null {
    const stmt = this.db.prepare(`
      SELECT * FROM sessions
      WHERE project_hash = ? AND name = ?
    `);
    const row = stmt.get(this.projectHash, name) as SessionRow | undefined;

    if (!row) return null;
    return this.rowToSession(row);
  }

  /**
   * List all sessions for current project (metadata only, no history)
   */
  list(): SessionListItem[] {
    const stmt = this.db.prepare(`
      SELECT id, name, initial_prompt, project_path, project_hash, git_branch,
             history, created_at, last_active_at
      FROM sessions
      WHERE project_hash = ?
      ORDER BY last_active_at DESC
      LIMIT 100
    `);

    const rows = stmt.all(this.projectHash) as SessionRow[];

    return rows.map(row => ({
      id: row.id,
      name: row.name ?? undefined,
      initialPrompt: row.initial_prompt,
      projectPath: row.project_path,
      projectHash: row.project_hash,
      gitBranch: row.git_branch ?? undefined,
      messageCount: JSON.parse(row.history).length,
      createdAt: new Date(row.created_at),
      lastActiveAt: new Date(row.last_active_at)
    }));
  }

  /**
   * Update session name
   */
  rename(id: string, name: string): boolean {
    const stmt = this.db.prepare(`
      UPDATE sessions SET name = ?, last_active_at = ? WHERE id = ?
    `);
    const result = stmt.run(name, new Date().toISOString(), id);
    return result.changes > 0;
  }

  /**
   * Update session's initial prompt (called on first user message)
   */
  updateInitialPrompt(id: string, initialPrompt: string): boolean {
    const stmt = this.db.prepare(`
      UPDATE sessions SET initial_prompt = ?, last_active_at = ? WHERE id = ?
    `);
    const result = stmt.run(initialPrompt.slice(0, 100), new Date().toISOString(), id);
    logger.info('sessions.initial_prompt_updated', { sessionId: id, prompt: initialPrompt.slice(0, 50) });
    return result.changes > 0;
  }

  /**
   * Add a conversation entry and update session
   */
  addEntry(id: string, entry: ConversationEntry): void {
    const session = this.get(id);
    if (!session) return;

    const newHistory = [...session.history, entry];
    const stmt = this.db.prepare(`
      UPDATE sessions
      SET history = ?, last_active_at = ?
      WHERE id = ?
    `);

    stmt.run(JSON.stringify(newHistory), new Date().toISOString(), id);
  }

  /**
   * Replace full history (for bulk updates)
   */
  setHistory(id: string, history: ConversationEntry[]): void {
    const stmt = this.db.prepare(`
      UPDATE sessions
      SET history = ?, last_active_at = ?
      WHERE id = ?
    `);

    stmt.run(JSON.stringify(history), new Date().toISOString(), id);
  }

  /**
   * Save UI messages for display (ConversationMessage[] from useAgent)
   * These are stored separately from 'history' to preserve full message types
   */
  saveUIMessages(id: string, messages: ConversationMessage[]): void {
    const stmt = this.db.prepare(`
      UPDATE sessions
      SET ui_messages = ?, last_active_at = ?
      WHERE id = ?
    `);

    stmt.run(JSON.stringify(messages), new Date().toISOString(), id);
  }

  /**
   * Get UI messages for display when resuming a session
   */
  getUIMessages(id: string): ConversationMessage[] {
    const stmt = this.db.prepare('SELECT ui_messages FROM sessions WHERE id = ?');
    const row = stmt.get(id) as { ui_messages: string | null } | undefined;

    if (!row || !row.ui_messages) return [];

    try {
      return JSON.parse(row.ui_messages) as ConversationMessage[];
    } catch {
      return [];
    }
  }

  /**
   * Append a single UI message (more efficient than replacing all)
   */
  appendUIMessage(id: string, message: ConversationMessage): void {
    const existing = this.getUIMessages(id);
    existing.push(message);
    this.saveUIMessages(id, existing);
  }

  /**
   * Update session options
   */
  updateOptions(id: string, options: Partial<SessionOptions>): void {
    const session = this.get(id);
    if (!session) return;

    const newOptions = { ...session.options, ...options };
    const stmt = this.db.prepare(`
      UPDATE sessions SET options = ?, last_active_at = ? WHERE id = ?
    `);

    stmt.run(JSON.stringify(newOptions), new Date().toISOString(), id);
  }

  /**
   * Set processing state
   */
  setProcessing(id: string, processing: boolean): void {
    const stmt = this.db.prepare(`
      UPDATE sessions SET is_processing = ?, last_active_at = ? WHERE id = ?
    `);

    stmt.run(processing ? 1 : 0, new Date().toISOString(), id);
  }

  /**
   * Clear session history
   */
  clearHistory(id: string): void {
    const stmt = this.db.prepare(`
      UPDATE sessions SET history = ?, last_active_at = ? WHERE id = ?
    `);

    stmt.run(JSON.stringify([]), new Date().toISOString(), id);
  }

  /**
   * Delete a session
   */
  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM sessions WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Close database connection
   */
  close(): void {
    this.db.close();
  }

  /**
   * Get current git branch (best effort)
   */
  private getGitBranch(): string | undefined {
    try {
      const gitHeadPath = path.join(this.projectPath, '.git', 'HEAD');
      if (fs.existsSync(gitHeadPath)) {
        const content = fs.readFileSync(gitHeadPath, 'utf-8').trim();
        const match = content.match(/^ref: refs\/heads\/(.+)$/);
        return match ? match[1] : undefined;
      }
    } catch {
      // Ignore errors - git branch is optional
    }
    return undefined;
  }

  /**
   * Convert database row to PIVSession
   */
  private rowToSession(row: SessionRow): PIVSession {
    return {
      id: row.id,
      name: row.name ?? undefined,
      initialPrompt: row.initial_prompt,
      projectPath: row.project_path,
      projectHash: row.project_hash,
      gitBranch: row.git_branch ?? undefined,
      messageCount: JSON.parse(row.history).length,
      createdAt: new Date(row.created_at),
      lastActiveAt: new Date(row.last_active_at),
      options: JSON.parse(row.options),
      history: JSON.parse(row.history),
      isProcessing: row.is_processing === 1
    };
  }
}

/**
 * Database row type
 */
interface SessionRow {
  id: string;
  name: string | null;
  initial_prompt: string;
  project_path: string;
  project_hash: string;
  git_branch: string | null;
  options: string;
  history: string;
  is_processing: number;
  created_at: string;
  last_active_at: string;
}

/**
 * Singleton instances per project
 */
const instances = new Map<string, SessionService>();

/**
 * Get SessionService for a project (singleton per project)
 */
export function getSessionService(projectPath: string): SessionService {
  const resolved = path.resolve(projectPath);

  if (!instances.has(resolved)) {
    instances.set(resolved, new SessionService(resolved));
  }

  return instances.get(resolved)!;
}

/**
 * Close all session service instances
 */
export function closeAllSessionServices(): void {
  for (const service of instances.values()) {
    service.close();
  }
  instances.clear();
}
