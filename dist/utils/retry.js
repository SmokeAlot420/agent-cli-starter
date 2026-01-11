/**
 * Retry Utilities
 * Exponential backoff for transient failures
 */
import { PIVTypedError } from '../types/errors.js';
/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS = {
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 10000,
    shouldRetry: (error) => {
        // Check for PIVTypedError with retryable code
        if (error instanceof PIVTypedError) {
            return error.isRetryable();
        }
        // Check for common transient error patterns in message
        if (error instanceof Error) {
            const message = error.message.toLowerCase();
            return (message.includes('rate_limit') ||
                message.includes('rate limit') ||
                message.includes('overloaded') ||
                message.includes('timeout') ||
                message.includes('etimedout') ||
                message.includes('econnreset') ||
                message.includes('econnrefused') ||
                message.includes('503') ||
                message.includes('429'));
        }
        return false;
    }
};
/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(attempt, baseDelayMs, maxDelayMs) {
    // Exponential backoff: base * 2^(attempt-1)
    const exponentialDelay = baseDelayMs * Math.pow(2, attempt - 1);
    // Add jitter: random value between 0 and 0.3 * delay
    const jitter = Math.random() * 0.3 * exponentialDelay;
    // Clamp to maxDelayMs
    return Math.min(exponentialDelay + jitter, maxDelayMs);
}
/**
 * Sleep for a specified duration
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
export async function withRetry(fn, options = {}) {
    const opts = { ...DEFAULT_RETRY_OPTIONS, ...options };
    let lastError;
    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            // Check if we should retry
            const isLastAttempt = attempt === opts.maxAttempts;
            const shouldRetryError = opts.shouldRetry?.(error, attempt) ?? false;
            if (isLastAttempt || !shouldRetryError) {
                throw error;
            }
            // Calculate delay
            const delay = calculateDelay(attempt, opts.baseDelayMs, opts.maxDelayMs);
            // Call onRetry callback
            opts.onRetry?.(error, attempt, delay);
            // Wait before retry
            await sleep(delay);
        }
    }
    // This should never be reached, but TypeScript needs it
    throw lastError;
}
/**
 * Wrap a function to automatically retry on transient failures
 *
 * @param fn - Function to wrap
 * @param options - Retry configuration options
 * @returns Wrapped function with retry logic
 */
export function withRetryWrapper(fn, options = {}) {
    return (...args) => withRetry(() => fn(...args), options);
}
/**
 * Check if an error is retryable based on common patterns
 */
export function isRetryableError(error) {
    return DEFAULT_RETRY_OPTIONS.shouldRetry(error, 1);
}
//# sourceMappingURL=retry.js.map