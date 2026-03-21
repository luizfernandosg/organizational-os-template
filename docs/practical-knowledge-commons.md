# Practical Knowledge Commons

**Version:** 1.0  
**Purpose:** Day-to-day workflows for capturing, sharing, and using organizational knowledge  
**Audience:** Team members, stewards, agents  
**Time to read:** 10 minutes  
**Time to implement:** Start with 2-minute daily practice

---

## The Core Practice

Knowledge commoning is simple: **capture what's valuable, share it, build on it.**

Three principles:
1. **Capture at the source** — Don't wait, record while it's fresh
2. **Review before sharing** — Quality over quantity
3. **Link and connect** — Knowledge grows through relationships

---

## Daily Workflows

### 1. Post-Meeting Capture (2 minutes)

**When:** Immediately after a meeting  
**Who:** Meeting facilitator or designated note-taker  
**Tools:** OPAL `/process` + human review

**Steps:**
```bash
# 1. Process the meeting transcript
npx opal-bridge process content/meetings/2026-03-21-council.md

# 2. Review what OPAL extracted (in _staging/)
npx opal-bridge review

# 3. Approve good extractions, reject poor ones
# 4. Approved items automatically move to knowledge/entities/
```

**What gets captured:**
- ✅ Attendees → `knowledge/entities/people/`
- ✅ Decisions → `knowledge/insights/`
- ✅ Action items → `data/meetings.yaml`
- ✅ Key topics → `knowledge/patterns/`

**Template for manual additions:**
```markdown
# Insight: [One-line summary]

**Source:** Council Call 2026-03-21
**Date:** 2026-03-21
**Author:** [Your name]

## What We Decided

## Why It Matters

## Next Steps
- [ ] Action item 1
- [ ] Action item 2

## Related
- [Link to previous related decision]
- [Link to relevant pattern]
```

---

### 2. Research Quests (Ongoing)

**When:** Starting a research exploration  
**Who:** Anyone investigating a topic  
**Tools:** Egregore `/quest` or manual tracking

**Start a quest:**
```bash
# With Egregore (Claude Code)
/quest "How does quadratic funding work for local communities?"

# Or manual: create knowledge/quests/qf-research.md
```

**Quest log template:**
```markdown
# Quest: [Research topic]

**Started:** YYYY-MM-DD
**Owner:** [Name]
**Status:** active | paused | complete

## Objective
What we're trying to understand

## Log

### YYYY-MM-DD — [Phase name]
**Activities:** What we did
**Findings:** What we learned
**Sources:** Links, papers, interviews
**Blocks:** What's stopping progress
**Next:** What's next

## Resources
- [Link 1]
- [Link 2]

## Insights
Key discoveries that should be shared

## Conclusion
Final summary when complete
```

**Weekly check-in:**
- Review active quests
- Share findings in `/reflect`
- Archive completed quests to `knowledge/insights/`

---

### 3. Decision Documentation (5 minutes)

**When:** Any significant decision  
**Who:** Decision-maker or council member  
**Tools:** Egregore `/reflect` + manual documentation

**Structure:**
```markdown
# Decision: [What was decided]

**Date:** YYYY-MM-DD
**Context:** [Meeting/discussion where decided]
**Decision-maker:** [Who made the call]
**Review date:** [When to revisit]

## Context
What situation led to this decision

## Options Considered
- Option A: [Description] — rejected because...
- Option B: [Description] — chosen because...

## The Decision
Clear statement of what was decided

## Rationale
Why this choice was made

## Implications
- Short-term:
- Long-term:

## Related Decisions
- [Previous decision that led here]
- [Decisions this enables]
```

**Store in:** `knowledge/insights/decisions/`

---

### 4. Weekly Knowledge Review (30 minutes)

**When:** Every Monday morning (or your preferred time)  
**Who:** Knowledge steward or rotating role  
**Tools:** Git diff + manual curation

**Process:**
```bash
# 1. Review what was added last week
cd knowledge/
git diff --name-only HEAD~7..HEAD

# 2. Check for duplicates or conflicts
npx opal-bridge status

# 3. Review staging area
npx opal-bridge review --batch

# 4. Update cross-references
# Add "Related" links between connected insights

# 5. Archive outdated knowledge
mv knowledge/insights/old-topic.md knowledge/insights/archived/
```

**Weekly review checklist:**
- [ ] Review new entities from OPAL
- [ ] Check for duplicate entries
- [ ] Verify all decisions have context
- [ ] Link related insights
- [ ] Archive obsolete knowledge
- [ ] Sync with hub (if node)
- [ ] Share highlights in team channel

---

## Templates for Common Knowledge Types

### Pattern Documentation

```markdown
# Pattern: [Name]

**Type:** funding | governance | coordination | technical
**Source:** [Where first observed]
**Validated:** [How many times seen working]
**Applies to:** [Situations where relevant]

## Description
What the pattern is

## When to Use
Situations where this applies

## How to Apply
Step-by-step implementation

## Examples
- Example 1: [Description and outcome]
- Example 2: [Description and outcome]

## Anti-Patterns
What NOT to do

## Related Patterns
- [Pattern A]
- [Pattern B]

## References
- [Source material]
```

**Store in:** `knowledge/patterns/[type]/[name].md`

---

### Entity Profile (Person/Org)

