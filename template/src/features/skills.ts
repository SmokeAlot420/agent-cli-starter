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

import { existsSync, readdirSync, readFileSync } from 'fs';
import { join, basename, extname } from 'path';
import { homedir } from 'os';
import matter from 'gray-matter';
import { SKILL_CACHE_TTL } from '../constants.js';

/**
 * Skill cache structure
 */
interface SkillCache {
  /** Discovered skills */
  skills: Skill[];
  /** Cache creation timestamp */
  timestamp: number;
  /** Paths that were searched */
  paths: string[];
}

/** Cached skills with timestamp */
let skillCache: SkillCache | null = null;

/**
 * Clear the skill cache
 * Call this when skills are modified externally
 */
export function clearSkillCache(): void {
  skillCache = null;
}

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
export function getDefaultSkillPaths(): string[] {
  const paths: string[] = [];

  // User skills (~/.claude/skills/)
  const userPath = join(homedir(), '.claude', 'skills');
  if (existsSync(userPath)) {
    paths.push(userPath);
  }

  // Project skills (./.claude/skills/)
  const projectPath = join(process.cwd(), '.claude', 'skills');
  if (existsSync(projectPath)) {
    paths.push(projectPath);
  }

  return paths;
}

/**
 * Discover all skills in a directory
 */
export function discoverSkillsInDir(
  dirPath: string,
  sourceType: 'user' | 'project' | 'plugin'
): Skill[] {
  const skills: Skill[] = [];

  if (!existsSync(dirPath)) {
    return skills;
  }

  try {
    const files = readdirSync(dirPath, { withFileTypes: true });

    for (const file of files) {
      // Skills can be SKILL.md files or any .md file with skill frontmatter
      if (file.isFile() && extname(file.name) === '.md') {
        const filePath = join(dirPath, file.name);
        const content = readFileSync(filePath, 'utf-8');

        // Parse frontmatter
        const { data, content: body } = matter(content);

        // Only consider files with description (required for skill triggering)
        if (data.description) {
          const name = data.name || basename(file.name, '.md').toLowerCase().replace(/\s+/g, '-');

          const metadata: SkillMetadata = {
            name: data.name,
            description: data.description,
            allowedTools: parseAllowedTools(data['allowed-tools']),
            model: data.model,
            context: data.context,
            userInvocable: data['user-invocable'] !== false, // Default to true
            hooks: parseSkillHooks(data.hooks)
          };

          skills.push({
            name,
            description: metadata.description || '',
            source: filePath,
            sourceType,
            content: body.trim(),
            metadata
          });
        }
      } else if (file.isDirectory()) {
        // Recursively discover skills in subdirectories
        // Subdirectories are for organization only, don't affect skill names
        const subSkills = discoverSkillsInDir(
          join(dirPath, file.name),
          sourceType
        );
        skills.push(...subSkills);
      }
    }
  } catch (error) {
    console.warn(`Failed to discover skills in ${dirPath}:`, error);
  }

  return skills;
}

/**
 * Parse allowed-tools from frontmatter
 */
function parseAllowedTools(value: unknown): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    return value.split(',').map(s => s.trim()).filter(Boolean);
  }
  return undefined;
}

/**
 * Parse skill hooks from frontmatter
 */
function parseSkillHooks(value: unknown): SkillHooks | undefined {
  if (!value || typeof value !== 'object') return undefined;
  return value as SkillHooks;
}

/**
 * Discover all available skills
 *
 * Searches user and project directories for skill definitions.
 * Results are cached for performance.
 *
 * @param additionalPaths - Additional paths to search for skills
 * @returns Array of discovered skills
 */
export function discoverAllSkills(additionalPaths: string[] = []): Skill[] {
  // Check cache validity
  const cacheKey = additionalPaths.sort().join(':');
  if (skillCache &&
      skillCache.paths.join(':') === cacheKey &&
      Date.now() - skillCache.timestamp < SKILL_CACHE_TTL) {
    return [...skillCache.skills];
  }

  const skills: Skill[] = [];
  const seenNames = new Set<string>();

  const userPath = join(homedir(), '.claude', 'skills');
  const defaultPaths = getDefaultSkillPaths();

  // Process user first, then project (project overrides user)
  const allPaths = [...defaultPaths, ...additionalPaths];

  for (const path of allPaths) {
    // Determine source type
    const normalizedPath = path.replace(/\\/g, '/').toLowerCase();
    const normalizedUser = userPath.replace(/\\/g, '/').toLowerCase();
    const sourceType: 'user' | 'project' | 'plugin' =
      normalizedPath.startsWith(normalizedUser) ? 'user' : 'project';

    const pathSkills = discoverSkillsInDir(path, sourceType);

    for (const skill of pathSkills) {
      // Later paths override earlier ones with same name
      if (seenNames.has(skill.name)) {
        const idx = skills.findIndex(s => s.name === skill.name);
        if (idx >= 0) {
          skills.splice(idx, 1);
        }
      }

      skills.push(skill);
      seenNames.add(skill.name);
    }
  }

  // Update cache
  skillCache = {
    skills: [...skills],
    timestamp: Date.now(),
    paths: additionalPaths.sort()
  };

  return skills;
}

