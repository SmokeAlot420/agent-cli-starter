/**
 * ConversationalAgent Unit Tests
 */

import { describe, it, expect } from 'vitest';
import {
  ConversationalAgent,
  type McpServerConfig,
  type PermissionMode
} from '../src/conversation.js';

describe('ConversationalAgent', () => {
  describe('Initialization', () => {
    it('should create with default options', () => {
      const agent = new ConversationalAgent();
      const options = agent.getOptions();

      expect(options.workingDirectory).toBeDefined();
      expect(options.verbose).toBe(false);
      expect(options.maxTurns).toBe(50);
    });

    it('should accept custom core options', () => {
      const agent = new ConversationalAgent({
        verbose: true,
        maxTurns: 100,
        workingDirectory: '/test/dir'
      });
      const options = agent.getOptions();

      expect(options.verbose).toBe(true);
      expect(options.maxTurns).toBe(100);
      expect(options.workingDirectory).toBe('/test/dir');
    });

    it('should accept model options', () => {
      const agent = new ConversationalAgent({
        model: 'claude-sonnet-4-20250514',
        maxThinkingTokens: 64000,
        maxBudgetUsd: 10.0
      });
      const options = agent.getOptions();

      expect(options.model).toBe('claude-sonnet-4-20250514');
      expect(options.maxThinkingTokens).toBe(64000);
      expect(options.maxBudgetUsd).toBe(10.0);
    });

    it('should accept permission mode', () => {
      const agent = new ConversationalAgent({
        permissionMode: 'acceptEdits'
      });

      expect(agent.getOptions().permissionMode).toBe('acceptEdits');
    });

    it('should accept tool whitelist/blacklist', () => {
      const agent = new ConversationalAgent({
        allowedTools: ['Read', 'Write', 'Bash'],
        disallowedTools: ['WebFetch']
      });
      const options = agent.getOptions();

      expect(options.allowedTools).toEqual(['Read', 'Write', 'Bash']);
      expect(options.disallowedTools).toEqual(['WebFetch']);
    });

    it('should accept MCP server configuration', () => {
      const mcpServers: Record<string, McpServerConfig> = {
        myServer: { command: 'npx', args: ['-y', 'my-mcp-server'] }
      };

      const agent = new ConversationalAgent({ mcpServers });

      expect(agent.getOptions().mcpServers).toEqual(mcpServers);
    });

    it('should accept session management options', () => {
      const agent = new ConversationalAgent({
        resume: 'session-123',
        continue: true
      });
      const options = agent.getOptions();

      expect(options.resume).toBe('session-123');
      expect(options.continue).toBe(true);
    });

    it('should accept sandbox configuration', () => {
      const agent = new ConversationalAgent({
        sandbox: { enabled: true, autoAllowBashIfSandboxed: true }
      });

      expect(agent.getOptions().sandbox).toEqual({
        enabled: true,
        autoAllowBashIfSandboxed: true
      });
    });

    it('should accept environment variables', () => {
      const agent = new ConversationalAgent({
        env: { MY_VAR: 'value', OTHER_VAR: 'other' }
      });

      expect(agent.getOptions().env).toEqual({
        MY_VAR: 'value',
        OTHER_VAR: 'other'
      });
    });

    it('should accept setting sources', () => {
      const agent = new ConversationalAgent({
        settingSources: ['project', 'user']
      });

      expect(agent.getOptions().settingSources).toEqual(['project', 'user']);
    });

    it('should accept PIV personality toggle', () => {
      const agent = new ConversationalAgent({
        disablePIVPersonality: true
      });

      expect(agent.getOptions().disablePIVPersonality).toBe(true);
    });
  });

  describe('MCP Server Management', () => {
    it('should add MCP server', () => {
      const agent = new ConversationalAgent();

      agent.addMcpServer('test', { command: 'test-cmd' });

      expect(agent.getOptions().mcpServers?.['test']).toBeDefined();
      expect(agent.getOptions().mcpServers?.['test'].command).toBe('test-cmd');
    });

    it('should add multiple MCP servers', () => {
      const agent = new ConversationalAgent();

      agent.addMcpServer('server1', { command: 'cmd1' });
      agent.addMcpServer('server2', { command: 'cmd2', args: ['--flag'] });

      const servers = agent.getOptions().mcpServers;
      expect(servers?.['server1']).toBeDefined();
      expect(servers?.['server2']).toBeDefined();
      expect(servers?.['server2'].args).toEqual(['--flag']);
    });

    it('should remove MCP server', () => {
      const agent = new ConversationalAgent({
        mcpServers: { test: { command: 'cmd' } }
      });

      agent.removeMcpServer('test');

      expect(agent.getOptions().mcpServers?.['test']).toBeUndefined();
    });

    it('should handle removing non-existent server gracefully', () => {
      const agent = new ConversationalAgent();

      // Should not throw
      expect(() => agent.removeMcpServer('nonexistent')).not.toThrow();
    });

    it('should support HTTP MCP servers', () => {
      const agent = new ConversationalAgent();

      agent.addMcpServer('http-server', {
        type: 'http',
        url: 'https://mcp.example.com',
        headers: { 'Authorization': 'Bearer token' }
      });

      const server = agent.getOptions().mcpServers?.['http-server'];
      expect(server?.type).toBe('http');
      expect((server as any).url).toBe('https://mcp.example.com');
    });

    it('should support SSE MCP servers', () => {
      const agent = new ConversationalAgent();

      agent.addMcpServer('sse-server', {
        type: 'sse',
        url: 'https://sse.example.com/events'
      });

      const server = agent.getOptions().mcpServers?.['sse-server'];
      expect(server?.type).toBe('sse');
    });
  });

  describe('Custom Agents', () => {
    it('should add custom agent', () => {
      const agent = new ConversationalAgent();

      agent.addAgent('myAgent', {
        description: 'Test agent for specific tasks',
        prompt: 'You are a test agent'
      });

      const customAgent = agent.getOptions().agents?.['myAgent'];
      expect(customAgent).toBeDefined();
      expect(customAgent?.description).toBe('Test agent for specific tasks');
      expect(customAgent?.prompt).toBe('You are a test agent');
    });

    it('should add agent with tools and model', () => {
      const agent = new ConversationalAgent();

      agent.addAgent('restrictedAgent', {
        description: 'Limited tool access',
        tools: ['Read', 'Grep'],
        model: 'sonnet'
      });

      const customAgent = agent.getOptions().agents?.['restrictedAgent'];
      expect(customAgent?.tools).toEqual(['Read', 'Grep']);
      expect(customAgent?.model).toBe('sonnet');
    });

    it('should add multiple agents', () => {
      const agent = new ConversationalAgent();

      agent.addAgent('agent1', { description: 'First' });
      agent.addAgent('agent2', { description: 'Second' });

      expect(agent.getOptions().agents?.['agent1']).toBeDefined();
      expect(agent.getOptions().agents?.['agent2']).toBeDefined();
    });
  });

  describe('Options Update', () => {
    it('should update single option', () => {
      const agent = new ConversationalAgent({ verbose: false });

      agent.updateOptions({ verbose: true });

      expect(agent.getOptions().verbose).toBe(true);
    });

    it('should update multiple options', () => {
      const agent = new ConversationalAgent({
        verbose: false,
        maxTurns: 50
      });

      agent.updateOptions({
        verbose: true,
        maxTurns: 100,
        model: 'claude-sonnet-4-20250514'
      });

      const options = agent.getOptions();
      expect(options.verbose).toBe(true);
      expect(options.maxTurns).toBe(100);
      expect(options.model).toBe('claude-sonnet-4-20250514');
    });

    it('should preserve existing options when updating', () => {
      const agent = new ConversationalAgent({
        verbose: true,
        maxTurns: 100,
        model: 'opus'
      });

      agent.updateOptions({ maxTurns: 200 });

      expect(agent.getOptions().verbose).toBe(true); // Preserved
      expect(agent.getOptions().model).toBe('opus'); // Preserved
      expect(agent.getOptions().maxTurns).toBe(200); // Updated
    });
  });

  describe('State Management', () => {
    it('should track processing state', () => {
      const agent = new ConversationalAgent();

      expect(agent.isProcessing()).toBe(false);
    });

    it('should return empty history initially', () => {
      const agent = new ConversationalAgent();

      expect(agent.getHistory()).toEqual([]);
    });

    it('should clear history', () => {
      const agent = new ConversationalAgent();

      agent.clearHistory();

      expect(agent.getHistory()).toEqual([]);
    });

    it('should close cleanly', () => {
      const agent = new ConversationalAgent();

      // Should not throw
      expect(() => agent.close()).not.toThrow();
      expect(agent.isProcessing()).toBe(false);
    });
  });
});
