# OPAL Integration — FAQ

**For:** Agents, Operators  
**Purpose:** Common questions and quick answers

---

## General Questions

### Q: What is OPAL?
**A:** OPAL (Open Protocol for AI Learning) is an AI-powered knowledge garden system. It extracts entities (people, organizations, patterns, concepts) from meetings and documents with human-in-the-loop review.

### Q: How does OPAL differ from KOI?
**A:** 
- **OPAL:** AI extraction + human review for local knowledge gardens
- **KOI:** Distributed knowledge graphs for network-wide federation
- They complement each other: OPAL processes local content, KOI shares across network.

### Q: Do I need both OPAL and KOI?
**A:** No. You can use OPAL standalone for local knowledge management. Add KOI when you need to share knowledge across organizations.

---

## Setup & Installation

### Q: Installation fails with "OPAL not found"
**A:** 
```bash
# Clone OPAL first
cd /root/Zettelkasten/03\ Libraries
git clone https://github.com/omniharmonic/opal.git

# Then run setup
cd org-os/integrations/opal
npx opal-bridge setup --opal-path ../../opal
```

### Q: What's the difference between Solo and Commons mode?
**A:**
- **Solo:** Single user, automatic git commits, no PRs
- **Commons:** Team workflow, PR-based review, voting

### Q: How do I switch from Solo to Commons mode later?
**A:**
```bash
npx opal-bridge config set mode commons
npx opal-bridge setup --mode commons
# Update federation.yaml: pr_for_commons: true
```

---

## Processing & Extraction

### Q: How long does processing take?
**A:** 
- Short meeting (<30 min): ~2-3 minutes
- Long meeting (1-2 hours): ~5-8 minutes
- Document (10 pages): ~3-5 minutes
- Batch (10 files): ~15-20 minutes

### Q: Can I process PDFs?
**A:** Yes, if they contain extractable text (not scanned images). For scanned PDFs, use OCR first:
```bash
ocrmypdf input.pdf output.pdf  # Then process output.pdf
```

### Q: What entity types does OPAL extract?
**A:** 
- **people:** Names with roles and affiliations
- **organizations:** Companies, DAOs, groups
- **patterns:** Concepts, frameworks, methodologies
- **protocols:** Standards, agreements, procedures
- **concepts:** Ideas, theories, principles
- **decisions:** Explicit decisions made
- **action items:** Tasks with owners and deadlines

### Q: How accurate is extraction?
**A:** 
- People/organizations: ~90-95% accuracy
- Patterns/concepts: ~80-85% accuracy
- Decisions/action items: ~85-90% accuracy
- Always requires human review for critical entities.

---

## Review & Approval

### Q: Do I have to review every entity?
**A:** No. Configure auto-approval:
```yaml
# federation.yaml
review:
  auto_approve_threshold: 0.92  # Approve if confidence >92%
  auto_approve_max_daily: 50    # Limit daily auto-approvals
```

### Q: What if OPAL extracts something wrong?
**A:** Reject it in review:
```bash
npx opal-bridge review reject entity-abc123
# Optionally provide reason
npx opal-bridge review reject entity-abc123 --reason "Not a person, just mentioned in passing"
```

### Q: Can I edit extracted entities?
**A:** Yes:
```bash
npx opal-bridge review edit entity-abc123 --name "Corrected Name" --description "Fixed description"
```

### Q: Review queue is backing up. What do I do?
**A:**
```bash
# Option 1: Batch approve high-confidence
npx opal-bridge review --auto-approve --confidence-threshold 0.95 --max 50

# Option 2: Lower threshold temporarily
# Edit federation.yaml: auto_approve_threshold: 0.85

# Option 3: Schedule review time
# Set calendar reminder: "Review OPAL queue" daily at 4pm
```

---

## Git Integration

### Q: How does git sync work?
**A:**
1. OPAL extracts entities to `_staging/`
2. You approve entities
3. Bridge creates branch `opal-sync/...`
4. Commits approved entities to knowledge/, data/
5. (Commons mode) Creates PR for team review
6. (Solo mode) Commits directly to main

### Q: Can I customize commit messages?
**A:** Yes:
```yaml
# federation.yaml
sync:
  commit_prefix: "knowledge:"
  commit_template: "{{prefix}} {{entity_count}} entities from {{source}}"
```

### Q: What if there's a git conflict?
**A:** 
```bash
# Prefer OPAL changes
npx opal-bridge sync --strategy=ours

# Prefer existing data
npx opal-bridge sync --strategy=theirs

# Manual resolution
# Edit files, then: git add . && git commit
```

