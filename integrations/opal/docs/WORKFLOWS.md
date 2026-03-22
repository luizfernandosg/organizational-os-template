# OPAL Integration — Workflows

**For:** Operators, Agents  
**Purpose:** Day-to-day operational procedures

---

## Workflow 1: Meeting Knowledge Capture

### When to Use
After any meeting where decisions were made or action items assigned.

### Steps

#### 1. Record Meeting
```bash
# Option A: Use Meetily (recommended)
meetily record --output content/meetings/

# Option B: Use Otter.ai
# Export transcript to content/meetings/YYYY-MM-DD-title.md

# Option C: Manual notes
vim content/meetings/2026-03-21-governance-call.md
```

#### 2. Git Hook Triggers (Automatic)
```bash
git add content/meetings/2026-03-21-governance-call.md
git commit -m "Add: Governance call transcript"
# Git hook automatically triggers OPAL processing
```

#### 3. Monitor Processing
```bash
# Check status
npx opal-bridge status

# Should show:
# Processing: 1 file in queue
# Estimated completion: 3 minutes
```

#### 4. Review Extracted Entities (Within 1 Hour)
```bash
# List pending
npx opal-bridge review --list

# Interactive review
npx opal-bridge review --interactive

# Or batch approve high-confidence
npx opal-bridge review --auto-approve --confidence-threshold 0.92
```

#### 5. Verify Knowledge Creation
```bash
# Check knowledge/ directory
ls knowledge/regenerative-finance/

# Check data/meetings.yaml updated
cat data/meetings.yaml | grep 2026-03-21

# Check git status
git status
```

---

## Workflow 2: Document Ingestion

### When to Use
Processing reports, whitepapers, research documents into knowledge base.

### Steps

#### 1. Stage Document
```bash
# Copy to _inbox
cp ~/Downloads/regenerative-agriculture-report.pdf integrations/opal/_inbox/

# Or for text files
cp research findings.md integrations/opal/_inbox/
```

#### 2. Process Document
```bash
# Single document
npx opal-bridge process integrations/opal/_inbox/regenerative-agriculture-report.pdf

# Batch processing
npx opal-bridge process-batch integrations/opal/_inbox/
```

#### 3. Review with Domain Focus
```bash
# Filter by entity type
npx opal-bridge review --filter type=pattern

# Review high-impact patterns first
npx opal-bridge review --sort confidence --interactive
```

#### 4. Organize in Knowledge Base
```bash
# Move to appropriate domain
mkdir -p knowledge/regenerative-agriculture/
mv knowledge/extracted/patterns/* knowledge/regenerative-agriculture/

# Create index
npx knowledge-curator index knowledge/regenerative-agriculture/
```

---

## Workflow 3: Research Quest

### When to Use
Starting a multi-session research project on a specific topic.

### Steps

#### 1. Create Quest
```bash
npx opal-bridge quest create "Impact measurement standards for small-scale regenerative farms"

# Output: Quest ID QUEST-ABC123 created
```

#### 2. First Exploration
```bash
# Ask initial research question
npx opal-bridge ask "What impact measurement frameworks exist for agriculture?"

# Process relevant documents
npx opal-bridge process research/iris-plus-framework.md
npx opal-bridge process research/giin-standards.pdf

# Update quest
npx opal-bridge quest continue QUEST-ABC123 "Found IRIS+ and GIIN standards. Need to assess fit for small-scale farms."
```

#### 3. Multi-Session Continuation
```bash
# Day 2: Continue quest
npx opal-bridge quest list --status active
# → QUEST-ABC123: Impact measurement standards...

npx opal-bridge quest continue QUEST-ABC123 "Compared IRIS+ vs custom metrics. Tradeoff: standardization vs relevance."

# Day 3: More research
npx opal-bridge process interviews/farmer-feedback.md
npx opal-bridge quest continue QUEST-ABC123 "Farmers prefer simple indicators: soil health, biodiversity count, yield stability."
```

#### 4. Synthesize Findings
```bash
# Quest summary
npx opal-bridge quest show QUEST-ABC123

# Export to knowledge base
npx opal-bridge quest export QUEST-ABC123 --format markdown --output knowledge/regenerative-agriculture/impact-measurement-guide.md

# Close quest
npx opal-bridge quest close QUEST-ABC123 --reason "completed"
```

---

## Workflow 4: Team Handoff

### When to Use
Switching contexts, going on vacation, or ending a work session.

### Steps

