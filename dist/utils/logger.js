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
/** Log level priority for filtering */
const LOG_LEVEL_PRIORITY = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};
/**
 * Get logger configuration from environment
 */
function getConfigFromEnv() {
    const enabled = process.env.PIV_DEBUG === 'true' || process.env.PIV_DEBUG === '1';
    const levelEnv = process.env.PIV_LOG_LEVEL?.toLowerCase();
    const minLevel = levelEnv === 'debug' || levelEnv === 'info' || levelEnv === 'warn' || levelEnv === 'error'
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
class StructuredLogger {
    config;
    sessionId;
    presetAttributes;
    constructor(config = {}, presetAttributes = {}) {
        const envConfig = getConfigFromEnv();
        this.config = { ...envConfig, ...config };
        this.sessionId = this.config.defaultSessionId || 'piv-unknown';
        this.presetAttributes = presetAttributes;
    }
    /**
     * Set the session ID for correlation
     */
    setSessionId(sessionId) {
        this.sessionId = sessionId;
    }
    /**
     * Create a child logger with preset attributes
     */
    child(attributes) {
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
    shouldLog(level) {
        if (!this.config.enabled)
            return false;
        return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.config.minLevel];
    }
    /**
     * Format and output a log entry
     */
    log(level, event, attributes = {}) {
        if (!this.shouldLog(level))
            return;
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            session_id: this.sessionId,
            event,
            ...this.presetAttributes,
            ...attributes,
        };
        // Remove undefined values
        const cleanEntry = Object.fromEntries(Object.entries(entry).filter(([, v]) => v !== undefined));
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
        }
        else {
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
    debug(event, attributes) {
        this.log('debug', event, attributes);
    }
    info(event, attributes) {
        this.log('info', event, attributes);
    }
    warn(event, attributes) {
        this.log('warn', event, attributes);
    }
    error(event, attributes) {
        this.log('error', event, attributes);
    }
}
/**
 * Create a new logger instance
 */
export function createLogger(config = {}, presetAttributes = {}) {
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
export function createDomainLogger(domain, sessionId) {
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
export function startTimer() {
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
export async function withLogging(log, eventBase, operation, attributes = {}) {
    const timer = startTimer();
    log.info(`${eventBase}_started`, attributes);
    try {
        const result = await operation();
        log.info(`${eventBase}_completed`, {
            ...attributes,
            duration_ms: timer(),
        });
        return result;
    }
    catch (error) {
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
//# sourceMappingURL=logger.js.map