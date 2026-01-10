/**
 * Structured Logger Unit Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createLogger,
  createDomainLogger,
  startTimer,
  withLogging,
} from '../../src/utils/logger.js';

describe('Structured Logger', () => {
  // Spy on console methods
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
    };
    // Enable logging for tests
    process.env.PIV_DEBUG = 'true';
    process.env.PIV_LOG_LEVEL = 'debug';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.PIV_DEBUG;
    delete process.env.PIV_LOG_LEVEL;
  });

  describe('createLogger', () => {
    it('should create a logger instance', () => {
      const logger = createLogger();
      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.debug).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
    });

    it('should log info messages when enabled', () => {
      const logger = createLogger();
      logger.info('test.event', { foo: 'bar' });

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      const logOutput = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.event).toBe('test.event');
      expect(parsed.level).toBe('info');
      expect(parsed.foo).toBe('bar');
    });

    it('should log debug messages when level is debug', () => {
      const logger = createLogger();
      logger.debug('test.debug_event', { value: 123 });

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      const logOutput = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.event).toBe('test.debug_event');
      expect(parsed.level).toBe('debug');
      expect(parsed.value).toBe(123);
    });

    it('should log warn messages to console.warn', () => {
      const logger = createLogger();
      logger.warn('test.warning', { message: 'something wrong' });

      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      const logOutput = consoleSpy.warn.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.event).toBe('test.warning');
      expect(parsed.level).toBe('warn');
    });

    it('should log error messages to console.error', () => {
      const logger = createLogger();
      logger.error('test.error', { error: 'something failed' });

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      const logOutput = consoleSpy.error.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.event).toBe('test.error');
      expect(parsed.level).toBe('error');
    });

    it('should include timestamp in logs', () => {
      const logger = createLogger();
      logger.info('test.timestamp', {});

      const logOutput = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.timestamp).toBeDefined();
      expect(new Date(parsed.timestamp).toISOString()).toBe(parsed.timestamp);
    });

    it('should include session_id in logs', () => {
      const logger = createLogger();
      logger.setSessionId('piv-12345');
      logger.info('test.session', {});

      const logOutput = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.session_id).toBe('piv-12345');
    });

    it('should not log when PIV_DEBUG is not set', () => {
      delete process.env.PIV_DEBUG;

      const logger = createLogger();
      logger.info('test.silent', {});

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });

    it('should respect log level filtering', () => {
      process.env.PIV_LOG_LEVEL = 'warn';

      const logger = createLogger();
      logger.debug('test.debug', {});
      logger.info('test.info', {});
      logger.warn('test.warn', {});
      logger.error('test.error', {});

      // Only warn and error should be logged
      expect(consoleSpy.log).not.toHaveBeenCalled();
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('child logger', () => {
    it('should create child logger with preset attributes', () => {
      const parentLogger = createLogger();
      const childLogger = parentLogger.child({ agent: 'planner' });

      childLogger.info('planner.started', {});

      const logOutput = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.agent).toBe('planner');
      expect(parsed.event).toBe('planner.started');
    });

    it('should inherit session_id from parent', () => {
      const parentLogger = createLogger();
      parentLogger.setSessionId('piv-parent');
      const childLogger = parentLogger.child({ agent: 'validator' });

      childLogger.info('validator.started', {});

      const logOutput = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.session_id).toBe('piv-parent');
      expect(parsed.agent).toBe('validator');
    });

    it('should merge child attributes with log attributes', () => {
      const parentLogger = createLogger();
      const childLogger = parentLogger.child({ agent: 'implementer', phase: 'executing' });

      childLogger.info('task.started', { task_id: 'task-1' });

      const logOutput = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.agent).toBe('implementer');
      expect(parsed.phase).toBe('executing');
      expect(parsed.task_id).toBe('task-1');
    });
  });

  describe('createDomainLogger', () => {
    it('should create logger with domain preset', () => {
      const logger = createDomainLogger('orchestrator', 'piv-test');

      logger.info('lifecycle.started', {});

      const logOutput = consoleSpy.log.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);

      expect(parsed.domain).toBe('orchestrator');
      expect(parsed.session_id).toBe('piv-test');
    });
  });

  describe('startTimer', () => {
    it('should return elapsed time in milliseconds', async () => {
      const timer = startTimer();

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 50));

      const elapsed = timer();

      expect(elapsed).toBeGreaterThanOrEqual(50);
      expect(elapsed).toBeLessThan(200); // Should not take too long
    });

    it('should return accurate timing', () => {
      const timer = startTimer();

      // Immediate call should be close to 0
      const elapsed = timer();

      expect(elapsed).toBeGreaterThanOrEqual(0);
      expect(elapsed).toBeLessThan(10);
    });
  });

  describe('withLogging', () => {
    it('should log start and completion of successful operations', async () => {
      const logger = createLogger();
      logger.setSessionId('piv-withlog');

      const result = await withLogging(
        logger,
        'test.operation',
        async () => 'success',
        { extra: 'data' }
      );

      expect(result).toBe('success');
      expect(consoleSpy.log).toHaveBeenCalledTimes(2);

      // Check started log
      const startLog = JSON.parse(consoleSpy.log.mock.calls[0][0]);
      expect(startLog.event).toBe('test.operation_started');
      expect(startLog.extra).toBe('data');

      // Check completed log
      const completeLog = JSON.parse(consoleSpy.log.mock.calls[1][0]);
      expect(completeLog.event).toBe('test.operation_completed');
      expect(completeLog.duration_ms).toBeGreaterThanOrEqual(0);
    });

    it('should log start and failure of failed operations', async () => {
      const logger = createLogger();
      const testError = new Error('Test failure');

      await expect(
        withLogging(
          logger,
          'test.failing_operation',
          async () => {
            throw testError;
          },
          { context: 'test' }
        )
      ).rejects.toThrow('Test failure');

      // Started (info) + Failed (error)
      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      expect(consoleSpy.error).toHaveBeenCalledTimes(1);

      // Check started log
      const startLog = JSON.parse(consoleSpy.log.mock.calls[0][0]);
      expect(startLog.event).toBe('test.failing_operation_started');

      // Check failed log
      const failLog = JSON.parse(consoleSpy.error.mock.calls[0][0]);
      expect(failLog.event).toBe('test.failing_operation_failed');
      expect(failLog.error).toBe('Test failure');
      expect(failLog.error_type).toBe('Error');
      expect(failLog.duration_ms).toBeGreaterThanOrEqual(0);
    });
  });
});
