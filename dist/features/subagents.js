/**
 * Subagents System
 *
 * Subagents are specialized AI assistants with their own context windows.
 * They can be configured with custom system prompts and tool access.
 *
 * Subagents can be stored in:
 * - ~/.claude/agents/ (personal/user subagents)
 * - .claude/agents/ (project subagents)
 * - Plugin subagents (via plugin.json)
 *
 * Subagent files are markdown with YAML frontmatter.
 */
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, basename, extname } from 'path';
import { homedir } from 'os';
import matter from 'gray-matter';
import { SUBAGENT_CACHE_TTL } from '../constants.js';
/** Cached subagents with timestamp */
let subagentCache = null;
/**
 * Clear the subagent cache
 */
export function clearSubagentCache() {
    subagentCache = null;
}
/**
 * Built-in subagent definitions
 */
export const BUILTIN_SUBAGENTS = {
    'general-purpose': {
        name: 'general-purpose',
        description: 'General-purpose agent for complex multi-step tasks with reading and writing capabilities',
        systemPrompt: `You are a general-purpose assistant capable of handling complex, multi-step tasks.
You have access to all tools and can read, write, and execute code as needed.
Be thorough and systematic in your approach.`,
        metadata: {
            description: 'General-purpose agent for complex multi-step tasks',
            model: 'inherit'
        }
    },
    'Explore': {
        name: 'Explore',
        description: 'Fast, read-only agent specialized for codebase exploration using Glob, Grep, and Read tools',
        systemPrompt: `You are a codebase exploration specialist. Your job is to quickly find and analyze code.
You have READ-ONLY access to the codebase. Use Glob to find files by pattern, Grep to search content, and Read to examine files.
Be efficient and thorough in your exploration. Report findings clearly and concisely.`,
        metadata: {
            description: 'Fast codebase exploration with read-only access',
            tools: ['Glob', 'Grep', 'Read'],
            model: 'haiku'
        }
    },
    'Plan': {
        name: 'Plan',
        description: 'Software architect agent specialized for designing implementation plans',
        systemPrompt: `You are a software architect specializing in implementation planning.
Your job is to design clear, actionable implementation plans.
Consider:
- Architecture and design patterns
- Critical files and components
- Trade-offs and alternatives
- Testing strategy
- Potential issues and mitigations

Provide step-by-step plans that are detailed enough to implement but not overly prescriptive.`,
        metadata: {
            description: 'Software architect for implementation planning',
            permissionMode: 'plan',
            model: 'inherit'
        }
    }
};
/**
 * Get default subagent search paths
 */
export function getDefaultSubagentPaths() {
    const paths = [];
    // User subagents (~/.claude/agents/)
    const userPath = join(homedir(), '.claude', 'agents');
    if (existsSync(userPath)) {
        paths.push(userPath);
    }
    // Project subagents (./.claude/agents/)
    const projectPath = join(process.cwd(), '.claude', 'agents');
    if (existsSync(projectPath)) {
        paths.push(projectPath);
    }
    return paths;
}
/**
 * Discover subagents in a directory
 */
export function discoverSubagentsInDir(dirPath, sourceType) {
    const subagents = [];
    if (!existsSync(dirPath)) {
        return subagents;
    }
    try {
        const files = readdirSync(dirPath, { withFileTypes: true });
        for (const file of files) {
            if (file.isFile() && extname(file.name) === '.md') {
                const filePath = join(dirPath, file.name);
                const content = readFileSync(filePath, 'utf-8');
                // Parse frontmatter
                const { data, content: body } = matter(content);
                // Require at minimum a description
                if (data.description || data.name) {
                    const name = data.name || basename(file.name, '.md').toLowerCase().replace(/\s+/g, '-');
                    const metadata = {
                        name: data.name,
                        description: data.description,
                        tools: parseToolsList(data.tools),
                        model: data.model,
                        permissionMode: data['permission-mode'] || data.permissionMode,
                        skills: parseToolsList(data.skills),
                        maxTurns: data['max-turns'] || data.maxTurns
                    };
                    subagents.push({
                        name,
                        description: metadata.description || `Custom agent: ${name}`,
                        source: filePath,
                        sourceType,
                        systemPrompt: body.trim(),
                        metadata
                    });
                }
            }
        }
    }
    catch (error) {
        console.warn(`Failed to discover subagents in ${dirPath}:`, error);
    }
    return subagents;
}
/**
 * Parse tools list from frontmatter (can be string or array)
 */
