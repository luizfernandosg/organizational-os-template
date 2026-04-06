---
description: Open org-os session — sync, gather state, render dashboard, plan work
---

You are opening a new org-os session. Follow these steps exactly:

## Step 1: Sync

Run this command to pull latest changes:

```bash
git pull --rebase --quiet 2>&1 || echo "sync: no remote or offline — continuing with local state"
```

## Step 2: Gather State

Run the data gatherer script to collect all organizational state:

```bash
node scripts/initialize.mjs
```

If the script fails (missing dependencies, node not found), try `npm install` first, then retry. If it still fails, read the key files manually: `IDENTITY.md`, `HEARTBEAT.md`, `federation.yaml`, `data/projects.yaml`, `data/members.yaml`, `data/finances.yaml`, `data/meetings.yaml`, `data/events.yaml`, `data/funding-opportunities.yaml`, `data/ideas.yaml`, and recent files in `memory/`.

## Step 3: Read Configuration

Read these files:

1. `skills/org-os-init/SKILL.md` — visual language and dashboard layout spec
2. `docs/agent-plans/QUEUE.md` — active and queued plans
3. `dashboard.yaml` — **dashboard configuration** that controls which sections to show, their order, and per-section options

## Step 4: Render Dashboard

You are now in **Phase 1: OPEN**. Using the JSON from Step 2 and the config from `dashboard.yaml`, render the dashboard.

**Only render sections where `show: true`** (or where `show` is omitted, which defaults to true). Render them **in the order they appear in `dashboard.yaml`**. Respect per-section options:

| Section | Key options |
|---------|------------|
| `header` | `style: ascii` (block letters) or `style: compact` (single line) |
| `projects` | `max:` limit count, `stages:` filter by IDEA stage |
| `tasks` | `max:` per tier, `show_completed:` toggle completed tasks |
| `calendar` | `days:` window (7 = week, 14 = two weeks) |
| `funding` | `horizon_days:` only show deadlines within N days |
| `context` | `max_entries:` number of recent memory entries |
| `plans` | `queued_preview:` how many queued plans to show after active |
| `apps` | (no options) |
| `cheatsheet` | (no options) |
| `federation` | (no options) |
| `prompt` | `suggestions:` number of contextual suggestions |

If `dashboard.yaml` has a `custom_sections` list, render each one after the built-in sections (or in the position where it's placed in the sections list). For custom sections, read the `source` file and render as `table`, `list`, or `summary` per the `render` field.

If `dashboard.yaml` doesn't exist, render all sections with defaults.

End with the session prompt and contextual suggestions, then wait for the operator to pick what to work on. Transition to **Phase 2: PLAN** — load context, analyze, and present a tight work plan (5-7 steps max). Then execute.

$ARGUMENTS