```markdown
# [Entity Name]

**Type:** person | organization | concept | protocol
**First seen:** YYYY-MM-DD
**Sources:** [Documents where mentioned]

## Description
Brief overview

## Relationships
- Works with: [Related entities]
- Part of: [Larger entities]
- Uses: [Tools/protocols]

## Contact (if person/org)
- Role:
- Organization:
- Reachable via:

## Notes
Additional context, updates over time
```

**Store in:** `knowledge/entities/[type]/[name].md`

---

## Search & Discovery

### Finding Existing Knowledge

**Quick search:**
```bash
# Search titles
grep -r "quadratic funding" knowledge/ --include="*.md"

# Search content
grep -r "funding" knowledge/ --include="*.md" -l

# With OPAL
npx opal-bridge ask "What do we know about quadratic funding?"
```

**Browse by domain:**
```
knowledge/
├── domains/
│   ├── regenerative-finance/   ← Funding models, treasuries
│   ├── local-governance/       ← Cooperatives, ESS, bioregions
│   └── network-coordination/   ← Council, federation, sync
```

**Browse by type:**
```
knowledge/
├── patterns/       ← Recurring solutions
├── insights/       ← Specific discoveries
├── entities/       ← People, orgs, concepts
└── quests/         ← Research in progress
```

### Cross-Referencing Convention

Always link related knowledge:
```markdown
## Related
- [Previous decision that led here](link)
- [Pattern we applied](link)
- [Person driving this](link)
- [Quest that informed this](link)
```

---

## Knowledge Lifecycle

```
Draft → Review → Published → Archived
  │        │          │         │
  │        │          │         └── No longer current
  │        │          │              Keep for history
  │        │          │
  │        │          └── Approved, searchable, shareable
  │        │             Via KOI to network
  │        │
  │        └── Human review (OPAL staging)
  │           Quality check
  │
  └── Initial capture
      Quick, unpolished
      In _staging/ or drafts/
```

**Status indicators:**
```yaml
---
status: draft | review | published | archived
confidence: 0.0-1.0
reviewers: [name1, name2]
last_reviewed: YYYY-MM-DD
---
```

---

## Common Workflows by Role

### As a Meeting Facilitator
1. Record or transcribe meeting
2. Save to `content/meetings/YYYY-MM-DD-[topic].md`
3. Run `npx opal-bridge process [file]`
4. Review extracted entities
5. Approve good ones, reject poor ones
6. Check `data/meetings.yaml` for action items

### As a Researcher
1. Start quest: `/quest "[topic]"` or create `knowledge/quests/[topic].md`
2. Log findings weekly
3. When complete, move key insights to `knowledge/insights/`
4. Link related patterns
5. `/reflect` summary for team

### As a Steward
1. Weekly review (Monday mornings)
2. Approve pending OPAL extractions
3. Archive outdated knowledge
4. Sync with hub if node
5. Share highlights in Telegram/Discord

### As a New Team Member
1. Read `knowledge/INDEX.md`
2. Browse `knowledge/domains/` for your area
3. Search for topics you're working on
4. Start `/quest` for your learning journey
5. Add insights as you learn

---

## Quality Guidelines

### Good Knowledge Capture

✅ **Do:**
- Capture within 24 hours while memory is fresh
- Include context (why it matters, not just what)
- Link to related knowledge
- Use specific examples, not just abstractions
- Note uncertainty ("we think..." vs "we know...")

❌ **Don't:**
- Wait a week (details fade)
- Capture without review (stays in staging)
- Duplicate without linking (search first)
- Keep obsolete knowledge (archive it)
- Capture sensitive/private info (respect boundaries)

### Review Criteria

Before approving from staging:
- [ ] Is it accurate?
- [ ] Is it complete enough to be useful?
- [ ] Is it linked to related knowledge?
- [ ] Is the source clear?
- [ ] Is it appropriate to share (not sensitive)?

---

## Troubleshooting

### "OPAL extracted wrong entities"
- Edit in staging before approving
- Reject and manually capture instead
- Improve source document clarity

### "Can't find existing knowledge"
- Check multiple domains (it might be categorized differently)
- Use `grep -r` for full-text search
- Ask in team channel: "Anyone know where we documented X?"
- If truly missing, capture it now

### "Knowledge is out of date"
- Update with new insight (link to old)
- Or archive old and create new
- Mark with `status: archived` and `replaced_by: [new link]`

### "Too much to review"
- Batch review weekly (don't try daily)
- Focus on high-confidence extractions first
- Delegate review to team members by domain

---

## Success Metrics

Healthy knowledge commons shows:
- **Capture rate:** 80%+ of meetings processed within 24h
- **Review cycle:** <7 days from staging to published
- **Search success:** Finding existing knowledge in <3 attempts
- **Cross-linking:** Most insights link to 2+ related items
- **Usage:** Team references knowledge in decisions weekly

---

## Start Small

Don't try to implement everything at once.

**Week 1:** Just process one meeting through OPAL  
**Week 2:** Add one research quest  
**Week 3:** Start weekly review habit  
**Week 4:** Add cross-references between insights

Knowledge commons grows through **consistent small practices**, not heroic efforts.

---

## File Quick Reference

| What | Where | Template |
|------|-------|----------|
| Meeting notes | `content/meetings/` | Auto-generated |
| Decisions | `knowledge/insights/decisions/` | Decision template |
| Patterns | `knowledge/patterns/[type]/` | Pattern template |
| People/Orgs | `knowledge/entities/[type]/` | Entity template |
| Research | `knowledge/quests/` | Quest template |
| Raw OPAL | `knowledge/entities/` | Auto-extracted |

---

*Practical knowledge commons — captured today, valuable tomorrow*
