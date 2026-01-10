/**
 * Query Builder Tests
 */

import { describe, it, expect } from 'vitest';
import { buildQueryOptions, type QueryBuildOptions } from '../../src/conversation/query-builder.js';

describe('buildQueryOptions', () => {
  const baseOptions: QueryBuildOptions = {
    model: 'claude-sonnet-4-20250514',
    maxTurns: 50,
    workingDirectory: '/test/dir',
    thinkingTokens: 0,
    permissionMode: 'acceptEdits',
    isPlanMode: false,
    systemPromptAppend: '',
    mcpServers: {}
  };

  it('should build basic query options', () => {
    const result = buildQueryOptions(baseOptions);

    expect(result.model).toBe('claude-sonnet-4-20250514');
    expect(result.maxTurns).toBe(50);
    expect(result.cwd).toBe('/test/dir');
    expect(result.maxThinkingTokens).toBe(0);
    expect(result.permissionMode).toBe('acceptEdits');
  });

  it('should use claude_code preset for tools and system prompt', () => {
    const result = buildQueryOptions(baseOptions);

    expect(result.tools).toEqual({ type: 'preset', preset: 'claude_code' });
    expect(result.systemPrompt).toEqual({
      type: 'preset',
      preset: 'claude_code',
      append: ''
    });
  });

  it('should add plan mode restrictions', () => {
    const planOptions = { ...baseOptions, isPlanMode: true };
    const result = buildQueryOptions(planOptions);

    expect(result.permissionMode).toBe('default');
    expect(result.disallowedTools).toContain('Write');
    expect(result.disallowedTools).toContain('Edit');
    expect(result.disallowedTools).toContain('Bash');
    expect(result.disallowedTools).toContain('NotebookEdit');
    expect((result.systemPrompt as { append: string }).append).toContain('PLAN MODE ACTIVE');
  });

  it('should include existing disallowed tools in plan mode', () => {
    const planOptions = { ...baseOptions, isPlanMode: true, disallowedTools: ['CustomTool'] };
    const result = buildQueryOptions(planOptions);

    expect(result.disallowedTools).toContain('CustomTool');
    expect(result.disallowedTools).toContain('Write');
  });

  it('should include MCP servers when provided', () => {
    const withMcp = {
      ...baseOptions,
      mcpServers: { testServer: { type: 'stdio', command: 'test' } }
    };
    const result = buildQueryOptions(withMcp);

    expect(result.mcpServers).toEqual({ testServer: { type: 'stdio', command: 'test' } });
  });

  it('should not include empty MCP servers', () => {
    const result = buildQueryOptions(baseOptions);
    expect(result.mcpServers).toBeUndefined();
  });

  it('should include optional configurations when provided', () => {
    const fullOptions: QueryBuildOptions = {
      ...baseOptions,
      fallbackModel: 'claude-haiku',
      maxBudgetUsd: 10,
      allowedTools: ['Read', 'Grep'],
      env: { TEST: 'value' }
    };
    const result = buildQueryOptions(fullOptions);

    expect(result.fallbackModel).toBe('claude-haiku');
    expect(result.maxBudgetUsd).toBe(10);
    expect(result.allowedTools).toEqual(['Read', 'Grep']);
    expect(result.env).toEqual({ TEST: 'value' });
  });

  it('should set bypassPermissions flag correctly', () => {
    const bypassOptions = { ...baseOptions, permissionMode: 'bypassPermissions' };
    const result = buildQueryOptions(bypassOptions);

    expect(result.allowDangerouslySkipPermissions).toBe(true);
  });

  it('should include thinking tokens when provided', () => {
    const withThinking = { ...baseOptions, thinkingTokens: 128000 };
    const result = buildQueryOptions(withThinking);

    expect(result.maxThinkingTokens).toBe(128000);
  });

  it('should include session management options', () => {
    const withSession: QueryBuildOptions = {
      ...baseOptions,
      resume: 'session-123',
      forkSession: true,
      continue: true
    };
    const result = buildQueryOptions(withSession);

    expect(result.resume).toBe('session-123');
    expect(result.forkSession).toBe(true);
    expect(result.continue).toBe(true);
  });

  it('should include output format options', () => {
    const withOutput: QueryBuildOptions = {
      ...baseOptions,
      outputFormat: { type: 'json_schema', schema: { name: 'string' } },
      includePartialMessages: true
    };
    const result = buildQueryOptions(withOutput);

    expect(result.outputFormat).toEqual({ type: 'json_schema', schema: { name: 'string' } });
    expect(result.includePartialMessages).toBe(true);
  });

  it('should include sandbox configuration', () => {
    const withSandbox: QueryBuildOptions = {
      ...baseOptions,
      sandbox: { enabled: true }
    };
    const result = buildQueryOptions(withSandbox);

    expect(result.sandbox).toEqual({ enabled: true });
  });

  it('should include hooks configuration', () => {
    const hookFn = () => {};
    const withHooks: QueryBuildOptions = {
      ...baseOptions,
      hooks: { onMessage: hookFn }
    };
    const result = buildQueryOptions(withHooks);

    expect(result.hooks).toEqual({ onMessage: hookFn });
  });

  it('should include additional directories', () => {
    const withDirs: QueryBuildOptions = {
      ...baseOptions,
      additionalDirectories: ['/extra/dir1', '/extra/dir2']
    };
    const result = buildQueryOptions(withDirs);

    expect(result.additionalDirectories).toEqual(['/extra/dir1', '/extra/dir2']);
  });

  it('should include setting sources', () => {
    const withSources: QueryBuildOptions = {
      ...baseOptions,
      settingSources: ['project', 'user']
    };
    const result = buildQueryOptions(withSources);

    expect(result.settingSources).toEqual(['project', 'user']);
  });

  it('should include agents configuration', () => {
    const withAgents: QueryBuildOptions = {
      ...baseOptions,
      agents: { customAgent: { name: 'Custom' } }
    };
    const result = buildQueryOptions(withAgents);

    expect(result.agents).toEqual({ customAgent: { name: 'Custom' } });
  });

  it('should include file checkpointing option', () => {
    const withCheckpoint: QueryBuildOptions = {
      ...baseOptions,
      enableFileCheckpointing: true
    };
    const result = buildQueryOptions(withCheckpoint);

    expect(result.enableFileCheckpointing).toBe(true);
  });

  it('should not include disallowedTools outside plan mode when not isPlanMode', () => {
    const withDisallowed: QueryBuildOptions = {
      ...baseOptions,
      isPlanMode: false,
      disallowedTools: ['SomeTool']
    };
    const result = buildQueryOptions(withDisallowed);

    expect(result.disallowedTools).toEqual(['SomeTool']);
  });

  it('should append system prompt correctly', () => {
    const withSystemPrompt = { ...baseOptions, systemPromptAppend: 'Custom system prompt' };
    const result = buildQueryOptions(withSystemPrompt);

    expect((result.systemPrompt as { append: string }).append).toBe('Custom system prompt');
  });

  it('should append system prompt with plan mode message', () => {
    const withSystemPrompt = { ...baseOptions, systemPromptAppend: 'Custom', isPlanMode: true };
    const result = buildQueryOptions(withSystemPrompt);

    const append = (result.systemPrompt as { append: string }).append;
    expect(append).toContain('Custom');
    expect(append).toContain('PLAN MODE ACTIVE');
  });
});
