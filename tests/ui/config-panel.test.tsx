/**
 * ConfigPanel Unit Tests
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';

import { ConfigPanel } from '../../src/ui/components/ConfigPanel.js';
import type { ConfigStatus, ConfigSettings, ConfigUsage } from '../../src/ui/hooks/useConfigPanel.js';

const mockStatus: ConfigStatus = {
  version: '1.0.0',
  productName: 'Fork Brand Ship',
  sessionId: 'test-session-123',
  cwd: '/test/path',
  model: 'opus',
  modelId: 'claude-opus-4-5-20251101',
  thinkingTokens: 128000
};

const mockSettings: ConfigSettings = {
  thinkingMode: true,
  verboseOutput: false,
  permissionMode: 'default'
};

const mockUsage: ConfigUsage = {
  contextPercent: 45
};

describe('ConfigPanel Component', () => {
  it('should render status tab by default', () => {
    const { lastFrame } = render(
      <ConfigPanel
        activeTab="status"
        status={mockStatus}
        settings={mockSettings}
        usage={mockUsage}
        selectedSettingIndex={0}
        onClose={() => {}}
        onNextTab={() => {}}
        onPrevTab={() => {}}
        onSetTab={() => {}}
        onSelectNextSetting={() => {}}
        onSelectPrevSetting={() => {}}
        onActivateSetting={() => {}}
      />
    );

    expect(lastFrame()).toContain('Status');
    expect(lastFrame()).toContain('Version');
    expect(lastFrame()).toContain('1.0.0');
    expect(lastFrame()).toContain('/test/path');
  });

  it('should render config tab', () => {
    const { lastFrame } = render(
      <ConfigPanel
        activeTab="config"
        status={mockStatus}
        settings={mockSettings}
        usage={mockUsage}
        selectedSettingIndex={0}
        onClose={() => {}}
        onNextTab={() => {}}
        onPrevTab={() => {}}
        onSetTab={() => {}}
        onSelectNextSetting={() => {}}
        onSelectPrevSetting={() => {}}
        onActivateSetting={() => {}}
      />
    );

    expect(lastFrame()).toContain('Config');
    expect(lastFrame()).toContain('Thinking mode');
    expect(lastFrame()).toContain('on');
  });

  it('should render usage tab', () => {
    const { lastFrame } = render(
      <ConfigPanel
        activeTab="usage"
        status={mockStatus}
        settings={mockSettings}
        usage={mockUsage}
        selectedSettingIndex={0}
        onClose={() => {}}
        onNextTab={() => {}}
        onPrevTab={() => {}}
        onSetTab={() => {}}
        onSelectNextSetting={() => {}}
        onSelectPrevSetting={() => {}}
        onActivateSetting={() => {}}
      />
    );

    expect(lastFrame()).toContain('Usage');
    expect(lastFrame()).toContain('45%');
  });

  it('should show tab navigation hint', () => {
    const { lastFrame } = render(
      <ConfigPanel
        activeTab="status"
        status={mockStatus}
        settings={mockSettings}
        usage={mockUsage}
        selectedSettingIndex={0}
        onClose={() => {}}
        onNextTab={() => {}}
        onPrevTab={() => {}}
        onSetTab={() => {}}
        onSelectNextSetting={() => {}}
        onSelectPrevSetting={() => {}}
        onActivateSetting={() => {}}
      />
    );

    expect(lastFrame()).toContain('tab to cycle');
    expect(lastFrame()).toContain('Esc: Close');
  });

  it('should show MCP servers when provided', () => {
    const { lastFrame } = render(
      <ConfigPanel
        activeTab="status"
        status={mockStatus}
        settings={mockSettings}
        usage={mockUsage}
        selectedSettingIndex={0}
        mcpServers={{
          context7: { connected: true },
          archon: { connected: false }
        }}
        onClose={() => {}}
        onNextTab={() => {}}
        onPrevTab={() => {}}
        onSetTab={() => {}}
        onSelectNextSetting={() => {}}
        onSelectPrevSetting={() => {}}
        onActivateSetting={() => {}}
      />
    );

    expect(lastFrame()).toContain('MCP servers');
    expect(lastFrame()).toContain('context7');
    expect(lastFrame()).toContain('archon');
  });

  it('should show session ID when provided', () => {
    const { lastFrame } = render(
      <ConfigPanel
        activeTab="status"
        status={mockStatus}
        settings={mockSettings}
        usage={mockUsage}
        selectedSettingIndex={0}
        onClose={() => {}}
        onNextTab={() => {}}
        onPrevTab={() => {}}
        onSetTab={() => {}}
        onSelectNextSetting={() => {}}
        onSelectPrevSetting={() => {}}
        onActivateSetting={() => {}}
      />
    );

    expect(lastFrame()).toContain('Session ID');
    expect(lastFrame()).toContain('test-session-123');
  });

  it('should not show session ID when not provided', () => {
    const statusWithoutSession: ConfigStatus = {
      ...mockStatus,
      sessionId: undefined
    };

    const { lastFrame } = render(
      <ConfigPanel
        activeTab="status"
        status={statusWithoutSession}
        settings={mockSettings}
        usage={mockUsage}
        selectedSettingIndex={0}
        onClose={() => {}}
        onNextTab={() => {}}
        onPrevTab={() => {}}
        onSetTab={() => {}}
        onSelectNextSetting={() => {}}
        onSelectPrevSetting={() => {}}
        onActivateSetting={() => {}}
      />
    );

    expect(lastFrame()).not.toContain('Session ID');
  });

  it('should show thinking tokens', () => {
    const { lastFrame } = render(
      <ConfigPanel
        activeTab="status"
        status={mockStatus}
        settings={mockSettings}
        usage={mockUsage}
        selectedSettingIndex={0}
        onClose={() => {}}
        onNextTab={() => {}}
        onPrevTab={() => {}}
        onSetTab={() => {}}
        onSelectNextSetting={() => {}}
        onSelectPrevSetting={() => {}}
        onActivateSetting={() => {}}
      />
    );

    expect(lastFrame()).toContain('Thinking tokens');
    expect(lastFrame()).toContain('128,000');
  });

  it('should show verbose output setting as off', () => {
    const { lastFrame } = render(
      <ConfigPanel
        activeTab="config"
        status={mockStatus}
        settings={mockSettings}
        usage={mockUsage}
        selectedSettingIndex={0}
        onClose={() => {}}
        onNextTab={() => {}}
        onPrevTab={() => {}}
        onSetTab={() => {}}
        onSelectNextSetting={() => {}}
        onSelectPrevSetting={() => {}}
        onActivateSetting={() => {}}
      />
    );

    expect(lastFrame()).toContain('Verbose output');
    expect(lastFrame()).toContain('off');
  });

  it('should show permission mode', () => {
    const { lastFrame } = render(
      <ConfigPanel
        activeTab="config"
        status={mockStatus}
        settings={mockSettings}
        usage={mockUsage}
        selectedSettingIndex={0}
        onClose={() => {}}
        onNextTab={() => {}}
        onPrevTab={() => {}}
        onSetTab={() => {}}
        onSelectNextSetting={() => {}}
        onSelectPrevSetting={() => {}}
        onActivateSetting={() => {}}
      />
    );

    expect(lastFrame()).toContain('Permission mode');
    expect(lastFrame()).toContain('default');
  });
});

describe('useConfigPanel Hook', () => {
  it('should export from hooks index', async () => {
    const hooks = await import('../../src/ui/hooks/index.js');
    expect(typeof hooks.useConfigPanel).toBe('function');
  });
});

describe('ConfigPanel Export', () => {
  it('should export from components index', async () => {
    const components = await import('../../src/ui/components/index.js');
    expect(typeof components.ConfigPanel).toBe('function');
  });
});
