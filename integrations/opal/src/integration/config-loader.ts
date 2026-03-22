/**
 * Config Loader - Load and merge org-os and OPAL configurations
 *
 * Features:
 * - Read org-os federation.yaml
 * - Load OPAL .opal/config.yaml
 * - Merge configurations
 * - Environment variable handling
 */

import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import YAML from 'yaml';

// ============================================================================
// Type Definitions - OrgOS Config
// ============================================================================

export interface OrgOsConfig {
  version: string;
  spec: string;
  identity: OrgOsIdentity;
  network?: string;
  hub?: string;
  peers?: OrgOsPeer[];
  upstream?: OrgOsUpstream;
  downstream?: OrgOsDownstream[];
  agent: OrgOsAgentConfig;
  'knowledge-commons'?: OrgOsKnowledgeCommons;
  integrations?: OrgOsIntegrations;
  packages?: OrgOsPackages;
  customizations?: OrgOsCustomization[];
  governance?: OrgOsGovernance;
  platforms?: OrgOsPlatforms;
  metadata?: OrgOsMetadata;
}

export interface OrgOsIdentity {
  name: string;
  type: 'DAO' | 'Cooperative' | 'Foundation' | 'Project' | 'LocalNode' | 'Hub' | string;
  emoji?: string;
  daoURI?: string;
  chain?: string;
  safe?: string;
  hats?: number | null;
  gardens?: string;
  onchain_registration?: {
    enabled: boolean;
    chain?: string;
    contract_address?: string;
  };
}

export interface OrgOsPeer {
  name: string;
  repo: string;
  url: string;
  trust: 'full' | 'read' | 'none';
}

export interface OrgOsUpstream {
  type: string;
  repository: string;
  url: string;
  relationship: string;
  last_sync?: string;
  sync_frequency?: string;
  remote_name?: string;
}

export interface OrgOsDownstream {
  name: string;
  repo: string;
  url: string;
}

export interface OrgOsAgentConfig {
  runtime: 'openclaw' | 'cursor' | 'custom' | 'none';
  workspace: string;
  skills: string[];
  channels?: string[];
  proactive?: boolean;
  heartbeat_interval?: string;
}

export interface OrgOsKnowledgeCommons {
  enabled: boolean;
  'shared-domains'?: string[];
  'sync-protocol'?: 'git' | 'koi-net' | 'manual';
  publish?: {
    meetings?: boolean;
    projects?: boolean;
    funding?: boolean;
  };
  subscribe?: OrgOsSubscription[];
}

export interface OrgOsSubscription {
  name: string;
  url: string;
  type: string;
  filters?: string[];
}

export interface OrgOsIntegrations {
  agent_runtimes?: OrgOsIntegration[];
  knowledge_infrastructure?: OrgOsIntegration[];
  publishing?: OrgOsIntegration[];
  grants?: OrgOsIntegration[];
}

export interface OrgOsIntegration {
  name: string;
  repo: string;
  url: string;
  role: string;
}

export interface OrgOsPackages {
  knowledge_base?: boolean;
  meetings?: boolean;
  projects?: boolean;
  finances?: boolean;
  coordination?: boolean;
  webapps?: boolean;
  web3?: boolean;
  egregore?: boolean;
}

export interface OrgOsCustomization {
  path: string;
  reason: string;
  type: 'addition' | 'modification' | 'replacement';
  maintain_on_sync?: boolean;
}

export interface OrgOsGovernance {
  maintainers?: OrgOsMaintainer[];
  decision_model?: 'consensus' | 'voting' | 'hierarchical' | 'delegated';
  proposal_threshold?: string;
}

export interface OrgOsMaintainer {
  name: string;
  role: string;
  wallet?: string;
}

export interface OrgOsPlatforms {
  primary: string;
  deployment?: string;
  domain?: string;
  mirrors?: string[];
}

export interface OrgOsMetadata {
  created?: string;
  last_updated?: string;
  framework_version?: string;
}

// ============================================================================
// Type Definitions - OPAL Config
// ============================================================================

export interface OpalConfig {
  name?: string;
  profile?: string;
  path?: string;
  schema?: string;
  federation?: OpalFederationConfig;
  sources?: OpalSourcesConfig;
  processing?: OpalProcessingConfig;
  github?: OpalGithubConfig;
  calendar?: OpalCalendarConfig;
  notion?: OpalNotionConfig;
  embeddings?: OpalEmbeddingsConfig;
  'koi-federation'?: OpalKoiConfig;
}

