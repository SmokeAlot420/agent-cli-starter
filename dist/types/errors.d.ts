/**
 * PIV Loop Error Codes
 * Typed error codes for programmatic error handling
 */
export declare enum PIVErrorCode {
    PARSE_JSON_FAILED = "PARSE_JSON_FAILED",
    PARSE_RESPONSE_EMPTY = "PARSE_RESPONSE_EMPTY",
    PARSE_INVALID_STRUCTURE = "PARSE_INVALID_STRUCTURE",
    SDK_QUERY_FAILED = "SDK_QUERY_FAILED",
    SDK_TIMEOUT = "SDK_TIMEOUT",
    SDK_RATE_LIMITED = "SDK_RATE_LIMITED",
    SDK_OVERLOADED = "SDK_OVERLOADED",
    VALIDATION_FAILED = "VALIDATION_FAILED",
    VALIDATION_TIMEOUT = "VALIDATION_TIMEOUT",
    VALIDATION_COMMAND_ERROR = "VALIDATION_COMMAND_ERROR",
    FILE_NOT_FOUND = "FILE_NOT_FOUND",
    FILE_READ_FAILED = "FILE_READ_FAILED",
    FILE_WRITE_FAILED = "FILE_WRITE_FAILED",
    PLUGIN_INSTALL_FAILED = "PLUGIN_INSTALL_FAILED",
    PLUGIN_INVALID_SOURCE = "PLUGIN_INVALID_SOURCE",
    PLUGIN_NOT_FOUND = "PLUGIN_NOT_FOUND",
    MCP_CONNECTION_FAILED = "MCP_CONNECTION_FAILED",
    MCP_CONFIG_INVALID = "MCP_CONFIG_INVALID",
    MCP_TIMEOUT = "MCP_TIMEOUT",
    UNKNOWN_ERROR = "UNKNOWN_ERROR",
    MAX_ITERATIONS_EXCEEDED = "MAX_ITERATIONS_EXCEEDED"
}
/**
 * Enhanced PIV Error with error code support
 */
export declare class PIVTypedError extends Error {
    readonly code: PIVErrorCode;
    readonly context?: Record<string, unknown> | undefined;
    readonly cause?: Error | undefined;
    constructor(code: PIVErrorCode, message: string, context?: Record<string, unknown> | undefined, cause?: Error | undefined);
    /**
     * Create error from unknown value
     */
    static fromUnknown(code: PIVErrorCode, error: unknown, context?: Record<string, unknown>): PIVTypedError;
    /**
     * Check if error is retryable
     */
    isRetryable(): boolean;
}
//# sourceMappingURL=errors.d.ts.map