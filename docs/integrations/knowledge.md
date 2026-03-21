# Knowledge Folder Structure

**Purpose:** Knowledge commons directory for organizational memory
**Location:** `/knowledge/` in each org-os instance
**Status:** Implemented in refi-dao-os, refi-bcn-os, org-os

---

## Overview

The `knowledge/` directory is the **canonical location for organizational knowledge** — structured for both human readability and agent processing.

```
knowledge/
├── INDEX.md              # This file - directory overview
├── README.md             # Domain-specific readme
├── domains/              # Knowledge domains
│   ├── regenerative-finance/
│   ├── local-governance/
│   ├── network-coordination/
│   └── [custom-domains]/
├── patterns/             # Recognized patterns
│   ├── funding/
│   ├── governance/
│   └── coordination/
├── insights/             # Key insights and reflections
├── entities/             # Extracted entities (from OPAL)
│   ├── people/
│   ├── organizations/
│   └── concepts/
└── from-nodes/          # Aggregated from network nodes (hub only)
    ├── refi-dao-os/
    ├── refi-bcn-os/
    └── [other-nodes]/
```

---

## Core Directories

### domains/

Knowledge organized by domain. Each domain has:
- README.md — Domain overview
- Files organized by topic
- Cross-references to other domains

**Standard domains:**
- `regenerative-finance/` — Funding, treasury, economic models
- `local-governance/` — Bioregional, cooperative, ESS governance
- `network-coordination/` — Federation, council, cross-node sync

**Custom domains:**
Add as needed for your organization:
- `agroforestry/`, `waste-management/`, `energy-systems/`

### patterns/

Recurring patterns across the organization's work:
- `funding/` — Funding patterns (QF, retroPGF, etc.)
- `governance/` — Decision-making patterns
- `coordination/` — Cross-team coordination patterns

Each pattern file:
```markdown
# Pattern: [Name]

**Type:** funding|governance|coordination|technical
**Source:** [Where identified]
**Applies to:** [Contexts]

## Description

## Examples

## Related Patterns
```

### insights/

Key insights and reflections captured from:
- Meeting summaries
- Research findings
- Retrospectives
- `/reflect` commands (egregore)

Format:
```markdown
# Insight: [Title]

**Date:** YYYY-MM-DD
**Source:** [Meeting/Research/Reflection]
**Author:** [Name]

## Summary

## Context

## Implications
```

### entities/

**Auto-populated by OPAL** — extracted entities from content:

```
entities/
├── people/
│   └── [name].md          # Person profiles
├── organizations/
│   └── [org-name].md     # Organization profiles
└── concepts/
    └── [concept].md       # Key concepts
```

Each entity:
```markdown
# [Entity Name]

**Type:** person|organization|concept|pattern|protocol
**First seen:** YYYY-MM-DD
**Sources:** [list of source documents]

## Description

## Relationships

## References
```

### from-nodes/ (Hub only)

**Aggregated knowledge from network nodes:**

```
from-nodes/
├── refi-dao-os/
│   └── [synced-knowledge-files]
├── refi-bcn-os/
│   └── [synced-knowledge-files]
└── [other-nodes]/
```

**Sync process:**
1. Nodes push knowledge to hub (Mondays 6am UTC)
2. Hub aggregates to `from-nodes/[node]/`
3. Hub curates cross-node insights
4. Hub distributes back to nodes

---

## Integration with Other Systems

### With OPAL

**Flow:**
```
Content → OPAL /process → _staging/ → /review → entities/ → knowledge/
```

OPAL populates:
- `entities/people/` — From meeting attendees
- `entities/organizations/` — From partner mentions
- `entities/concepts/` — From extracted concepts
- `patterns/` — From recognized patterns

### With KOI

**Flow:**
```
knowledge/ → KOI bridge → Broadcast RIDs → Network
Network → KOI bridge → Ingest to knowledge/
```

KOI syncs:
- `entities/` — With network-wide entity RIDs
- `patterns/` — Cross-node pattern recognition
- `from-nodes/` — Aggregated knowledge

### With Egregore

**Flow:**
```
/reflect → egregore-memory/reflections/ → knowledge/insights/
/handoff → egregore-memory/handoffs/ → knowledge/from-team/
```

Egregore captures:
- `insights/` — From `/reflect` commands
- Context for `from-nodes/` understanding

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Domain files | `[topic].md` | `quadratic-funding.md` |
| Patterns | `[pattern-name].md` | `participatory-budgeting.md` |
| Insights | `YYYY-MM-DD-[title].md` | `2026-03-21-qf-insights.md` |
| Entities | `[kebab-case-name].md` | `sarah-chen.md` |
| From nodes | `[original-filename]` | Preserved from source |

---

## Contribution Guidelines

### For Humans

1. **Add to appropriate domain** — Don't dump everything at root
2. **Cross-reference** — Link to related knowledge
3. **Include metadata** — Date, source, author
4. **Use templates** — Follow pattern/insight/entity formats
5. **Git commit** — Everything versioned

### For Agents

1. **Check INDEX.md** — Understand structure before writing
2. **Map to domains** — Use schema-bridge for domain mapping
3. **Extract entities** — OPAL-style extraction to entities/
4. **Link sources** — Every knowledge item needs source_ref
5. **Sync awareness** — Knowledge may propagate to network

---

## Sync Protocols

### Hub → Nodes (Skill Distribution)
- **Trigger:** GitHub Actions on hub skills/ changes
- **Content:** Patterns, entity templates
- **Frequency:** On push

### Nodes → Hub (Knowledge Aggregation)
- **Trigger:** Mondays 6am UTC (GitHub Actions)
- **Content:** knowledge/ directory (excluding from-nodes/)
- **Frequency:** Weekly

### Peer Sync (Bilateral)
- **Trigger:** Configured per peer (e.g., ReFi DAO ↔ ReFi BCN)
- **Content:** Governance decisions, urgent knowledge
- **Frequency:** On change or scheduled

---

## Status Indicators

Files may include status frontmatter:

```yaml
---
status: draft|review|published|archived
confidence: 0.0-1.0
reviewers: [name1, name2]
source: [meeting|research|reflection|external]
---
```

| Status | Meaning |
|--------|---------|
| `draft` | Work in progress |
| `review` | Pending human review |
| `published` | Approved, part of knowledge base |
| `archived` | No longer current, kept for history |

---

## File References

- Hub knowledge: `regen-coordination-os/knowledge/`
- DAO knowledge: `refi-dao-os/knowledge/`
- BCN knowledge: `refi-bcn-os/knowledge/`
- Framework: `org-os/knowledge/`

---

*Knowledge folder — the organizational memory commons*
