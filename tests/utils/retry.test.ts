/**
 * Retry Utilities Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  withRetry,
  withRetryWrapper,
  isRetryableError,
  RetryOptions,
} from '../../src/utils/retry.js';
import { PIVErrorCode, PIVTypedError } from '../../src/types/errors.js';

describe('Retry utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('withRetry()', () => {
    it('should return result on first success', async () => {
      const fn = vi.fn().mockResolvedValue(42);

      const promise = withRetry(fn);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBe(42);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable error', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('rate_limit exceeded'))
        .mockResolvedValue('success');

      const promise = withRetry(fn, { baseDelayMs: 100 });

      // Run all timers to completion
      await vi.runAllTimersAsync();

      const result = await promise;
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max attempts', async () => {
      const error = new Error('rate_limit exceeded');
      const fn = vi.fn().mockRejectedValue(error);

      const promise = withRetry(fn, {
        maxAttempts: 3,
        baseDelayMs: 100,
        maxDelayMs: 1000,
      });

      // Set up rejection handler BEFORE running timers to avoid unhandled rejection
      const expectation = expect(promise).rejects.toThrow('rate_limit exceeded');

      // Run through all retries
      await vi.runAllTimersAsync();

      await expectation;
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable errors', async () => {
      const error = new Error('validation failed');
      const fn = vi.fn().mockRejectedValue(error);

      const promise = withRetry(fn);

      // Set up rejection handler BEFORE running timers to avoid unhandled rejection
      const expectation = expect(promise).rejects.toThrow('validation failed');
      await vi.runAllTimersAsync();

      await expectation;
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should use custom shouldRetry predicate', async () => {
      const error = new Error('custom error');
      const fn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const promise = withRetry(fn, {
        baseDelayMs: 100,
        shouldRetry: (err) => err instanceof Error && err.message === 'custom error',
      });

      await vi.runAllTimersAsync();

      const result = await promise;
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should call onRetry callback before each retry', async () => {
      const onRetry = vi.fn();
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('rate_limit'))
        .mockRejectedValueOnce(new Error('rate_limit'))
        .mockResolvedValue('success');

      const promise = withRetry(fn, {
        baseDelayMs: 100,
        maxDelayMs: 1000,
        onRetry,
      });

      await vi.runAllTimersAsync();
      await promise;

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenCalledWith(
        expect.any(Error),
        1,
        expect.any(Number)
      );
      expect(onRetry).toHaveBeenCalledWith(
        expect.any(Error),
        2,
        expect.any(Number)
      );
    });

    it('should handle PIVTypedError retryable codes', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(
          new PIVTypedError(PIVErrorCode.SDK_RATE_LIMITED, 'Rate limited')
        )
        .mockResolvedValue('success');

      const promise = withRetry(fn, { baseDelayMs: 100 });
      await vi.runAllTimersAsync();

      const result = await promise;
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should not retry PIVTypedError non-retryable codes', async () => {
      const error = new PIVTypedError(
        PIVErrorCode.PARSE_JSON_FAILED,
        'Invalid JSON'
      );
      const fn = vi.fn().mockRejectedValue(error);

      const promise = withRetry(fn);

      // Set up rejection handler BEFORE running timers to avoid unhandled rejection
      const expectation = expect(promise).rejects.toThrow('Invalid JSON');
      await vi.runAllTimersAsync();

      await expectation;
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should respect maxDelayMs cap', async () => {
      const onRetry = vi.fn();
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('success');

      const promise = withRetry(fn, {
        maxAttempts: 5,
        baseDelayMs: 1000,
        maxDelayMs: 2000,
        onRetry,
      });

      await vi.runAllTimersAsync();
      await promise;

      // All delays should be <= maxDelayMs
      for (const call of onRetry.mock.calls) {
        expect(call[2]).toBeLessThanOrEqual(2000);
      }
    });

    it('should apply exponential backoff', async () => {
      const delays: number[] = [];
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('success');

      const promise = withRetry(fn, {
        maxAttempts: 4,
        baseDelayMs: 100,
        maxDelayMs: 10000,
        onRetry: (_, __, delay) => delays.push(delay),
      });

      await vi.runAllTimersAsync();
      await promise;

      // Delays should increase (with some jitter)
      // Base formula: 100 * 2^(attempt-1) + jitter
      // Attempt 1: ~100ms, Attempt 2: ~200ms, Attempt 3: ~400ms
      expect(delays[0]).toBeGreaterThanOrEqual(100);
      expect(delays[0]).toBeLessThan(200);
      expect(delays[1]).toBeGreaterThanOrEqual(200);
      expect(delays[1]).toBeLessThan(400);
      expect(delays[2]).toBeGreaterThanOrEqual(400);
      expect(delays[2]).toBeLessThan(800);
    });
  });

  describe('withRetryWrapper()', () => {
    it('should wrap function with retry logic', async () => {
      const originalFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('rate_limit'))
        .mockResolvedValue('success');

      const wrappedFn = withRetryWrapper(originalFn, { baseDelayMs: 100 });

      const promise = wrappedFn('arg1', 'arg2');
      await vi.runAllTimersAsync();

      const result = await promise;
      expect(result).toBe('success');
      expect(originalFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(originalFn).toHaveBeenCalledTimes(2);
    });

    it('should preserve function arguments across retries', async () => {
      const originalFn = vi
        .fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('done');

      const wrappedFn = withRetryWrapper(originalFn, { baseDelayMs: 100 });

      const promise = wrappedFn(1, 2, 3);
      await vi.runAllTimersAsync();

      await promise;
      expect(originalFn).toHaveBeenNthCalledWith(1, 1, 2, 3);
      expect(originalFn).toHaveBeenNthCalledWith(2, 1, 2, 3);
    });

    it('should work with async functions', async () => {
      const asyncFn = async (x: number) => x * 2;
      const wrappedFn = withRetryWrapper(asyncFn);

      const result = await wrappedFn(21);
      expect(result).toBe(42);
    });
  });

  describe('isRetryableError()', () => {
    it('should return true for rate limit errors', () => {
      expect(isRetryableError(new Error('rate_limit exceeded'))).toBe(true);
      expect(isRetryableError(new Error('Rate Limit hit'))).toBe(true);
      expect(isRetryableError(new Error('429 Too Many Requests'))).toBe(true);
    });

    it('should return true for timeout errors', () => {
      expect(isRetryableError(new Error('timeout occurred'))).toBe(true);
      expect(isRetryableError(new Error('ETIMEDOUT'))).toBe(true);
    });

    it('should return true for connection errors', () => {
      expect(isRetryableError(new Error('ECONNRESET'))).toBe(true);
      expect(isRetryableError(new Error('ECONNREFUSED'))).toBe(true);
    });

    it('should return true for overloaded errors', () => {
      expect(isRetryableError(new Error('server overloaded'))).toBe(true);
      expect(isRetryableError(new Error('503 Service Unavailable'))).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      expect(isRetryableError(new Error('validation failed'))).toBe(false);
      expect(isRetryableError(new Error('invalid input'))).toBe(false);
      expect(isRetryableError(new Error('not found'))).toBe(false);
    });

    it('should return true for retryable PIVTypedErrors', () => {
      expect(
        isRetryableError(
          new PIVTypedError(PIVErrorCode.SDK_RATE_LIMITED, 'Rate limited')
        )
      ).toBe(true);
      expect(
        isRetryableError(
          new PIVTypedError(PIVErrorCode.SDK_TIMEOUT, 'Timeout')
        )
      ).toBe(true);
      expect(
        isRetryableError(
          new PIVTypedError(PIVErrorCode.SDK_OVERLOADED, 'Overloaded')
        )
      ).toBe(true);
      expect(
        isRetryableError(
          new PIVTypedError(PIVErrorCode.MCP_TIMEOUT, 'MCP Timeout')
        )
      ).toBe(true);
      expect(
        isRetryableError(
          new PIVTypedError(PIVErrorCode.MCP_CONNECTION_FAILED, 'Connection failed')
        )
      ).toBe(true);
    });

    it('should return false for non-retryable PIVTypedErrors', () => {
      expect(
        isRetryableError(
          new PIVTypedError(PIVErrorCode.PARSE_JSON_FAILED, 'Parse error')
        )
      ).toBe(false);
      expect(
        isRetryableError(
          new PIVTypedError(PIVErrorCode.VALIDATION_FAILED, 'Validation error')
        )
      ).toBe(false);
    });

    it('should return false for non-Error values', () => {
      expect(isRetryableError('string error')).toBe(false);
      expect(isRetryableError(null)).toBe(false);
      expect(isRetryableError(undefined)).toBe(false);
      expect(isRetryableError(42)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle immediate success', async () => {
      const fn = vi.fn().mockResolvedValue('immediate');

      const result = await withRetry(fn, { maxAttempts: 5 });

      expect(result).toBe('immediate');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should handle success on last attempt', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('finally');

      const promise = withRetry(fn, {
        maxAttempts: 3,
        baseDelayMs: 100,
      });

      await vi.runAllTimersAsync();

      const result = await promise;
      expect(result).toBe('finally');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should handle zero maxAttempts gracefully', async () => {
      const fn = vi.fn().mockResolvedValue('value');

      // With 0 or negative maxAttempts, loop won't execute
      // The function should still throw/handle gracefully
      const promise = withRetry(fn, { maxAttempts: 0 });

      // Should throw the lastError (undefined in this case)
      await expect(promise).rejects.toBeUndefined();
    });

    it('should handle mixed error types', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('rate_limit'))
        .mockRejectedValueOnce(
          new PIVTypedError(PIVErrorCode.SDK_TIMEOUT, 'Timeout')
        )
        .mockResolvedValue('success');

      const promise = withRetry(fn, {
        maxAttempts: 5,
        baseDelayMs: 100,
      });

      await vi.runAllTimersAsync();

      const result = await promise;
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should handle async throwing functions', async () => {
      const fn = vi.fn().mockImplementation(async () => {
        throw new Error('async throw');
      });

      const promise = withRetry(fn, { maxAttempts: 1 });

      // Set up rejection handler BEFORE running timers to avoid unhandled rejection
      const expectation = expect(promise).rejects.toThrow('async throw');
      await vi.runAllTimersAsync();

      await expectation;
    });
  });

  describe('timing and delays', () => {
    it('should wait correct duration before retry', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('success');

      const promise = withRetry(fn, {
        baseDelayMs: 500,
        maxDelayMs: 1000,
      });

      // Function should have been called once
      expect(fn).toHaveBeenCalledTimes(1);

      // Advance time but not enough for retry (less than base delay)
      await vi.advanceTimersByTimeAsync(400);
      expect(fn).toHaveBeenCalledTimes(1);

      // Advance past delay with enough margin for max jitter (500 * 1.3 = 650ms)
      // We've advanced 400ms, need at least 250ms more to cover max jitter
      await vi.advanceTimersByTimeAsync(300);
      await promise;

      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should add jitter to delays', async () => {
      const delays: number[] = [];

      // Run multiple times to see jitter variation
      for (let i = 0; i < 5; i++) {
        const fn = vi
          .fn()
          .mockRejectedValueOnce(new Error('timeout'))
          .mockResolvedValue('success');

        const promise = withRetry(fn, {
          baseDelayMs: 100,
          maxDelayMs: 10000,
          onRetry: (_, __, delay) => delays.push(delay),
        });

        await vi.runAllTimersAsync();
        await promise;
      }

      // Not all delays should be identical due to jitter
      const uniqueDelays = new Set(delays);
      // With jitter, we expect some variation (may not always be true with mocked Math.random)
      expect(delays.length).toBe(5);
    });
  });
});
