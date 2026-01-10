/**
 * PIV Loop Error Codes
 * Typed error codes for programmatic error handling
 */

export enum PIVErrorCode {
  // Parsing errors
  PARSE_JSON_FAILED = 'PARSE_JSON_FAILED',
  PARSE_RESPONSE_EMPTY = 'PARSE_RESPONSE_EMPTY',
  PARSE_INVALID_STRUCTURE = 'PARSE_INVALID_STRUCTURE',

  // SDK errors
  SDK_QUERY_FAILED = 'SDK_QUERY_FAILED',
  SDK_TIMEOUT = 'SDK_TIMEOUT',
  SDK_RATE_LIMITED = 'SDK_RATE_LIMITED',
  SDK_OVERLOADED = 'SDK_OVERLOADED',

  // Validation errors
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  VALIDATION_TIMEOUT = 'VALIDATION_TIMEOUT',
  VALIDATION_COMMAND_ERROR = 'VALIDATION_COMMAND_ERROR',

  // File errors
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_READ_FAILED = 'FILE_READ_FAILED',
  FILE_WRITE_FAILED = 'FILE_WRITE_FAILED',

  // Plugin errors
  PLUGIN_INSTALL_FAILED = 'PLUGIN_INSTALL_FAILED',
  PLUGIN_INVALID_SOURCE = 'PLUGIN_INVALID_SOURCE',
  PLUGIN_NOT_FOUND = 'PLUGIN_NOT_FOUND',

  // MCP errors
  MCP_CONNECTION_FAILED = 'MCP_CONNECTION_FAILED',
  MCP_CONFIG_INVALID = 'MCP_CONFIG_INVALID',
  MCP_TIMEOUT = 'MCP_TIMEOUT',

  // Generic errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  MAX_ITERATIONS_EXCEEDED = 'MAX_ITERATIONS_EXCEEDED',
}

/**
 * Enhanced PIV Error with error code support
 */
export class PIVTypedError extends Error {
  constructor(
    public readonly code: PIVErrorCode,
    message: string,
    public readonly context?: Record<string, unknown>,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = 'PIVTypedError';

    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PIVTypedError);
    }
  }

  /**
   * Create error from unknown value
   */
  static fromUnknown(code: PIVErrorCode, error: unknown, context?: Record<string, unknown>): PIVTypedError {
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
  isRetryable(): boolean {
    return [
      PIVErrorCode.SDK_TIMEOUT,
      PIVErrorCode.SDK_RATE_LIMITED,
      PIVErrorCode.SDK_OVERLOADED,
      PIVErrorCode.MCP_TIMEOUT,
      PIVErrorCode.MCP_CONNECTION_FAILED,
    ].includes(this.code);
  }
}
