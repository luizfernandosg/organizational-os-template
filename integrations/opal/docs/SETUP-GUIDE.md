# OPAL Integration — Setup Guide

**For:** Agent Developers, Operators  
**Time:** 15-20 minutes  
**Difficulty:** Intermediate

---

## Prerequisites

### Required
- Node.js 18+ and npm
- Git 2.30+
- GitHub CLI (gh) — for PR workflows
- Access to OPAL repository

### For Commons Mode (Team)
- GitHub organization with multiple members
- GitHub Actions enabled
- Branch protection rules configured

---

## Installation

### Step 1: Clone OPAL (if not already)

```bash
cd /root/Zettelkasten/03\ Libraries
git clone https://github.com/omniharmonic/opal.git
```

### Step 2: Install OPAL Bridge

```bash
cd org-os/integrations/opal
npm install
npm run build
```

### Step 3: Validate Installation

```bash
npm run validate
```

Expected output:
```
✓ OPAL found at ../../opal
✓ CLAUDE.md exists
✓ Node.js version 18+
✓ Git configured
✓ TypeScript compilation successful
✓ All checks passed
```

---

## Configuration

### Option A: Solo Mode (Single User)

Best for: Individual operators, testing

```bash
# Setup with defaults
npx opal-bridge setup \
  --opal-path ../../opal \
  --profile regen \
  --mode solo
```

### Option B: Commons Mode (Team)

Best for: Organizations with multiple contributors

```bash
# Setup for team
npx opal-bridge setup \
  --opal-path ../../opal \
  --profile regen \
  --mode commons \
  --team-size 5
```

### Step 4: Configure federation.yaml

Add to your org-os instance's `federation.yaml`:

```yaml
knowledge-commons:
  enabled: true
  
  opal-integration:
    enabled: true
    opal_path: "../../opal"
    profile: "regen"
    
    # Processing settings
    processing:
      auto_process: true
      extract_decisions: true
      extract_action_items: true
      extract_attendees: true
      
    # Review settings  
    review:
      required: true
      auto_approve_threshold: 0.92
      auto_approve_max_daily: 50
      
    # Git sync settings
    sync:
      git_sync: true
      branch_prefix: "opal-sync/"
      pr_for_commons: true
      commit_prefix: "opal:"
```

### Step 5: Environment Variables (Optional)

Create `.env` in `integrations/opal/`:

```bash
# OPAL settings
OPAL_PATH=../../opal
OPAL_PROFILE=regen

# Review automation
OPAL_AUTO_APPROVE=true
OPAL_CONFIDENCE_THRESHOLD=0.92
OPAL_MAX_DAILY_AUTO=50

# Git settings
OPAL_GIT_SYNC=true
OPAL_BRANCH_PREFIX=opal-sync/
OPAL_PR_MODE=commons

# Notifications (optional)
OPAL_NOTIFY_SLACK=https://hooks.slack.com/...
OPAL_NOTIFY_EMAIL=team@example.com
```

### Step 6: Initialize OPAL

```bash
# Run OPAL setup (creates CLAUDE.md, config)
npx opal-bridge opal setup

# Verify OPAL is ready
npx opal-bridge opal status
```

---

## Verification

### Test 1: Basic Processing

```bash
# Create test meeting
echo "# Test Meeting

## Attendees
- Alice (ReFi DAO)
- Bob (Green Goods)

## Decisions
- Approved $5K for community garden project

## Action Items
- Alice to prepare proposal by Friday" > content/meetings/test-2026-03-21.md

# Process through OPAL
npx opal-bridge process content/meetings/test-2026-03-21.md

# Check results
npx opal-bridge status
```

### Test 2: Review Workflow

```bash
# List pending entities
npx opal-bridge review --list

# Interactive review
npx opal-bridge review --interactive

# Approve specific entity
npx opal-bridge review approve entity-abc123
```

### Test 3: Git Integration

