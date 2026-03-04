# Memory Directory

This directory contains daily organizational memory logs written by agents (and humans) during operational sessions.

## Format

Files follow the pattern `YYYY-MM-DD.md`.

### Daily Log Template

```markdown
# YYYY-MM-DD

## Sessions
- Brief description of sessions/meetings

## Key Decisions
- Decision 1 (context)
- Decision 2 (context)

## Actions Taken
- Action 1
- Action 2

## Observations
- Relevant context for future sessions

## Next
- Upcoming tasks or follow-ups
```

## Guidelines

- **Write during sessions**: Log significant events as they happen
- **Be concise**: This is a log, not a report — bullet points preferred
- **Date-stamp everything**: `YYYY-MM-DD` format always
- **Link to source files**: Reference meeting notes, project files, etc.
- **Keep 90 days**: Archive or delete entries older than 90 days

## Relation to MEMORY.md

`MEMORY.md` is the curated long-term index — key decisions, active context, milestones.
This directory contains the detailed daily logs that `MEMORY.md` references.

When something important happens:
1. Log it in `memory/YYYY-MM-DD.md` (detail)
2. If it's a key decision, add to `MEMORY.md` quick index (summary)