---

## Integration with Other Systems

### Q: Does it work with Notion?
**A:** Yes, via integration layer:
```typescript
// Sync approved entities to Notion
import { NotionSync } from './integrations/notion';
await notionSync.syncEntities(approvedEntities);
```

### Q: Can I use this with Slack?
**A:** Yes:
```yaml
# federation.yaml
notifications:
  slack:
    webhook: "https://hooks.slack.com/..."
    events: ["review_required", "sync_complete"]
```

### Q: How do I connect to KOI network?
**A:** Enable KOI bridge alongside OPAL:
```yaml
knowledge-commons:
  opal-integration:
    enabled: true
  koi-bridge:
    enabled: true
    coordinator_url: "https://koi.regen.network"
```

---

## Performance & Troubleshooting

### Q: Processing is slow. How to speed up?
**A:**
- Batch multiple files together
- Use `--parallel` flag (if available)
- Reduce extraction depth: `extract_depth: shallow`
- Run during off-peak hours

### Q: OPAL API rate limits?
**A:** OPAL has generous limits, but if you hit them:
```bash
# Add delays between requests
npx opal-bridge process --rate-limit 10  # 10 requests/minute
```

### Q: How much storage does this use?
**A:**
- Source code: ~50KB
- Dependencies: ~200MB (node_modules)
- Knowledge per entity: ~2-5KB
- Typical instance: 10-100MB for knowledge base

### Q: Can I run this on a server?
**A:** Yes. Use the sync daemon:
```bash
npx opal-bridge daemon start --interval 300  # Check every 5 minutes
```

---

## Security & Privacy

### Q: Is my meeting data secure?
**A:** 
- Processing happens locally (OPAL on your machine)
- No data sent to external APIs (unless you configure KOI)
- Git repository controls access
- Review who has access to your org-os repo

### Q: Can I exclude sensitive content?
**A:** Yes:
```yaml
# federation.yaml
processing:
  exclude_patterns:
    - "salary*"
    - "*compensation*"
    - "*private*"
```

### Q: How do I delete extracted entities?
**A:**
```bash
# Remove from knowledge base
rm knowledge/people/sensitive-person.md

# Also remove from OPAL
npx opal-bridge entity forget entity-abc123
```

---

## Advanced Usage

### Q: Can I create custom entity types?
**A:** Yes, by extending the OPAL profile:
```yaml
# .opal/profiles/custom.yaml
dimensions:
  - name: "funding_opportunities"
    prompt: "Identify grants, investments, funding sources"
```

### Q: How do I automate daily processing?
**A:** Cron job:
```bash
# crontab -e
0 9 * * * cd /path/to/org-os && npx opal-bridge process-batch content/meetings/
```

Or GitHub Actions:
```yaml
# .github/workflows/daily-opal.yml
on:
  schedule:
    - cron: '0 9 * * *'
```

### Q: Can I export knowledge?
**A:** Yes:
```bash
# Export to JSON
npx opal-bridge export --format json --output knowledge-export.json

# Export to Markdown
npx opal-bridge export --format markdown --output knowledge-base.md
```

---

## Getting Help

### Q: Where do I report bugs?
**A:** 
- GitHub Issues: `luizfernandosg/org-os/issues`
- Include: logs (`npx opal-bridge logs --output bug-report.log`)

### Q: How do I request features?
**A:** 
- GitHub Discussions: Ideas category
- Or fork and PR

### Q: Documentation unclear?
**A:** 
- Check `API-REFERENCE.md` for technical details
- Check `ARCHITECTURE.md` for system understanding
- Check `WORKFLOWS.md` for procedures

---

## Quick Commands Cheat Sheet

```bash
# Setup
npx opal-bridge setup --opal-path ../../opal

# Process
npx opal-bridge process content/meetings/2026-03-21.md
npx opal-bridge process-batch content/meetings/

# Review
npx opal-bridge review --list
npx opal-bridge review --interactive
npx opal-bridge review approve entity-id

# Search
npx opal-bridge search "participatory budgeting"
npx opal-bridge ask "What governance models do we use?"

# Status
npx opal-bridge status
npx opal-bridge validate

# Quests
npx opal-bridge quest create "Research topic"
npx opal-bridge quest continue QUEST-ID "Update"

# Sync
npx opal-bridge sync
npx opal-bridge sync --strategy=ours
```

---

**Still have questions?** Check `API-REFERENCE.md` or open an issue.
