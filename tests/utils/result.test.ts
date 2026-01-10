/**
 * Result Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  Result,
  ok,
  err,
  isOk,
  isErr,
  unwrap,
  unwrapOr,
  mapResult,
  flatMapResult,
  mapError,
  fromPromise,
  tryCatch,
} from '../../src/utils/result.js';

describe('Result utilities', () => {
  describe('ok()', () => {
    it('should create success result', () => {
      const result = ok(42);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(42);
      }
    });

    it('should work with different types', () => {
      expect(ok('hello').success).toBe(true);
      expect(ok({ name: 'test' }).success).toBe(true);
      expect(ok([1, 2, 3]).success).toBe(true);
      expect(ok(null).success).toBe(true);
      expect(ok(undefined).success).toBe(true);
    });
  });

  describe('err()', () => {
    it('should create failure result', () => {
      const result = err('error message');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('error message');
      }
    });

    it('should include raw data if provided', () => {
      const result = err('error', 'raw response data');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.rawData).toBe('raw response data');
      }
    });

    it('should work with Error objects', () => {
      const error = new Error('test error');
      const result = err(error);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(error);
        expect(result.error.message).toBe('test error');
      }
    });
  });

  describe('isOk()', () => {
    it('should return true for success result', () => {
      expect(isOk(ok(1))).toBe(true);
    });

    it('should return false for failure result', () => {
      expect(isOk(err('error'))).toBe(false);
    });

    it('should narrow type correctly', () => {
      const result: Result<number, string> = ok(42);
      if (isOk(result)) {
        // TypeScript should allow result.data here
        const value: number = result.data;
        expect(value).toBe(42);
      }
    });
  });

  describe('isErr()', () => {
    it('should return false for success result', () => {
      expect(isErr(ok(1))).toBe(false);
    });

    it('should return true for failure result', () => {
      expect(isErr(err('error'))).toBe(true);
    });

    it('should narrow type correctly', () => {
      const result: Result<number, string> = err('failed');
      if (isErr(result)) {
        // TypeScript should allow result.error here
        const errorMsg: string = result.error;
        expect(errorMsg).toBe('failed');
      }
    });

    it('should allow access to rawData on error', () => {
      const result: Result<number, string> = err('failed', 'raw data');
      if (isErr(result)) {
        expect(result.rawData).toBe('raw data');
      }
    });
  });

  describe('unwrap()', () => {
    it('should return data for success result', () => {
      const result = ok(42);
      expect(unwrap(result)).toBe(42);
    });

    it('should throw error for failure result', () => {
      const result = err(new Error('test error'));
      expect(() => unwrap(result)).toThrow('test error');
    });

    it('should throw string error for failure result', () => {
      const result = err('string error');
      expect(() => unwrap(result)).toThrow('string error');
    });
  });

  describe('unwrapOr()', () => {
    it('should return data for success result', () => {
      const result = ok(42);
      expect(unwrapOr(result, 0)).toBe(42);
    });

    it('should return default value for failure result', () => {
      const result = err('error');
      expect(unwrapOr(result, 0)).toBe(0);
    });

    it('should work with null default', () => {
      const result: Result<string, string> = err('error');
      expect(unwrapOr(result, null as unknown as string)).toBe(null);
    });
  });

  describe('mapResult()', () => {
    it('should map success value', () => {
      const result = ok(5);
      const mapped = mapResult(result, (x) => x * 2);
      expect(isOk(mapped)).toBe(true);
      if (isOk(mapped)) {
        expect(mapped.data).toBe(10);
      }
    });

    it('should pass through error unchanged', () => {
      const result: Result<number, string> = err('error');
      const mapped = mapResult(result, (x) => x * 2);
      expect(isErr(mapped)).toBe(true);
      if (isErr(mapped)) {
        expect(mapped.error).toBe('error');
      }
    });

    it('should allow type transformation', () => {
      const result = ok(42);
      const mapped = mapResult(result, (x) => x.toString());
      expect(isOk(mapped)).toBe(true);
      if (isOk(mapped)) {
        expect(mapped.data).toBe('42');
      }
    });
  });

  describe('flatMapResult()', () => {
    it('should chain success results', () => {
      const result = ok(5);
      const chained = flatMapResult(result, (x) => ok(x * 2));
      expect(isOk(chained)).toBe(true);
      if (isOk(chained)) {
        expect(chained.data).toBe(10);
      }
    });

    it('should propagate first error', () => {
      const result: Result<number, string> = err('first error');
      const chained = flatMapResult(result, (x) => ok(x * 2));
      expect(isErr(chained)).toBe(true);
      if (isErr(chained)) {
        expect(chained.error).toBe('first error');
      }
    });

    it('should propagate chained error', () => {
      const result = ok(5);
      const chained = flatMapResult(result, () => err('chained error'));
      expect(isErr(chained)).toBe(true);
      if (isErr(chained)) {
        expect(chained.error).toBe('chained error');
      }
    });

    it('should allow multiple chains', () => {
      const result = ok(2);
      const chained = flatMapResult(
        flatMapResult(result, (x) => ok(x * 3)),
        (x) => ok(x + 1)
      );
      expect(isOk(chained)).toBe(true);
      if (isOk(chained)) {
        expect(chained.data).toBe(7); // (2 * 3) + 1
      }
    });
  });

  describe('mapError()', () => {
    it('should map error value', () => {
      const result: Result<number, string> = err('error');
      const mapped = mapError(result, (e) => new Error(e));
      expect(isErr(mapped)).toBe(true);
      if (isErr(mapped)) {
        expect(mapped.error).toBeInstanceOf(Error);
        expect(mapped.error.message).toBe('error');
      }
    });

    it('should pass through success unchanged', () => {
      const result: Result<number, string> = ok(42);
      const mapped = mapError(result, (e) => new Error(e));
      expect(isOk(mapped)).toBe(true);
      if (isOk(mapped)) {
        expect(mapped.data).toBe(42);
      }
    });

    it('should preserve rawData when mapping error', () => {
      const result: Result<number, string> = err('error', 'raw data');
      const mapped = mapError(result, (e) => ({ type: 'error', message: e }));
      expect(isErr(mapped)).toBe(true);
      if (isErr(mapped)) {
        expect(mapped.rawData).toBe('raw data');
      }
    });
  });

  describe('fromPromise()', () => {
    it('should return success for resolved promise', async () => {
      const result = await fromPromise(Promise.resolve(42));
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe(42);
      }
    });

    it('should return error for rejected promise', async () => {
      const result = await fromPromise(Promise.reject(new Error('failed')));
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    it('should use error mapper if provided', async () => {
      const result = await fromPromise(
        Promise.reject(new Error('original')),
        (e) => ({ type: 'custom', original: e })
      );
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('custom');
      }
    });
  });

  describe('tryCatch()', () => {
    it('should return success for non-throwing function', () => {
      const result = tryCatch(() => 42);
      expect(isOk(result)).toBe(true);
      if (isOk(result)) {
        expect(result.data).toBe(42);
      }
    });

    it('should return error for throwing function', () => {
      const result = tryCatch(() => {
        throw new Error('failed');
      });
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    it('should use error mapper if provided', () => {
      const result = tryCatch(
        () => {
          throw new Error('original');
        },
        (e) => ({ type: 'mapped', original: e })
      );
      expect(isErr(result)).toBe(true);
      if (isErr(result)) {
        expect(result.error.type).toBe('mapped');
      }
    });

    it('should work with JSON.parse', () => {
      const validResult = tryCatch(() => JSON.parse('{"a": 1}'));
      expect(isOk(validResult)).toBe(true);

      const invalidResult = tryCatch(() => JSON.parse('invalid json'));
      expect(isErr(invalidResult)).toBe(true);
    });
  });

  describe('type inference', () => {
    it('should infer success type correctly', () => {
      const result = ok({ name: 'test', value: 42 });
      if (isOk(result)) {
        // These should type-check
        const name: string = result.data.name;
        const value: number = result.data.value;
        expect(name).toBe('test');
        expect(value).toBe(42);
      }
    });

    it('should work with generic functions', () => {
      function divide(a: number, b: number): Result<number, string> {
        if (b === 0) return err('Division by zero');
        return ok(a / b);
      }

      const success = divide(10, 2);
      const failure = divide(10, 0);

      expect(isOk(success)).toBe(true);
      expect(isErr(failure)).toBe(true);
      if (isOk(success)) {
        expect(success.data).toBe(5);
      }
      if (isErr(failure)) {
        expect(failure.error).toBe('Division by zero');
      }
    });
  });
});
