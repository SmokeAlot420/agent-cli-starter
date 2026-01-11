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
export declare const BRANDING: BrandingConfig;
export declare const productName: string, tagline: string, subtitle: string, logo: string, logoColor: string, promptPrefix: string, systemPrompt: string, defaultMcpServers: McpServersConfig, cloudMcpServers: McpServersConfig;
//# sourceMappingURL=branding.d.ts.map