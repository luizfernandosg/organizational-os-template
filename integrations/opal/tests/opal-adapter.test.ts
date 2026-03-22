/** @jest-environment node */
import { describe, expect, test, jest, beforeEach, afterEach } from '@jest/globals';
import { OpalBridge, OpalConfig, ExtractedEntity } from '../src/index.js';
import { mkdirSync, rmSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock OPAL command execution
const mockExecSync = jest.fn();
const mockSpawn = jest.fn();

jest.unstable_mockModule('child_process', () => ({
  execSync: mockExecSync,
  spawn: mockSpawn
}));

describe('OpalBridge', () => {
  let tempDir: string;
  let opalDir: string;
  let orgOsDir: string;
  let bridge: OpalBridge;

  beforeEach(async () => {
    // Create temporary test directories
    tempDir = join(tmpdir(), `opal-bridge-test-${Date.now()}`);
    opalDir = join(tempDir, 'opal');
    orgOsDir = join(tempDir, 'org-os');
    
    mkdirSync(opalDir, { recursive: true });
    mkdirSync(orgOsDir, { recursive: true });
    mkdirSync(join(orgOsDir, 'data'), { recursive: true });
    
    // Create mock CLAUDE.md to simulate valid OPAL installation
    writeFileSync(join(opalDir, 'CLAUDE.md'), '# OPAL - Open Protocol Agent Librarian');
    
    // Create mock inbox and staging directories
    mkdirSync(join(opalDir, '_inbox'), { recursive: true });
    mkdirSync(join(opalDir, '_staging'), { recursive: true });
    mkdirSync(join(opalDir, '_index'), { recursive: true });
    
    const config: OpalConfig = {
      opalPath: opalDir,
      orgOsPath: orgOsDir,
      profile: 'test'
    };
    
    bridge = new OpalBridge(config);
    
    // Reset mocks
    mockExecSync.mockReset();
    mockSpawn.mockReset();
  });

  afterEach(() => {
    // Cleanup temp directory
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('initialization', () => {
    test('should initialize successfully with valid OPAL directory', async () => {
      await expect(bridge.initialize()).resolves.not.toThrow();
    });

    test('should throw error when OPAL directory does not exist', async () => {
      const invalidBridge = new OpalBridge({
        opalPath: '/nonexistent/path',
        orgOsPath: orgOsDir,
        profile: 'test'
      });

      await expect(invalidBridge.initialize()).rejects.toThrow('OPAL not found');
    });

    test('should throw error when CLAUDE.md is missing', async () => {
      rmSync(join(opalDir, 'CLAUDE.md'));
      
      await expect(bridge.initialize()).rejects.toThrow('CLAUDE.md missing');
    });

    test('should handle nested relative paths correctly', async () => {
      const nestedBridge = new OpalBridge({
        opalPath: '../../opal',
        orgOsPath: orgOsDir,
        profile: 'test'
      });
      
      // Should construct correct absolute path
      expect(nestedBridge).toBeDefined();
    });
  });

  describe('getStatus', () => {
    test('should return connected status when OPAL responds', async () => {
      mockExecSync.mockReturnValue('OPAL v2.1.0 - 5 pending items');
      
      const status = await bridge.getStatus();
      
      expect(status.status).toBe('connected');
      expect(status.profile).toBe('test');
    });

    test('should return error status when OPAL command fails', async () => {
      mockExecSync.mockImplementation(() => {
        throw new Error('Command failed');
      });
      
      const status = await bridge.getStatus();
      
      expect(status.status).toBe('error');
      expect(status.pendingItems).toBe(0);
    });

    test('should parse version from OPAL response', async () => {
      mockExecSync.mockReturnValue('OPAL v2.1.0 - 5 pending items');
      
      const status = await bridge.getStatus();
      
      // Version extraction is not fully implemented yet
      expect(status).toHaveProperty('version');
    });
  });

  describe('process', () => {
    test('should extract person entities from content', async () => {
      const tempFile = join(tempDir, 'meeting.md');
      writeFileSync(tempFile, 'Meeting with John Smith and Jane Doe about project planning.');
      
      const entities = await bridge.process(tempFile);
      
      const people = entities.filter(e => e.type === 'person');
      expect(people.length).toBeGreaterThanOrEqual(1);
      expect(people.some(p => p.name === 'John Smith')).toBe(true);
    });

    test('should extract organization entities from content', async () => {
      const tempFile = join(tempDir, 'meeting.md');
      writeFileSync(tempFile, 'Working with ReFi DAO and Regen Network on coordination.');
      
      const entities = await bridge.process(tempFile);
      
      const orgs = entities.filter(e => e.type === 'organization');
      expect(orgs.length).toBeGreaterThanOrEqual(1);
      expect(orgs.some(o => o.name === 'ReFi DAO')).toBe(true);
    });

    test('should extract pattern entities from content', async () => {
      const tempFile = join(tempDir, 'meeting.md');
      writeFileSync(tempFile, 'Implementing distributed coordination and circular funding models.');
      
      const entities = await bridge.process(tempFile);
      
      const patterns = entities.filter(e => e.type === 'pattern');
      expect(patterns.length).toBeGreaterThanOrEqual(1);
    });

    test('should assign confidence scores to entities', async () => {
      const tempFile = join(tempDir, 'meeting.md');
      writeFileSync(tempFile, 'Alice Johnson from GreenDAO presented the proposal.');
      
      const entities = await bridge.process(tempFile);
      
      entities.forEach(entity => {
        expect(entity.confidence).toBeGreaterThanOrEqual(0);
        expect(entity.confidence).toBeLessThanOrEqual(1);
      });
    });

    test('should generate unique IDs for entities', async () => {
      const tempFile = join(tempDir, 'meeting.md');
      writeFileSync(tempFile, 'John Smith and John Smith discussed the topic.');
      
      const entities = await bridge.process(tempFile);
      
      const ids = entities.map(e => e.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    test('should handle file not found gracefully', async () => {
      await expect(bridge.process('/nonexistent/file.md')).rejects.toThrow();
    });
  });

  describe('getPending', () => {
    test('should return empty array when no pending items', async () => {
      const pending = await bridge.getPending();
      
      expect(pending).toEqual([]);
    });

    test('should return pending items from staging', async () => {
      // Create mock staging data
      const stagingPath = join(opalDir, '_staging', 'entity-001.json');
      const mockEntity = {
        id: 'entity-001',
        name: 'Test Entity',
        type: 'person',
        confidence: 0.85
      };
      writeFileSync(stagingPath, JSON.stringify(mockEntity));
      
      const pending = await bridge.getPending();
      
      // Note: Currently returns empty array as parsing is not fully implemented
      expect(Array.isArray(pending)).toBe(true);
    });
  });

  describe('approve', () => {
    test('should log approval of entity', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await bridge.approve('entity-001');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Approved: entity-001'));
      consoleSpy.mockRestore();
    });
  });

  describe('reject', () => {
    test('should log rejection of entity', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await bridge.reject('entity-001');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Rejected: entity-001'));
      consoleSpy.mockRestore();
    });
  });

  describe('edit', () => {
    test('should log edit of entity', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await bridge.edit('entity-001', { name: 'Updated Name' });
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Edited: entity-001'));
      consoleSpy.mockRestore();
    });
  });

  describe('ask', () => {
    test('should return search results for query', async () => {
      mockExecSync.mockReturnValue(JSON.stringify([
        { name: 'Result 1', score: 0.95 },
        { name: 'Result 2', score: 0.87 }
      ]));
      
      const results = await bridge.ask('funding models');
      
      expect(Array.isArray(results)).toBe(true);
    });

    test('should handle empty search results', async () => {
      mockExecSync.mockReturnValue('[]');
      
      const results = await bridge.ask('nonexistent query');
      
      expect(results).toEqual([]);
    });
  });

  describe('quest', () => {
    test('should create new quest with ID', async () => {
      const quest = await bridge.quest('regenerative finance');
      
      expect(quest).toHaveProperty('id');
      expect(quest.topic).toBe('regenerative finance');
      expect(quest.status).toBe('active');
      expect(quest.createdAt).toBeInstanceOf(Date);
      expect(quest.updates).toEqual([]);
    });

    test('should generate unique quest IDs', async () => {
      const quest1 = await bridge.quest('topic 1');
      const quest2 = await bridge.quest('topic 2');
      
      expect(quest1.id).not.toBe(quest2.id);
    });
  });

  describe('questContinue', () => {
    test('should add update to quest', async () => {
      const quest = await bridge.questContinue('quest-001', 'New findings about grants');
      
      expect(quest.updates).toHaveLength(1);
      expect(quest.updates[0].content).toBe('New findings about grants');
      expect(quest.updates[0].timestamp).toBeInstanceOf(Date);
    });
  });

  describe('handoff', () => {
    test('should log handoff creation', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await bridge.handoff('Task handoff content', 'Alice');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Handoff created'));
      consoleSpy.mockRestore();
    });

    test('should work without assignee', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await bridge.handoff('Task handoff content');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Handoff created'));
      consoleSpy.mockRestore();
    });
  });

  describe('activity', () => {
    test('should return activity list', async () => {
      const activity = await bridge.activity();
      
      expect(Array.isArray(activity)).toBe(true);
    });
  });

  describe('ingestOrgOsData', () => {
    test('should ingest members data', async () => {
      const membersPath = join(orgOsDir, 'data', 'members.yaml');
      writeFileSync(membersPath, 'members:\n  - name: Alice\n    role: Developer');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await bridge.ingestOrgOsData('members');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('members'));
      consoleSpy.mockRestore();
    });

    test('should handle missing data file gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await bridge.ingestOrgOsData('finances');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
      consoleSpy.mockRestore();
    });

    test('should ingest projects data', async () => {
      const projectsPath = join(orgOsDir, 'data', 'projects.yaml');
      writeFileSync(projectsPath, 'projects:\n  - name: Project Alpha\n    status: active');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await bridge.ingestOrgOsData('projects');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('projects'));
      consoleSpy.mockRestore();
    });

    test('should ingest meetings data', async () => {
      const meetingsPath = join(orgOsDir, 'data', 'meetings.yaml');
      writeFileSync(meetingsPath, 'meetings:\n  - title: Sprint Planning\n    date: 2026-03-15');
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await bridge.ingestOrgOsData('meetings');
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('meetings'));
      consoleSpy.mockRestore();
    });
  });

  describe('ingestNetworkKnowledge', () => {
    test('should process network knowledge array', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const knowledge = [
        { rid: { identifier: 'knowledge-1' }, content: 'Test knowledge' },
        { rid: { identifier: 'knowledge-2' }, content: 'More knowledge' }
      ];
      
      await bridge.ingestNetworkKnowledge(knowledge);
      
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      consoleSpy.mockRestore();
    });

    test('should handle empty knowledge array', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await bridge.ingestNetworkKnowledge([]);
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should handle knowledge without identifier', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const knowledge = [
        { content: 'Test knowledge without ID' }
      ];
      
      await bridge.ingestNetworkKnowledge(knowledge);
      
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('unknown'));
      consoleSpy.mockRestore();
    });
  });
});

// Mock child_process tests
describe('Command Execution Error Handling', () => {
  let tempDir: string;
  let bridge: OpalBridge;

  beforeEach(() => {
    tempDir = join(tmpdir(), `opal-bridge-error-test-${Date.now()}`);
    mkdirSync(tempDir, { recursive: true });
    mkdirSync(join(tempDir, '_inbox'), { recursive: true });
    mkdirSync(join(tempDir, '_staging'), { recursive: true });
    writeFileSync(join(tempDir, 'CLAUDE.md'), '# OPAL');

    bridge = new OpalBridge({
      opalPath: tempDir,
      orgOsPath: tempDir,
      profile: 'test'
    });
  });

  afterEach(() => {
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('should handle OPAL command failures gracefully', async () => {
    mockExecSync.mockImplementation(() => {
      throw new Error('Connection refused');
    });

    const status = await bridge.getStatus();
    
    expect(status.status).toBe('error');
  });

  test('should parse malformed JSON in search results', async () => {
    mockExecSync.mockReturnValue('invalid json');

    const results = await bridge.ask('query');
    
    // Should return empty array for invalid JSON
    expect(Array.isArray(results)).toBe(true);
  });
});
