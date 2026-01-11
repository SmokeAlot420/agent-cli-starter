/**
 * PIV Loop Error Utilities
 * Centralized error handling and logging
 *
 * Uses structured logging internally while maintaining backward-compatible API.
 */
import { PIVErrorCode } from '../types/errors.js';
/**
 * Structured error for JSON parsing failures
 * Provides context for debugging malformed responses
 */
export interface ParseError {
    code: PIVErrorCode;
    message: string;
    rawContent?: string;
    parseAttempt?: string;
}
/**
 * Create a ParseError for JSON parsing failures
 */
export declare function createParseError(message: string, rawContent?: string, parseAttempt?: string): ParseError;
/**
 * Create a ParseError for empty responses
 */
export declare function createEmptyResponseError(context: string): ParseError;
/**
 * Custom error class for PIV loop operations
 */
export declare class PIVError extends Error {
    readonly context: string;
    readonly cause?: Error | undefined;
    constructor(message: string, context: string, cause?: Error | undefined);
}
/**
 * Log an error with context
 * Uses structured logging internally.
 *
 * @param context - The context/module where error occurred (maps to event domain)
 * @param error - The error or message
 * @returns The error message string
 */
export declare function logError(context: string, error: unknown): string;
/**
 * Log a warning with context
 * Uses structured logging internally.
 *
 * @param context - The context/module where warning occurred (maps to event domain)
 * @param message - The warning message
 */
export declare function logWarning(context: string, message: string): void;
/**
 * Safely parse JSON with error context
 *
 * @param json - The JSON string to parse
 * @param context - Context for error reporting
 * @returns Parsed object or null on failure
 */
export declare function safeJsonParse<T>(json: string, context: string): T | null;
//# sourceMappingURL=errors.d.ts.map