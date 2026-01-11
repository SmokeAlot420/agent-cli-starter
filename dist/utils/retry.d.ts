/**
 * Retry Utilities
 * Exponential backoff for transient failures
 */
/**
 * Options for retry behavior
 */
export interface RetryOptions {
    /** Maximum number of attempts (default: 3) */
    maxAttempts: number;
    /** Base delay in milliseconds (default: 1000) */
    baseDelayMs: number;
    /** Maximum delay in milliseconds (default: 10000) */
    maxDelayMs: number;
    /** Custom predicate to determine if error is retryable */
    shouldRetry?: (error: unknown, attempt: number) => boolean;
    /** Callback called before each retry */
    onRetry?: (error: unknown, attempt: number, delay: number) => void;
}
/**
 * Execute a function with retry logic
 *
 * @param fn - Async function to execute
 * @param options - Retry configuration options
 * @returns Result of the function
 * @throws Last error if all retries exhausted
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => fetchFromAPI(),
 *   { maxAttempts: 3, baseDelayMs: 1000 }
 * );
 * ```
 */
export declare function withRetry<T>(fn: () => Promise<T>, options?: Partial<RetryOptions>): Promise<T>;
/**
 * Wrap a function to automatically retry on transient failures
 *
 * @param fn - Function to wrap
 * @param options - Retry configuration options
 * @returns Wrapped function with retry logic
 */
export declare function withRetryWrapper<TArgs extends unknown[], TReturn>(fn: (...args: TArgs) => Promise<TReturn>, options?: Partial<RetryOptions>): (...args: TArgs) => Promise<TReturn>;
/**
 * Check if an error is retryable based on common patterns
 */
export declare function isRetryableError(error: unknown): boolean;
//# sourceMappingURL=retry.d.ts.map