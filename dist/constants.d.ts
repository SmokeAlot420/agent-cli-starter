/**
 * CLI Template Constants
 * Centralized configuration and magic numbers
 */
/** Default model for all agents */
export declare const DEFAULT_MODEL = "claude-opus-4-5-20251101";
/** Maximum thinking tokens for extended thinking (128K) */
export declare const ULTRATHINK_TOKENS = 128000;
/** Default maximum conversation turns */
export declare const MAX_TURNS_DEFAULT = 50;
/** Timeout for git clone operations */
export declare const GIT_CLONE_TIMEOUT = 60000;
/** Timeout for MCP health check requests */
export declare const MCP_HEALTH_CHECK_TIMEOUT = 5000;
/** Polling interval for MCP health */
export declare const MCP_POLL_INTERVAL = 5000;
/** Commands cache time-to-live */
export declare const COMMAND_CACHE_TTL = 30000;
/** Skills cache time-to-live */
export declare const SKILL_CACHE_TTL = 30000;
/** Subagents cache time-to-live */
export declare const SUBAGENT_CACHE_TTL = 30000;
/** Settings cache time-to-live */
export declare const SETTINGS_CACHE_TTL = 30000;
/** MCP config cache time-to-live */
export declare const MCP_CACHE_TTL = 60000;
/** Number of recent history items to include in context */
export declare const CONVERSATION_HISTORY_LIMIT = 10;
export declare const VALIDATION_LEVEL_NAMES: {
    readonly 1: "Syntax & Style";
    readonly 2: "Type Safety";
    readonly 3: "Unit Tests";
    readonly 4: "Integration Tests";
    readonly 5: "Human Review";
};
/** Safe environment variables allowed for MCP config expansion */
export declare const SAFE_ENV_VARS: Set<string>;
/** Prefixes that are always allowed for env var expansion */
export declare const SAFE_ENV_VAR_PREFIXES: string[];
/** Default log level when AGENT_LOG_LEVEL not set */
export declare const DEFAULT_LOG_LEVEL = "info";
/** Whether logging is JSON by default */
export declare const DEFAULT_JSON_LOGGING = true;
/** Default hook execution timeout (milliseconds) */
export declare const HOOK_TIMEOUT = 5000;
//# sourceMappingURL=constants.d.ts.map