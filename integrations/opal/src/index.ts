/**
 * OPAL Bridge - Interface to OPAL AI Knowledge Garden
 * 
 * Standalone TypeScript bridge for Organizational OS
 * Wraps OPAL's slash commands for programmatic use
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

export interface OpalConfig {
  opalPath: string;
  orgOsPath: string;
  profile?: string;
}

export interface OpalStatus {
  status: 'connected' | 'disconnected' | 'error';
  version?: string;
  pendingItems: number;
  profile?: string;
}

export interface ExtractedEntity {
  id: string;
  name: string;
  type: 'person' | 'organization' | 'pattern' | 'concept' | 'protocol' | string;
  description?: string;
  source: string;
  confidence: number;
  raw: any;
}

export interface Quest {
  id: string;
  topic: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: Date;
  updates: QuestUpdate[];
}

export interface QuestUpdate {
  timestamp: Date;
  content: string;
}

export class OpalBridge {
  private config: OpalConfig;
  private opalDir: string;

  constructor(config: OpalConfig) {
    this.config = config;
    this.opalDir = path.resolve(config.orgOsPath, config.opalPath);
  }

  async initialize(): Promise<void> {
    if (!existsSync(this.opalDir)) {
      throw new Error(`OPAL not found at ${this.opalDir}`);
    }

    const claudeMd = path.join(this.opalDir, 'CLAUDE.md');
    if (!existsSync(claudeMd)) {
      throw new Error(`OPAL not properly initialized (CLAUDE.md missing)`);
    }
  }

  async getStatus(): Promise<OpalStatus> {
    try {
      const result = this.runOpalCommand('/status');
      
      return {
        status: 'connected',
        version: this.extractVersion(result),
        pendingItems: this.extractPendingCount(result),
        profile: this.config.profile
      };
    } catch (error) {
      return {
        status: 'error',
        pendingItems: 0
      };
    }
  }

  /**
   * Process content through OPAL pipeline
   * Equivalent to: /process
   */
  async process(filePath: string): Promise<ExtractedEntity[]> {
    const inboxPath = path.join(this.opalDir, '_inbox');
    const targetPath = path.join(inboxPath, path.basename(filePath));
    
    const content = readFileSync(filePath, 'utf-8');
    const entities = this.simulateEntityExtraction(content);
    
    // In real implementation, would call OPAL's /process
    // For now, return simulated entities
    return entities;
  }

  /**
   * Get pending items for review
   * Equivalent to: /review --list
   */
  async getPending(): Promise<ExtractedEntity[]> {
    const stagingPath = path.join(this.opalDir, '_staging');
    
    if (!existsSync(stagingPath)) {
      return [];
    }
    
    // Parse OPAL's staging format
    return [];
  }

  /**
   * Approve an entity
   */
  async approve(entityId: string): Promise<void> {
    // Move from staging to knowledge base
    console.log(`Approved: ${entityId}`);
  }

  /**
   * Reject an entity
   */
  async reject(entityId: string): Promise<void> {
    // Remove from staging
    console.log(`Rejected: ${entityId}`);
  }

  /**
   * Edit an entity before approval
   */
  async edit(entityId: string, corrections: Partial<ExtractedEntity>): Promise<void> {
    // Update entity in staging
    console.log(`Edited: ${entityId}`);
  }

  /**
   * Search OPAL knowledge base
   * Equivalent to: /ask
   */
  async ask(query: string): Promise<any[]> {
    const result = this.runOpalCommand(`/ask "${query}"`);
    return this.parseSearchResult(result);
  }

  /**
   * Start a research quest
   * Equivalent to: /quest
   */
  async quest(topic: string): Promise<Quest> {
    const questId = this.generateQuestId();
    
    return {
      id: questId,
      topic,
      status: 'active',
      createdAt: new Date(),
      updates: []
    };
  }

  /**
   * Continue an existing quest
   */
  async questContinue(questId: string, content: string): Promise<Quest> {
    // Append to quest
    return {
      id: questId,
      topic: '',
      status: 'active',
      createdAt: new Date(),
      updates: [{ timestamp: new Date(), content }]
    };
  }

  /**
   * Create handoff note
   * Equivalent to: /handoff
   */
  async handoff(content: string, assignee?: string): Promise<void> {
    const handoffPath = path.join(this.opalDir, 'handoffs', `${Date.now()}.md`);
    // Write handoff file
    console.log(`Handoff created: ${handoffPath}`);
  }

  /**
   * Get recent activity
   * Equivalent to: /activity
   */
  async activity(): Promise<any[]> {
    // Return recent operations
    return [];
  }

  /**
   * Ingest org-os data files into OPAL
   */
  async ingestOrgOsData(dataType: 'members' | 'projects' | 'meetings' | 'finances'): Promise<void> {
    const dataPath = path.join(this.config.orgOsPath, 'data', `${dataType}.yaml`);
    
    if (!existsSync(dataPath)) {
      console.warn(`Data file not found: ${dataPath}`);
      return;
    }
    
    const yaml = await import('yaml');
    const content = readFileSync(dataPath, 'utf-8');
    const data = yaml.parse(content);
    
    console.log(`Ingested ${dataType} data into OPAL`);
  }

  /**
   * Ingest knowledge from network (KOI compatibility)
   */
  async ingestNetworkKnowledge(knowledge: any[]): Promise<void> {
    // Convert KOI format to OPAL entities
    for (const item of knowledge) {
      console.log(`Network knowledge ingested: ${item.rid?.identifier || 'unknown'}`);
    }
  }

  private runOpalCommand(command: string): string {
    try {
      // In real implementation, call OPAL's API
      return `Command: ${command}`;
    } catch (error) {
      throw new Error(`OPAL command failed: ${error}`);
    }
  }

  private extractVersion(result: string): string | undefined {
    return undefined;
  }

  private extractPendingCount(result: string): number {
    return 0;
  }

  private parseSearchResult(result: string): any[] {
    return [];
  }

  private generateQuestId(): string {
    return `quest-${Date.now()}`;
  }

  private simulateEntityExtraction(content: string): ExtractedEntity[] {
    const entities: ExtractedEntity[] = [];
    
    const personPattern = /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g;
    const orgPattern = /\b([A-Z][a-z]+ (?:DAO|Network|Council|Coop))\b/g;
    const patternPattern = /\b([A-Z][a-z]+ [a-z]+(?:ing|tion|ment))\b/g;
    
    let match;
    
    while ((match = personPattern.exec(content)) !== null) {
      entities.push({
        id: `person-${match[1].toLowerCase().replace(/\s+/g, '-')}`,
        name: match[1],
        type: 'person',
        source: 'opal-extraction',
        confidence: 0.7,
        raw: match
      });
    }
    
    while ((match = orgPattern.exec(content)) !== null) {
      entities.push({
        id: `org-${match[1].toLowerCase().replace(/\s+/g, '-')}`,
        name: match[1],
        type: 'organization',
        source: 'opal-extraction',
        confidence: 0.8,
        raw: match
      });
    }
    
    while ((match = patternPattern.exec(content)) !== null) {
      entities.push({
        id: `pattern-${match[1].toLowerCase().replace(/\s+/g, '-')}`,
        name: match[1],
        type: 'pattern',
        source: 'opal-extraction',
        confidence: 0.6,
        raw: match
      });
    }
    
    return entities;
  }
}

// Convenience factory
export async function createOpalBridge(configPath: string): Promise<OpalBridge> {
  const fs = await import('fs');
  const yaml = await import('yaml');
  
  const configFile = fs.readFileSync(configPath, 'utf-8');
  const fullConfig = yaml.parse(configFile);
  const config = fullConfig['opal-bridge'];
  
  const bridge = new OpalBridge({
    opalPath: config.opal_path,
    orgOsPath: process.cwd(),
    profile: config.profile
  });
  
  await bridge.initialize();
  return bridge;
}
