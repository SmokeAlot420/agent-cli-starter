/**
 * UI Components Unit Tests
 */

import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from 'ink-testing-library';

import { Header } from '../../src/ui/components/Header.js';
import { StatusBar } from '../../src/ui/components/StatusBar.js';
import { ThinkingIndicator } from '../../src/ui/components/ThinkingIndicator.js';
import { MessageStream } from '../../src/ui/components/MessageStream.js';
import { ToolCard } from '../../src/ui/components/ToolCard.js';
import { UltrathinkText } from '../../src/ui/components/UltrathinkText.js';
import { ColorizedTextInput } from '../../src/ui/components/ColorizedTextInput.js';

describe('Header Component', () => {
  it('should render with cwd and mode', () => {
    const { lastFrame } = render(
      <Header cwd="/test/path" mode="interactive" verbose={false} />
    );

    // Uses BRANDING.productName from src/branding.ts
    expect(lastFrame()).toContain('Fork Brand Ship');
    expect(lastFrame()).toContain('/test/path');
    expect(lastFrame()).toContain('Interactive');
  });

  it('should show verbose indicator when enabled', () => {
    const { lastFrame } = render(
      <Header cwd="/test" mode="interactive" verbose={true} />
    );

    expect(lastFrame()).toContain('Verbose');
  });

  it('should show oneshot mode correctly', () => {
    const { lastFrame } = render(
      <Header cwd="/test" mode="oneshot" verbose={false} />
    );

    expect(lastFrame()).toContain('One-shot');
  });
});

describe('StatusBar Component', () => {
  it('should render context usage', () => {
    const { lastFrame } = render(
      <StatusBar contextUsage={45} thinkingState="idle" permissionMode="acceptEdits" />
    );

    expect(lastFrame()).toContain('45%');
    expect(lastFrame()).toContain('Ready');
  });

  it('should show thinking state', () => {
    const { lastFrame } = render(
      <StatusBar contextUsage={30} thinkingState="thinking" permissionMode="acceptEdits" />
    );

    expect(lastFrame()).toContain('Thinking');
  });

  it('should show tool_use state', () => {
    const { lastFrame } = render(
      <StatusBar contextUsage={60} thinkingState="tool_use" permissionMode="acceptEdits" />
    );

    expect(lastFrame()).toContain('Using tools');
  });
});

describe('ThinkingIndicator Component', () => {
  it('should return null when not active', () => {
    const { lastFrame } = render(
      <ThinkingIndicator active={false} elapsed={0} />
    );

    expect(lastFrame()).toBe('');
  });

  it('should show thinking message when active', () => {
    const { lastFrame } = render(
      <ThinkingIndicator active={true} elapsed={5} />
    );

    expect(lastFrame()).toContain('Thinking');
    expect(lastFrame()).toContain('5s');
  });

  it('should show tool name when provided', () => {
    const { lastFrame } = render(
      <ThinkingIndicator active={true} tool="Read" elapsed={3} />
    );

    expect(lastFrame()).toContain('Using Read');
  });
});

describe('MessageStream Component', () => {
  it('should render text messages', () => {
    const messages = [
      { type: 'text' as const, content: 'Hello world' }
    ];

    const { lastFrame } = render(
      <MessageStream messages={messages} streaming={false} />
    );

    expect(lastFrame()).toContain('Hello world');
  });

  it('should show waiting message when streaming with no messages', () => {
    const { lastFrame } = render(
      <MessageStream messages={[]} streaming={true} />
    );

    expect(lastFrame()).toContain('Waiting for response');
  });

  it('should render error messages', () => {
    const messages = [
      { type: 'error' as const, content: 'Something went wrong' }
    ];

    const { lastFrame } = render(
      <MessageStream messages={messages} streaming={false} />
    );

    expect(lastFrame()).toContain('Error');
    expect(lastFrame()).toContain('Something went wrong');
  });
});

describe('ToolCard Component', () => {
  it('should render tool name', () => {
    const { lastFrame } = render(
      <ToolCard tool="Read" input={{ path: '/test' }} verbose={false} />
    );

    expect(lastFrame()).toContain('Read');
  });

  it('should show input in verbose mode', () => {
    const { lastFrame } = render(
      <ToolCard tool="Write" input={{ path: '/test', content: 'hello' }} verbose={true} />
    );

    expect(lastFrame()).toContain('Write');
    expect(lastFrame()).toContain('path');
  });

  it('should hide input in non-verbose mode', () => {
    const { lastFrame } = render(
      <ToolCard tool="Bash" input={{ command: 'ls' }} verbose={false} />
    );

    expect(lastFrame()).toContain('Bash');
    expect(lastFrame()).not.toContain('command');
  });

  it('should show elapsed time when provided', () => {
    const { lastFrame } = render(
      <ToolCard tool="Grep" input={{}} verbose={false} elapsed={12} />
    );

    expect(lastFrame()).toContain('12s');
  });
});

