/**
 * Retry Utilities
 * Exponential backoff for transient failures
 */

import { PIVTypedError } from '../types/errors.js';

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
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
  shouldRetry: (error: unknown) => {
    // Check for PIVTypedError with retryable code
    if (error instanceof PIVTypedError) {
      return error.isRetryable();
    }

    // Check for common transient error patterns in message
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('rate_limit') ||
        message.includes('rate limit') ||
        message.includes('overloaded') ||
        message.includes('timeout') ||
        message.includes('etimedout') ||
        message.includes('econnreset') ||
        message.includes('econnrefused') ||
        message.includes('503') ||
        message.includes('429')
      );
    }

    return false;
  }
};

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number
): number {
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
function sleep(ms: number): Promise<void> {
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
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts: RetryOptions = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
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
export function withRetryWrapper<TArgs extends unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: Partial<RetryOptions> = {}
): (...args: TArgs) => Promise<TReturn> {
  return (...args: TArgs) => withRetry(() => fn(...args), options);
}

/**
 * Check if an error is retryable based on common patterns
 */
export function isRetryableError(error: unknown): boolean {
  return DEFAULT_RETRY_OPTIONS.shouldRetry!(error, 1);
}
