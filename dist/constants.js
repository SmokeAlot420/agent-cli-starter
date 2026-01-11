/**
 * CLI Template Constants
 * Centralized configuration and magic numbers
 */
// ============================================================================
// Model Configuration
// ============================================================================
/** Default model for all agents */
export const DEFAULT_MODEL = 'claude-opus-4-5-20251101';
/** Maximum thinking tokens for extended thinking (128K) */
export const ULTRATHINK_TOKENS = 128000;
/** Default maximum conversation turns */
export const MAX_TURNS_DEFAULT = 50;
// ============================================================================
// Timeouts (milliseconds)
// ============================================================================
/** Timeout for git clone operations */
export const GIT_CLONE_TIMEOUT = 60000;
/** Timeout for MCP health check requests */
export const MCP_HEALTH_CHECK_TIMEOUT = 5000;
/** Polling interval for MCP health */
export const MCP_POLL_INTERVAL = 5000;
// ============================================================================
// Cache TTL (milliseconds)
// ============================================================================
/** Commands cache time-to-live */
export const COMMAND_CACHE_TTL = 30000;
/** Skills cache time-to-live */
export const SKILL_CACHE_TTL = 30000;
/** Subagents cache time-to-live */
export const SUBAGENT_CACHE_TTL = 30000;
/** Settings cache time-to-live */
export const SETTINGS_CACHE_TTL = 30000;
/** MCP config cache time-to-live */
export const MCP_CACHE_TTL = 60000;
// ============================================================================
// Conversation
// ============================================================================
/** Number of recent history items to include in context */
export const CONVERSATION_HISTORY_LIMIT = 10;
// ============================================================================
// Validation Levels
// ============================================================================
export const VALIDATION_LEVEL_NAMES = {
    1: 'Syntax & Style',
    2: 'Type Safety',
    3: 'Unit Tests',
    4: 'Integration Tests',
    5: 'Human Review'
};
// ============================================================================
// Environment Variable Allowlist
// ============================================================================
/** Safe environment variables allowed for MCP config expansion */
export const SAFE_ENV_VARS = new Set([
    'HOME',
    'USER',
    'PATH',
    'ANTHROPIC_API_KEY',
    'NODE_ENV',
    'DEBUG',
    'AGENT_DEBUG'
]);
/** Prefixes that are always allowed for env var expansion */
export const SAFE_ENV_VAR_PREFIXES = ['AGENT_', 'CLAUDE_'];
// ============================================================================
// Logging Configuration
// ============================================================================
/** Default log level when AGENT_LOG_LEVEL not set */
export const DEFAULT_LOG_LEVEL = 'info';
/** Whether logging is JSON by default */
export const DEFAULT_JSON_LOGGING = true;
// ============================================================================
// Hook System Configuration
// ============================================================================
/** Default hook execution timeout (milliseconds) */
export const HOOK_TIMEOUT = 5000;
//# sourceMappingURL=constants.js.map