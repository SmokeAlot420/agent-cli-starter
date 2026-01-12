/**
 * Conversation Module Constants
 */

import { systemPrompt } from '../branding.js';

/** The intelligent model - Opus 4.5 with extended thinking */
export const DEFAULT_MODEL = 'claude-opus-4-5-20251101';

/** Maximum thinking tokens (128K) */
export const DEFAULT_THINKING_TOKENS = 128000;

/** System prompt from branding configuration */
export const SYSTEM_PROMPT_APPEND = systemPrompt;

// For backwards compatibility
export const PIV_SYSTEM_PROMPT_APPEND = SYSTEM_PROMPT_APPEND;