/**
 * Get a specific skill by name
 */
export function getSkill(name: string, skills?: Skill[]): Skill | null {
  const allSkills = skills || discoverAllSkills();
  return allSkills.find(s => s.name === name) || null;
}

/**
 * Find skills that match a task description
 *
 * Uses keyword matching and description analysis to find relevant skills.
 *
 * @param taskDescription - The user's task or request
 * @param skills - Skills to search (defaults to all discovered skills)
 * @returns Array of matching skills with confidence scores
 */
export function findMatchingSkills(
  taskDescription: string,
  skills?: Skill[]
): SkillMatch[] {
  const allSkills = skills || discoverAllSkills();
  const matches: SkillMatch[] = [];
  const lowerTask = taskDescription.toLowerCase();

  for (const skill of allSkills) {
    // Simple keyword matching for now
    // In production, this could use embeddings or more sophisticated matching
    const skillKeywords = extractKeywords(skill.description + ' ' + skill.name);
    const taskKeywords = extractKeywords(lowerTask);

    const commonKeywords = skillKeywords.filter(kw => taskKeywords.includes(kw));
    const confidence = commonKeywords.length / Math.max(skillKeywords.length, 1);

    if (confidence > 0.2) { // Minimum threshold
      matches.push({
        skill,
        confidence,
        reason: `Matched keywords: ${commonKeywords.join(', ')}`
      });
    }
  }

  // Sort by confidence descending
  matches.sort((a, b) => b.confidence - a.confidence);

  return matches;
}

/**
 * Extract keywords from text for matching
 */
function extractKeywords(text: string): string[] {
  // Simple keyword extraction - split on non-alphanumeric, filter short words
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(word => word.length > 2)
    .filter(word => !STOP_WORDS.has(word));
}

/** Common stop words to ignore in keyword matching */
const STOP_WORDS = new Set([
  'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all',
  'can', 'her', 'was', 'one', 'our', 'out', 'has', 'have',
  'this', 'that', 'with', 'they', 'from', 'been', 'will',
  'when', 'what', 'where', 'which', 'who', 'how', 'use',
  'using', 'used', 'should', 'would', 'could'
]);

/**
 * Get user-invocable skills (for slash command menu)
 */
export function getUserInvocableSkills(skills?: Skill[]): Skill[] {
  const allSkills = skills || discoverAllSkills();
  return allSkills.filter(s => s.metadata.userInvocable !== false);
}

/**
 * Format skills for display
 */
export function formatSkillList(skills: Skill[]): string {
  if (skills.length === 0) {
    return 'No skills found.\n\nCreate skills in:\n  ~/.claude/skills/ (personal)\n  .claude/skills/ (project)';
  }

  const lines: string[] = ['Available Skills:', ''];

  // Group by source type
  const groups: Record<string, Skill[]> = {
    user: [],
    project: [],
    plugin: []
  };

  for (const skill of skills) {
    groups[skill.sourceType].push(skill);
  }

  for (const [type, typeSkills] of Object.entries(groups)) {
    if (typeSkills.length > 0) {
      lines.push(`  ${type.charAt(0).toUpperCase() + type.slice(1)}:`);
      for (const skill of typeSkills.sort((a, b) => a.name.localeCompare(b.name))) {
        const invocable = skill.metadata.userInvocable !== false ? '' : ' (auto-only)';
        lines.push(`    ${skill.name}${invocable}`);
        lines.push(`      ${skill.description.slice(0, 60)}${skill.description.length > 60 ? '...' : ''}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

/**
 * Build skill context for agent system prompt
 *
 * This generates the context that tells the agent about available skills.
 */
export function buildSkillContext(skills: Skill[]): string {
  if (skills.length === 0) {
    return '';
  }

  const lines: string[] = [
    '# Available Skills',
    '',
    'The following skills are available and will be automatically triggered when relevant:',
    ''
  ];

  for (const skill of skills) {
    lines.push(`- **${skill.name}**: ${skill.description}`);
  }

  lines.push('');
  lines.push('Skills are triggered automatically based on task matching. You can also explicitly request a skill: "Use the X skill to..."');

  return lines.join('\n');
}

/**
 * Expand a skill's content for use in a prompt
 *
 * Handles:
 * - @file references (include file contents)
 * - !command references (include command output)
 * - Variable substitution
 */
export function expandSkillContent(
  skill: Skill,
  variables: Record<string, string> = {}
): string {
  let content = skill.content;

  // Replace variables ($VAR or ${VAR})
  for (const [key, value] of Object.entries(variables)) {
    content = content.replace(new RegExp(`\\$\\{?${key}\\}?`, 'g'), value);
  }

  // TODO: Handle @file references
  // TODO: Handle !command execution

  return content;
}
