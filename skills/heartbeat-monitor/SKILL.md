---
name: heartbeat-monitor
version: 1.0.0
description: Proactive organizational health monitoring and task tracking
author: organizational-os
category: infrastructure
metadata:
  openclaw:
    requires:
      env: []
      bins: []
      config: []
---

# Heartbeat Monitor

## What This Is

Proactively monitors `HEARTBEAT.md` and organizational data for tasks requiring attention, system health checks, and upcoming deadlines. The heartbeat keeps the organization from dropping important balls.

## When to Use

- On a schedule (proactive — check `federation.yaml` heartbeat_interval)
- At the start of every session (part of startup sequence in `AGENTS.md`)
- When explicitly asked "what's pending?" or "any alerts?"
- Before a coordination call: "what should we discuss today?"

## Core Functions

### 1. Task Review

Read `HEARTBEAT.md` and categorize pending tasks by urgency:
- **Critical**: Due today or overdue
- **Urgent**: Due within 7 days
- **Upcoming**: Due within 30 days
- **Ongoing**: No deadline, but active

Report format:
```markdown
## Heartbeat Report — YYYY-MM-DD

### Critical (action needed today)
- [x/y] Task description (due: DATE)

### Urgent (this week)
- [ ] Task description (due: DATE)

### Upcoming (next 30 days)
- [ ] Task description (due: DATE)

### System Health
- Agent status: OK
- Last schema generation: [date]
- Last hub sync: [date]
```

### 2. Deadline Detection

Scan `data/funding-opportunities.yaml` for upcoming deadlines:
- If deadline within 30 days → add to `HEARTBEAT.md` if not already there
- If deadline within 7 days → flag as urgent in heartbeat report
- If deadline passed → mark as expired; remove from active list

### 3. System Health Checks

Check:
- `.well-known/` schemas last modified (alert if > 7 days without update when data changed)
- `memory/` has recent entries (alert if > 3 days since last memory write)
- `MEMORY.md` key decisions section has been updated recently

### 4. Action Item Aging

Scan meeting notes in `packages/operations/meetings/` for unclaimed action items:
- Items without owner: flag for assignment
- Items > 14 days old without status update: flag for review

### 5. Proactive Alerts

In messaging channels (if configured), surface:
- Upcoming funding deadlines
- Overdue action items
- Governance votes approaching

**Only send alerts when proactive mode is enabled in `federation.yaml`.**

## Heartbeat Schedule

Configure in `federation.yaml`:
```yaml
agent:
  proactive: true
  heartbeat_interval: "30m"  # or "1h", "6h", cron expression
```

For OpenClaw: heartbeat runs on this interval; agent checks `HEARTBEAT.md` and sends alerts to configured channels.

For Cursor: heartbeat runs manually at session start.

## Writing to HEARTBEAT.md

When adding new tasks from detected conditions:
```markdown
### [Category]
- [ ] [Task description] — detected [date], due: [DATE if known]
```

When marking tasks complete:
```markdown
### Recently Completed
- [x] [Task description] — completed [date]
```

Archive completed tasks to "Recently Completed" section; remove after 30 days.

## Notes

- This skill is lightweight — it reads files, doesn't make external calls
- Run it first to understand what needs attention, then activate other skills
- The `HEARTBEAT.md` file is the organizational nervous system — keep it current
- Delete stale tasks ruthlessly: a bloated HEARTBEAT is useless
