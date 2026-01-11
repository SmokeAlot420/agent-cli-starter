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
import type { LogAttributes, LoggerConfig, ILogger } from '../types/logging.js';
export type { ILogger, LogAttributes, LoggerConfig } from '../types/logging.js';
/**
 * Create a new logger instance
 */
export declare function createLogger(config?: Partial<LoggerConfig>, presetAttributes?: LogAttributes): ILogger;
/**
 * Default logger instance
 */
export declare const logger: ILogger;
/**
 * Convenience function to create a domain-specific logger
 *
 * @example
 * const orchestratorLogger = createDomainLogger('orchestrator', sessionId);
 * orchestratorLogger.info('lifecycle.started', { complexity: 'new_feature' });
 */
export declare function createDomainLogger(domain: string, sessionId?: string): ILogger;
/**
 * Utility to measure and log operation duration
 *
 * @example
 * const timer = startTimer();
 * // ... do work ...
 * logger.info('operation.completed', { duration_ms: timer() });
 */
export declare function startTimer(): () => number;
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
export declare function withLogging<T>(log: ILogger, eventBase: string, operation: () => Promise<T>, attributes?: LogAttributes): Promise<T>;
//# sourceMappingURL=logger.d.ts.map