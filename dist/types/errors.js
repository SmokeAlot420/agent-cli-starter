/**
 * PIV Loop Error Codes
 * Typed error codes for programmatic error handling
 */
export var PIVErrorCode;
(function (PIVErrorCode) {
    // Parsing errors
    PIVErrorCode["PARSE_JSON_FAILED"] = "PARSE_JSON_FAILED";
    PIVErrorCode["PARSE_RESPONSE_EMPTY"] = "PARSE_RESPONSE_EMPTY";
    PIVErrorCode["PARSE_INVALID_STRUCTURE"] = "PARSE_INVALID_STRUCTURE";
    // SDK errors
    PIVErrorCode["SDK_QUERY_FAILED"] = "SDK_QUERY_FAILED";
    PIVErrorCode["SDK_TIMEOUT"] = "SDK_TIMEOUT";
    PIVErrorCode["SDK_RATE_LIMITED"] = "SDK_RATE_LIMITED";
    PIVErrorCode["SDK_OVERLOADED"] = "SDK_OVERLOADED";
    // Validation errors
    PIVErrorCode["VALIDATION_FAILED"] = "VALIDATION_FAILED";
    PIVErrorCode["VALIDATION_TIMEOUT"] = "VALIDATION_TIMEOUT";
    PIVErrorCode["VALIDATION_COMMAND_ERROR"] = "VALIDATION_COMMAND_ERROR";
    // File errors
    PIVErrorCode["FILE_NOT_FOUND"] = "FILE_NOT_FOUND";
    PIVErrorCode["FILE_READ_FAILED"] = "FILE_READ_FAILED";
    PIVErrorCode["FILE_WRITE_FAILED"] = "FILE_WRITE_FAILED";
    // Plugin errors
    PIVErrorCode["PLUGIN_INSTALL_FAILED"] = "PLUGIN_INSTALL_FAILED";
    PIVErrorCode["PLUGIN_INVALID_SOURCE"] = "PLUGIN_INVALID_SOURCE";
    PIVErrorCode["PLUGIN_NOT_FOUND"] = "PLUGIN_NOT_FOUND";
    // MCP errors
    PIVErrorCode["MCP_CONNECTION_FAILED"] = "MCP_CONNECTION_FAILED";
    PIVErrorCode["MCP_CONFIG_INVALID"] = "MCP_CONFIG_INVALID";
    PIVErrorCode["MCP_TIMEOUT"] = "MCP_TIMEOUT";
    // Generic errors
    PIVErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
    PIVErrorCode["MAX_ITERATIONS_EXCEEDED"] = "MAX_ITERATIONS_EXCEEDED";
})(PIVErrorCode || (PIVErrorCode = {}));
/**
 * Enhanced PIV Error with error code support
 */
export class PIVTypedError extends Error {
    code;
    context;
    cause;
    constructor(code, message, context, cause) {
        super(message);
        this.code = code;
        this.context = context;
        this.cause = cause;
        this.name = 'PIVTypedError';
        // Maintain proper stack trace in V8
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, PIVTypedError);
        }
    }
    /**
     * Create error from unknown value
     */
    static fromUnknown(code, error, context) {
        if (error instanceof PIVTypedError) {
            return error;
        }
        if (error instanceof Error) {
            return new PIVTypedError(code, error.message, context, error);
        }
        return new PIVTypedError(code, String(error), context);
    }
    /**
     * Check if error is retryable
     */
    isRetryable() {
        return [
            PIVErrorCode.SDK_TIMEOUT,
            PIVErrorCode.SDK_RATE_LIMITED,
            PIVErrorCode.SDK_OVERLOADED,
            PIVErrorCode.MCP_TIMEOUT,
            PIVErrorCode.MCP_CONNECTION_FAILED,
        ].includes(this.code);
    }
}
//# sourceMappingURL=errors.js.map