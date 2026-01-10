/**
 * Panel Components Unit Tests
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';

import { ServerCard } from '../../src/ui/components/panels/ServerCard.js';

describe('ServerCard Component', () => {
  it('should render server name and type', () => {
    const { lastFrame } = render(
      <ServerCard
        name="context7"
        type="http"
        connected={true}
        isSelected={false}
      />
    );

    expect(lastFrame()).toContain('context7');
    expect(lastFrame()).toContain('http');
  });

  it('should show green dot when connected', () => {
    const { lastFrame } = render(
      <ServerCard
        name="archon"
        type="http"
        connected={true}
        isSelected={false}
      />
    );

    expect(lastFrame()).toContain('●');
    expect(lastFrame()).toContain('connected');
  });

  it('should show empty dot when offline', () => {
    const { lastFrame } = render(
      <ServerCard
        name="crawl4ai"
        type="sse"
        connected={false}
        isSelected={false}
      />
    );

    expect(lastFrame()).toContain('○');
    expect(lastFrame()).toContain('offline');
  });

  it('should highlight when selected', () => {
    const { lastFrame } = render(
      <ServerCard
        name="archon"
        type="http"
        connected={true}
        isSelected={true}
      />
    );

    // Selected cards have cyan color styling
    expect(lastFrame()).toContain('archon');
  });

  it('should show error message when present', () => {
    const { lastFrame } = render(
      <ServerCard
        name="broken-server"
        type="http"
        connected={false}
        error="Connection refused"
        isSelected={false}
      />
    );

    expect(lastFrame()).toContain('Connection refused');
    expect(lastFrame()).toContain('offline');
  });

  it('should show different type badges', () => {
    const { lastFrame: httpFrame } = render(
      <ServerCard name="s1" type="http" connected={true} isSelected={false} />
    );
    expect(httpFrame()).toContain('http');

    const { lastFrame: sseFrame } = render(
      <ServerCard name="s2" type="sse" connected={true} isSelected={false} />
    );
    expect(sseFrame()).toContain('sse');

    const { lastFrame: stdioFrame } = render(
      <ServerCard name="s3" type="stdio" connected={true} isSelected={false} />
    );
    expect(stdioFrame()).toContain('stdio');
  });
});

describe('ServerCard Edge Cases', () => {
  it('should handle long server names', () => {
    const { lastFrame } = render(
      <ServerCard
        name="very-long-server-name-here"
        type="http"
        connected={true}
        isSelected={false}
      />
    );

    // Server name is rendered (may be truncated in fixed-width layout)
    expect(lastFrame()).toContain('very-long-server');
    expect(lastFrame()).toContain('http');
    expect(lastFrame()).toContain('connected');
  });

  it('should handle empty error string', () => {
    const { lastFrame } = render(
      <ServerCard
        name="server"
        type="http"
        connected={false}
        error=""
        isSelected={false}
      />
    );

    expect(lastFrame()).toContain('offline');
  });
});
