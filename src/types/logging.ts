/**
 * Structured Logging Types
 *
 * Hybrid Dotted Namespace Pattern: {domain}.{component}.{action}_{state}
 * Based on OpenTelemetry semantic conventions for AI agent observability.
 *
 * @see .agents/reference/logging-standard.md
 */

/** Log levels matching standard severity */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/** PIV Loop domains for event taxonomy */
export type PIVDomain =
  | 'orchestrator'
  | 'planner'
  | 'discovery'
  | 'implementer'
  | 'validator'
  | 'reviewer'
  | 'application';

/**
 * Standard state suffixes for lifecycle events.
 * Use these consistently across all event names.
 */
export type EventState =
  | 'started'
  | 'progress'
  | 'completed'
  | 'failed'
  | 'validated'
  | 'rejected'
  | 'retrying'
  | 'cancelled'
  | 'timeout'
  | 'received'
  | 'sent';

/**
 * Base attributes present in all log entries
 */
export interface BaseLogAttributes {
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Log level */
  level: LogLevel;
  /** PIV session correlation ID */
  session_id: string;
  /** Event name following dotted namespace pattern */
  event: string;
}

/**
 * Orchestrator-specific log attributes
 */
export interface OrchestratorAttributes {
  /** Current PIV phase */
  phase?: string;
  /** Complexity level */
  complexity?: string;
  /** Current iteration number */
  iteration?: number;
  /** Maximum iterations allowed */
  max_iterations?: number;
  /** Feature being processed */
  feature?: string;
  /** Task ID being processed */
  task_id?: string;
  /** Duration in milliseconds */
  duration_ms?: number;
}

/**
 * Agent-specific log attributes (planner, implementer, validator, reviewer)
 */
export interface AgentAttributes {
  /** Agent name */
  agent: string;
  /** Current phase */
  phase?: string;
  /** Feature name */
  feature?: string;
  /** Task ID */
  task_id?: string;
  /** Operation being performed */
  operation?: string;
  /** Duration in milliseconds */
  duration_ms?: number;
  /** Model used for LLM calls */
  model?: string;
  /** Prompt token count */
  tokens_prompt?: number;
  /** Completion token count */
  tokens_completion?: number;
}

/**
 * Validation-specific log attributes
 */
export interface ValidationAttributes {
  /** Validation pyramid level (1-5) */
  validation_level?: number;
  /** Command being executed */
  command?: string;
  /** Whether validation passed */
  passed?: boolean;
  /** Number of failures */
  failure_count?: number;
  /** Whether this is a system issue vs code issue */
  is_system_issue?: boolean;
  /** Duration in milliseconds */
  duration_ms?: number;
}

/**
 * Error-specific log attributes
 */
export interface ErrorAttributes {
  /** Error message */
  error: string;
  /** Error class/type name */
  error_type?: string;
  /** Stack trace */
  stack_trace?: string;
  /** Whether error is retryable */
  retryable?: boolean;
  /** Number of retry attempts */
  retry_count?: number;
}

/**
 * Combined log attributes - interface for structured log context
 */
export interface LogAttributes {
  // Base attributes (optional when used as context)
  timestamp?: string;
  level?: LogLevel;
  session_id?: string;
  event?: string;

  // Orchestrator attributes
  phase?: string;
  complexity?: string;
  iteration?: number;
  max_iterations?: number;
  feature?: string;
  task_id?: string;
  duration_ms?: number;

  // Agent attributes
  agent?: string;
  operation?: string;
  model?: string;
  tokens_prompt?: number;
  tokens_completion?: number;

  // Validation attributes
  validation_level?: number;
  command?: string;
  passed?: boolean;
  failure_count?: number;
  is_system_issue?: boolean;

  // Error attributes
  error?: string;
  error_type?: string;
  stack_trace?: string;
  retryable?: boolean;
  retry_count?: number;

  // Domain for domain-specific loggers
  domain?: string;

  /** Additional arbitrary attributes */
  [key: string]: unknown;
}

/**
 * Complete log entry structure
 */
export interface LogEntry extends BaseLogAttributes {
  /** Additional context attributes */
  [key: string]: unknown;
}

/**
 * Logger configuration options
 */
export interface LoggerConfig {
  /** Minimum log level to output */
  minLevel: LogLevel;
  /** Whether to output as JSON */
  jsonOutput: boolean;
  /** Default session ID if not provided */
  defaultSessionId?: string;
  /** Whether logging is enabled */
  enabled: boolean;
}

/**
 * Logger interface for structured logging
 */
export interface ILogger {
  /** Log at debug level */
  debug(event: string, attributes?: LogAttributes): void;
  /** Log at info level */
  info(event: string, attributes?: LogAttributes): void;
  /** Log at warn level */
  warn(event: string, attributes?: LogAttributes): void;
  /** Log at error level */
  error(event: string, attributes?: LogAttributes): void;
  /** Create a child logger with preset attributes */
  child(attributes: LogAttributes): ILogger;
  /** Set the session ID for correlation */
  setSessionId(sessionId: string): void;
}
