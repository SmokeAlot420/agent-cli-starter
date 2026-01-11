/**
 * Skills System
 *
 * Agent Skills are markdown files that teach Claude specialized capabilities.
 * They are automatically triggered based on task description matching.
 *
 * Skills can be stored in:
 * - ~/.claude/skills/ (personal/user skills)
 * - .claude/skills/ (project skills)
 * - Plugin skills (via plugin.json)
 *
 * Skill files have frontmatter metadata and markdown content.
 */
/**
 * Clear the skill cache
 * Call this when skills are modified externally
 */
export declare function clearSkillCache(): void;
/**
 * Skill definition
 */
export interface Skill {
    /** Skill name (unique identifier, lowercase with hyphens) */
    name: string;
    /** Description of when to use this skill (critical for triggering) */
    description: string;
    /** Source file path */
    source: string;
    /** Source type */
    sourceType: 'user' | 'project' | 'plugin';
    /** Raw markdown content (instructions) */
    content: string;
    /** Frontmatter metadata */
    metadata: SkillMetadata;
}
/**
 * Skill frontmatter metadata
 */
export interface SkillMetadata {
    /** Skill name */
    name?: string;
    /** Description of when to trigger (critical) */
    description?: string;
    /** Allowed tools for this skill */
    allowedTools?: string[];
    /** Model override for this skill */
    model?: string;
    /** Run in forked/separate context */
    context?: 'fork' | 'inherit';
    /** Whether skill can be invoked via slash command */
    userInvocable?: boolean;
    /** Hook definitions scoped to this skill */
    hooks?: SkillHooks;
    /** Additional custom metadata */
    [key: string]: unknown;
}
/**
 * Hooks that can be defined in a skill
 */
export interface SkillHooks {
    /** Pre-tool-use hooks */
    PreToolUse?: SkillHook[];
    /** Post-tool-use hooks */
    PostToolUse?: SkillHook[];
    /** Stop hook */
    Stop?: SkillHook[];
}
/**
 * Individual skill hook definition
 */
export interface SkillHook {
    /** Matcher for tool names */
    matcher?: string;
    /** Bash command to run */
    command?: string;
    /** Prompt for AI-based hook */
    prompt?: string;
}
/**
 * Skill match result from discovery
 */
export interface SkillMatch {
    /** The matched skill */
    skill: Skill;
    /** Match confidence score (0-1) */
    confidence: number;
    /** Reason for match */
    reason: string;
}
/**
 * Get default skill search paths
 */
export declare function getDefaultSkillPaths(): string[];
/**
 * Discover all skills in a directory
 */
export declare function discoverSkillsInDir(dirPath: string, sourceType: 'user' | 'project' | 'plugin'): Skill[];
/**
 * Discover all available skills
 *
 * Searches user and project directories for skill definitions.
 * Results are cached for performance.
 *
 * @param additionalPaths - Additional paths to search for skills
 * @returns Array of discovered skills
 */
export declare function discoverAllSkills(additionalPaths?: string[]): Skill[];
/**
 * Get a specific skill by name
 */
export declare function getSkill(name: string, skills?: Skill[]): Skill | null;
/**
 * Find skills that match a task description
 *
 * Uses keyword matching and description analysis to find relevant skills.
 *
 * @param taskDescription - The user's task or request
 * @param skills - Skills to search (defaults to all discovered skills)
 * @returns Array of matching skills with confidence scores
 */
export declare function findMatchingSkills(taskDescription: string, skills?: Skill[]): SkillMatch[];
/**
 * Get user-invocable skills (for slash command menu)
 */
export declare function getUserInvocableSkills(skills?: Skill[]): Skill[];
/**
 * Format skills for display
 */
export declare function formatSkillList(skills: Skill[]): string;
/**
 * Build skill context for agent system prompt
 *
 * This generates the context that tells the agent about available skills.
 */
export declare function buildSkillContext(skills: Skill[]): string;
/**
 * Expand a skill's content for use in a prompt
 *
 * Handles:
 * - @file references (include file contents)
 * - !command references (include command output)
 * - Variable substitution
 */
export declare function expandSkillContent(skill: Skill, variables?: Record<string, string>): string;
//# sourceMappingURL=skills.d.ts.map