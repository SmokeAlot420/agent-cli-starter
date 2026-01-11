/**
 * Query Builder Module
 *
 * Constructs query options for the Claude Agent SDK.
 */
import type { McpServersConfig } from '../features/mcp.js';
import type { CanUseToolCallback } from './types.js';
/**
 * Options for building a query
 */
export interface QueryBuildOptions {
    model: string;
    maxTurns: number;
    workingDirectory: string;
    thinkingTokens: number;
    permissionMode: string;
    isPlanMode: boolean;
    systemPromptAppend: string;
    mcpServers: McpServersConfig;
    allowedTools?: string[];
    disallowedTools?: string[];
    fallbackModel?: string;
    maxBudgetUsd?: number;
    settingSources?: string[];
    agents?: Record<string, unknown>;
    hooks?: unknown;
    env?: Record<string, string>;
    additionalDirectories?: string[];
    sandbox?: unknown;
    resume?: string;
    forkSession?: boolean;
    continue?: boolean;
    outputFormat?: {
        type: 'json_schema';
        schema: Record<string, unknown>;
    };
    includePartialMessages?: boolean;
    enableFileCheckpointing?: boolean;
    /** Custom permission handler for interactive tool approval */
    canUseTool?: CanUseToolCallback;
}
/**
 * Build query options for the Claude Agent SDK
 */
export declare function buildQueryOptions(options: QueryBuildOptions): Record<string, unknown>;
//# sourceMappingURL=query-builder.d.ts.map