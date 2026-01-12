/**
 * Claude CLI Template
 *
 * Production-ready CLI for Claude Agent SDK.
 * Fork. Brand. Ship.
 */

// Branding Configuration
export { BRANDING, type BrandingConfig } from './branding.js';

// Conversational Agent
export {
  ConversationalAgent,
  PERMISSION_MODE_CYCLE,
  PERMISSION_MODE_LABELS,
  type ConversationMessage,
  type ConversationalAgentOptions,
  type PermissionMode,
  type SlashCommand,
  type CommandMetadata
} from './conversation.js';

// Model Configuration
export {
  MODELS,
  MODEL_ALIASES,
  MODEL_PRICING,
  DEFAULT_MODEL,
  resolveModel,
  getModelDisplayName,
  getModelAlias,
  calculateCost,
  formatCost,
  formatModelList
} from './features/models.js';

// MCP Server Configuration
export {
  buildMcpConfig,
  loadMcpConfig,
  mergeMcpServers,
  checkMcpServerHealth,
  checkAllMcpServers,
  formatMcpStatus,
  DEFAULT_MCP_SERVERS,
  CLOUD_MCP_SERVERS,
  type McpServerConfig,
  type McpStdioServerConfig,
  type McpHttpServerConfig,
  type McpSseServerConfig,
  type McpServersConfig,
  type McpOptions
} from './features/mcp.js';

// Slash Commands
export {
  parseCommand,
  discoverAllCommands,
  discoverCommandsInDir,
  executeCommand,
  expandCommandTemplate,
  formatCommandList,
  getCommand,
  getDefaultCommandPaths,
  BUILTIN_COMMANDS,
  type ParsedCommand
} from './features/commands.js';

// Plugin System
export {
  PluginManager,
  parsePluginSource,
  loadPluginManifest,
  loadPlugin,
  getInstalledPlugins,
  formatPluginList,
  listInstalledPluginNames,
  PLUGINS_DIR,
  PLUGINS_REGISTRY_FILE,
  type PluginManifest,
  type LoadedPlugin,
  type PluginSource,
  type PluginInstallResult,
  type PluginRegistryEntry
} from './features/plugins.js';

// Context Management
export {
  ContextManager,
  estimateTokens,
  parseCompactMetadata,
  createCompactPrompt,
  type TokenUsage,
  type ContextMetrics,
  type CompactionEvent,
  type ContextThresholds,
  type ContextStatus
} from './features/context.js';

// UI Components
export { App } from './ui/App.js';
export type { AppProps } from './ui/App.js';
export {
  Header,
  StatusBar,
  ThinkingIndicator,
  MessageStream,
  InputPrompt,
  ToolCard
} from './ui/components/index.js';
export type {
  HeaderProps,
  StatusBarProps,
  ThinkingState,
  ThinkingIndicatorProps,
  MessageStreamProps,
  InputPromptProps,
  ToolCardProps
} from './ui/components/index.js';

// UI Hooks
export {
  useAgent,
  useThinking,
  useKeyboard
} from './ui/hooks/index.js';
export type {
  UseAgentOptions,
  UseAgentReturn,
  UseThinkingReturn,
  UseKeyboardOptions
} from './ui/hooks/index.js';

// Session Management
export { SessionService } from './services/sessions.js';
export type { SessionInfo, SessionListItem } from './types/sessions.js';

// Branding Context (for downstream customization)
export {
  BrandingProvider,
  useBranding,
  BrandingContext,
  type BrandingProviderProps
} from './ui/context/index.js';
