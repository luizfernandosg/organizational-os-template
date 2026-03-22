/**
 * Entity Mapper - Bidirectional mapping between OPAL and org-os entities
 * 
 * Maps OPAL extracted entities to org-os YAML structures:
 * - People → data/members.yaml
 * - Organizations → data/members.yaml (type: org)
 * - Patterns → knowledge/patterns/
 * - Projects → data/projects.yaml
 * - Decisions → data/meetings.yaml action items
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import YAML from 'yaml';

// ============================================================================
// Type Definitions
// ============================================================================

export interface OpalEntity {
  id: string;
  name: string;
  type: string;
  description?: string;
  source: string;
  confidence: number;
  aliases?: string[];
  fields?: Record<string, any>;
  raw?: any;
}

export interface OrgOsMember {
  id: string;
  name: string;
  role: 'member' | 'lead' | 'contributor' | 'advisor' | string;
  type?: 'person' | 'org' | 'organization';
  joined?: string;
  wallet?: string;
  email?: string;
  telegram?: string;
  expertise?: string[];
  opalId?: string;  // Reference back to OPAL entity
}

export interface OrgOsProject {
  id: string;
  name: string;
  status: 'Idea' | 'Develop' | 'Test' | 'Deploy' | 'Complete' | 'Archive' | string;
  lead?: string;
  members?: string[];
  startDate?: string;
  endDate?: string;
  description?: string;
  opalId?: string;
}

export interface OrgOsPattern {
  id: string;
  name: string;
  description?: string;
  problem?: string;
  solution?: string;
  sectors?: string[];
  scales?: string[];
  relatedPatterns?: string[];
  sourceFile?: string;
  opalId?: string;
}

export interface OrgOsMeeting {
  id: string;
  title: string;
  date: string;
  attendees?: string[];
  decisions?: OrgOsDecision[];
  actionItems?: OrgOsActionItem[];
  topics?: string[];
  transcriptFile?: string;
  calendarEventId?: string;
  opalSource?: string;
}

export interface OrgOsDecision {
  id: string;
  description: string;
  madeBy?: string;
  timestamp?: string;
  opalId?: string;
}

export interface OrgOsActionItem {
  id: string;
  description: string;
  assignee?: string;
  dueDate?: string;
  status: 'open' | 'in-progress' | 'done' | string;
  priority?: 'low' | 'medium' | 'high' | string;
  sourceDecision?: string;
  opalId?: string;
}

export interface MappingConfig {
  orgOsPath: string;
  opalPath: string;
  autoApproveThreshold?: number;
}

export interface MappingResult {
  success: boolean;
  entity: OpalEntity;
  orgOsEntity?: any;
  path?: string;
  error?: string;
  action: 'created' | 'updated' | 'skipped' | 'failed';
}

// ============================================================================
// Entity Mapper Class
// ============================================================================

export class EntityMapper {
  private config: MappingConfig;

  constructor(config: MappingConfig) {
    this.config = config;
  }

  // ==========================================================================
  // OPAL → OrgOS Mapping
  // ==========================================================================

  /**
   * Map a single OPAL entity to appropriate org-os structure
   */
  async mapToOrgOs(entity: OpalEntity): Promise<MappingResult> {
    try {
      switch (entity.type) {
        case 'person':
          return await this.mapPersonToMember(entity);
        case 'organization':
          return await this.mapOrganizationToMember(entity);
        case 'pattern':
          return await this.mapPatternToKnowledge(entity);
        case 'project':
          return await this.mapProjectToOrgOs(entity);
        case 'decision':
          return await this.mapDecisionToMeeting(entity);
        case 'action_item':
          return await this.mapActionItemToMeeting(entity);
        default:
          return {
            success: false,
            entity,
            action: 'skipped',
            error: `Unknown entity type: ${entity.type}`
          };
      }
    } catch (error) {
      return {
        success: false,
        entity,
        action: 'failed',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Map OPAL person to org-os member
   */
  private async mapPersonToMember(entity: OpalEntity): Promise<MappingResult> {
    const membersPath = path.join(this.config.orgOsPath, 'data', 'members.yaml');
    
    // Load existing members
    const data = this.loadYaml(membersPath, { members: [] });
    const members: OrgOsMember[] = data.members || [];

    // Check for existing member by OPAL ID or name
    const existingIndex = members.findIndex(
      m => m.opalId === entity.id || m.name.toLowerCase() === entity.name.toLowerCase()
    );

    const member: OrgOsMember = {
      id: existingIndex >= 0 ? members[existingIndex].id : this.generateId('member', entity.name),
      name: entity.name,
      role: entity.fields?.role || 'member',
      type: 'person',
      expertise: entity.fields?.expertise || [],
      opalId: entity.id
    };

    if (existingIndex >= 0) {
      // Merge with existing
      members[existingIndex] = { ...members[existingIndex], ...member };
    } else {
      members.push(member);
    }

    // Save back
    data.members = members;
    this.saveYaml(membersPath, data);

    return {
      success: true,
      entity,
      orgOsEntity: member,
      path: membersPath,
      action: existingIndex >= 0 ? 'updated' : 'created'
    };
  }

  /**
   * Map OPAL organization to org-os member (type: org)
   */
  private async mapOrganizationToMember(entity: OpalEntity): Promise<MappingResult> {
    const membersPath = path.join(this.config.orgOsPath, 'data', 'members.yaml');
    
    const data = this.loadYaml(membersPath, { members: [] });
    const members: OrgOsMember[] = data.members || [];

    const existingIndex = members.findIndex(
      m => m.opalId === entity.id || m.name.toLowerCase() === entity.name.toLowerCase()
    );

    const member: OrgOsMember = {
      id: existingIndex >= 0 ? members[existingIndex].id : this.generateId('org', entity.name),
      name: entity.name,
      role: 'member',
      type: 'org',
      expertise: entity.fields?.expertise || [],
      opalId: entity.id
    };

    if (existingIndex >= 0) {
      members[existingIndex] = { ...members[existingIndex], ...member };
    } else {
      members.push(member);
    }

    data.members = members;
    this.saveYaml(membersPath, data);

    return {
      success: true,
      entity,
      orgOsEntity: member,
      path: membersPath,
      action: existingIndex >= 0 ? 'updated' : 'created'
    };
  }

  /**
   * Map OPAL pattern to org-os knowledge/patterns/
   */
  private async mapPatternToKnowledge(entity: OpalEntity): Promise<MappingResult> {
    const patternsDir = path.join(this.config.orgOsPath, 'knowledge', 'patterns');
    
    if (!existsSync(patternsDir)) {
      mkdirSync(patternsDir, { recursive: true });
    }

    const patternId = this.slugify(entity.name);
    const patternPath = path.join(patternsDir, `${patternId}.md`);

    const pattern: OrgOsPattern = {
      id: patternId,
      name: entity.name,
      description: entity.description,
      problem: entity.fields?.problem,
      solution: entity.fields?.solution,
      sectors: entity.fields?.sectors || entity.fields?.dimensions || [],
      scales: entity.fields?.scales || [],
      relatedPatterns: entity.fields?.related_patterns || [],
      sourceFile: patternPath,
      opalId: entity.id
    };

    // Generate markdown content
    const content = this.generatePatternMarkdown(pattern, entity);
    
    const existing = existsSync(patternPath);
    writeFileSync(patternPath, content, 'utf-8');

    return {
      success: true,
      entity,
      orgOsEntity: pattern,
      path: patternPath,
      action: existing ? 'updated' : 'created'
    };
  }

  /**
   * Map OPAL project to org-os projects.yaml
   */
  private async mapProjectToOrgOs(entity: OpalEntity): Promise<MappingResult> {
    const projectsPath = path.join(this.config.orgOsPath, 'data', 'projects.yaml');
    
    const data = this.loadYaml(projectsPath, { projects: [] });
    const projects: OrgOsProject[] = data.projects || [];

    const existingIndex = projects.findIndex(
      p => p.opalId === entity.id || p.name.toLowerCase() === entity.name.toLowerCase()
    );

    const project: OrgOsProject = {
      id: existingIndex >= 0 ? projects[existingIndex].id : this.generateId('project', entity.name),
      name: entity.name,
      status: entity.fields?.status || 'Idea',
      lead: entity.fields?.lead,
      members: entity.fields?.members || [],
      startDate: entity.fields?.start_date,
      endDate: entity.fields?.end_date,
      description: entity.description,
      opalId: entity.id
    };

    if (existingIndex >= 0) {
      projects[existingIndex] = { ...projects[existingIndex], ...project };
    } else {
      projects.push(project);
    }

    data.projects = projects;
    this.saveYaml(projectsPath, data);

    return {
      success: true,
      entity,
      orgOsEntity: project,
      path: projectsPath,
      action: existingIndex >= 0 ? 'updated' : 'created'
    };
  }

  /**
   * Map OPAL decision to org-os meetings.yaml
   */
  private async mapDecisionToMeeting(entity: OpalEntity): Promise<MappingResult> {
    const meetingsPath = path.join(this.config.orgOsPath, 'data', 'meetings.yaml');
    
    const data = this.loadYaml(meetingsPath, { meetings: [] });
    const meetings: OrgOsMeeting[] = data.meetings || [];

    // Find or create meeting
    const meetingId = entity.fields?.meeting_id || this.generateId('meeting', entity.source);
    let meetingIndex = meetings.findIndex(m => m.id === meetingId);

    const decision: OrgOsDecision = {
      id: this.generateId('decision', entity.name),
      description: entity.description || entity.name,
      madeBy: entity.fields?.made_by,
      timestamp: entity.fields?.timestamp || new Date().toISOString(),
      opalId: entity.id
    };

    if (meetingIndex >= 0) {
      // Add to existing meeting
      if (!meetings[meetingIndex].decisions) {
        meetings[meetingIndex].decisions = [];
      }
      meetings[meetingIndex].decisions!.push(decision);
    } else {
      // Create new meeting
      meetings.push({
        id: meetingId,
        title: entity.fields?.meeting_title || 'Untitled Meeting',
        date: entity.fields?.meeting_date || new Date().toISOString().split('T')[0],
        decisions: [decision],
        opalSource: entity.source
      });
    }

    data.meetings = meetings;
    this.saveYaml(meetingsPath, data);

    return {
      success: true,
      entity,
      orgOsEntity: decision,
      path: meetingsPath,
      action: 'created'
    };
  }

  /**
   * Map OPAL action item to org-os meetings.yaml
   */
  private async mapActionItemToMeeting(entity: OpalEntity): Promise<MappingResult> {
    const meetingsPath = path.join(this.config.orgOsPath, 'data', 'meetings.yaml');
    
    const data = this.loadYaml(meetingsPath, { meetings: [] });
    const meetings: OrgOsMeeting[] = data.meetings || [];

    const meetingId = entity.fields?.meeting_id || this.generateId('meeting', entity.source);
    let meetingIndex = meetings.findIndex(m => m.id === meetingId);

    const actionItem: OrgOsActionItem = {
      id: this.generateId('action', entity.name),
      description: entity.description || entity.name,
      assignee: entity.fields?.assignee,
      dueDate: entity.fields?.due_date,
      status: entity.fields?.status || 'open',
      priority: entity.fields?.priority || 'medium',
      sourceDecision: entity.fields?.source_decision,
      opalId: entity.id
    };

    if (meetingIndex >= 0) {
      if (!meetings[meetingIndex].actionItems) {
        meetings[meetingIndex].actionItems = [];
      }
      meetings[meetingIndex].actionItems!.push(actionItem);
    } else {
      meetings.push({
        id: meetingId,
        title: entity.fields?.meeting_title || 'Untitled Meeting',
        date: entity.fields?.meeting_date || new Date().toISOString().split('T')[0],
        actionItems: [actionItem],
        opalSource: entity.source
      });
    }

    data.meetings = meetings;
    this.saveYaml(meetingsPath, data);

    return {
      success: true,
      entity,
      orgOsEntity: actionItem,
      path: meetingsPath,
      action: 'created'
    };
  }

  // ==========================================================================
  // OrgOS → OPAL Mapping (Reverse)
  // ==========================================================================

  /**
   * Map org-os member to OPAL person entity
   */
  async mapMemberToPerson(member: OrgOsMember): Promise<OpalEntity> {
    return {
      id: member.opalId || this.generateId('opal', member.name),
      name: member.name,
      type: 'person',
      source: 'org-os-members.yaml',
      confidence: 1.0,
      fields: {
        role: member.role,
        expertise: member.expertise,
        joined: member.joined,
        wallet: member.wallet,
        email: member.email
      }
    };
  }

  /**
   * Map org-os project to OPAL project entity
   */
  async mapOrgOsProjectToOpal(project: OrgOsProject): Promise<OpalEntity> {
    return {
      id: project.opalId || this.generateId('opal', project.name),
      name: project.name,
      type: 'project',
      description: project.description,
      source: 'org-os-projects.yaml',
      confidence: 1.0,
      fields: {
        status: project.status,
        lead: project.lead,
        members: project.members,
        start_date: project.startDate,
        end_date: project.endDate
      }
    };
  }

  /**
   * Map org-os pattern to OPAL pattern entity
   */
  async mapOrgOsPatternToOpal(pattern: OrgOsPattern): Promise<OpalEntity> {
    return {
      id: pattern.opalId || this.generateId('opal', pattern.name),
      name: pattern.name,
      type: 'pattern',
      description: pattern.description,
      source: pattern.sourceFile || 'org-os-knowledge',
      confidence: 1.0,
      fields: {
        problem: pattern.problem,
        solution: pattern.solution,
        sectors: pattern.sectors,
        scales: pattern.scales,
        related_patterns: pattern.relatedPatterns
      }
    };
  }

  /**
   * Batch process multiple entities
   */
  async batchMapToOrgOs(entities: OpalEntity[]): Promise<MappingResult[]> {
    const results: MappingResult[] = [];
    for (const entity of entities) {
      const result = await this.mapToOrgOs(entity);
      results.push(result);
    }
    return results;
  }

  /**
   * Batch process multiple org-os entities back to OPAL
   */
  async batchMapToOpal(
    members?: OrgOsMember[],
    projects?: OrgOsProject[],
    patterns?: OrgOsPattern[]
  ): Promise<OpalEntity[]> {
    const entities: OpalEntity[] = [];

    if (members) {
      for (const member of members) {
        if (member.type === 'person' || !member.type) {
          entities.push(await this.mapMemberToPerson(member));
        } else {
          // Map as organization
          entities.push({
            id: member.opalId || this.generateId('opal', member.name),
            name: member.name,
            type: 'organization',
            source: 'org-os-members.yaml',
            confidence: 1.0,
            fields: { role: member.role }
          });
        }
      }
    }

    if (projects) {
      for (const project of projects) {
        entities.push(await this.mapOrgOsProjectToOpal(project));
      }
    }

    if (patterns) {
      for (const pattern of patterns) {
        entities.push(await this.mapOrgOsPatternToOpal(pattern));
      }
    }

    return entities;
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  private loadYaml(filePath: string, defaultValue: any = {}): any {
    if (!existsSync(filePath)) {
      return defaultValue;
    }
    try {
      const content = readFileSync(filePath, 'utf-8');
      return YAML.parse(content) || defaultValue;
    } catch {
      return defaultValue;
    }
  }

  private saveYaml(filePath: string, data: any): void {
    const dir = path.dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(filePath, YAML.stringify(data), 'utf-8');
  }

  private generateId(prefix: string, name: string): string {
    const slug = this.slugify(name);
    const timestamp = Date.now().toString(36).slice(-4);
    return `${prefix}-${slug}-${timestamp}`;
  }

  private slugify(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private generatePatternMarkdown(pattern: OrgOsPattern, entity: OpalEntity): string {
    const frontmatter = {
      id: pattern.id,
      name: pattern.name,
      sectors: pattern.sectors || [],
      scales: pattern.scales || [],
      related_patterns: pattern.relatedPatterns || [],
      created: new Date().toISOString().split('T')[0],
      opal_id: entity.id,
      source: entity.source
    };

    return `---
${YAML.stringify(frontmatter)}---

# ${pattern.name}

${pattern.description || ''}

## Problem

${pattern.problem || ''}

## Solution

${pattern.solution || ''}

## Related Patterns

${pattern.relatedPatterns?.map(p => `- [[${p}]]`).join('\n') || '- '}

## Source

Extracted from: ${entity.source}
Confidence: ${Math.round(entity.confidence * 100)}%
`;
  }
}

// ============================================================================
// Export convenience functions
// ============================================================================

export function createEntityMapper(config: MappingConfig): EntityMapper {
  return new EntityMapper(config);
}

export async function mapEntityToOrgOs(
  entity: OpalEntity,
  config: MappingConfig
): Promise<MappingResult> {
  const mapper = new EntityMapper(config);
  return mapper.mapToOrgOs(entity);
}

export async function mapOrgOsToOpal(
  members?: OrgOsMember[],
  projects?: OrgOsProject[],
  patterns?: OrgOsPattern[],
  config?: MappingConfig
): Promise<OpalEntity[]> {
  if (!config) {
    throw new Error('MappingConfig is required');
  }
  const mapper = new EntityMapper(config);
  return mapper.batchMapToOpal(members, projects, patterns);
}