export interface OpalFederationConfig {
  enabled: boolean;
  publish?: {
    include?: string[];
    license?: string;
  };
  governance?: {
    pr_moderation?: {
      required_approvals?: number;
      voting_period_hours?: number;
      auto_merge_on_approval?: boolean;
    };
  };
}

export interface OpalSourcesConfig {
  filesystem?: {
    enabled: boolean;
    watch?: OpalWatchConfig[];
  };
  telegram?: {
    enabled: boolean;
    routing?: {
      default?: string;
    };
  };
  meetily?: {
    enabled: boolean;
    db_path?: string;
  };
  otter?: {
    enabled: boolean;
    api_key?: string;
  };
  fathom?: {
    enabled: boolean;
    api_key?: string;
  };
  calendar?: {
    enabled: boolean;
  };
  notion?: {
    enabled: boolean;
    token?: string;
  };
}

export interface OpalWatchConfig {
  path: string;
  type: string;
}

export interface OpalProcessingConfig {
  extract_entities?: boolean;
  create_backlinks?: boolean;
  detect_patterns?: boolean;
  confidence_threshold?: number;
  opl?: {
    validate_taxonomy?: boolean;
    suggest_sectors?: boolean;
    suggest_scales?: boolean;
    detect_relationships?: boolean;
  };
}

export interface OpalGithubConfig {
  enabled: boolean;
  repo?: string;
  branch?: string;
  auto_push?: boolean;
}

export interface OpalCalendarConfig {
  enabled: boolean;
  provider?: string;
  credentials_path?: string;
  lookup_before_processing?: boolean;
  writeback_after_commit?: boolean;
}

export interface OpalNotionConfig {
  enabled: boolean;
  token?: string;
  databases?: string[];
}

export interface OpalEmbeddingsConfig {
  provider?: string;
  model?: string;
  dimensions?: number;
  local?: boolean;
  batch_size?: number;
}

export interface OpalKoiConfig {
  namespace_prefix?: string;
  publish_types?: string[];
  subscribe_topics?: string[];
  auto_sdg_tagging?: boolean;
}

// ============================================================================
// Type Definitions - Merged Config
// ============================================================================

export interface MergedConfig {
  orgos: OrgOsConfig;
  opal: OpalConfig;
  bridge: BridgeConfig;
  resolved: ResolvedConfig;
}

export interface BridgeConfig {
  enabled: boolean;
  mode: 'staging' | 'auto' | 'review';
  syncInterval?: string;
  autoApproveThreshold?: number;
  entityMappings?: Record<string, string>;
  pathMappings?: Record<string, string>;
}

export interface ResolvedConfig {
  orgOsPath: string;
  opalPath: string;
  meetingsPath: string;
  dataPath: string;
  knowledgePath: string;
  contentPath: string;
  skillsEnabled: string[];
  calendarEnabled: boolean;
  githubEnabled: boolean;
  commonsMode: boolean;
}

export interface ConfigLoadOptions {
  orgOsPath?: string;
  opalPath?: string;
  profile?: string;
  envPrefix?: string;
}

export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// Config Loader Class
// ============================================================================

export class ConfigLoader {
  private orgOsPath: string;
  private opalPath: string;
  private envPrefix: string;

  constructor(options: ConfigLoadOptions = {}) {
    this.orgOsPath = options.orgOsPath || process.cwd();
    this.opalPath = options.opalPath || path.join(this.orgOsPath, 'opal');
    this.envPrefix = options.envPrefix || 'ORGOS_';
  }

  // ==========================================================================
  // Main Load Methods
  // ==========================================================================

  /**
   * Load and merge all configurations
   */
  async load(): Promise<MergedConfig> {
    const orgos = await this.loadOrgOsConfig();
    const opal = await this.loadOpalConfig();
    const bridge = this.buildBridgeConfig(orgos, opal);
    const resolved = this.buildResolvedConfig(orgos, opal, bridge);

    // Apply environment variable overrides
    this.applyEnvironmentOverrides(orgos, opal, bridge);

    return {
      orgos,
      opal,
      bridge,
      resolved
    };
  }