```bash
# Check git status
git status

# Should see:
# - New branch: opal-sync/meeting-test-2026-03-21
# - Modified: knowledge/, data/meetings.yaml

# Review changes
git diff

# If satisfied:
git add .
git commit -m "opal: test meeting entities"
git push origin opal-sync/meeting-test-2026-03-21

# Create PR (commons mode)
gh pr create --title "OPAL: Test meeting entities" --body "Extracted entities from test meeting"
```

---

## Troubleshooting

### Problem: OPAL not found

```
Error: OPAL not found at ../../opal
```

**Solution:**
```bash
# Check path
cd ../../opal && pwd

# If missing, clone:
cd /root/Zettelkasten/03\ Libraries
git clone https://github.com/omniharmonic/opal.git

# Re-run setup
cd org-os/integrations/opal
npx opal-bridge setup --opal-path ../../opal
```

### Problem: CLAUDE.md missing

```
Error: OPAL not initialized (CLAUDE.md missing)
```

**Solution:**
```bash
# Initialize OPAL
cd ../../opal
npm install
npx create-opal@latest --local

# Or use bridge helper
npx opal-bridge opal setup
```

### Problem: Review queue backed up

```
Warning: 127 entities pending review
```

**Solution:**
```bash
# Option 1: Batch approve high-confidence
npx opal-bridge review --auto-approve --confidence-threshold 0.95

# Option 2: Process interactively in batches
npx opal-bridge review --interactive --batch-size 10

# Option 3: Increase daily auto-approve limit
# Edit federation.yaml: auto_approve_max_daily: 100
```

### Problem: Git sync conflicts

```
Error: Merge conflict in data/meetings.yaml
```

**Solution:**
```bash
# Automatic resolution (prefer OPAL changes)
npx opal-bridge sync --strategy=ours

# Or manual resolution
git checkout --ours data/meetings.yaml
git add data/meetings.yaml
git commit -m "Resolve conflict: prefer OPAL extraction"
```

### Problem: TypeScript compilation errors

```
Error: Cannot find module '../opal/adapter'
```

**Solution:**
```bash
# Clean build
rm -rf dist/
npm run build

# If still failing, check dependencies
npm install
npm run build
```

---

## Advanced Configuration

### Custom OPAL Profile

Create `.opal/profiles/custom.yaml`:

```yaml
name: "custom-regen"
description: "Custom profile for regenerative organizations"

dimensions:
  - name: "people"
    prompt: "Identify people, their roles, and affiliations"
  - name: "organizations"
    prompt: "Identify organizations, their type and focus"
  - name: "regenerative_practices"
    prompt: "Identify regenerative agriculture, governance, economic practices"
  - name: "funding_sources"
    prompt: "Identify grants, investments, funding opportunities mentioned"
    
extraction:
  min_confidence: 0.75
  max_entities_per_file: 100
```

Then use:
```bash
npx opal-bridge setup --profile custom-regen
```

### Calendar Integration

Enable in `federation.yaml`:

```yaml
opal-integration:
  calendar:
    enabled: true
    provider: "google"  # or "calendly", "outlook"
    credentials_path: ".credentials/calendar.json"
    
    # Sync settings
    sync_attendees: true
    write_back_notes: true
    create_followup_events: true
```

### Webhook Notifications

```yaml
opal-integration:
  notifications:
    webhooks:
      - url: "https://hooks.slack.com/services/..."
        events: ["entity_extracted", "review_required", "sync_complete"]
      - url: "https://discord.com/api/webhooks/..."
        events: ["error", "review_backlog"]
```

---

## See Also

- `API-REFERENCE.md` — Complete API documentation
- `ARCHITECTURE.md` — System design
- `WORKFLOWS.md` — Operational procedures
- `FAQ.md` — Common questions
- `INTEGRATION-PATTERNS.md` — Connecting to other systems

---

**Setup complete!** Next: Review `WORKFLOWS.md` for daily operations.
