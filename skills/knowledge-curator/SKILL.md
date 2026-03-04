---
name: knowledge-curator
version: 1.0.0
description: Aggregate, organize, and share knowledge from channels and operational activity
author: organizational-os
category: knowledge
metadata:
  openclaw:
    requires:
      env: []
      bins: []
      config: []
---

# Knowledge Curator

## What This Is

Monitors organizational channels (Telegram, GitHub, meeting notes) for meaningful knowledge, organizes it by domain, and produces curated summaries for the workspace and federation commons. Turns the constant flow of shared links and discussions into navigable organizational knowledge.

## When to Use

- When asked "what do we know about [topic]?"
- When Telegram groups have accumulated links and updates to process
- After meetings where domain knowledge was discussed
- Weekly: scheduled curation of accumulated knowledge
- When preparing a thematic report or discussion

## When NOT to Use

- For individual meeting processing → use meeting-processor skill
- For financial tracking → use capital-flow skill
- For raw transcript processing → use meeting-processor skill

## Inputs

- Telegram channel messages (if channel access is configured in `TOOLS.md`)
- Meeting notes in `packages/operations/meetings/`
- GitHub activity from monitored repos (configured in `TOOLS.md`)
- Direct content pasted by operator

## Outputs

| Output | Location | Format |
|--------|----------|--------|
| Domain curation | `knowledge/<domain>/YYYY-MM-DD.md` | Markdown |
| Hub contribution | Sync to hub `knowledge/` | Markdown |
| Weekly digest | `memory/YYYY-MM-DD.md` | Markdown |
| Memory index update | `MEMORY.md` | Markdown |

## What Gets Curated

### High Value (always curate)
- Funding opportunities and platform mechanics
- Partner organization updates (new projects, launches, pivots)
- Governance decisions from ecosystem protocols
- Technical developments relevant to org domains
- Strategic insights from discussions

### Medium Value (curate if distinct)
- Shared links with substantive context
- Questions with useful answers
- Project status updates from network

### Low Value (skip)
- Social chat without informational content
- Duplicate information already in knowledge base
- Highly ephemeral content (memes, reactions)

## Domain Organization

Organize by domains declared in `federation.yaml`:
```
knowledge/
├── regenerative-finance/
│   └── YYYY-MM-DD-curation.md
├── local-governance/
│   └── YYYY-MM-DD-curation.md
└── agroforestry/
    └── YYYY-MM-DD-curation.md
```

## Curation Format

```markdown
# Knowledge Curation — [Domain]
**Period:** YYYY-MM-DD → YYYY-MM-DD
**Curated by:** [node name from IDENTITY.md]

## Key Developments

### [Sub-topic]
- [Insight] — Source: [meeting/channel/date]
- [Insight] — Source: [URL or reference]

## Partner Updates
- [Partner name]: [What's happening] — Source: [...]

## Funding Landscape
- [Opportunity or development] — Source: [...]

## Resources
- [Description] — [URL]
```

## Curation Principles

1. **Synthesize, don't copy** — extract insights, not raw text
2. **Source everything** — always note where info came from
3. **Domain-tag everything** — every item belongs to at least one domain
4. **Distinguish signal from noise** — only what has durable value
5. **Apply org voice** — match terminology from `SOUL.md`

## Channel Configuration

Check `TOOLS.md` for configured channels:
```markdown
## Telegram Channels to Monitor
- @channel_handle — Description
```

## Privacy Handling

- Only curate from authorized channels
- Synthesize ideas, not quotes of individuals
- Personal names appear only when relevant and public
- Apply `SOUL.md` boundaries: "Open by default, private by exception"

## Knowledge Commons Publishing

If `federation.yaml` has `knowledge-commons.publish.meetings: true`:
- After curation, copy to hub sync location
- Follow hub contribution format in `federation.yaml`

## Notes

- This skill creates `knowledge/` directories if they don't exist
- Curations are cumulative — each file covers a specific period
- After curation, update `MEMORY.md` if key insights warrant it
