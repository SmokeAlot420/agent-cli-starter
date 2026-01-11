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
 * Create a successful result
 */
export function ok(data) {
    return { success: true, data };
}
/**
 * Create a failure result
 */
export function err(error, rawData) {
    return { success: false, error, rawData };
}
/**
 * Type guard for successful result
 */
export function isOk(result) {
    return result.success;
}
/**
 * Type guard for failure result
 */
export function isErr(result) {
    return !result.success;
}
/**
 * Unwrap a result, throwing if it's an error
 * @throws The error if result is a failure
 */
export function unwrap(result) {
    if (isOk(result)) {
        return result.data;
    }
    throw result.error;
}
/**
 * Unwrap a result with a default value for errors
 */
export function unwrapOr(result, defaultValue) {
    return isOk(result) ? result.data : defaultValue;
}
/**
 * Map over a successful result
 */
export function mapResult(result, fn) {
    if (isOk(result)) {
        return ok(fn(result.data));
    }
    return result;
}
/**
 * Chain Result operations (flatMap)
 */
export function flatMapResult(result, fn) {
    if (isOk(result)) {
        return fn(result.data);
    }
    return result;
}
/**
 * Map over an error result
 */
export function mapError(result, fn) {
    if (isErr(result)) {
        return err(fn(result.error), result.rawData);
    }
    return result;
}
/**
 * Convert a Promise to Result (catches errors)
 */
export async function fromPromise(promise, errorMapper) {
    try {
        const data = await promise;
        return ok(data);
    }
    catch (error) {
        if (errorMapper) {
            return err(errorMapper(error));
        }
        return err(error);
    }
}
/**
 * Convert a function that might throw to Result
 */
export function tryCatch(fn, errorMapper) {
    try {
        return ok(fn());
    }
    catch (error) {
        if (errorMapper) {
            return err(errorMapper(error));
        }
        return err(error);
    }
}
//# sourceMappingURL=result.js.map