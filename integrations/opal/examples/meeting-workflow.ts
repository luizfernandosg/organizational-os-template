/**
 * OPAL Bridge - Complete Meeting Processing Workflow
 * 
 * This example demonstrates a complete workflow from meeting transcript
 * to approved knowledge, including:
 * 
 * 1. Ingesting meeting transcripts
 * 2. Extracting entities (people, organizations, patterns)
 * 3. Reviewing and approving entities
 * 4. Creating follow-up quests
 * 5. Generating action items
 * 6. Syncing to knowledge base
 */

import { OpalBridge, OpalConfig, ExtractedEntity } from '../src/index.js';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Meeting data structure
interface Meeting {
  id: string;
  title: string;
  date: string;
  attendees: string[];
  transcriptPath: string;
  extractedEntities?: ExtractedEntity[];
  approvedEntities?: ExtractedEntity[];
  actionItems?: ActionItem[];
}

interface ActionItem {
  id: string;
  task: string;
  owner: string;
  dueDate?: string;
  status: 'pending' | 'in-progress' | 'completed';
}

async function main() {
  console.log('🌿 OPAL Bridge - Complete Meeting Workflow Example\n');
  console.log('This example demonstrates the full meeting processing pipeline.\n');

  // ============================================================================
  // Setup Environment
  // ============================================================================
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Phase 1: Environment Setup');
  console.log('═══════════════════════════════════════════════════════════\n');

  const tempDir = join(tmpdir(), `opal-bridge-workflow-${Date.now()}`);
  const opalDir = join(tempDir, 'opal');
  const orgOsDir = join(tempDir, 'org-os');
  const meetingsDir = join(orgOsDir, 'content', 'meetings');

  // Create directory structure
  mkdirSync(opalDir, { recursive: true });
  mkdirSync(join(opalDir, '_inbox'), { recursive: true });
  mkdirSync(join(opalDir, '_staging'), { recursive: true });
  mkdirSync(join(opalDir, '_index'), { recursive: true });
  mkdirSync(join(opalDir, 'handoffs'), { recursive: true });
  mkdirSync(meetingsDir, { recursive: true });
  mkdirSync(join(orgOsDir, 'data'), { recursive: true });

  // Create mock CLAUDE.md
  writeFileSync(join(opalDir, 'CLAUDE.md'), '# OPAL - Mock Installation');

  // Create federation.yaml
  const federationYaml = `
knowledge-commons:
  enabled: true
  opal-bridge:
    enabled: true
    opal_path: "${opalDir}"
    profile: "workflow-example"
    auto_process: true
    review_required: true
`;
  writeFileSync(join(orgOsDir, 'federation.yaml'), federationYaml);

  // Initialize the bridge
  const config: OpalConfig = {
    opalPath: opalDir,
    orgOsPath: orgOsDir,
    profile: 'workflow-example'
  };

  const bridge = new OpalBridge(config);
  await bridge.initialize();

  console.log('✅ Environment initialized\n');

  // ============================================================================
  // Create Sample Meetings
  // ============================================================================
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Phase 2: Create Sample Meetings');
  console.log('═══════════════════════════════════════════════════════════\n');

  const meetings: Meeting[] = [
    {
      id: 'meeting-001',
      title: 'ReFi DAO Barcelona - Weekly Coordination',
      date: '2026-03-15',
      attendees: ['Maria Garcia', 'Pedro Sanchez', 'Ana Lopez'],
      transcriptPath: join(meetingsDir, '2026-03-15-refi-coordination.md')
    },
    {
      id: 'meeting-002',
      title: 'Knowledge Graph Planning Session',
      date: '2026-03-18',
      attendees: ['Alice Johnson', 'Bob Smith', 'Carol Williams'],
      transcriptPath: join(meetingsDir, '2026-03-18-knowledge-graph.md')
    }
  ];

  // Write meeting transcripts
  const transcript1 = `# ReFi DAO Barcelona - Weekly Coordination
Date: 2026-03-15
Time: 15:00 UTC

**Participants:**
- Maria Garcia (Facilitator, ReFi DAO Barcelona)
- Pedro Sanchez (Developer, GreenDAO)
- Ana Lopez (Designer, Impact Network)

**Meeting Notes:**

Maria opened the meeting by reviewing progress on the distributed coordination
protocol. The ReFi DAO Barcelona team has been working closely with GreenDAO
to implement quadratic voting mechanisms for community decisions.

Pedro shared technical updates on the circular funding smart contracts. The
implementation includes soulbound tokens for participant verification and automated
payout distribution based on ecological impact metrics from Regen Network.

Ana presented user research findings on the Impact Network coordination tools.
Key insights include the need for mobile-first interfaces and multi-language
support (Spanish and Catalan).

**Key Patterns Identified:**
1. Distributed coordination across time zones
2. Circular funding models for sustained impact
3. Quadratic voting for democratic resource allocation

**Organizations Mentioned:**
- ReFi DAO Barcelona
- GreenDAO
- Impact Network
- Regen Foundation
- Community Council

**Decisions:**
- Adopt distributed coordination pattern for all major decisions
- Submit joint grant proposal with GreenDAO and Impact Network
- Move to bi-weekly meeting cadence

**Action Items:**
1. Maria: Finalize coordination protocol documentation (Due: 2026-03-22)
2. Pedro: Deploy test contracts to testnet (Due: 2026-03-20)
3. Ana: Complete mobile UI mockups (Due: 2026-03-25)
`;

  const transcript2 = `# Knowledge Graph Planning Session
Date: 2026-03-18
Time: 14:00 UTC

**Participants:**
- Alice Johnson (Lead Developer)
- Bob Smith (Product Manager)
- Carol Williams (UX Designer)

**Meeting Notes:**

Alice presented the technical architecture for the Knowledge Graph Explorer.
The system will integrate with OPAL's entity extraction pipeline and provide
visualization of organizational knowledge networks.

Bob outlined the product roadmap, prioritizing:
1. Entity search and discovery
2. Relationship visualization
3. Pattern identification across meetings
4. Integration with existing org-os data

Carol shared wireframes for the knowledge exploration interface. The design
emphasizes:
- Graph-based visualization of entity relationships
- Faceted search for filtering by entity type
- Timeline view of knowledge evolution

**Patterns for Implementation:**
- Semantic search with vector embeddings
- Incremental knowledge graph updates
- Human-in-the-loop entity verification

**Organizations:**
- OPAL Project
- Knowledge Commons Working Group

**Decisions:**
- Use React Flow for graph visualization
- Implement entity confidence scoring
- Build incremental update system

**Action Items:**
1. Alice: Set up development environment (Due: 2026-03-19)
2. Bob: Draft product requirements document (Due: 2026-03-22)
3. Carol: Create interactive prototype (Due: 2026-03-26)
`;

  writeFileSync(meetings[0].transcriptPath, transcript1);
  writeFileSync(meetings[1].transcriptPath, transcript2);

  console.log(`✅ Created ${meetings.length} meeting transcripts\n`);

  // ============================================================================
  // Process Meetings
  // ============================================================================
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Phase 3: Process Meetings through OPAL');
  console.log('═══════════════════════════════════════════════════════════\n');

  for (const meeting of meetings) {
    console.log(`Processing: ${meeting.title}`);
    console.log(`File: ${meeting.transcriptPath}\n`);

    // Process the meeting through OPAL
    const entities = await bridge.process(meeting.transcriptPath);
    meeting.extractedEntities = entities;

    console.log(`  📊 Extracted ${entities.length} entities:\n`);
    
    // Group and display entities
    displayEntitiesByType(entities);
    console.log('');
  }

  // ============================================================================
  // Review and Approve Entities
  // ============================================================================
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Phase 4: Review and Approve Entities');
  console.log('═══════════════════════════════════════════════════════════\n');

  for (const meeting of meetings) {
    if (!meeting.extractedEntities) continue;

    console.log(`\n${meeting.title}:`);
    console.log('-'.repeat(50));

    const approved: ExtractedEntity[] = [];
    const rejected: ExtractedEntity[] = [];
    const needsReview: ExtractedEntity[] = [];

    for (const entity of meeting.extractedEntities) {
      if (entity.confidence >= 0.85) {
        // High confidence - auto-approve
        console.log(`  ✅ ${entity.name} (${entity.type}) - ${Math.round(entity.confidence * 100)}%`);
        await bridge.approve(entity.id);
        approved.push(entity);
      } else if (entity.confidence >= 0.60) {
        // Medium confidence - manual review
        console.log(`  ⚠️  ${entity.name} (${entity.type}) - ${Math.round(entity.confidence * 100)}% [REVIEW]`);
        needsReview.push(entity);
      } else {
        // Low confidence - reject
        console.log(`  ❌ ${entity.name} (${entity.type}) - ${Math.round(entity.confidence * 100)}% [REJECTED]`);
        await bridge.reject(entity.id);
        rejected.push(entity);
      }
    }

    meeting.approvedEntities = approved;

    console.log(`\n  Summary: ${approved.length} approved, ${needsReview.length} for review, ${rejected.length} rejected`);
  }

  // ============================================================================
  // Extract Action Items
  // ============================================================================
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('Phase 5: Extract Action Items');
  console.log('═══════════════════════════════════════════════════════════\n');

  for (const meeting of meetings) {
    console.log(`${meeting.title}:\n`);

    // Parse action items from transcript (simplified)
    const content = readFileSync(meeting.transcriptPath, 'utf-8');
    const actionItemRegex = /(\d+)\.\s+([^:]+):\s+(.+?)(?:\s*\(Due:\s*([^)]+)\))?$/gm;
    
    const actionItems: ActionItem[] = [];
    let match;
    let counter = 1;
    
    while ((match = actionItemRegex.exec(content)) !== null) {
      const owner = match[2].trim();
      const task = match[3].trim();
      const dueDate = match[4] ? match[4].trim() : undefined;

      const actionItem: ActionItem = {
        id: `ai-${meeting.id}-${counter}`,
        task,
        owner,
        dueDate,
        status: 'pending'
      };

      actionItems.push(actionItem);
      counter++;
    }

    meeting.actionItems = actionItems;

    for (const item of actionItems) {
      const dueStr = item.dueDate ? `(Due: ${item.dueDate})` : '';
      console.log(`  📋 ${item.owner}: ${item.task} ${dueStr}`);
    }

    console.log(`\n  Total: ${actionItems.length} action items\n`);
  }

  // ============================================================================
  // Create Follow-up Quests
  // ============================================================================
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Phase 6: Create Follow-up Research Quests');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Quest 1: Based on patterns from meeting 1
  const quest1 = await bridge.quest('circular funding models in regenerative DAOs');
  console.log(`🎯 Quest 1: ${quest1.topic}`);
  console.log(`   ID: ${quest1.id}`);

  await bridge.questContinue(quest1.id, 'Identified 3 DAOs using circular funding: ReFi DAO Barcelona, GreenDAO, and Regen Foundation');
  await bridge.questContinue(quest1.id, 'Key mechanism: Returns from successful projects flow back into funding pool');
  console.log('   Status: 2 findings recorded\n');

  // Quest 2: Based on technical discussion from meeting 2
  const quest2 = await bridge.quest('knowledge graph visualization patterns');
  console.log(`🎯 Quest 2: ${quest2.topic}`);
  console.log(`   ID: ${quest2.id}`);

  await bridge.questContinue(quest2.id, 'Researching React Flow vs D3.js for entity relationship visualization');
  await bridge.questContinue(quest2.id, 'Considering incremental update patterns for real-time collaboration');
  console.log('   Status: 2 findings recorded\n');

  // ============================================================================
  // Create Handoffs
  // ============================================================================
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Phase 7: Create Team Handoffs');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Handoff for meeting 1
  await bridge.handoff(
    `ReFi DAO Barcelona coordination meeting processed. ` +
    `${meetings[0].approvedEntities?.length || 0} entities approved. ` +
    `${meetings[0].actionItems?.length || 0} action items extracted. ` +
    `Research quest started on circular funding models.`,
    'Maria Garcia'
  );
  console.log('📤 Handoff 1: Maria Garcia - ReFi DAO Barcelona coordination\n');

  // Handoff for meeting 2
  await bridge.handoff(
    `Knowledge Graph planning session completed. ` +
    `Technical architecture approved. ` +
    `Action items assigned to Alice, Bob, and Carol. ` +
    `Research quest active on visualization patterns.`,
    'Alice Johnson'
  );
  console.log('📤 Handoff 2: Alice Johnson - Knowledge Graph planning\n');

  // ============================================================================
  // Generate Summary Report
  // ============================================================================
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Phase 8: Generate Summary Report');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Get final status
  const status = await bridge.getStatus();
  const activity = await bridge.activity();

  console.log('📊 Final Status:\n');
  console.log(`  Bridge Status: ${status.status}`);
  console.log(`  Profile: ${status.profile}`);
  console.log(`  Pending Items: ${status.pendingItems}`);
  console.log(`  Total Activity: ${activity.length} events\n`);

  console.log('📈 Processing Summary:\n');

  let totalEntities = 0;
  let totalApproved = 0;
  let totalActionItems = 0;

  for (const meeting of meetings) {
    const entityCount = meeting.extractedEntities?.length || 0;
    const approvedCount = meeting.approvedEntities?.length || 0;
    const actionCount = meeting.actionItems?.length || 0;

    totalEntities += entityCount;
    totalApproved += approvedCount;
    totalActionItems += actionCount;

    console.log(`  ${meeting.title}:`);
    console.log(`    - Entities: ${entityCount}`);
    console.log(`    - Approved: ${approvedCount}`);
    console.log(`    - Action Items: ${actionCount}`);
  }

  console.log('\n  ─────────────────────────');
  console.log(`  TOTALS:`);
  console.log(`    - Entities Extracted: ${totalEntities}`);
  console.log(`    - Entities Approved: ${totalApproved}`);
  console.log(`    - Action Items: ${totalActionItems}`);
  console.log(`    - Research Quests: 2`);
  console.log(`    - Handoffs Created: 2`);

  // ============================================================================
  // Cleanup
  // ============================================================================
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('✨ Workflow Complete!');
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log(`Temporary files preserved at: ${tempDir}`);
  console.log('You can inspect the generated files for detailed output.\n');

  console.log('📚 What was demonstrated:');
  console.log('  1. Environment setup with mock OPAL');
  console.log('  2. Meeting transcript creation');
  console.log('  3. Entity extraction from meetings');
  console.log('  4. Human-in-the-loop review process');
  console.log('  5. Action item extraction');
  console.log('  6. Research quest creation');
  console.log('  7. Team handoff generation');
  console.log('  8. Status and activity reporting\n');
}

/**
 * Display entities grouped by type
 */
function displayEntitiesByType(entities: ExtractedEntity[]) {
  const byType = entities.reduce((acc, entity) => {
    if (!acc[entity.type]) {
      acc[entity.type] = [];
    }
    acc[entity.type].push(entity);
    return acc;
  }, {} as Record<string, ExtractedEntity[]>);

  const icons: Record<string, string> = {
    person: '👤',
    organization: '🏢',
    pattern: '🔮',
    protocol: '📜',
    concept: '💡'
  };

  for (const [type, items] of Object.entries(byType)) {
    const icon = icons[type] || '📄';
    console.log(`    ${icon} ${type.charAt(0).toUpperCase() + type.slice(1)}s (${items.length}):`);
    
    for (const entity of items) {
      const confidence = Math.round(entity.confidence * 100);
      console.log(`       • ${entity.name} (${confidence}%)`);
    }
  }
}

// Run the workflow
main().catch(error => {
  console.error('❌ Workflow failed:', error);
  process.exit(1);
});