#### 1. Create Handoff
```bash
npx opal-bridge handoff create "Current status: Reviewing 23 funding opportunities. 5 high-priority need proposal drafts by Friday. Blocker: Need accountant input on budget projections."

# With assignee
npx opal-bridge handoff create "Continue governance research" --assignee giulio
```

#### 2. Context Captured
- Pending reviews
- Active quests
- Recent decisions
- Blockers and dependencies

#### 3. Team Member Picks Up
```bash
# View handoffs
npx opal-bridge handoff list --status active

# Read context
cat handoffs/2026-03-21-handoff-luiz.md

# Acknowledge
npx opal-bridge handoff acknowledge HANDOFF-XYZ789
```

---

## Workflow 5: Federation Sync

### When to Use
Contributing local knowledge to network or pulling network knowledge locally.

### Steps

#### Hub → Nodes (Skill Distribution)
```bash
# Triggered automatically on skills/ push
# Or manually:
gh workflow run distribute-skills.yml -f target_node=regen-coordination/refi-bcn-os
```

#### Nodes → Hub (Knowledge Aggregation)
```bash
# Triggered Mondays 6am UTC
# Or manually:
gh workflow run aggregate-knowledge.yml

# Check what was aggregated
git log knowledge/from-nodes/refi-bcn-os/ --oneline -10
```

#### Peer Sync (ReFi DAO ↔ ReFi BCN)
```bash
# Bidirectional sync
git workflow run peer-sync-refi.yml -f sync_direction=bidirectional
```

---

## Workflow 6: Error Recovery

### When to Use
Something went wrong — processing failed, sync conflict, review backlog.

### Steps

#### Processing Failure
```bash
# Check error log
npx opal-bridge logs --tail 50

# Reprocess failed file
npx opal-bridge process content/meetings/failed-meeting.md --force

# If still failing: manual extraction
# Edit file to fix formatting issues
# Reprocess
```

#### Sync Conflict
```bash
# View conflict
git diff data/meetings.yaml

# Resolution options:
# Option 1: Prefer local (OPAL) changes
npx opal-bridge sync --strategy=ours

# Option 2: Prefer remote changes
npx opal-bridge sync --strategy=theirs

# Option 3: Manual merge
vim data/meetings.yaml  # Resolve manually
git add data/meetings.yaml
git commit -m "Resolve sync conflict"
```

#### Review Backlog
```bash
# Check queue size
npx opal-bridge review --list | wc -l

# If >50: batch process
npx opal-bridge review --auto-approve --confidence-threshold 0.95 --max 30

# If confidence unclear: lower threshold temporarily
# Edit federation.yaml: auto_approve_threshold: 0.85
# Restart processing
```

---

## Workflow 7: Commons Mode Governance

### When to Use
Team review of knowledge in commons mode.

### Steps

#### 1. OPAL Creates PR
```
[GitHub] New PR: "OPAL: Entities from 3 meetings"
# Branch: opal-sync/meetings-2026-03-15-to-21
```

#### 2. Team Reviews
```bash
# View PR
gh pr view 42

# Review changes
git diff main..opal-sync/meetings-2026-03-15-to-21

# Comment on specific entities
gh pr review 42 --comment "Approve ReFi DAO entity, question the Green Goods one"
```

#### 3. Voting (Optional)
```bash
# In commons mode with voting
gh pr comment 42 --body "/vote approve"

# Or request changes
gh pr review 42 --request-changes --body "Need clarification on entity X"
```

#### 4. Merge
```bash
# When approved
gh pr merge 42 --squash --delete-branch

# Knowledge now in main branch
```

---

## Best Practices

### Daily Operations
- **Morning:** Review overnight OPAL extractions (`opal-bridge review --list`)
- **After meetings:** Process within 1 hour for fresh context
- **Weekly:** Run knowledge curation synthesis
- **Monthly:** Archive old staging data

### Batch Processing
- Process meetings in batches (saves API calls)
- Use `--auto-approve` for routine entities (>0.95 confidence)
- Reserve interactive review for decisions and low-confidence

### Quality Control
- Maintain >90% approval rate (reject low-quality extractions)
- Update OPAL profile if certain entity types consistently low-confidence
- Regular schema validation: `npm run validate:schemas`

### Automation
- Set up Git hooks for automatic processing
- Enable auto-approve for your entity types only
- Use `--dry-run` before batch operations

---

## See Also
- `SETUP-GUIDE.md` — Installation
- `API-REFERENCE.md` — Method documentation
- `ARCHITECTURE.md` — System design
- `FAQ.md` — Common questions
