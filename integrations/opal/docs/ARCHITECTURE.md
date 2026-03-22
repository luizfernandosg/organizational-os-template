# OPAL Integration — System Architecture

**For:** Agent Developers  
**Purpose:** Understanding how OPAL connects to org-os

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│  External World                                                  │
│  ├── Meeting Tools (Meetily, Otter, Fathom, Read.ai)            │
│  ├── Documents (PDFs, Markdown, Google Docs)                    │
│  └── Research (Papers, Reports, Transcripts)                      │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  OPAL (AI Knowledge Garden)                                     │
│  ├── _inbox/ — Raw content awaiting processing                   │
│  ├── _staging/ — Extracted entities pending review              │
│  └── knowledge/ — Approved entities (git-tracked)               │
│                                                                  │
│  AI Extraction Engine:                                           │
│  ├── Entity Recognition (people, orgs, patterns)                │
│  ├── Relationship Mapping                                         │
│  └── Confidence Scoring                                         │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  OPAL Bridge (this integration)                                 │
│  ├── opal/adapter.ts — Command wrapper                         │
│  ├── opal/ingest.ts — org-os → OPAL                            │
│  ├── opal/extract.ts — OPAL → org-os                           │
│  └── opal/review.ts — Human review queue                        │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Organizational OS                                             │
│  ├── content/meetings/ — Meeting transcripts                    │
│  ├── knowledge/ — Domain knowledge bases                        │
│  ├── data/ — Structured registries (YAML)                       │
│  └── .well-known/ — EIP-4824 schemas                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow: Meeting to Knowledge

```
Meeting Ends
    ↓
[Meetily] Records transcript → content/meetings/2026-03-21.md
    ↓
[Git Hook] Detects new file → Triggers OPAL bridge
    ↓
[OPAL Bridge] /process meeting transcript
    ↓
[OPAL AI] Extracts entities:
    - People: Sarah Chen (confidence: 0.94)
    - Organization: ReFi DAO (confidence: 0.97)
    - Pattern: Participatory Budgeting (confidence: 0.89)
    - Decision: Move treasury to Gnosis (confidence: 0.91)
    - Action Item: Luiz to prepare proposal (confidence: 0.88)
    ↓
[OPAL Bridge] Stages to _staging/ → Human review notification
    ↓
[Human Review] Approves 4/5 entities (rejects 1 low-confidence)
    ↓
[OPAL Bridge] Approved entities → knowledge/ + data/*.yaml
    ↓
[Git Sync] Commit with message: "opal: entities from 2026-03-21 meeting"
    ↓
[Knowledge Curator] Synthesizes across meetings
    ↓
[Optional KOI] Broadcasts to network
    ↓
Network nodes receive → Local knowledge enriched
```

---

## Component Architecture

### 1. OPAL Adapter Layer

```typescript
// Wraps OPAL's slash commands
class OpalAdapter {
  // Direct command mapping
  async process(file: string) → runs OPAL /process
  async review() → runs OPAL /review
  async ask(question: string) → runs OPAL /ask
  
  // Status and monitoring
  async getStatus() → OPAL health
  async getPending() → Review queue length
}
```

### 2. Integration Layer

```typescript
// Maps OPAL entities to org-os structures
class EntityMapper {
  // OPAL → org-os
  mapPerson(entity) → data/members.yaml entry
  mapOrganization(entity) → data/members.yaml entry
  mapPattern(entity) → knowledge/patterns/*.md
  mapDecision(entity) → data/meetings.yaml action item
  
  // org-os → OPAL
  mapMemberToEntity(member) → OPAL person format
  mapProjectToEntity(project) → OPAL organization format
}

// Syncs changes to git
class GitSync {
  createBranch(name: string) → git checkout -b opal-sync/...
  commitChanges(message: string) → git commit
  createPR(title: string) → gh pr create
  handleConflicts(strategy: string) → merge resolution
}
```

### 3. Meeting Pipeline

```typescript
class MeetingPipeline {
  // Specialized meeting processing
  parseTranscript(file: string) → structured data
  extractAttendees(text: string) → Person[]
  extractDecisions(text: string) → Decision[]
  extractActionItems(text: string) → ActionItem[]
  
  // Calendar integration
  lookupAttendees(email: string) → Member
  writeBackToCalendar(event: string, notes: string)
}
```

---

## Review Queue Architecture

