/**
 * Branding Configuration
 *
 * Customize your CLI agent here. All branding is centralized in this file.
 *
 * To customize:
 * 1. Change productName to your agent's name
 * 2. Update the ASCII logo
 * 3. Modify the systemPrompt for your agent's personality
 * 4. Configure your default MCP servers
 */

import type { McpServersConfig } from './features/mcp.js';

export interface BrandingConfig {
  /** Product name shown in header and help */
  productName: string;
  /** Short tagline shown after product name */
  tagline: string;
  /** Subtitle shown below header */
  subtitle: string;
  /** ASCII art logo */
  logo: string;
  /** Color for logo and branding elements */
  logoColor: string;
  /** Prompt prefix (what shows before user input) */
  promptPrefix: string;
  /** System prompt appended to Claude's base prompt */
  systemPrompt: string;
  /** Default MCP servers to include */
  defaultMcpServers: McpServersConfig;
  /** Cloud-only MCP servers (no localhost) */
  cloudMcpServers: McpServersConfig;
}

/**
 * Default branding - customize this for your agent!
 */
export const BRANDING: BrandingConfig = {
  productName: 'My Agent',

  tagline: 'Your AI Assistant',

  subtitle: 'Claude Agent SDK | Full Claude Code Power',

  logo: `
 ██╗ ██╗    ██╗   ██╗
████████╗   ╚██╗ ██╔╝
╚██╔═██╔╝    ╚████╔╝
████████╗     ╚██╔╝
╚██╔═██╔╝      ██║
 ╚═╝ ╚═╝       ╚═╝`,

  logoColor: 'cyan',

  promptPrefix: 'agent',

  systemPrompt: `
## Your Identity

You are a helpful AI assistant powered by Claude.

## Personality

- **Friendly and professional** - Communicate clearly and helpfully
- **Proactive** - Anticipate user needs and offer suggestions
- **Transparent** - Explain what you're doing and why

## Capabilities

You have full Claude Code capabilities:
- Read, write, and edit files
- Run bash commands
- Search with Glob and Grep
- Web search and fetch
- MCP server integrations
- Extended thinking (128K tokens)

## Guidelines

- Always read existing code before making changes
- Validate your work (run tests, type checks)
- Keep the user informed of your progress
`,

  defaultMcpServers: {
    // Add your default MCP servers here
    // Example:
    // 'my-server': {
    //   type: 'stdio',
    //   command: 'npx',
    //   args: ['-y', 'my-mcp-server']
    // }
  },

  cloudMcpServers: {
    // Add cloud-only MCP servers here (no localhost)
    context7: {
      type: 'http',
      url: 'https://mcp.context7.com/mcp'
    }
  }
};

// Export individual values for easy importing
export const {
  productName,
  tagline,
  subtitle,
  logo,
  logoColor,
  promptPrefix,
  systemPrompt,
  defaultMcpServers,
  cloudMcpServers
} = BRANDING;
