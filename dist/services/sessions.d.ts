/**
 * Session Service - Local SQLite session storage for PIV Loop CLI
 *
 * Storage: ~/.pivloop/projects/<project-hash>/sessions.db
 * Each project directory gets its own session database.
 */
import type { PIVSession, SessionOptions, ConversationEntry, SessionListItem } from '../types/index.js';
import type { ConversationMessage } from '../conversation.js';
/**
 * Get database path for a project
 */
export declare function getProjectDbPath(projectPath: string): string;
/**
 * Session Service - manages local session storage
 */
export declare class SessionService {
    private db;
    private projectPath;
    private projectHash;
    constructor(projectPath: string);
    private initSchema;
    /**
     * Create a new session
     */
    create(initialPrompt: string, options?: SessionOptions): PIVSession;
    /**
     * Create a session with a known ID (from SDK's system.init)
     * Used when SDK provides the session_id and we just store metadata
     *
     * Note: When resuming with forkSession: false (default), SDK returns the
     * SAME session_id. This method handles that case by returning the existing
     * session instead of trying to insert a duplicate.
     */
    createWithId(id: string, initialPrompt: string, options?: SessionOptions): PIVSession;
    /**
     * Get a session by ID
     */
    get(id: string): PIVSession | null;
    /**
     * Get the most recent session
     */
    getMostRecent(): PIVSession | null;
    /**
     * Get a session by name
     */
    getByName(name: string): PIVSession | null;
    /**
     * List all sessions for current project (metadata only, no history)
     */
    list(): SessionListItem[];
    /**
     * Update session name
     */
    rename(id: string, name: string): boolean;
    /**
     * Update session's initial prompt (called on first user message)
     */
    updateInitialPrompt(id: string, initialPrompt: string): boolean;
    /**
     * Add a conversation entry and update session
     */
    addEntry(id: string, entry: ConversationEntry): void;
    /**
     * Replace full history (for bulk updates)
     */
    setHistory(id: string, history: ConversationEntry[]): void;
    /**
     * Save UI messages for display (ConversationMessage[] from useAgent)
     * These are stored separately from 'history' to preserve full message types
     */
    saveUIMessages(id: string, messages: ConversationMessage[]): void;
    /**
     * Get UI messages for display when resuming a session
     */
    getUIMessages(id: string): ConversationMessage[];
    /**
     * Append a single UI message (more efficient than replacing all)
     */
    appendUIMessage(id: string, message: ConversationMessage): void;
    /**
     * Update session options
     */
    updateOptions(id: string, options: Partial<SessionOptions>): void;
    /**
     * Set processing state
     */
    setProcessing(id: string, processing: boolean): void;
    /**
     * Clear session history
     */
    clearHistory(id: string): void;
    /**
     * Delete a session
     */
    delete(id: string): boolean;
    /**
     * Close database connection
     */
    close(): void;
    /**
     * Get current git branch (best effort)
     */
    private getGitBranch;
    /**
     * Convert database row to PIVSession
     */
    private rowToSession;
}
/**
 * Get SessionService for a project (singleton per project)
 */
export declare function getSessionService(projectPath: string): SessionService;
/**
 * Close all session service instances
 */
export declare function closeAllSessionServices(): void;
//# sourceMappingURL=sessions.d.ts.map