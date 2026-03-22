/**
 * Meeting Pipeline - Specialized pipeline for meeting processing
 * 
 * Features:
 * - Read meeting transcripts from content/meetings/
 * - Extract: attendees, decisions, action items, topics
 * - Update data/meetings.yaml with extracted data
 * - Link to calendar (if configured)
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';
import YAML from 'yaml';

// ============================================================================
// Type Definitions
// ============================================================================

export interface MeetingTranscript {
  filePath: string;
  content: string;
  metadata?: TranscriptMetadata;
}

export interface TranscriptMetadata {
  title?: string;
  date?: string;
  time?: string;
  duration?: string;
  attendees?: string[];
  source?: string;  // 'meetily', 'otter', 'fathom', 'manual', etc.
  calendarEventId?: string;
  meetingUrl?: string;
  recordingUrl?: string;
}

export interface ExtractedMeeting {
  id: string;
  title: string;
  date: string;
  time?: string;
  duration?: string;
  sourceFile: string;
  attendees: ExtractedAttendee[];
  decisions: ExtractedDecision[];
  actionItems: ExtractedActionItem[];
  topics: ExtractedTopic[];
  keyPoints: string[];
  calendarEventId?: string;
  confidence: number;
}

export interface ExtractedAttendee {
  name: string;
  email?: string;
  identifiedBy: 'calendar' | 'transcript' | 'manual' | 'inference';
  confidence: number;
  speakingTime?: number;  // Approximate speaking time in seconds
  contributions?: string[];
}

export interface ExtractedDecision {
  id: string;
  description: string;
  context?: string;
  madeBy?: string[];
  timestamp?: string;
  confidence: number;
  relatedTopics?: string[];
}

export interface ExtractedActionItem {
  id: string;
  description: string;
  assignee?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in-progress' | 'done' | 'blocked';
  sourceDecision?: string;
  confidence: number;
}

export interface ExtractedTopic {
  id: string;
  name: string;
  startTime?: string;
  duration?: number;
  keyPoints: string[];
  relatedPatterns?: string[];
  confidence: number;
}

export interface MeetingPipelineConfig {
  orgOsPath: string;
  meetingsPath?: string;
  calendarIntegration?: {
    enabled: boolean;
    provider: 'google' | 'outlook' | 'calendly';
    credentialsPath?: string;
  };
  transcriptSources?: string[];  // 'meetily', 'otter', 'fathom', 'read', 'manual'
  autoExtract?: boolean;
  confidenceThreshold?: number;
}

export interface PipelineResult {
  success: boolean;
  meeting?: ExtractedMeeting;
  error?: string;
  warnings?: string[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  attendees: Array<{ email: string; name?: string; response?: string }>;
  description?: string;
  location?: string;
  meetingLink?: string;
}

// ============================================================================
// Meeting Pipeline Class
// ============================================================================

export class MeetingPipeline {
  private config: MeetingPipelineConfig;
  private meetingsDir: string;

  constructor(config: MeetingPipelineConfig) {
    this.config = {
      meetingsPath: 'content/meetings',
      transcriptSources: ['meetily', 'otter', 'fathom', 'manual'],
      autoExtract: true,
      confidenceThreshold: 0.7,
      ...config
    };
    this.meetingsDir = path.join(config.orgOsPath, this.config.meetingsPath!);
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================

  async initialize(): Promise<void> {
    if (!existsSync(this.meetingsDir)) {
      mkdirSync(this.meetingsDir, { recursive: true });
    }

    // Ensure data/meetings.yaml exists
    const meetingsDataPath = path.join(this.config.orgOsPath, 'data', 'meetings.yaml');
    if (!existsSync(meetingsDataPath)) {
      this.saveYaml(meetingsDataPath, { meetings: [] });
    }
  }

  // ==========================================================================
  // Transcript Discovery
  // ==========================================================================

  /**
   * Discover all meeting transcripts in the meetings directory
   */
  async discoverTranscripts(): Promise<MeetingTranscript[]> {
    if (!existsSync(this.meetingsDir)) {
      return [];
    }

    const transcripts: MeetingTranscript[] = [];
    const files = readdirSync(this.meetingsDir, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile()) continue;

      const ext = path.extname(file.name).toLowerCase();
      if (ext === '.md' || ext === '.txt' || ext === '.vtt' || ext === '.srt') {
        const filePath = path.join(this.meetingsDir, file.name);
        const content = readFileSync(filePath, 'utf-8');
        
        transcripts.push({
          filePath,
          content,
          metadata: this.parseTranscriptMetadata(filePath, content)
        });
      }
    }

    return transcripts.sort((a, b) => {
      const dateA = a.metadata?.date || '';
      const dateB = b.metadata?.date || '';
      return dateB.localeCompare(dateA);  // Newest first
    });
  }

  /**
   * Parse metadata from transcript file
   */
  private parseTranscriptMetadata(filePath: string, content: string): TranscriptMetadata {
    const metadata: TranscriptMetadata = {
      source: this.inferSource(filePath)
    };

    // Try to extract from YAML frontmatter
    if (content.startsWith('---')) {
      const endIndex = content.indexOf('---', 3);
      if (endIndex !== -1) {
        const frontmatter = content.substring(3, endIndex).trim();
        try {
          const parsed = YAML.parse(frontmatter);
          Object.assign(metadata, parsed);
        } catch {
          // Continue with manual extraction
        }
      }
    }

    // Extract from filename if not in frontmatter
    if (!metadata.date) {
      const filename = path.basename(filePath, path.extname(filePath));
      const dateMatch = filename.match(/(\d{4}[-_]\d{2}[-_]\d{2})/);
      if (dateMatch) {
        metadata.date = dateMatch[1].replace(/_/g, '-');
      }
    }

    // Infer title from filename
    if (!metadata.title) {
      const filename = path.basename(filePath, path.extname(filePath));
      metadata.title = filename
        .replace(/\d{4}[-_]\d{2}[-_]\d{2}[-_]?/, '')
        .replace(/[-_]/g, ' ')
        .trim();
    }

    return metadata;
  }

  /**
   * Infer transcript source from filename/content
   */
  private inferSource(filePath: string): string {
    const filename = filePath.toLowerCase();
    
    if (filename.includes('meetily')) return 'meetily';
    if (filename.includes('otter')) return 'otter';
    if (filename.includes('fathom')) return 'fathom';
    if (filename.includes('read.ai') || filename.includes('readai')) return 'read';
    if (filename.includes('.vtt') || filename.includes('.srt')) return 'manual';
    
    return 'unknown';
  }

  // ==========================================================================
  // Content Extraction
  // ==========================================================================

  /**
   * Process a single transcript and extract structured data
   */
  async processTranscript(transcript: MeetingTranscript): Promise<PipelineResult> {
    try {
      // Clean up transcript based on source
      const cleaned = this.cleanTranscript(transcript);
      
      // Extract entities
      const meeting = this.extractMeetingData(cleaned, transcript);
      
      // Enrich with calendar data if available
      if (this.config.calendarIntegration?.enabled && meeting.calendarEventId) {
        await this.enrichWithCalendar(meeting);
      }
      
      return {
        success: true,
        meeting,
        warnings: this.validateMeeting(meeting)
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Clean transcript based on source type
   */
  private cleanTranscript(transcript: MeetingTranscript): string {
    let content = transcript.content;

    switch (transcript.metadata?.source) {
      case 'meetily':
        // Meetily-specific cleaning
        content = content.replace(/\[\d{2}:\d{2}:\d{2}\]/g, '');  // Remove timestamps
        content = content.replace(/Speaker \d+:/g, '');  // Normalize speaker labels
        break;
      
      case 'otter':
        // Otter.ai cleaning
        content = content.replace(/\d{2}:\d{2}\s+/g, '');  // Remove timestamps
        break;
      
      case 'fathom':
        // Fathom cleaning
        content = content.replace(/\[\d{2}:\d{2}\.\d{3}\s*-->\s*\d{2}:\d{2}\.\d{3}\]/g, '');
        break;
      
      case 'read':
        // Read.ai cleaning
        content = content.replace(/\d{1,2}:\d{2}\s*(AM|PM)?/gi, '');
        break;
      
      default:
        // Generic cleaning for VTT/SRT
        if (transcript.filePath.endsWith('.vtt') || transcript.filePath.endsWith('.srt')) {
          content = this.cleanSubtitleFile(content);
        }
    }

    // Common cleaning
    content = content.replace(/\n{3,}/g, '\n\n');  // Normalize newlines
    content = content.trim();

    return content;
  }

  /**
   * Clean subtitle file format (VTT/SRT)
   */
  private cleanSubtitleFile(content: string): string {
    // Remove cue numbers and timestamps
    return content
      .replace(/^\d+\s*$/gm, '')  // Remove cue numbers
      .replace(/^\d{2}:\d{2}:\d{2}[,.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]\d{3}.*$/gm, '')
      .replace(/<[^>]+>/g, '')  // Remove HTML tags
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Extract meeting data from cleaned transcript
   */
  private extractMeetingData(content: string, transcript: MeetingTranscript): ExtractedMeeting {
    const metadata = transcript.metadata || {};
    const meetingId = this.generateMeetingId(metadata);

    return {
      id: meetingId,
      title: metadata.title || 'Untitled Meeting',
      date: metadata.date || new Date().toISOString().split('T')[0],
      time: metadata.time,
      duration: metadata.duration,
      sourceFile: transcript.filePath,
      attendees: this.extractAttendees(content, metadata),
      decisions: this.extractDecisions(content),
      actionItems: this.extractActionItems(content),
      topics: this.extractTopics(content),
      keyPoints: this.extractKeyPoints(content),
      calendarEventId: metadata.calendarEventId,
      confidence: 0.8
    };
  }

  /**
   * Extract attendees from transcript
   */
  private extractAttendees(content: string, metadata: TranscriptMetadata): ExtractedAttendee[] {
    const attendees: ExtractedAttendee[] = [];

    // Start with calendar attendees if available
    if (metadata.attendees) {
      for (const attendee of metadata.attendees) {
        attendees.push({
          name: attendee,
          identifiedBy: 'calendar',
          confidence: 0.95
        });
      }
    }

    // Extract from transcript speaker patterns
    const speakerPatterns = [
      /([A-Z][a-z]+ [A-Z][a-z]+):/g,  // "John Smith:"
      /Speaker (\w+):/g,
      /^([A-Z][a-z]+):/gm  // Name at start of line
    ];

    const foundSpeakers = new Set<string>();
    
    for (const pattern of speakerPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const name = match[1].trim();
        if (name.length > 2 && !foundSpeakers.has(name.toLowerCase())) {
          foundSpeakers.add(name.toLowerCase());
          
          // Check if already from calendar
          const existing = attendees.find(a => 
            a.name.toLowerCase() === name.toLowerCase()
          );
          
          if (!existing) {
            attendees.push({
              name,
              identifiedBy: 'transcript',
              confidence: 0.7
            });
          }
        }
      }
    }

    return attendees;
  }

  /**
   * Extract decisions from transcript
   */
  private extractDecisions(content: string): ExtractedDecision[] {
    const decisions: ExtractedDecision[] = [];
    
    const decisionPatterns = [
      /(?:decided|decision|agreed|agreement|resolved|conclusion):?\s*([^\n]+)/gi,
      /(?:we|the team) (?:decided|agreed|resolved) (?:to|that) ([^\n]+)/gi,
      /(?:consensus|decision reached):\s*([^\n]+)/gi
    ];

    for (const pattern of decisionPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const description = match[1].trim();
        if (description.length > 10 && description.length < 500) {
          decisions.push({
            id: this.generateId('decision', description),
            description,
            confidence: 0.75
          });
        }
      }
    }

    return decisions;
  }

  /**
   * Extract action items from transcript
   */
  private extractActionItems(content: string): ExtractedActionItem[] {
    const actionItems: ExtractedActionItem[] = [];
    
    const actionPatterns = [
      /(?:action item|todo|task|will|needs? to):?\s*([^\n]+)/gi,
      /(?:@|assigned to)\s*([\w\s]+):?\s*([^\n]+)/gi,
      /([A-Z][a-z]+ [A-Z][a-z]+) will ([^\n]+)/gi
    ];

    for (const pattern of actionPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        let assignee: string | undefined;
        let description: string;

        if (match.length > 2) {
          assignee = match[1].trim();
          description = match[2].trim();
        } else {
          description = match[1].trim();
        }

        if (description.length > 5 && description.length < 300) {
          actionItems.push({
            id: this.generateId('action', description),
            description,
            assignee,
            status: 'open',
            priority: this.inferPriority(description),
            confidence: assignee ? 0.8 : 0.6
          });
        }
      }
    }

    return actionItems;
  }

  /**
   * Infer priority from action item description
   */
  private inferPriority(description: string): ExtractedActionItem['priority'] {
    const lower = description.toLowerCase();
    if (lower.includes('urgent') || lower.includes('critical') || lower.includes('asap')) {
      return 'critical';
    }
    if (lower.includes('important') || lower.includes('high priority') || lower.includes('deadline')) {
      return 'high';
    }
    if (lower.includes('low priority') || lower.includes('when possible') || lower.includes('eventually')) {
      return 'low';
    }
    return 'medium';
  }

  /**
   * Extract topics from transcript
   */
  private extractTopics(content: string): ExtractedTopic[] {
    const topics: ExtractedTopic[] = [];
    
    // Look for section headers or topic markers
    const topicPatterns = [
      /^#+\s*(.+)$/gm,  // Markdown headers
      /(?:topic|agenda item|discussion):\s*([^\n]+)/gi,
      /(?:\d+\.\s*)([^\n]+)/gm  // Numbered lists
    ];

    for (const pattern of topicPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const name = match[1].trim();
        if (name.length > 3 && name.length < 100) {
          topics.push({
            id: this.generateId('topic', name),
            name,
            keyPoints: [],
            confidence: 0.6
          });
        }
      }
    }

    return topics;
  }

  /**
   * Extract key points from transcript
   */
  private extractKeyPoints(content: string): string[] {
    const keyPoints: string[] = [];
    
    // Look for emphasized statements
    const pointPatterns = [
      /(?:key point|important|note that|remember):?\s*([^\n]+)/gi,
      /(?:highlight|main takeaway):?\s*([^\n]+)/gi
    ];

    for (const pattern of pointPatterns) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const point = match[1].trim();
        if (point.length > 10 && point.length < 200) {
          keyPoints.push(point);
        }
      }
    }

    return keyPoints.slice(0, 10);  // Limit to top 10
  }

  // ==========================================================================
  // Calendar Integration
  // ==========================================================================

  /**
   * Enrich meeting data with calendar information
   */
  private async enrichWithCalendar(meeting: ExtractedMeeting): Promise<void> {
    if (!meeting.calendarEventId) return;

    try {
      const event = await this.fetchCalendarEvent(meeting.calendarEventId);
      
      if (event) {
        // Merge attendees
        for (const calAttendee of event.attendees) {
          const existing = meeting.attendees.find(a => 
            a.email === calAttendee.email || 
            a.name?.toLowerCase() === calAttendee.name?.toLowerCase()
          );
          
          if (existing) {
            existing.email = calAttendee.email;
            existing.confidence = Math.max(existing.confidence, 0.9);
          } else {
            meeting.attendees.push({
              name: calAttendee.name || calAttendee.email.split('@')[0],
              email: calAttendee.email,
              identifiedBy: 'calendar',
              confidence: 0.9
            });
          }
        }

        // Use calendar title if ours is generic
        if (meeting.title === 'Untitled Meeting' && event.title) {
          meeting.title = event.title;
        }

        // Set duration from calendar
        if (event.startTime && event.endTime) {
          const duration = (event.endTime.getTime() - event.startTime.getTime()) / 1000 / 60;
          meeting.duration = `${duration} minutes`;
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch calendar event ${meeting.calendarEventId}:`, error);
    }
  }

  /**
   * Fetch calendar event by ID
   */
  private async fetchCalendarEvent(eventId: string): Promise<CalendarEvent | null> {
    // This is a placeholder - actual implementation would use Google Calendar API, etc.
    // For now, return null to indicate calendar data not available
    return null;
  }

  /**
   * Write meeting summary back to calendar
   */
  async writebackToCalendar(meeting: ExtractedMeeting): Promise<boolean> {
    if (!this.config.calendarIntegration?.enabled || !meeting.calendarEventId) {
      return false;
    }

    try {
      // Generate summary
      const summary = this.generateMeetingSummary(meeting);
      
      // This would call the actual calendar API
      console.log(`Would write back to calendar event ${meeting.calendarEventId}:`);
      console.log(summary);
      
      return true;
    } catch (error) {
      console.error('Failed to write back to calendar:', error);
      return false;
    }
  }

  /**
   * Generate meeting summary for calendar writeback
   */
  private generateMeetingSummary(meeting: ExtractedMeeting): string {
    const lines = [
      `## Meeting Summary: ${meeting.title}`,
      '',
      `**Date:** ${meeting.date}`,
      `**Attendees:** ${meeting.attendees.map(a => a.name).join(', ')}`,
      ''
    ];

    if (meeting.decisions.length > 0) {
      lines.push('### Decisions', '');
      meeting.decisions.forEach((d, i) => {
        lines.push(`${i + 1}. ${d.description}`);
      });
      lines.push('');
    }

    if (meeting.actionItems.length > 0) {
      lines.push('### Action Items', '');
      meeting.actionItems.forEach((a, i) => {
        const assignee = a.assignee ? ` (@${a.assignee})` : '';
        const due = a.dueDate ? ` [Due: ${a.dueDate}]` : '';
        lines.push(`${i + 1}. ${a.description}${assignee}${due}`);
      });
      lines.push('');
    }

    return lines.join('\n');
  }

  // ==========================================================================
  // Data Persistence
  // ==========================================================================

  /**
   * Save extracted meeting to org-os data structure
   */
  async saveToOrgOs(meeting: ExtractedMeeting): Promise<void> {
    const meetingsPath = path.join(this.config.orgOsPath, 'data', 'meetings.yaml');
    
    // Load existing meetings
    const data = this.loadYaml(meetingsPath, { meetings: [] });
    const meetings: any[] = data.meetings || [];

    // Check for existing meeting
    const existingIndex = meetings.findIndex(m => 
      m.id === meeting.id || 
      (m.sourceFile === meeting.sourceFile && m.date === meeting.date)
    );

    // Convert to org-os format
    const orgOsMeeting = {
      id: meeting.id,
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration,
      source_file: meeting.sourceFile,
      attendees: meeting.attendees.map(a => ({
        name: a.name,
        email: a.email,
        confidence: a.confidence
      })),
      decisions: meeting.decisions.map(d => ({
        id: d.id,
        description: d.description,
        confidence: d.confidence
      })),
      action_items: meeting.actionItems.map(a => ({
        id: a.id,
        description: a.description,
        assignee: a.assignee,
        status: a.status,
        priority: a.priority,
        confidence: a.confidence
      })),
      topics: meeting.topics.map(t => ({
        id: t.id,
        name: t.name
      })),
      calendar_event_id: meeting.calendarEventId,
      extracted_at: new Date().toISOString(),
      confidence: meeting.confidence
    };

    if (existingIndex >= 0) {
      meetings[existingIndex] = orgOsMeeting;
    } else {
      meetings.push(orgOsMeeting);
    }

    // Save back
    data.meetings = meetings;
    this.saveYaml(meetingsPath, data);

    // Also update members.yaml with any new attendees
    await this.updateMembersFromAttendees(meeting.attendees);
  }

  /**
   * Update members.yaml with attendees not already registered
   */
  private async updateMembersFromAttendees(attendees: ExtractedAttendee[]): Promise<void> {
    const membersPath = path.join(this.config.orgOsPath, 'data', 'members.yaml');
    const data = this.loadYaml(membersPath, { members: [] });
    const members: any[] = data.members || [];

    for (const attendee of attendees) {
      const exists = members.some(m => 
        m.name.toLowerCase() === attendee.name.toLowerCase() ||
        (attendee.email && m.email === attendee.email)
      );

      if (!exists && attendee.confidence >= 0.8) {
        members.push({
          id: this.generateId('member', attendee.name),
          name: attendee.name,
          role: 'member',
          type: 'person',
          email: attendee.email,
          joined: new Date().toISOString().split('T')[0]
        });
      }
    }

    data.members = members;
    this.saveYaml(membersPath, data);
  }

  /**
   * Batch process all pending transcripts
   */
  async processAll(): Promise<PipelineResult[]> {
    const transcripts = await this.discoverTranscripts();
    const results: PipelineResult[] = [];

    for (const transcript of transcripts) {
      const result = await this.processTranscript(transcript);
      
      if (result.success && result.meeting) {
        await this.saveToOrgOs(result.meeting);
        
        // Write back to calendar if enabled
        if (this.config.calendarIntegration?.enabled) {
          await this.writebackToCalendar(result.meeting);
        }
      }

      results.push(result);
    }

    return results;
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

  private generateMeetingId(metadata: TranscriptMetadata): string {
    const date = metadata.date || new Date().toISOString().split('T')[0];
    const title = metadata.title || 'meeting';
    return `meeting-${date}-${this.slugify(title)}`;
  }

  private generateId(prefix: string, content: string): string {
    const slug = this.slugify(content.slice(0, 30));
    const hash = this.simpleHash(content).slice(0, 6);
    return `${prefix}-${slug}-${hash}`;
  }

  private slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  private validateMeeting(meeting: ExtractedMeeting): string[] {
    const warnings: string[] = [];

    if (meeting.attendees.length === 0) {
      warnings.push('No attendees detected');
    }

    if (meeting.confidence < this.config.confidenceThreshold!) {
      warnings.push(`Low overall confidence: ${Math.round(meeting.confidence * 100)}%`);
    }

    return warnings;
  }
}

// ============================================================================
// Export convenience functions
// ============================================================================

export function createMeetingPipeline(config: MeetingPipelineConfig): MeetingPipeline {
  return new MeetingPipeline(config);
}

export async function processMeetingTranscript(
  transcriptPath: string,
  config: MeetingPipelineConfig
): Promise<PipelineResult> {
  const pipeline = new MeetingPipeline(config);
  await pipeline.initialize();
  
  const content = readFileSync(transcriptPath, 'utf-8');
  const transcript: MeetingTranscript = {
    filePath: transcriptPath,
    content,
    metadata: {}  // Will be parsed by the pipeline
  };
  
  const result = await pipeline.processTranscript(transcript);
  
  if (result.success && result.meeting) {
    await pipeline.saveToOrgOs(result.meeting);
  }
  
  return result;
}
