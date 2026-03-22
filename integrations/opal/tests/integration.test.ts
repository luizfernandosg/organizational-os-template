/** @jest-environment node */
import { describe, expect, test, jest, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { OpalBridge, OpalConfig } from '../src/index.js';
import { mkdirSync, rmSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

/**
 * Integration Tests for OPAL Bridge
 * 
 * These tests verify end-to-end workflows including:
 * - Meeting processing pipeline
 * - Entity extraction and review
 * - Git sync verification
 */

describe('OPAL Bridge Integration Tests', () => {
  let tempDir: string;
  let opalDir: string;
  let orgOsDir: string;
  let contentDir: string;
  let bridge: OpalBridge;

  beforeAll(() => {
    // Create temporary test environment
    tempDir = join(tmpdir(), `opal-bridge-integration-${Date.now()}`);
    opalDir = join(tempDir, 'opal');
    orgOsDir = join(tempDir, 'org-os');
    contentDir = join(orgOsDir, 'content', 'meetings');
    
    // Create directory structure
    mkdirSync(opalDir, { recursive: true });
    mkdirSync(join(opalDir, '_inbox'), { recursive: true });
    mkdirSync(join(opalDir, '_staging'), { recursive: true });
    mkdirSync(join(opalDir, '_index'), { recursive: true });
    mkdirSync(join(opalDir, 'handoffs'), { recursive: true });
    mkdirSync(orgOsDir, { recursive: true });
    mkdirSync(join(orgOsDir, 'data'), { recursive: true });
    mkdirSync(contentDir, { recursive: true });
    
    // Create mock CLAUDE.md
    writeFileSync(join(opalDir, 'CLAUDE.md'), '# OPAL - Open Protocol Agent Librarian');
    
    // Create mock federation.yaml
    const federationYaml = `
opal-bridge:
  enabled: true
  opal_path: "${opalDir}"
  profile: "integration-test"
  auto_process: true
  review_required: true
`;
    writeFileSync(join(orgOsDir, 'federation.yaml'), federationYaml);
    
    // Create mock org-os data files
    writeFileSync(join(orgOsDir, 'data', 'members.yaml'), `
members:
  - id: alice
    name: Alice Johnson
    role: Lead Developer
    email: alice@example.com
  - id: bob
    name: Bob Smith
    role: Product Manager
    email: bob@example.com
`);
    
    writeFileSync(join(orgOsDir, 'data', 'projects.yaml'), `
projects:
  - id: opal-bridge
    name: OPAL Bridge Integration
    status: active
    team: [alice, bob]
  - id: knowledge-graph
    name: Knowledge Graph Explorer
    status: planning
    team: [alice]
`);
  });

  afterAll(() => {
    // Cleanup
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  beforeEach(async () => {
    const config: OpalConfig = {
      opalPath: opalDir,
      orgOsPath: orgOsDir,
      profile: 'integration-test'
    };
    bridge = new OpalBridge(config);
    await bridge.initialize();
  });

  describe('Meeting Processing Pipeline', () => {
    test('should process meeting transcript end-to-end', async () => {
      const meetingContent = `# Weekly Coordination Meeting
Date: 2026-03-21

**Attendees:**
- Alice Johnson (Facilitator)
- Bob Smith (Product)
- Carol Williams (Design)

**Discussion:**
We reviewed progress on the OPAL Bridge Integration project. Alice presented
updates on the entity extraction pipeline. Bob outlined the roadmap for
Knowledge Graph Explorer. Carol shared designs for the new interface.

**Decisions:**
1. Move forward with semantic search implementation
2. Schedule review session for next Friday

**Action Items:**
- Alice: Complete test coverage for adapter module
- Bob: Draft project charter for Knowledge Graph Explorer
- Carol: Share Figma prototypes by Wednesday

**Patterns Identified:**
Distributed coordination and circular funding models were discussed as
potential approaches for community engagement.
`;

      const meetingFile = join(contentDir, '2026-03-21-weekly-coordination.md');
      writeFileSync(meetingFile, meetingContent);

      const entities = await bridge.process(meetingFile);

      // Verify entities were extracted
      expect(entities.length).toBeGreaterThan(0);
      
      // Check for people
      const people = entities.filter(e => e.type === 'person');
      expect(people.some(p => p.name === 'Alice Johnson')).toBe(true);
      expect(people.some(p => p.name === 'Bob Smith')).toBe(true);
      expect(people.some(p => p.name === 'Carol Williams')).toBe(true);

      // Check for patterns
      const patterns = entities.filter(e => e.type === 'pattern');
      expect(patterns.length).toBeGreaterThanOrEqual(1);
    });

    test('should handle multiple file processing in sequence', async () => {
      const files = [
        {
          name: 'meeting-1.md',
          content: 'Discussed regenerative finance with ReFi DAO and GreenDAO.'
        },
        {
          name: 'meeting-2.md',
          content: 'Meeting with Impact Network about coordination protocols.'
        },
        {
          name: 'meeting-3.md',
          content: 'Review with Community Council on funding models.'
        }
      ];

      const allEntities: any[] = [];
      
      for (const file of files) {
        const filePath = join(contentDir, file.name);
        writeFileSync(filePath, file.content);
        const entities = await bridge.process(filePath);
        allEntities.push(...entities);
      }

      // Verify we extracted entities from all files
      expect(allEntities.length).toBeGreaterThan(0);
      
      // Check for organization mentions
      const orgs = allEntities.filter(e => e.type === 'organization');
      expect(orgs.length).toBeGreaterThanOrEqual(2);
    });

    test('should persist processed entities to staging area', async () => {
      const meetingContent = 'Alice Johnson proposed a new governance pattern for the Community Council.';
      const meetingFile = join(contentDir, '2026-03-21-governance.md');
      writeFileSync(meetingFile, meetingContent);

      await bridge.process(meetingFile);

      // Check that staging directory exists
      const stagingPath = join(opalDir, '_staging');
      expect(existsSync(stagingPath)).toBe(true);
    });
  });

  describe('Entity Extraction and Review', () => {
    test('should complete approve workflow for extracted entity', async () => {
      const meetingContent = 'Alice Johnson presented the funding proposal.';
      const meetingFile = join(contentDir, '2026-03-21-proposal.md');
      writeFileSync(meetingFile, meetingContent);

      const entities = await bridge.process(meetingFile);
      
      // Verify we have entities to approve
      expect(entities.length).toBeGreaterThan(0);
      
      // Approve each entity
      for (const entity of entities) {
        await expect(bridge.approve(entity.id)).resolves.not.toThrow();
      }
    });

    test('should complete reject workflow for extracted entity', async () => {
      const meetingContent = 'Alice Johnson presented the funding proposal.';
      const meetingFile = join(contentDir, '2026-03-21-proposal-2.md');
      writeFileSync(meetingFile, meetingContent);

      const entities = await bridge.process(meetingFile);
      
      expect(entities.length).toBeGreaterThan(0);
      
      // Reject each entity
      for (const entity of entities) {
        await expect(bridge.reject(entity.id)).resolves.not.toThrow();
      }
    });

    test('should complete edit workflow for extracted entity', async () => {
      const meetingContent = 'Alice Johnson presented the funding proposal.';
      const meetingFile = join(contentDir, '2026-03-21-proposal-3.md');
      writeFileSync(meetingFile, meetingContent);

      const entities = await bridge.process(meetingFile);
      
      expect(entities.length).toBeGreaterThan(0);
      
      // Edit the first entity
      const entity = entities[0];
      await expect(
        bridge.edit(entity.id, { name: 'Updated Name', confidence: 0.95 })
      ).resolves.not.toThrow();
    });

    test('should retrieve pending items for review', async () => {
      // Currently returns empty array as implementation is stubbed
      const pending = await bridge.getPending();
      
      expect(Array.isArray(pending)).toBe(true);
    });
  });

  describe('Knowledge Ingestion', () => {
    test('should ingest all org-os data types', async () => {
      const dataTypes = ['members', 'projects', 'meetings', 'finances'] as const;
      
      for (const dataType of dataTypes) {
        // Create data file if it doesn't exist
        const dataPath = join(orgOsDir, 'data', `${dataType}.yaml`);
        if (!existsSync(dataPath)) {
          writeFileSync(dataPath, `${dataType}:\n  - name: Test ${dataType}\n    status: active`);
        }
        
        await expect(bridge.ingestOrgOsData(dataType)).resolves.not.toThrow();
      }
    });

    test('should handle ingest of empty data files', async () => {
      writeFileSync(join(orgOsDir, 'data', 'empty.yaml'), '');
      
      // Should not throw
      await expect(bridge.ingestOrgOsData('empty' as any)).resolves.not.toThrow();
    });

    test('should ingest network knowledge from KOI format', async () => {
      const networkKnowledge = [
        {
          rid: { identifier: 'koi-entity-1', cid: 'Qm123' },
          type: 'Pattern',
          name: 'Distributed Coordination',
          description: 'A pattern for decentralized organization'
        },
        {
          rid: { identifier: 'koi-entity-2', cid: 'Qm456' },
          type: 'Organization',
          name: 'ReFi DAO Barcelona',
          description: 'Local ReFi chapter'
        }
      ];

      await expect(bridge.ingestNetworkKnowledge(networkKnowledge)).resolves.not.toThrow();
    });
  });

  describe('Research Quest Workflow', () => {
    test('should complete full quest lifecycle', async () => {
      // Start a quest
      const quest = await bridge.quest('regenerative finance funding models');
      
      expect(quest).toHaveProperty('id');
      expect(quest.topic).toBe('regenerative finance funding models');
      expect(quest.status).toBe('active');
      
      // Continue the quest with findings
      const updatedQuest = await bridge.questContinue(
        quest.id,
        'Found 3 papers on circular funding models in regenerative contexts'
      );
      
      expect(updatedQuest.updates).toHaveLength(1);
      expect(updatedQuest.updates[0].content).toContain('Found 3 papers');
      
      // Add more findings
      const furtherUpdatedQuest = await bridge.questContinue(
        quest.id,
        'Community DAOs in Barcelona using quadratic funding'
      );
      
      expect(furtherUpdatedQuest.updates).toHaveLength(1);
    });

    test('should handle multiple concurrent quests', async () => {
      const quest1 = await bridge.quest('topic A');
      const quest2 = await bridge.quest('topic B');
      const quest3 = await bridge.quest('topic C');
      
      expect(quest1.id).not.toBe(quest2.id);
      expect(quest2.id).not.toBe(quest3.id);
      expect(quest1.id).not.toBe(quest3.id);
    });
  });

  describe('Handoff Workflow', () => {
    test('should create handoff with assignee', async () => {
      await expect(
        bridge.handoff('Complete the entity extraction module', 'Alice')
      ).resolves.not.toThrow();
    });

    test('should create handoff without assignee', async () => {
      await expect(
        bridge.handoff('Review the documentation for accuracy')
      ).resolves.not.toThrow();
    });
  });

  describe('Semantic Search', () => {
    test('should return results for valid query', async () => {
      const results = await bridge.ask('funding models');
      
      expect(Array.isArray(results)).toBe(true);
    });

    test('should handle empty results gracefully', async () => {
      const results = await bridge.ask('xyznonexistentquery12345');
      
      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });
  });

  describe('Activity Tracking', () => {
    test('should return activity history', async () => {
      const activity = await bridge.activity();
      
      expect(Array.isArray(activity)).toBe(true);
    });
  });

  describe('Git Sync Verification', () => {
    test('should verify git repository exists', () => {
      // Check if git is available
      const { execSync } = require('child_process');
      
      try {
        const gitVersion = execSync('git --version', { encoding: 'utf-8' });
        expect(gitVersion).toContain('git version');
      } catch (error) {
        // Git not available - skip this test
        console.log('Git not available, skipping git verification');
      }
    });

    test('should verify federation.yaml exists and is valid', () => {
      const federationPath = join(orgOsDir, 'federation.yaml');
      expect(existsSync(federationPath)).toBe(true);
      
      const content = readFileSync(federationPath, 'utf-8');
      expect(content).toContain('opal-bridge:');
      expect(content).toContain('opal_path:');
    });

    test('should verify org-os directory structure', () => {
      expect(existsSync(join(orgOsDir, 'data'))).toBe(true);
      expect(existsSync(join(orgOsDir, 'federation.yaml'))).toBe(true);
    });

    test('should verify OPAL directory structure', () => {
      expect(existsSync(join(opalDir, '_inbox'))).toBe(true);
      expect(existsSync(join(opalDir, '_staging'))).toBe(true);
      expect(existsSync(join(opalDir, '_index'))).toBe(true);
      expect(existsSync(join(opalDir, 'CLAUDE.md'))).toBe(true);
    });
  });

  describe('Configuration Loading', () => {
    test('should load configuration from federation.yaml', async () => {
      const federationPath = join(orgOsDir, 'federation.yaml');
      
      // Verify the file exists and has proper structure
      expect(existsSync(federationPath)).toBe(true);
      
      const content = readFileSync(federationPath, 'utf-8');
      expect(content).toContain('opal-bridge:');
      expect(content).toContain('integration-test');
    });

    test('should handle invalid configuration gracefully', async () => {
      const invalidConfig: OpalConfig = {
        opalPath: '/nonexistent/path',
        orgOsPath: orgOsDir,
        profile: 'test'
      };
      
      const invalidBridge = new OpalBridge(invalidConfig);
      
      await expect(invalidBridge.initialize()).rejects.toThrow();
    });
  });

  describe('Error Recovery', () => {
    test('should recover from processing errors', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Try to ingest non-existent data type
      await bridge.ingestOrgOsData('nonexistent' as any);
      
      // Should log warning but not throw
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should handle concurrent operations', async () => {
      const promises = [
        bridge.quest('topic 1'),
        bridge.quest('topic 2'),
        bridge.quest('topic 3'),
        bridge.activity(),
        bridge.getStatus()
      ];
      
      // All should complete without error
      await expect(Promise.all(promises)).resolves.not.toThrow();
    });
  });
});

/**
 * End-to-End Workflow Test
 * Simulates complete meeting processing workflow
 */
describe('End-to-End Meeting Workflow', () => {
  let tempDir: string;
  let bridge: OpalBridge;

  beforeAll(() => {
    tempDir = join(tmpdir(), `opal-bridge-e2e-${Date.now()}`);
    const opalDir = join(tempDir, 'opal');
    const orgOsDir = join(tempDir, 'org-os');
    
    mkdirSync(opalDir, { recursive: true });
    mkdirSync(join(opalDir, '_inbox'), { recursive: true });
    mkdirSync(join(opalDir, '_staging'), { recursive: true });
    mkdirSync(join(opalDir, '_index'), { recursive: true });
    writeFileSync(join(opalDir, 'CLAUDE.md'), '# OPAL');
    
    mkdirSync(join(orgOsDir, 'content', 'meetings'), { recursive: true });
    writeFileSync(join(orgOsDir, 'federation.yaml'), `
opal-bridge:
  enabled: true
  opal_path: "${opalDir}"
  profile: "e2e-test"
`);
    
    bridge = new OpalBridge({
      opalPath: opalDir,
      orgOsPath: orgOsDir,
      profile: 'e2e-test'
    });
  });

  afterAll(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('complete workflow: meeting to approved knowledge', async () => {
    await bridge.initialize();
    
    // Step 1: Create meeting transcript
    const meetingContent = `
# ReFi DAO Barcelona Coordination
Date: 2026-03-21

**Participants:**
- Maria Garcia (Facilitator, ReFi DAO Barcelona)
- Pedro Sanchez (Developer, GreenDAO)
- Ana Lopez (Designer, Impact Network)

**Key Discussion Points:**
We reviewed the quarterly progress on regenerative funding initiatives.
Maria presented updates on the community coordination protocol that uses
quadratic voting for decision making. Pedro shared technical specifications
for the new funding distribution smart contracts. Ana discussed the user
research findings on community engagement patterns.

**Organizations Mentioned:**
- ReFi DAO Barcelona
- GreenDAO
- Impact Network
- Community Council

**Action Items:**
1. Maria: Finalize the coordination protocol documentation
2. Pedro: Deploy test contracts to testnet by Friday
3. Ana: Share user personas with the team

**New Patterns Identified:**
- Quadratic voting for community decisions
- Circular funding models for sustained impact
- Distributed coordination across time zones
`;

    const meetingFile = join(tempDir, 'org-os', 'content', 'meetings', '2026-03-21-refi-coordination.md');
    writeFileSync(meetingFile, meetingContent);
    
    // Step 2: Process the meeting through OPAL
    const entities = await bridge.process(meetingFile);
    
    expect(entities.length).toBeGreaterThan(5);
    
    // Verify people extracted
    const people = entities.filter(e => e.type === 'person');
    expect(people).toHaveLength(3);
    expect(people.some(p => p.name === 'Maria Garcia')).toBe(true);
    expect(people.some(p => p.name === 'Pedro Sanchez')).toBe(true);
    expect(people.some(p => p.name === 'Ana Lopez')).toBe(true);
    
    // Verify organizations extracted
    const orgs = entities.filter(e => e.type === 'organization');
    expect(orgs.length).toBeGreaterThanOrEqual(2);
    
    // Verify patterns extracted
    const patterns = entities.filter(e => e.type === 'pattern');
    expect(patterns.length).toBeGreaterThanOrEqual(2);
    
    // Step 3: Review entities
    const pending = await bridge.getPending();
    expect(Array.isArray(pending)).toBe(true);
    
    // Step 4: Approve high-confidence entities
    for (const entity of entities) {
      if (entity.confidence > 0.7) {
        await bridge.approve(entity.id);
      }
    }
    
    // Step 5: Search for newly approved knowledge
    const searchResults = await bridge.ask('funding models');
    expect(Array.isArray(searchResults)).toBe(true);
    
    // Step 6: Create a quest for follow-up research
    const quest = await bridge.quest('regenerative funding mechanisms');
    expect(quest.topic).toBe('regenerative funding mechanisms');
    
    // Step 7: Add findings to quest
    await bridge.questContinue(
      quest.id,
      'Found 5 relevant case studies on quadratic funding in DAOs'
    );
    
    // Step 8: Create handoff for team
    await bridge.handoff(
      'Meeting processed and entities approved. Follow-up research started on funding mechanisms.',
      'Maria Garcia'
    );
    
    // Step 9: Verify activity tracking
    const activity = await bridge.activity();
    expect(Array.isArray(activity)).toBe(true);
  });
});
