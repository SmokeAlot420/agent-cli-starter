/**
 * PIV Loop Error Utilities
 * Centralized error handling and logging
 *
 * Uses structured logging internally while maintaining backward-compatible API.
 */
import { logger } from './logger.js';
import { PIVErrorCode } from '../types/errors.js';
/**
 * Create a ParseError for JSON parsing failures
 */
export function createParseError(message, rawContent, parseAttempt) {
    return {
        code: PIVErrorCode.PARSE_JSON_FAILED,
        message,
        rawContent: rawContent?.substring(0, 500), // Truncate for logging
        parseAttempt,
    };
}
/**
 * Create a ParseError for empty responses
 */
export function createEmptyResponseError(context) {
    return {
        code: PIVErrorCode.PARSE_RESPONSE_EMPTY,
        message: `Empty response received from ${context}`,
    };
}
/**
 * Custom error class for PIV loop operations
 */
export class PIVError extends Error {
    context;
    cause;
    constructor(message, context, cause) {
        super(`[${context}] ${message}`);
        this.context = context;
        this.cause = cause;
        this.name = 'PIVError';
    }
}
/**
 * Log an error with context
 * Uses structured logging internally.
 *
 * @param context - The context/module where error occurred (maps to event domain)
 * @param error - The error or message
 * @returns The error message string
 */
export function logError(context, error) {
    const message = error instanceof Error ? error.message : String(error);
    const errorType = error instanceof Error ? error.constructor.name : 'Unknown';
    const stackTrace = error instanceof Error ? error.stack : undefined;
    // Map context to structured event name
    // e.g., "Orchestrator" -> "orchestrator.error_occurred"
    const domain = context.toLowerCase().replace(/\s+/g, '_');
    const event = `${domain}.error_occurred`;
    logger.error(event, {
        error: message,
        error_type: errorType,
        stack_trace: stackTrace,
    });
    return message;
}
/**
 * Log a warning with context
 * Uses structured logging internally.
 *
 * @param context - The context/module where warning occurred (maps to event domain)
 * @param message - The warning message
 */
export function logWarning(context, message) {
    // Map context to structured event name
    const domain = context.toLowerCase().replace(/\s+/g, '_');
    const event = `${domain}.warning_occurred`;
    logger.warn(event, {
        error: message,
    });
}
/**
 * Safely parse JSON with error context
 *
 * @param json - The JSON string to parse
 * @param context - Context for error reporting
 * @returns Parsed object or null on failure
 */
export function safeJsonParse(json, context) {
    try {
        return JSON.parse(json);
    }
    catch (error) {
        logError(context, `Failed to parse JSON: ${error instanceof Error ? error.message : error}`);
        return null;
    }
}
//# sourceMappingURL=errors.js.map