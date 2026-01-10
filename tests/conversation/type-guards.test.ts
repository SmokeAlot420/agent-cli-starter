/**
 * Type Guards Tests
 */

import { describe, it, expect } from 'vitest';
import {
  isThinkingBlock,
  isToolUseBlock,
  isTextBlock,
  isTextDeltaStreamEvent,
  getTextFromStreamEvent
} from '../../src/conversation/type-guards.js';

describe('Type Guards', () => {
  describe('isThinkingBlock', () => {
    it('should return true for valid thinking block', () => {
      const block = { type: 'thinking', thinking: 'Some thoughts...' };
      expect(isThinkingBlock(block)).toBe(true);
    });

    it('should return false for non-thinking block', () => {
      expect(isThinkingBlock({ type: 'text', text: 'hello' })).toBe(false);
      expect(isThinkingBlock(null)).toBe(false);
      expect(isThinkingBlock(undefined)).toBe(false);
      expect(isThinkingBlock({ type: 'thinking' })).toBe(false); // missing thinking property
    });

    it('should return false for wrong type property', () => {
      expect(isThinkingBlock({ type: 'other', thinking: 'test' })).toBe(false);
    });

    it('should return false for non-string thinking property', () => {
      expect(isThinkingBlock({ type: 'thinking', thinking: 123 })).toBe(false);
      expect(isThinkingBlock({ type: 'thinking', thinking: null })).toBe(false);
    });
  });

  describe('isToolUseBlock', () => {
    it('should return true for valid tool_use block', () => {
      const block = { type: 'tool_use', name: 'Read', input: { path: '/test' }, id: '123' };
      expect(isToolUseBlock(block)).toBe(true);
    });

    it('should return false for non-tool_use block', () => {
      expect(isToolUseBlock({ type: 'text', text: 'hello' })).toBe(false);
      expect(isToolUseBlock(null)).toBe(false);
      expect(isToolUseBlock({ type: 'tool_use' })).toBe(false); // missing name
    });

    it('should return false for wrong type property', () => {
      expect(isToolUseBlock({ type: 'other', name: 'test', input: {} })).toBe(false);
    });

    it('should return false for non-string name property', () => {
      expect(isToolUseBlock({ type: 'tool_use', name: 123, input: {} })).toBe(false);
    });

    it('should return true even without id (input is required)', () => {
      const block = { type: 'tool_use', name: 'Read', input: {} };
      expect(isToolUseBlock(block)).toBe(true);
    });
  });

  describe('isTextBlock', () => {
    it('should return true for valid text block', () => {
      const block = { type: 'text', text: 'Hello world' };
      expect(isTextBlock(block)).toBe(true);
    });

    it('should return false for non-text block', () => {
      expect(isTextBlock({ type: 'thinking', thinking: 'thoughts' })).toBe(false);
      expect(isTextBlock(null)).toBe(false);
      expect(isTextBlock({ type: 'text' })).toBe(false); // missing text
    });

    it('should return false for wrong type property', () => {
      expect(isTextBlock({ type: 'other', text: 'test' })).toBe(false);
    });

    it('should return false for non-string text property', () => {
      expect(isTextBlock({ type: 'text', text: 123 })).toBe(false);
      expect(isTextBlock({ type: 'text', text: null })).toBe(false);
    });

    it('should return true for empty string text', () => {
      const block = { type: 'text', text: '' };
      expect(isTextBlock(block)).toBe(true);
    });
  });

  describe('isTextDeltaStreamEvent', () => {
    it('should return true for valid text delta stream event', () => {
      const msg = {
        type: 'stream_event',
        event: {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 'hello' }
        }
      };
      expect(isTextDeltaStreamEvent(msg)).toBe(true);
    });

    it('should return false for non-text-delta events', () => {
      expect(isTextDeltaStreamEvent({ type: 'assistant' })).toBe(false);
      expect(isTextDeltaStreamEvent({
        type: 'stream_event',
        event: { type: 'other' }
      })).toBe(false);
      expect(isTextDeltaStreamEvent(null)).toBe(false);
    });

    it('should return false for wrong stream event type', () => {
      expect(isTextDeltaStreamEvent({ type: 'other_event' })).toBe(false);
    });

    it('should return false for missing event property', () => {
      expect(isTextDeltaStreamEvent({ type: 'stream_event' })).toBe(false);
    });

    it('should return false for wrong event type', () => {
      const msg = {
        type: 'stream_event',
        event: {
          type: 'other_delta',
          delta: { type: 'text_delta', text: 'hello' }
        }
      };
      expect(isTextDeltaStreamEvent(msg)).toBe(false);
    });

    it('should return false for wrong delta type', () => {
      const msg = {
        type: 'stream_event',
        event: {
          type: 'content_block_delta',
          delta: { type: 'other_delta', text: 'hello' }
        }
      };
      expect(isTextDeltaStreamEvent(msg)).toBe(false);
    });

    it('should return false for non-string text in delta', () => {
      const msg = {
        type: 'stream_event',
        event: {
          type: 'content_block_delta',
          delta: { type: 'text_delta', text: 123 }
        }
      };
      expect(isTextDeltaStreamEvent(msg)).toBe(false);
    });
  });

  describe('getTextFromStreamEvent', () => {
    it('should extract text from stream event', () => {
      const msg = {
        type: 'stream_event' as const,
        event: {
          type: 'content_block_delta' as const,
          delta: { type: 'text_delta' as const, text: 'extracted text' }
        }
      };
      expect(getTextFromStreamEvent(msg)).toBe('extracted text');
    });

    it('should extract empty string', () => {
      const msg = {
        type: 'stream_event' as const,
        event: {
          type: 'content_block_delta' as const,
          delta: { type: 'text_delta' as const, text: '' }
        }
      };
      expect(getTextFromStreamEvent(msg)).toBe('');
    });
  });
});
