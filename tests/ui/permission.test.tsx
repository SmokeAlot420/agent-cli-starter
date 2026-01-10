/**
 * Permission System Unit Tests
 * Tests for usePermission hook and PermissionPrompt component
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';

import { PermissionPrompt } from '../../src/ui/components/PermissionPrompt.js';
import type { PermissionRequest } from '../../src/ui/hooks/usePermission.js';

describe('PermissionPrompt Component', () => {
  const mockRequest: PermissionRequest = {
    toolName: 'Bash',
    toolInput: { command: 'rm -rf ./temp' },
    toolUseID: 'test-123',
    decisionReason: 'This command modifies the filesystem'
  };

  it('should render permission prompt with tool name', () => {
    const onRespond = vi.fn();
    const { lastFrame } = render(
      <PermissionPrompt request={mockRequest} onRespond={onRespond} />
    );

    expect(lastFrame()).toContain('Permission Required');
    expect(lastFrame()).toContain('Bash');
  });

  it('should display truncated command for Bash tool', () => {
    const onRespond = vi.fn();
    const { lastFrame } = render(
      <PermissionPrompt request={mockRequest} onRespond={onRespond} />
    );

    expect(lastFrame()).toContain('rm -rf ./temp');
  });

  it('should show decision reason when provided', () => {
    const onRespond = vi.fn();
    const { lastFrame } = render(
      <PermissionPrompt request={mockRequest} onRespond={onRespond} />
    );

    expect(lastFrame()).toContain('This command modifies the filesystem');
  });

  it('should display Y/A/N options', () => {
    const onRespond = vi.fn();
    const { lastFrame } = render(
      <PermissionPrompt request={mockRequest} onRespond={onRespond} />
    );

    expect(lastFrame()).toContain('[Y]');
    expect(lastFrame()).toContain('Allow once');
    expect(lastFrame()).toContain('[A]');
    expect(lastFrame()).toContain('Always allow');
    expect(lastFrame()).toContain('[N]');
    expect(lastFrame()).toContain('Deny');
  });

  it('should show file path for Write tool', () => {
    const writeRequest: PermissionRequest = {
      toolName: 'Write',
      toolInput: { file_path: '/path/to/file.ts', content: 'test content' },
      toolUseID: 'test-456'
    };
    const onRespond = vi.fn();
    const { lastFrame } = render(
      <PermissionPrompt request={writeRequest} onRespond={onRespond} />
    );

    expect(lastFrame()).toContain('Write');
    expect(lastFrame()).toContain('/path/to/file.ts');
  });

  it('should show file path for Edit tool', () => {
    const editRequest: PermissionRequest = {
      toolName: 'Edit',
      toolInput: { file_path: '/path/to/edit.ts', old_string: 'foo', new_string: 'bar' },
      toolUseID: 'test-789'
    };
    const onRespond = vi.fn();
    const { lastFrame } = render(
      <PermissionPrompt request={editRequest} onRespond={onRespond} />
    );

    expect(lastFrame()).toContain('Edit');
    expect(lastFrame()).toContain('/path/to/edit.ts');
  });

  it('should show notebook path for NotebookEdit tool', () => {
    const notebookRequest: PermissionRequest = {
      toolName: 'NotebookEdit',
      toolInput: { notebook_path: '/path/to/notebook.ipynb' },
      toolUseID: 'test-notebook'
    };
    const onRespond = vi.fn();
    const { lastFrame } = render(
      <PermissionPrompt request={notebookRequest} onRespond={onRespond} />
    );

    expect(lastFrame()).toContain('NotebookEdit');
    expect(lastFrame()).toContain('/path/to/notebook.ipynb');
  });

  it('should truncate long commands', () => {
    const longCommandRequest: PermissionRequest = {
      toolName: 'Bash',
      toolInput: { command: 'a'.repeat(100) }, // 100 chars
      toolUseID: 'test-long'
    };
    const onRespond = vi.fn();
    const { lastFrame } = render(
      <PermissionPrompt request={longCommandRequest} onRespond={onRespond} />
    );

    // Should contain truncated version with ...
    expect(lastFrame()).toContain('...');
  });

  it('should handle missing decision reason', () => {
    const requestWithoutReason: PermissionRequest = {
      toolName: 'Bash',
      toolInput: { command: 'ls' },
      toolUseID: 'test-no-reason'
    };
    const onRespond = vi.fn();
    const { lastFrame } = render(
      <PermissionPrompt request={requestWithoutReason} onRespond={onRespond} />
    );

    // Should render without crashing
    expect(lastFrame()).toContain('Permission Required');
    expect(lastFrame()).toContain('Bash');
  });
});

describe('usePermission Hook', () => {
  it('should export usePermission function', async () => {
    const { usePermission } = await import('../../src/ui/hooks/usePermission.js');
    expect(typeof usePermission).toBe('function');
  });

  it('should export type definitions', async () => {
    // Type exports are verified at compile time
    // This test ensures the module loads correctly
    const module = await import('../../src/ui/hooks/usePermission.js');
    expect(module).toBeDefined();
    expect(typeof module.usePermission).toBe('function');
  });
});

describe('Permission Types', () => {
  it('should have PermissionRequest interface with required fields', async () => {
    // This tests the type structure at runtime via the component
    const request: PermissionRequest = {
      toolName: 'Test',
      toolInput: {},
      toolUseID: 'id-123'
    };
    expect(request.toolName).toBe('Test');
    expect(request.toolInput).toEqual({});
    expect(request.toolUseID).toBe('id-123');
    expect(request.decisionReason).toBeUndefined();
  });

  it('should have PermissionRequest interface with optional decisionReason', async () => {
    const request: PermissionRequest = {
      toolName: 'Test',
      toolInput: { arg: 'value' },
      toolUseID: 'id-456',
      decisionReason: 'Explanation here'
    };
    expect(request.decisionReason).toBe('Explanation here');
  });
});

describe('Permission Integration', () => {
  it('should export PermissionPrompt from components index', async () => {
    const components = await import('../../src/ui/components/index.js');
    expect(typeof components.PermissionPrompt).toBe('function');
  });

  it('should export usePermission from hooks index', async () => {
    const hooks = await import('../../src/ui/hooks/index.js');
    expect(typeof hooks.usePermission).toBe('function');
  });

  it('should export permission types from conversation index', async () => {
    const conversation = await import('../../src/conversation/index.js');
    // Types are verified at compile time, but we can check the module loads
    expect(conversation).toBeDefined();
  });
});
