# Knowledge Commons Quick Reference

**One-page cheat sheet for daily use**

---

## 🚀 30-Second Start

```bash
# Process meeting → review → approve
cd refi-bcn-os
npx opal-bridge process content/meetings/2026-03-21.md
npx opal-bridge review
# Approve: a, Reject: r, Skip: s

# Search knowledge
npx opal-bridge ask "quadratic funding"
grep -r "funding" knowledge/ --include="*.md" -l
```

---

## 📁 Where Things Go

| Content Type | Location | How It Gets There |
|--------------|----------|-------------------|
| Meeting transcript | `content/meetings/` | Save manually or auto-record |
| Extracted entities | `knowledge/entities/` | OPAL `/process` + review |
| Decisions | `knowledge/insights/decisions/` | Manual or `/reflect` |
| Patterns | `knowledge/patterns/` | Manual documentation |
| Research | `knowledge/quests/` | `/quest` or manual |
| Network sync | `knowledge/from-nodes/` | Hub aggregation (auto) |

---

## 🎯 Daily Commands

```bash
# Morning: Check status
npx opal-bridge status          # What's in staging?
npx koi-bridge status           # Network connection?

# Post-meeting: Capture
npx opal-bridge process content/meetings/YYYY-MM-DD.md
npx opal-bridge review

# End of day: Reflect
/reflect "Key insight from today"    # (Claude Code)
# or manually add to knowledge/insights/

# Weekly: Sync with hub (if node)
npx koi-bridge sync              # Push local → network
npx koi-bridge poll              # Pull network → local
```

---

## 📝 Templates at a Glance

**Decision (save to `knowledge/insights/decisions/`):**
```markdown
# Decision: [What]

**Date:** YYYY-MM-DD
**Context:** [Where decided]

## The Decision
## Rationale
## Implications
## Related
```

**Pattern (save to `knowledge/patterns/[type]/`):**
```markdown
# Pattern: [Name]

**Type:** funding|governance|coordination
**Applies to:** [When to use]

## Description
## How to Apply
## Examples
```

**Quest (save to `knowledge/quests/`):**
```markdown
# Quest: [Topic]

**Started:** YYYY-MM-DD
**Status:** active|paused|complete

## Objective
## Log
### YYYY-MM-DD — [What happened]
## Insights
```

---

## 🔍 Search Patterns

```bash
# By filename
grep -r "funding" knowledge/ --include="*.md" -l

# By content
grep -r "quadratic" knowledge/ --include="*.md"

# Recent changes
git diff --name-only HEAD~7..HEAD knowledge/

# With OPAL
npx opal-bridge ask "what do we know about X?"
```

---

## 🏷️ Status Tags

Add to frontmatter:
```yaml
---
status: draft        # Work in progress
       | review      # Pending approval
       | published   # Approved, searchable
       | archived    # No longer current
confidence: 0.9      # How sure are we (0.0-1.0)
---
```

---

## ⚡ Quick Troubleshooting

| Problem | Fix |
|---------|-----|
| OPAL extracted wrong | Edit in staging or reject |
| Can't find something | Try `grep -r` full-text search |
| Staging full | Do weekly review, batch approve |
| Out of date knowledge | Update or archive with `status: archived` |
| Sensitive info captured | Remove from staging before approve |

---

## 🎓 Learning Path

**Week 1:** Process 1 meeting  
**Week 2:** Document 1 decision  
**Week 3:** Start 1 research quest  
**Week 4:** Do weekly review  
**Week 5+:** Cross-link related knowledge

---

## 📞 Get Help

- Full guide: `docs/practical-knowledge-commons.md`
- Architecture: `docs/ARCHITECTURE.md`
- Integration details: `docs/integrations/`
- Ask in team channel: "Knowledge commons question..."

---

*Keep this visible. Use it daily. Knowledge compounds.*
