/**
 * OPAL Bridge - Basic Usage Example
 * 
 * This example demonstrates:
 * 1. Setting up the OPAL bridge
 * 2. Processing content files
 * 3. Reviewing extracted entities
 * 4. Querying the knowledge base
 */

import { OpalBridge, OpalConfig, ExtractedEntity } from '../src/index.js';
import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

async function main() {
  console.log('🌿 OPAL Bridge - Basic Usage Example\n');

  // ============================================================================
  // Step 1: Setup and Initialize
  // ============================================================================
  console.log('Step 1: Setting up OPAL Bridge...');

  // Create a temporary test environment
  const tempDir = join(tmpdir(), `opal-bridge-example-${Date.now()}`);
  const opalDir = join(tempDir, 'opal');
  const orgOsDir = join(tempDir, 'org-os');

  // Create directory structure
  mkdirSync(opalDir, { recursive: true });
  mkdirSync(join(opalDir, '_inbox'), { recursive: true });
  mkdirSync(join(opalDir, '_staging'), { recursive: true });
  mkdirSync(join(opalDir, '_index'), { recursive: true });
  mkdirSync(orgOsDir, { recursive: true });
  mkdirSync(join(orgOsDir, 'content', 'meetings'), { recursive: true });
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
    profile: "example"
    auto_process: true
    review_required: true
`;
  writeFileSync(join(orgOsDir, 'federation.yaml'), federationYaml);

  // Initialize the bridge
  const config: OpalConfig = {
    opalPath: opalDir,
    orgOsPath: orgOsDir,
    profile: 'example'
  };

  const bridge = new OpalBridge(config);
  await bridge.initialize();
  console.log('✅ OPAL Bridge initialized successfully\n');

  // ============================================================================
  // Step 2: Process Content File
  // ============================================================================
  console.log('Step 2: Processing content file...');

  // Create a sample meeting transcript
  const meetingContent = `# Project Coordination Meeting
Date: 2026-03-21
Attendees: Alice Johnson, Bob Smith, Carol Williams

**Discussion:**
Alice presented updates on the distributed coordination system being developed
by the ReFi DAO Barcelona team. Bob shared insights on quadratic funding
mechanisms from the Regen Foundation research. Carol discussed the new community
engagement patterns being implemented.

**Decisions:**
- Adopt circular funding model for Q2
- Move to bi-weekly coordination meetings
- Partner with Impact Network on community protocols

**Action Items:**
- Alice: Complete technical specifications
- Bob: Draft funding proposal
- Carol: Design user research survey
`;

  const meetingFile = join(orgOsDir, 'content', 'meetings', '2026-03-21-coordination.md');
  writeFileSync(meetingFile, meetingContent);

  // Process the file through OPAL
  const entities = await bridge.process(meetingFile);

  console.log(`✅ Extracted ${entities.length} entities:\n`);

  // Display extracted entities
  displayEntities(entities);

  // ============================================================================
  // Step 3: Review Extracted Entities
  // ============================================================================
  console.log('\nStep 3: Reviewing extracted entities...');

  // Simulate entity review process
  for (const entity of entities) {
    if (entity.confidence > 0.8) {
      // High confidence - auto-approve
      console.log(`  ✅ Auto-approved: ${entity.name} (${entity.type}) - ${Math.round(entity.confidence * 100)}% confidence`);
      await bridge.approve(entity.id);
    } else if (entity.confidence > 0.6) {
      // Medium confidence - needs review
      console.log(`  ⚠️  Needs review: ${entity.name} (${entity.type}) - ${Math.round(entity.confidence * 100)}% confidence`);
    } else {
      // Low confidence - reject
      console.log(`  ❌ Low confidence: ${entity.name} (${entity.type}) - ${Math.round(entity.confidence * 100)}% confidence`);
      await bridge.reject(entity.id);
    }
  }

  // Check for pending items
  const pending = await bridge.getPending();
  console.log(`\n📋 ${pending.length} items pending review\n`);

  // ============================================================================
  // Step 4: Query Knowledge Base
  // ============================================================================
  console.log('Step 4: Querying knowledge base...');

  // Search for funding-related entities
  const fundingResults = await bridge.ask('funding models');
  console.log(`  Found ${fundingResults.length} results for "funding models"\n`);

  // Search for coordination patterns
  const coordinationResults = await bridge.ask('distributed coordination');
  console.log(`  Found ${coordinationResults.length} results for "distributed coordination"\n`);

  // ============================================================================
  // Step 5: Create Research Quest
  // ============================================================================
  console.log('Step 5: Creating research quest...');

  const quest = await bridge.quest('regenerative finance governance patterns');
  console.log(`  🎯 Quest created: ${quest.id}`);
  console.log(`  📌 Topic: ${quest.topic}`);
  console.log(`  📊 Status: ${quest.status}\n`);

  // Add findings to quest
  const update1 = await bridge.questContinue(
    quest.id,
    'Found 5 papers on quadratic funding in DAOs'
  );
  console.log(`  📝 Added finding: "${update1.updates[0].content}"`);

  const update2 = await bridge.questContinue(
    quest.id,
    'Community DAOs using holographic voting for decisions'
  );
  console.log(`  📝 Added finding: "${update2.updates[0].content}"\n`);

  // ============================================================================
  // Step 6: Create Handoff
  // ============================================================================
  console.log('Step 6: Creating handoff...');

  await bridge.handoff(
    'Meeting processed and 8 entities extracted. 5 auto-approved, 3 need review. Research quest started on governance patterns.',
    'Alice Johnson'
  );
  console.log('  📤 Handoff created for Alice Johnson\n');

  // ============================================================================
  // Step 7: Check Status
  // ============================================================================
  console.log('Step 7: Checking OPAL status...');

  const status = await bridge.getStatus();
  console.log(`  🔌 Status: ${status.status}`);
  console.log(`  📦 Version: ${status.version || 'unknown'}`);
  console.log(`  🎭 Profile: ${status.profile}`);
  console.log(`  📥 Pending items: ${status.pendingItems}\n`);

  // ============================================================================
  // Cleanup
  // ============================================================================
  console.log('✨ Example completed successfully!');
  console.log(`\n🧹 Cleaning up temporary files: ${tempDir}`);
  
  // Note: In a real application, you'd clean up properly
  // For this example, we leave the temp directory for inspection
  console.log('  (Temporary files preserved for inspection)\n');

  console.log('📚 Next steps:');
  console.log('  1. Review the extracted entities above');
  console.log('  2. Check pending items: bridge.getPending()');
  console.log('  3. Search knowledge base: bridge.ask("your query")');
  console.log('  4. Create more quests: bridge.quest("topic")');
}

/**
 * Display entities in a formatted way
 */
function displayEntities(entities: ExtractedEntity[]) {
  // Group by type
  const byType = entities.reduce((acc, entity) => {
    if (!acc[entity.type]) {
      acc[entity.type] = [];
    }
    acc[entity.type].push(entity);
    return acc;
  }, {} as Record<string, ExtractedEntity[]>);

  // Display each type
  const icons: Record<string, string> = {
    person: '👤',
    organization: '🏢',
    pattern: '🔮',
    protocol: '📜',
    concept: '💡'
  };

  for (const [type, items] of Object.entries(byType)) {
    const icon = icons[type] || '📄';
    console.log(`  ${icon} ${type.charAt(0).toUpperCase() + type.slice(1)}s:`);
    for (const entity of items) {
      const confidence = Math.round(entity.confidence * 100);
      console.log(`     - ${entity.name} (${confidence}% confidence)`);
    }
  }
}

// Run the example
main().catch(error => {
  console.error('❌ Example failed:', error);
  process.exit(1);
});
