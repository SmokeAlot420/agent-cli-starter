/**
 * Result Type Utilities
 * Type-safe error handling without exceptions
 *
 * @example
 * ```typescript
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return err('Division by zero');
 *   return ok(a / b);
 * }
 *
 * const result = divide(10, 2);
 * if (isOk(result)) {
 *   console.log(result.data); // 5
 * }
 * ```
 */
/**
 * Result type representing success or failure
 */
export type Result<T, E = Error> = {
    success: true;
    data: T;
} | {
    success: false;
    error: E;
    rawData?: string;
};
/**
 * Create a successful result
 */
export declare function ok<T>(data: T): Result<T, never>;
/**
 * Create a failure result
 */
export declare function err<E>(error: E, rawData?: string): Result<never, E>;
/**
 * Type guard for successful result
 */
export declare function isOk<T, E>(result: Result<T, E>): result is {
    success: true;
    data: T;
};
/**
 * Type guard for failure result
 */
export declare function isErr<T, E>(result: Result<T, E>): result is {
    success: false;
    error: E;
    rawData?: string;
};
/**
 * Unwrap a result, throwing if it's an error
 * @throws The error if result is a failure
 */
export declare function unwrap<T, E>(result: Result<T, E>): T;
/**
 * Unwrap a result with a default value for errors
 */
export declare function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T;
/**
 * Map over a successful result
 */
export declare function mapResult<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E>;
/**
 * Chain Result operations (flatMap)
 */
export declare function flatMapResult<T, U, E>(result: Result<T, E>, fn: (data: T) => Result<U, E>): Result<U, E>;
/**
 * Map over an error result
 */
export declare function mapError<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F>;
/**
 * Convert a Promise to Result (catches errors)
 */
export declare function fromPromise<T, E = Error>(promise: Promise<T>, errorMapper?: (error: unknown) => E): Promise<Result<T, E>>;
/**
 * Convert a function that might throw to Result
 */
export declare function tryCatch<T, E = Error>(fn: () => T, errorMapper?: (error: unknown) => E): Result<T, E>;
//# sourceMappingURL=result.d.ts.map