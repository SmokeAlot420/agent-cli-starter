/**
 * PIV Loop Session Types
 * Local session storage for CLI conversations
 */

/**
 * A single conversation entry (message)
 */
export interface ConversationEntry {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Session configuration options
 */
export interface SessionOptions {
  workingDirectory?: string;
  model?: string;
  maxTurns?: number;
  maxThinkingTokens?: number;
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions';
  allowedTools?: string[];
  disallowedTools?: string[];
}

/**
 * Session metadata for display in picker
 */
export interface SessionMetadata {
  id: string;
  name?: string;
  initialPrompt: string;
  projectPath: string;
  projectHash: string;
  gitBranch?: string;
  messageCount: number;
  createdAt: Date;
  lastActiveAt: Date;
}

/**
 * Full session with conversation history
 */
export interface PIVSession extends SessionMetadata {
  options: SessionOptions;
  history: ConversationEntry[];
  isProcessing: boolean;
}

/**
 * Session list item (without full history for performance)
 */
export type SessionListItem = SessionMetadata;

/**
 * Session info (alias for SessionMetadata)
 */
export type SessionInfo = SessionMetadata;