function parseToolsList(value) {
    if (!value)
        return undefined;
    if (Array.isArray(value))
        return value.map(String);
    if (typeof value === 'string') {
        return value.split(',').map(s => s.trim()).filter(Boolean);
    }
    return undefined;
}
/**
 * Discover all available subagents
 *
 * Includes built-in subagents plus user and project definitions.
 *
 * @param additionalPaths - Additional paths to search
 * @returns Array of discovered subagents
 */
export function discoverAllSubagents(additionalPaths = []) {
    // Check cache validity
    const cacheKey = additionalPaths.sort().join(':');
    if (subagentCache &&
        subagentCache.paths.join(':') === cacheKey &&
        Date.now() - subagentCache.timestamp < SUBAGENT_CACHE_TTL) {
        return [...subagentCache.subagents];
    }
    const subagents = [];
    const seenNames = new Set();
    // Add built-in subagents first
    for (const [name, builtin] of Object.entries(BUILTIN_SUBAGENTS)) {
        subagents.push({
            ...builtin,
            source: 'builtin',
            sourceType: 'builtin'
        });
        seenNames.add(name);
    }
    // Get default paths
    const userPath = join(homedir(), '.claude', 'agents');
    const defaultPaths = getDefaultSubagentPaths();
    const allPaths = [...defaultPaths, ...additionalPaths];
    for (const path of allPaths) {
        // Determine source type
        const normalizedPath = path.replace(/\\/g, '/').toLowerCase();
        const normalizedUser = userPath.replace(/\\/g, '/').toLowerCase();
        const sourceType = normalizedPath.startsWith(normalizedUser) ? 'user' : 'project';
        const pathSubagents = discoverSubagentsInDir(path, sourceType);
        for (const subagent of pathSubagents) {
            // Later paths override earlier ones with same name
            if (seenNames.has(subagent.name)) {
                const idx = subagents.findIndex(s => s.name === subagent.name);
                if (idx >= 0) {
                    subagents.splice(idx, 1);
                }
            }
            subagents.push(subagent);
            seenNames.add(subagent.name);
        }
    }
    // Update cache
    subagentCache = {
        subagents: [...subagents],
        timestamp: Date.now(),
        paths: additionalPaths.sort()
    };
    return subagents;
}
/**
 * Get a specific subagent by name
 */
export function getSubagent(name, subagents) {
    const all = subagents || discoverAllSubagents();
    return all.find(s => s.name === name || s.name.toLowerCase() === name.toLowerCase()) || null;
}
/**
 * Format subagents for display
 */
export function formatSubagentList(subagents) {
    if (subagents.length === 0) {
        return 'No subagents found.\n\nCreate subagents in:\n  ~/.claude/agents/ (personal)\n  .claude/agents/ (project)';
    }
    const lines = ['Available Subagents:', ''];
    // Group by source type
    const groups = {
        builtin: [],
        user: [],
        project: [],
        plugin: []
    };
    for (const subagent of subagents) {
        groups[subagent.sourceType].push(subagent);
    }
    for (const [type, typeSubagents] of Object.entries(groups)) {
        if (typeSubagents.length > 0) {
            lines.push(`  ${type.charAt(0).toUpperCase() + type.slice(1)}:`);
            for (const subagent of typeSubagents.sort((a, b) => a.name.localeCompare(b.name))) {
                const model = subagent.metadata.model ? ` [${subagent.metadata.model}]` : '';
                lines.push(`    ${subagent.name}${model}`);
                lines.push(`      ${subagent.description.slice(0, 60)}${subagent.description.length > 60 ? '...' : ''}`);
            }
            lines.push('');
        }
    }
    return lines.join('\n');
}
/**
 * Build subagent context for main agent system prompt
 */
export function buildSubagentContext(subagents) {
    if (subagents.length === 0) {
        return '';
    }
    const lines = [
        '# Available Subagents',
        '',
        'You can delegate tasks to specialized subagents using the Task tool:',
        ''
    ];
    for (const subagent of subagents) {
        const tools = subagent.metadata.tools?.join(', ') || 'all';
        lines.push(`- **${subagent.name}**: ${subagent.description} (tools: ${tools})`);
    }
    lines.push('');
    lines.push('Use subagents for specialized tasks that benefit from focused context.');
    return lines.join('\n');
}
/**
 * Resolve model alias to actual model name
 */
export function resolveSubagentModel(model, defaultModel) {
    if (!model || model === 'inherit') {
        return defaultModel;
    }
    // Map aliases to actual model names
    const modelAliases = {
        'sonnet': 'claude-sonnet-4-20250514',
        'opus': 'claude-opus-4-5-20251101',
        'haiku': 'claude-haiku-3-5-20250120'
    };
    return modelAliases[model.toLowerCase()] || model;
}
//# sourceMappingURL=subagents.js.map