describe('UltrathinkText Component', () => {
  it('should render ULTRATHINK text', () => {
    const { lastFrame } = render(<UltrathinkText />);

    expect(lastFrame()).toContain('U');
    expect(lastFrame()).toContain('L');
    expect(lastFrame()).toContain('T');
    expect(lastFrame()).toContain('R');
    expect(lastFrame()).toContain('A');
    expect(lastFrame()).toContain('H');
    expect(lastFrame()).toContain('I');
    expect(lastFrame()).toContain('N');
    expect(lastFrame()).toContain('K');
  });

  it('should render with bold when specified', () => {
    const { lastFrame } = render(<UltrathinkText bold />);

    // Bold rendering is applied - content should still be present
    expect(lastFrame()).toBeTruthy();
  });

  it('should export from components index', async () => {
    const components = await import('../../src/ui/components/index.js');
    expect(typeof components.UltrathinkText).toBe('function');
  });
});

describe('MessageStream with Ultrathink Prefix', () => {
  it('should render ultrathink prefix with gradient', () => {
    const messages = [
      { type: 'text' as const, content: 'ultrathink: Test message' }
    ];

    const { lastFrame } = render(
      <MessageStream messages={messages} streaming={false} />
    );

    // Should contain ULTRATHINK letters and the rest of message
    expect(lastFrame()).toContain('U');
    expect(lastFrame()).toContain('K');
    expect(lastFrame()).toContain('Test message');
  });

  it('should handle uppercase ULTRATHINK prefix', () => {
    const messages = [
      { type: 'text' as const, content: 'ULTRATHINK: Uppercase test' }
    ];

    const { lastFrame } = render(
      <MessageStream messages={messages} streaming={false} />
    );

    expect(lastFrame()).toContain('Uppercase test');
  });

  it('should handle mixed case UltraThink prefix', () => {
    const messages = [
      { type: 'text' as const, content: 'UltraThink: Mixed case test' }
    ];

    const { lastFrame } = render(
      <MessageStream messages={messages} streaming={false} />
    );

    expect(lastFrame()).toContain('Mixed case test');
  });

  it('should render normal text without ultrathink prefix', () => {
    const messages = [
      { type: 'text' as const, content: 'Normal message without prefix' }
    ];

    const { lastFrame } = render(
      <MessageStream messages={messages} streaming={false} />
    );

    expect(lastFrame()).toContain('Normal message without prefix');
  });
});

describe('ColorizedTextInput Component', () => {
  it('should render basic text input', () => {
    const { lastFrame } = render(
      <ColorizedTextInput value="hello" onChange={() => {}} />
    );

    expect(lastFrame()).toContain('h');
    expect(lastFrame()).toContain('e');
    expect(lastFrame()).toContain('l');
    expect(lastFrame()).toContain('o');
  });

  it('should render placeholder when empty', () => {
    const { lastFrame } = render(
      <ColorizedTextInput value="" placeholder="Type here..." onChange={() => {}} />
    );

    expect(lastFrame()).toContain('Type here');
  });

  it('should colorize ultrathink prefix (lowercase, no colon needed)', () => {
    const { lastFrame } = render(
      <ColorizedTextInput value="ultrathink test" onChange={() => {}} />
    );

    // Should contain the text (colors are ANSI codes in output)
    expect(lastFrame()).toContain('u');
    expect(lastFrame()).toContain('l');
    expect(lastFrame()).toContain('t');
    expect(lastFrame()).toContain('r');
    expect(lastFrame()).toContain('a');
    expect(lastFrame()).toContain('test');
  });

  it('should colorize ULTRATHINK prefix (uppercase)', () => {
    const { lastFrame } = render(
      <ColorizedTextInput value="ULTRATHINK test" onChange={() => {}} />
    );

    expect(lastFrame()).toContain('U');
    expect(lastFrame()).toContain('L');
    expect(lastFrame()).toContain('T');
    expect(lastFrame()).toContain('test');
  });

  it('should colorize UltraThink prefix (mixed case)', () => {
    const { lastFrame } = render(
      <ColorizedTextInput value="UltraThink mixed" onChange={() => {}} />
    );

    expect(lastFrame()).toContain('U');
    expect(lastFrame()).toContain('l');
    expect(lastFrame()).toContain('mixed');
  });

  it('should not colorize regular text', () => {
    const { lastFrame } = render(
      <ColorizedTextInput value="normal text" onChange={() => {}} />
    );

    expect(lastFrame()).toContain('normal text');
  });

  it('should export from components index', async () => {
    const components = await import('../../src/ui/components/index.js');
    expect(typeof components.ColorizedTextInput).toBe('function');
  });
});