  /**
   * Load org-os federation.yaml
   */
  async loadOrgOsConfig(): Promise<OrgOsConfig> {
    const configPath = path.join(this.orgOsPath, 'federation.yaml');

    if (!existsSync(configPath)) {
      throw new Error(`OrgOS config not found: ${configPath}`);
    }

    try {
      const content = readFileSync(configPath, 'utf-8');
      const config = YAML.parse(content) as OrgOsConfig;
      return this.applyDefaults(config, 'orgos');
    } catch (error) {
      throw new Error(`Failed to parse OrgOS config: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Load OPAL .opal/config.yaml
   */
  async loadOpalConfig(): Promise<OpalConfig> {
    const configPath = path.join(this.opalPath, '.opal', 'config.yaml');

    // If OPAL not configured, return default config
    if (!existsSync(configPath)) {
      return this.getDefaultOpalConfig();
    }

    try {
      const content = readFileSync(configPath, 'utf-8');
      const config = YAML.parse(content) as OpalConfig;
      return this.applyDefaults(config, 'opal');
    } catch (error) {
      console.warn(`Failed to parse OPAL config: ${error}`);
      return this.getDefaultOpalConfig();
    }
  }

  // ==========================================================================
  // Bridge Configuration
  // ==========================================================================

  /**
   * Build bridge configuration from org-os and OPAL configs
   */
  private buildBridgeConfig(orgos: OrgOsConfig, opal: OpalConfig): BridgeConfig {
    // Determine mode from org-os and opal settings
    let mode: BridgeConfig['mode'] = 'staging';

    if (orgos['knowledge-commons']?.enabled && orgos.agent?.proactive) {
      mode = 'auto';
    } else if (orgos['knowledge-commons']?.enabled) {
      mode = 'review';
    }

    // Map entity types
    const entityMappings: Record<string, string> = {
      'person': 'member',
      'organization': 'member',
      'project': 'project',
      'pattern': 'pattern',
      'decision': 'meeting',
      'action_item': 'meeting',
      'meeting': 'meeting',
      'methodology': 'knowledge',
      'credit_class': 'knowledge',
      'claim': 'knowledge',
      'evidence': 'knowledge'
    };

    // Map storage paths
    const pathMappings: Record<string, string> = {
      '_staging': '.opal/_staging',
      '_inbox': '.opal/_inbox',
      'patterns': 'knowledge/patterns',
      'meetings': 'content/meetings',
      'projects': 'data/projects.yaml',
      'members': 'data/members.yaml'
    };

    return {
      enabled: orgos['knowledge-commons']?.enabled || false,
      mode,
      syncInterval: orgos.agent?.heartbeat_interval || '1h',
      autoApproveThreshold: opal.processing?.confidence_threshold || 0.8,
      entityMappings,
      pathMappings
    };
  }

  /**
   * Build resolved configuration with all paths and flags
   */
  private buildResolvedConfig(
    orgos: OrgOsConfig,
    opal: OpalConfig,
    bridge: BridgeConfig
  ): ResolvedConfig {
    // Determine enabled skills
    const skillsEnabled = orgos.agent?.skills || [];

    // Check feature flags
    const calendarEnabled = opal.calendar?.enabled || opal.sources?.calendar?.enabled || false;
    const githubEnabled = opal.github?.enabled || false;
    const commonsMode = orgos['knowledge-commons']?.enabled || false;

    return {
      orgOsPath: this.orgOsPath,
      opalPath: this.opalPath,
      meetingsPath: path.join(this.orgOsPath, 'content', 'meetings'),
      dataPath: path.join(this.orgOsPath, 'data'),
      knowledgePath: path.join(this.orgOsPath, 'knowledge'),
      contentPath: path.join(this.orgOsPath, 'content'),
      skillsEnabled,
      calendarEnabled,
      githubEnabled,
      commonsMode
    };
  }

  // ==========================================================================
  // Environment Variables
  // ==========================================================================

  /**
   * Apply environment variable overrides
   */
  private applyEnvironmentOverrides(
    orgos: OrgOsConfig,
    opal: OpalConfig,
    bridge: BridgeConfig
  ): void {
    // OrgOS overrides
    if (process.env[`${this.envPrefix}NAME`]) {
      orgos.identity.name = process.env[`${this.envPrefix}NAME`]!;
    }
    if (process.env[`${this.envPrefix}TYPE`]) {
      orgos.identity.type = process.env[`${this.envPrefix}TYPE`]! as any;
    }
    if (process.env[`${this.envPrefix}SAFE`]) {
      orgos.identity.safe = process.env[`${this.envPrefix}SAFE`]!;
    }
    if (process.env[`${this.envPrefix}CHAIN`]) {
      orgos.identity.chain = process.env[`${this.envPrefix}CHAIN`]!;
    }
    if (process.env[`${this.envPrefix}AGENT_RUNTIME`]) {
      orgos.agent.runtime = process.env[`${this.envPrefix}AGENT_RUNTIME`]! as any;
    }

    // OPAL overrides
    if (process.env.OPAL_PROFILE) {
      opal.profile = process.env.OPAL_PROFILE;
    }
    if (process.env.OPAL_GITHUB_TOKEN) {
      if (!opal.github) opal.github = { enabled: true };
      opal.github.enabled = true;
    }
    if (process.env.OPAL_CALENDAR_CREDENTIALS) {
      if (!opal.calendar) opal.calendar = { enabled: true };
      opal.calendar.enabled = true;
      opal.calendar.credentials_path = process.env.OPAL_CALENDAR_CREDENTIALS;
    }
    if (process.env.OPAL_NOTION_TOKEN) {
      if (!opal.notion) opal.notion = { enabled: true };
      opal.notion.enabled = true;
      opal.notion.token = process.env.OPAL_NOTION_TOKEN;
    }
    if (process.env.OPAL_OTTER_API_KEY) {
      if (!opal.sources) opal.sources = {};
      if (!opal.sources.otter) opal.sources.otter = { enabled: true };
      opal.sources.otter.enabled = true;
      opal.sources.otter.api_key = process.env.OPAL_OTTER_API_KEY;
    }

    // Bridge overrides
    if (process.env[`${this.envPrefix}BRIDGE_MODE`]) {
      bridge.mode = process.env[`${this.envPrefix}BRIDGE_MODE`]! as any;
    }
    if (process.env[`${this.envPrefix}AUTO_APPROVE_THRESHOLD`]) {
      bridge.autoApproveThreshold = parseFloat(process.env[`${this.envPrefix}AUTO_APPROVE_THRESHOLD`]!);
    }
  }

  // ==========================================================================
  // Default Configurations
  // ==========================================================================

  private getDefaultOpalConfig(): OpalConfig {
    return {
      profile: 'default',
      federation: {
        enabled: false,
        publish: {
          license: 'CC-BY-SA-4.0'
        }
      },
      processing: {
        extract_entities: true,
        create_backlinks: true,
        detect_patterns: true,
        confidence_threshold: 0.7
      },
      embeddings: {
        provider: 'ollama',
        model: 'nomic-embed-text',
        dimensions: 768,
        local: true,
        batch_size: 10
      }
    };
  }

  private applyDefaults<T>(config: T, type: 'orgos' | 'opal'): T {
    const defaults: Record<string, any> = {
      orgos: {
        version: '3.0',
        spec: 'organizational-os/3.0',
        agent: {
          runtime: 'none',
          workspace: '.',
          skills: [],
          proactive: false,
          heartbeat_interval: '1h'
        },
        platforms: {
          primary: 'github'
        }
      },
      opal: this.getDefaultOpalConfig()
    };

    return { ...defaults[type], ...config };
  }

  // ==========================================================================
  // Validation
  // ==========================================================================

  /**
   * Validate merged configuration
   */
  async validate(config: MergedConfig): Promise<ConfigValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate paths exist
    if (!existsSync(config.resolved.orgOsPath)) {
      errors.push(`OrgOS path does not exist: ${config.resolved.orgOsPath}`);
    }

    // Validate required org-os fields
    if (!config.orgos.identity?.name) {
      errors.push('OrgOS identity.name is required');
    }

    // Validate OPAL if configured
    if (existsSync(config.resolved.opalPath)) {
      if (!existsSync(path.join(config.resolved.opalPath, 'CLAUDE.md'))) {
        warnings.push('OPAL installation may be incomplete (CLAUDE.md not found)');
      }
    }

    // Validate calendar integration
    if (config.resolved.calendarEnabled) {
      const calendarCreds = config.opal.calendar?.credentials_path;
      if (calendarCreds && !existsSync(calendarCreds)) {
        errors.push(`Calendar credentials not found: ${calendarCreds}`);
      }
    }

    // Validate GitHub integration
    if (config.resolved.githubEnabled && !process.env.GITHUB_TOKEN) {
      warnings.push('GitHub integration enabled but GITHUB_TOKEN not set');
    }

    // Validate commons mode requirements
    if (config.resolved.commonsMode) {
      if (!config.orgos['knowledge-commons']?.['sync-protocol']) {
        warnings.push('Commons mode enabled but sync-protocol not configured');
      }
    }

    // Validate bridge configuration
    if (config.bridge.enabled) {
      if (config.bridge.autoApproveThreshold &&
          (config.bridge.autoApproveThreshold < 0 || config.bridge.autoApproveThreshold > 1)) {
        errors.push('autoApproveThreshold must be between 0 and 1');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // ==========================================================================
  // Config Generation
  // ==========================================================================

  /**
   * Generate a sample org-os configuration
   */
  async generateOrgOsConfig(name: string, type: string): Promise<OrgOsConfig> {
    const config: OrgOsConfig = {
      version: '3.0',
      spec: 'organizational-os/3.0',
      identity: {
        name,
        type: type as any
      },
      agent: {
        runtime: 'openclaw',
        workspace: '.',
        skills: ['meeting-processor', 'funding-scout', 'knowledge-curator']
      },
      platforms: {
        primary: 'github'
      },
      metadata: {
        created: new Date().toISOString(),
        framework_version: '3.0'
      }
    };

    // Save to federation.yaml
    const configPath = path.join(this.orgOsPath, 'federation.yaml');
    writeFileSync(configPath, YAML.stringify(config), 'utf-8');

    return config;
  }

  /**
   * Generate OPAL configuration for org-os integration
   */
  async generateOpalConfig(): Promise<OpalConfig> {
    const config: OpalConfig = {
      name: 'org-os-knowledge',
      profile: 'regen',
      federation: {
        enabled: true,
        publish: {
          include: ['patterns/*', 'projects/*', 'meetings/*'],
          license: 'CC-BY-SA-4.0'
        },
        governance: {
          pr_moderation: {
            required_approvals: 3,
            voting_period_hours: 72,
            auto_merge_on_approval: false
          }
        }
      },
      sources: {
        filesystem: {
          enabled: true,
          watch: [
            { path: '~/Downloads/*.pdf', type: 'artifact' },
            { path: 'content/meetings/*.md', type: 'transcript' }
          ]
        },
        meetily: {
          enabled: true,
          db_path: '~/.meetily/meetings.db'
        },
        calendar: {
          enabled: true
        }
      },
      processing: {
        extract_entities: true,
        create_backlinks: true,
        detect_patterns: true,
        confidence_threshold: 0.7,
        opl: {
          validate_taxonomy: true,
          suggest_sectors: true,
          suggest_scales: true,
          detect_relationships: true
        }
      },
      calendar: {
        enabled: true,
        lookup_before_processing: true,
        writeback_after_commit: true
      },
      embeddings: {
        provider: 'ollama',
        model: 'nomic-embed-text',
        local: true
      }
    };

    // Create .opal directory if needed
    const opalDir = path.join(this.opalPath, '.opal');
    if (!existsSync(opalDir)) {
      mkdirSync(opalDir, { recursive: true });
    }

    // Save config
    const configPath = path.join(opalDir, 'config.yaml');
    writeFileSync(configPath, YAML.stringify(config), 'utf-8');

    return config;
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Check if org-os is configured
   */
  isOrgOsConfigured(): boolean {
    return existsSync(path.join(this.orgOsPath, 'federation.yaml'));
  }

  /**
   * Check if OPAL is configured
   */
  isOpalConfigured(): boolean {
    return existsSync(path.join(this.opalPath, '.opal', 'config.yaml'));
  }

  /**
   * Get configuration summary
   */
  getSummary(config: MergedConfig): string {
    const lines = [
      'Configuration Summary',
      '====================',
      '',
      `OrgOS Path: ${config.resolved.orgOsPath}`,
      `OPAL Path: ${config.resolved.opalPath}`,
      '',
      'Organization:',
      `  Name: ${config.orgos.identity.name}`,
      `  Type: ${config.orgos.identity.type}`,
      '',
      'Agent:',
      `  Runtime: ${config.orgos.agent.runtime}`,
      `  Skills: ${config.resolved.skillsEnabled.join(', ')}`,
      '',
      'Features:',
      `  Calendar: ${config.resolved.calendarEnabled ? '✓' : '✗'}`,
      `  GitHub: ${config.resolved.githubEnabled ? '✓' : '✗'}`,
      `  Commons Mode: ${config.resolved.commonsMode ? '✓' : '✗'}`,
      '',
      'Bridge:',
      `  Enabled: ${config.bridge.enabled ? '✓' : '✗'}`,
      `  Mode: ${config.bridge.mode}`,
      `  Auto-approve: ${config.bridge.autoApproveThreshold || 'disabled'}`
    ];

    return lines.join('\n');
  }
}

// ============================================================================
// Export convenience functions
// ============================================================================

export function createConfigLoader(options?: ConfigLoadOptions): ConfigLoader {
  return new ConfigLoader(options);
}

export async function loadMergedConfig(options?: ConfigLoadOptions): Promise<MergedConfig> {
  const loader = new ConfigLoader(options);
  return loader.load();
}

export async function validateConfig(config: MergedConfig, options?: ConfigLoadOptions): Promise<ConfigValidationResult> {
  const loader = new ConfigLoader(options);
  return loader.validate(config);
}

export async function generateOpalConfigForOrgOs(
  orgOsPath: string,
  opalPath?: string
): Promise<OpalConfig> {
  const loader = new ConfigLoader({ orgOsPath, opalPath });
  return loader.generateOpalConfig();
}