### Two-Mode Operation

**Solo Mode (Default)**
```
OPAL extracts → _staging/ → Author approves → knowledge/
                         ↓
                    (single user)
```

**Commons Mode (Team)**
```
OPAL extracts → _staging/ → Team reviews → PR created → Merge → knowledge/
                         ↓        ↓
                    (reviewers) (voting)
```

### Review Decision Matrix

| Confidence | Entity Type | Auto-Approve? | Reviewers |
|------------|-------------|---------------|-----------|
| >0.95 | person, org | ✅ Yes | None |
| 0.85-0.95 | person, org | 🟡 Optional | 1 |
| <0.85 | person, org | ❌ Required | 2 |
| >0.90 | pattern, concept | 🟡 Optional | 1 |
| <0.90 | pattern, concept | ❌ Required | 2 |
| Any | decision, action | ❌ Required | 3 |

---

## Git Integration

### Branch Strategy

```
main
├── opal-sync/meeting-2026-03-21-abc123 (auto-created)
│   └── Contains: approved entities from meeting
│   └── Merged via: PR with review
│
└── opal-sync/weekly-batch-def456 (batch mode)
    └── Contains: week's entities
    └── Merged via: Weekly PR
```

### Commit Messages

```
opal: entities from 2026-03-21 governance call
- Sarah Chen (person, confidence 0.94)
- ReFi DAO (organization, confidence 0.97)
- Participatory Budgeting (pattern, confidence 0.89)
- [decision] Move treasury to Gnosis Chain
- [action] Luiz to prepare proposal by 2026-03-28

opal-review: approved 4/5 entities
- Rejected: "Green Goods" (confidence 0.62, not yet established)
```

---

## Performance Characteristics

### Latency Targets

| Stage | Target | Current | Notes |
|-------|--------|---------|-------|
| Ingest to OPAL | <1 min | ~30s | Git hook trigger |
| OPAL extraction | <5 min | ~3min | AI processing |
| Human review | <1 hr | Variable | Batch processing helps |
| Git sync | <1 min | ~30s | Commit + push |
| **Total** | **<2 hrs** | **1-48 hrs** | **Bottleneck: review** |

### Throughput

- **Single file:** ~3 minutes (depends on length)
- **Batch (10 files):** ~15 minutes
- **Review queue:** 50-100 entities/day sustainable

### Resource Usage

- **CPU:** Low (OPAL does heavy lifting)
- **Memory:** ~200MB for bridge
- **Disk:** ~10KB per entity
- **Network:** API calls to OPAL, git push

---

## Security & Safety

### Data Flow Safety

```
Untrusted Input (meeting transcripts)
    ↓
[Sanitize] Remove PII, check for malicious content
    ↓
OPAL Processing (AI extraction)
    ↓
[Validate] Schema compliance, confidence thresholds
    ↓
Staging (human review)
    ↓
[Approve] Explicit human decision
    ↓
Trusted Storage (knowledge/, data/)
    ↓
[Optional] KOI broadcast (consent-based)
```

### Error Recovery

| Failure Point | Recovery Strategy |
|---------------|-----------------|
| OPAL down | Queue for retry, notify admin |
| Extraction error | Manual review required |
| Git conflict | Automatic resolution (ours/theirs) |
| Review backlog | Auto-escalation, batch notifications |
| Network partition | Local queue, sync on reconnect |

---

## Extension Points

### Adding New Entity Types

1. **Update OPAL profile** (`.opal/config.yaml`)
2. **Add mapper function** (`src/integration/entity-mapper.ts`)
3. **Update schema** (`data/schema.yaml`)
4. **Add tests** (`tests/entity-mapper.test.ts`)

### Custom Processing Pipelines

```typescript
// Create specialized pipeline
class CustomPipeline extends MeetingPipeline {
  async extractCustomFields(text: string): Promise<CustomField[]> {
    // Your custom extraction logic
  }
}
```

### Integration with External Systems

- **Notion:** Sync approved entities to Notion database
- **Slack:** Notify channel of pending reviews
- **Email:** Daily digest of extracted entities
- **KOI:** Broadcast to distributed knowledge network

---

## See Also
- `API-REFERENCE.md` — Method documentation
- `SETUP-GUIDE.md` — Installation
- `WORKFLOWS.md` — Operational procedures
- `FAQ.md` — Common questions
