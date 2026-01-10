/**
 * CLI Unit Tests
 *
 * Note: parseArgs is internal to cli.ts. These tests verify CLI behavior
 * through the build artifacts and exported types.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';
import { resolve } from 'path';

const CLI_PATH = resolve(__dirname, '../dist/cli.js');

describe('CLI', () => {
  describe('Help Output', () => {
    it('should display help with --help', () => {
      const output = execSync(`node "${CLI_PATH}" --help`, {
        encoding: 'utf-8'
      });

      // Uses BRANDING from src/branding.ts
      expect(output).toContain('Fork Brand Ship');
      expect(output).toContain('Make It Yours');
    });

    it('should display help with -h', () => {
      const output = execSync(`node "${CLI_PATH}" -h`, {
        encoding: 'utf-8'
      });

      expect(output).toContain('USAGE:');
    });

    it('should show model options in help', () => {
      const output = execSync(`node "${CLI_PATH}" --help`, {
        encoding: 'utf-8'
      });

      expect(output).toContain('MODEL OPTIONS:');
      expect(output).toContain('--model');
      expect(output).toContain('--max-thinking');
      expect(output).toContain('--max-budget');
    });

    it('should show permission options in help', () => {
      const output = execSync(`node "${CLI_PATH}" --help`, {
        encoding: 'utf-8'
      });

      expect(output).toContain('PERMISSION OPTIONS:');
      expect(output).toContain('--permission');
      expect(output).toContain('--allow-tools');
      expect(output).toContain('--disallow-tools');
    });

    it('should show MCP options in help', () => {
      const output = execSync(`node "${CLI_PATH}" --help`, {
        encoding: 'utf-8'
      });

      expect(output).toContain('MCP OPTIONS:');
      expect(output).toContain('--mcp');
    });

    it('should show session options in help', () => {
      const output = execSync(`node "${CLI_PATH}" --help`, {
        encoding: 'utf-8'
      });

      expect(output).toContain('SESSION OPTIONS:');
      expect(output).toContain('--resume');
      expect(output).toContain('--continue');
    });

    it('should show sandbox options in help', () => {
      const output = execSync(`node "${CLI_PATH}" --help`, {
        encoding: 'utf-8'
      });

      expect(output).toContain('SANDBOX OPTIONS:');
      expect(output).toContain('--sandbox');
    });

    it('should show advanced options in help', () => {
      const output = execSync(`node "${CLI_PATH}" --help`, {
        encoding: 'utf-8'
      });

      expect(output).toContain('ADVANCED OPTIONS:');
      expect(output).toContain('--setting-sources');
      expect(output).toContain('--no-personality');
      expect(output).toContain('--env');
    });
  });

  describe('Version Output', () => {
    it('should display version with --version', () => {
      const output = execSync(`node "${CLI_PATH}" --version`, {
        encoding: 'utf-8'
      });

      expect(output).toContain('claude-cli-template');
      expect(output).toContain('v1.0.0');
    });

    it('should display version with -v', () => {
      const output = execSync(`node "${CLI_PATH}" -v`, {
        encoding: 'utf-8'
      });

      expect(output).toContain('1.0.0');
    });
  });

  describe('Examples in Help', () => {
    it('should show usage examples', () => {
      const output = execSync(`node "${CLI_PATH}" --help`, {
        encoding: 'utf-8'
      });

      expect(output).toContain('EXAMPLES:');
      expect(output).toContain('agent');
      expect(output).toContain('--model');
      expect(output).toContain('--permission acceptEdits');
      expect(output).toContain('--sandbox');
    });
  });

  describe('Capabilities in Help', () => {
    it('should list capabilities', () => {
      const output = execSync(`node "${CLI_PATH}" --help`, {
        encoding: 'utf-8'
      });

      expect(output).toContain('CAPABILITIES:');
      expect(output).toContain('MCP server integration');
      expect(output).toContain('Hooks and sandbox support');
      expect(output).toContain('Extended thinking');
    });
  });
});
