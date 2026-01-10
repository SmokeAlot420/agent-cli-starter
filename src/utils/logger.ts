/**
 * Structured Logger Module
 *
 * Implements the Hybrid Dotted Namespace Pattern for PIV Loop observability.
 * Pattern: {domain}.{component}.{action}_{state}
 *
 * Features:
 * - JSON structured output for machine parsing
 * - Session correlation via session_id
 * - Child loggers with preset attributes
 * - Environment-based configuration
 *
 * @see .agents/reference/logging-standard.md
 */

import type {
  LogLevel,
  LogAttributes,
  LogEntry,
  LoggerConfig,
  ILogger,
} from '../types/logging.js';

// Re-export types for convenience
export type { ILogger, LogAttributes, LoggerConfig } from '../types/logging.js';

/** Log level priority for filtering */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Get logger configuration from environment
 */
function getConfigFromEnv(): LoggerConfig {
  const enabled = process.env.PIV_DEBUG === 'true' || process.env.PIV_DEBUG === '1';
  const levelEnv = process.env.PIV_LOG_LEVEL?.toLowerCase();
  const minLevel: LogLevel =
    levelEnv === 'debug' || levelEnv === 'info' || levelEnv === 'warn' || levelEnv === 'error'
      ? levelEnv
      : 'info';

  return {
    enabled,
    minLevel,
    jsonOutput: true,
    defaultSessionId: 'piv-unknown',
  };
}

/**
 * Structured Logger implementation
 */
class StructuredLogger implements ILogger {
  private config: LoggerConfig;
  private sessionId: string;
  private presetAttributes: LogAttributes;

  constructor(
    config: Partial<LoggerConfig> = {},
    presetAttributes: LogAttributes = {}
  ) {
    const envConfig = getConfigFromEnv();
    this.config = { ...envConfig, ...config };
    this.sessionId = this.config.defaultSessionId || 'piv-unknown';
    this.presetAttributes = presetAttributes;
  }

  /**
   * Set the session ID for correlation
   */
  setSessionId(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * Create a child logger with preset attributes
   */
  child(attributes: LogAttributes): ILogger {
    const childLogger = new StructuredLogger(this.config, {
      ...this.presetAttributes,
      ...attributes,
    });
    childLogger.setSessionId(this.sessionId);
    return childLogger;
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel];
  }

  /**
   * Format and output a log entry
   */
  private log(level: LogLevel, event: string, attributes: LogAttributes = {}): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      session_id: this.sessionId,
      event,
      ...this.presetAttributes,
      ...attributes,
    };

    // Remove undefined values
    const cleanEntry = Object.fromEntries(
      Object.entries(entry).filter(([, v]) => v !== undefined)
    ) as LogEntry;

    if (this.config.jsonOutput) {
      const output = JSON.stringify(cleanEntry);
      switch (level) {
        case 'error':
          console.error(output);
          break;
        case 'warn':
          console.warn(output);
          break;
        default:
          console.log(output);
      }
    } else {
      // Human-readable format for development
      const attrs = Object.entries(cleanEntry)
        .filter(([k]) => !['timestamp', 'level', 'session_id', 'event'].includes(k))
        .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
        .join(' ');
      const message = `[${cleanEntry.timestamp}] ${level.toUpperCase()} ${event} ${attrs}`;
      switch (level) {
        case 'error':
          console.error(message);
          break;
        case 'warn':
          console.warn(message);
          break;
        default:
          console.log(message);
      }
    }
  }

  debug(event: string, attributes?: LogAttributes): void {
    this.log('debug', event, attributes);
  }

  info(event: string, attributes?: LogAttributes): void {
    this.log('info', event, attributes);
  }

  warn(event: string, attributes?: LogAttributes): void {
    this.log('warn', event, attributes);
  }

  error(event: string, attributes?: LogAttributes): void {
    this.log('error', event, attributes);
  }
}

/**
 * Create a new logger instance
 */
export function createLogger(
  config: Partial<LoggerConfig> = {},
  presetAttributes: LogAttributes = {}
): ILogger {
  return new StructuredLogger(config, presetAttributes);
}

/**
 * Default logger instance
 */
export const logger = createLogger();

/**
 * Convenience function to create a domain-specific logger
 *
 * @example
 * const orchestratorLogger = createDomainLogger('orchestrator', sessionId);
 * orchestratorLogger.info('lifecycle.started', { complexity: 'new_feature' });
 */
export function createDomainLogger(
  domain: string,
  sessionId?: string
): ILogger {
  const domainLogger = createLogger({}, { domain });
  if (sessionId) {
    domainLogger.setSessionId(sessionId);
  }
  return domainLogger;
}

/**
 * Utility to measure and log operation duration
 *
 * @example
 * const timer = startTimer();
 * // ... do work ...
 * logger.info('operation.completed', { duration_ms: timer() });
 */
export function startTimer(): () => number {
  const start = Date.now();
  return () => Date.now() - start;
}

/**
 * Wrap an async operation with timing and logging
 *
 * @example
 * const result = await withLogging(
 *   logger,
 *   'planner.prd.creation',
 *   async () => createPRD(config),
 *   { feature: 'auth' }
 * );
 */
export async function withLogging<T>(
  log: ILogger,
  eventBase: string,
  operation: () => Promise<T>,
  attributes: LogAttributes = {}
): Promise<T> {
  const timer = startTimer();
  log.info(`${eventBase}_started`, attributes);

  try {
    const result = await operation();
    log.info(`${eventBase}_completed`, {
      ...attributes,
      duration_ms: timer(),
    });
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorType = error instanceof Error ? error.constructor.name : 'Unknown';
    const stackTrace = error instanceof Error ? error.stack : undefined;

    log.error(`${eventBase}_failed`, {
      ...attributes,
      duration_ms: timer(),
      error: errorMessage,
      error_type: errorType,
      stack_trace: stackTrace,
    });
    throw error;
  }
}
