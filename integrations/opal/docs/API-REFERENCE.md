# OPAL Integration — API Reference

**For:** Agent Developers  
**Purpose:** Complete API documentation for OPAL integration

---

## Core Classes

### OpalAdapter

Main interface to OPAL system.

```typescript
class OpalAdapter {
  constructor(config: OpalConfig);
  
  // Lifecycle
  initialize(): Promise<void>;
  getStatus(): Promise<OpalStatus>;
  
  // Processing
  process(filePath: string): Promise<ExtractedEntity[]>;
  processBatch(files: string[]): Promise<BatchResult>;
  
  // Review
  getPending(): Promise<ExtractedEntity[]>;
  approve(entityId: string): Promise<void>;
  reject(entityId: string): Promise<void>;
  edit(entityId: string, updates: Partial<Entity>): Promise<void>;
  
  // Search
  search(query: string): Promise<SearchResult[]>;
  ask(question: string): Promise<string>;
  
  // Quests
  createQuest(topic: string): Promise<Quest>;
  continueQuest(questId: string, content: string): Promise<void>;
  
  // Handoffs
  createHandoff(context: string, assignee?: string): Promise<Handoff>;
}
```

### Entity Types

```typescript
interface ExtractedEntity {
  id: string;
  name: string;
  type: 'person' | 'organization' | 'pattern' | 
        'concept' | 'protocol' | 'decision' | 'action-item';
  description?: string;
  source: string;        // File path
  confidence: number;    // 0.0 - 1.0
  metadata?: Record<string, any>;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
}
```

---

## CLI Commands

### Setup
```bash
npx opal-bridge setup \
  --opal-path ../../opal \
  --profile regen \
  --org-os-path ../..
```

### Process Content
```bash
# Single file
npx opal-bridge process content/meetings/2026-03-21.md

# Batch
npx opal-bridge process-batch content/meetings/

# With options
npx opal-bridge process file.md --extract-decisions --extract-action-items
```

### Review Queue
```bash
# List pending
npx opal-bridge review --list

# Interactive review
npx opal-bridge review --interactive

# Approve all high-confidence
npx opal-bridge review --auto-approve --confidence-threshold 0.92
```

### Search & Query
```bash
# Search knowledge base
npx opal-bridge search "participatory budgeting"

# Ask natural language question
npx opal-bridge ask "What governance models do we use?"

# With filters
npx opal-bridge search "funding" --type organization --date-range 2026-01-01,2026-03-31
```

### Quest Management
```bash
# Create research quest
npx opal-bridge quest create "Impact measurement standards"

# Continue quest
npx opal-bridge quest continue QUEST-ABC123 "Found IRIS+ framework"

# List active quests
npx opal-bridge quest list --status active
```

### Status & Health
```bash
# Check system status
npx opal-bridge status

# Validate configuration
npx opal-bridge validate

# Debug mode
npx opal-bridge debug --verbose
```

---

## Integration Points for Agents

### With Meeting-Processor Skill
```typescript
// After meeting-processor parses transcript
const transcript = 'content/meetings/2026-03-21.md';

// Send to OPAL for entity extraction
const entities = await opal.process(transcript);

// Meeting-processor receives entities
// Creates structured meeting record
// Updates data/meetings.yaml
```

### With Knowledge-Curator Skill
```typescript
// Knowledge-curator requests synthesis
const topic = "regenerative agriculture";

// Search OPAL knowledge base
const findings = await opal.search(topic);

// Curator synthesizes into knowledge/domain/
// Creates knowledge/regenerative-agriculture/YYYY-MM-DD-findings.md
```

### With Funding-Scout Skill
```typescript
// Funding opportunity detected
const opportunity = {
  name: "Celo Public Goods",
  deadline: "2026-04-15"
};

// Create quest to research fit
const quest = await opal.createQuest(
  `Research ${opportunity.name} fit for our projects`
);

// Quest tracked in OPAL, findings fed back to funding-scout
```

---

## Configuration Options

### federation.yaml
```yaml
knowledge-commons:
  enabled: true
  
  opal-integration:
    enabled: true
    opal_path: "../../opal"
    profile: "regen"
    
    processing:
      auto_process: true              # Auto-run on new files
      extract_decisions: true
      extract_action_items: true
      extract_attendees: true
      
    review:
      required: true                  # Human approval required
      auto_approve_threshold: 0.92  # Auto-approve high confidence
      max_daily_auto: 50              # Safety limit
      
    sync:
      git_sync: true
      branch_prefix: "opal-sync/"
      pr_for_commons: true
```

### Environment Variables
```bash
# OPAL configuration
OPAL_PATH=../../opal
OPAL_PROFILE=regen

# Review settings
OPAL_AUTO_APPROVE=true
OPAL_CONFIDENCE_THRESHOLD=0.92
OPAL_MAX_DAILY_AUTO=50

# Git sync
OPAL_GIT_SYNC=true
OPAL_BRANCH_PREFIX=opal-sync/
OPAL_PR_MODE=commons
```

---

## Error Handling

### Common Errors

**OPAL not found**
```
Error: OPAL not found at ../../opal
Solution: Clone OPAL from github.com/omniharmonic/opal
```

**CLAUDE.md missing**
```
Error: OPAL not initialized (CLAUDE.md missing)
Solution: Run `npx opal-bridge setup` first
```

**Review queue backed up**
```
Error: 127 entities pending review
Solution: Run `npx opal-bridge review --interactive` or increase auto-approve threshold
```

### Error Codes
| Code | Meaning | Resolution |
|------|---------|------------|
| E100 | OPAL not found | Check OPAL_PATH |
| E101 | Not initialized | Run setup |
| E200 | Extraction failed | Check file format |
| E300 | Review queue full | Process pending items |
| E400 | Git sync conflict | Resolve manually or use --strategy=ours |

---

## Testing

### Unit Tests
```bash
cd integrations/opal
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Example Usage
```bash
npm run example:basic
npm run example:workflow
```

---

## See Also
- `SETUP-GUIDE.md` — Installation instructions
- `WORKFLOWS.md` — Operational procedures
- `INTEGRATION-PATTERNS.md` — Connection to other systems
- `ARCHITECTURE.md` — System design
