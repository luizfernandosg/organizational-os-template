---
name: org-os-init
description: Organizational OS initialization dashboard. Renders a rich ASCII visual overview of workspace state — projects, tasks, calendar, funding, cheatsheets. Use when running /initialize or starting a new org-os agent session.
license: MIT
compatibility: opencode
metadata:
  audience: operators
  workflow: initialization
---

# Org-OS Initialization Dashboard

You are rendering the **initialization dashboard** for an Organizational OS workspace. This is the first thing the operator sees when starting an agent session — make it count.

The dashboard is inspired by Egregore's "summoning circle" boot aesthetic: the agent arrives already aware, already oriented, ready to work. Not a blank slate asking "how can I help?" — a living system showing its current state.

## Data Source

You receive a JSON object from `node scripts/initialize.mjs` containing the full organizational state. Parse it and render each section below. If a section has no data, show the empty-state message instead of hiding it.

## Visual Language

Use Unicode box-drawing characters and block elements for a polished terminal look. These render correctly in all modern terminals and agent tools (OpenCode, Claude Code, etc.).

### Panel Frames

Use rounded corners for the main header panel:

```
╭──────────────────────────────────────────────────────────────────╮
│  Content                                                         │
╰──────────────────────────────────────────────────────────────────╯
```

Use simple line dividers for sections (no boxes — keep it breathable):

```
─── Section Title ─────────────────────────────────────────────────
```

### Status Indicators

```
●  Active / healthy / connected
○  Inactive / pending / not configured
▸  Action item / task bullet
✓  Completed
⚡ Critical priority
◆  Medium priority / urgent
◇  Low priority / upcoming
⚠  Warning (funding deadline approaching, system health issue)
```

### IDEA Stage Badges

```
[I] Integrate    [D] Develop    [E] Execute    [A] Archive
```

Use inline with project names: `[E] Execute`

## Dashboard Layout

Render these sections in order. Each section is a block of formatted text — NOT inside a box (except the header). Keep generous whitespace between sections.

---

### 1. HEADER — ASCII Art Banner (always render)

Render the organization name + "OS" as ASCII art block letters inside a rounded-corner panel. The script provides the org name in `identity.name`.

Use a chunky block-letter style. Example for "REFI BCN OS":

```
╭──────────────────────────────────────────────────────────────────────────────╮
│                                                                              │
│   ██████  ███████ ███████ ██     ██████   ██████ ███    ██                   │
│   ██   ██ ██      ██      ██     ██   ██ ██      ████   ██                   │
│   ██████  █████   █████   ██     ██████  ██      ██ ██  ██                   │
│   ██   ██ ██      ██      ██     ██   ██ ██      ██  ██ ██                   │
│   ██   ██ ███████ ██      ██     ██████   ██████ ██   ████                   │
│                                                           ╭─────╮           │
│   🌱 Cooperative · Celo                          OS       │ ╰─────╯           │
│   Memory: 2h ago · Peers: 3 · Runtime: opencode · Notion: connected         │
│                                                                              │
╰──────────────────────────────────────────────────────────────────────────────╯
```

Rules for the header:

- Generate ASCII block letters for the org name from `identity.name` (uppercase). Use `█` block characters.
- Do NOT add ` OS` to the ASCII art letters — render it separately as a small inline label or badge next to the banner.
- Below the ASCII art, show ONE metadata line: `{emoji} {type}` then chain if configured, then a Notion link `[Notion]({url})` if `identity.notionUrl` exists.
- Show the status bar as the last line inside the panel: Memory age · Peer count · Runtime · Notion status.
- No motivational quotes. No mission statement. No taglines. Keep it factual.

Adapt the ASCII art to the org name length:

- Short names (≤8 chars): Full chunky block letters
- Medium names (9-14 chars): Slightly narrower block letters
- Long names (>14 chars): Use only the acronym or abbreviation in block letters, show full name in regular text below

---

### 2. PROJECTS (from `state.projects`)

```
─── Active Projects ───────────────────────────────────────────────

  ●  Coop Formation        [E] Execute    @luiz    → notion.so/abc123
  ●  Treasury Migration    [D] Develop    @giulio  → notion.so/def456
  ●  Knowledge Commons     [I] Integrate  @luiz

  3 active
```

Rules:

- Use `●` bullet for each project
- Show `[X] StageName` badge aligned
- Show lead prefixed with `@`
- Show Notion URL as `→ notion.so/...` (shortened, not full URL)
- If a project has `notionUrl`, always show it
- Footer line: count of active projects
- Empty state: `  ○  No projects yet — add to data/projects.yaml or configure in Notion`

---

### 3. TASKS (from `state.tasks`)

```
─── Tasks ─────────────────────────────────────────────────────────

  ⚡ Review Artisan grant — deadline Apr 5             CRITICAL
  ◆  Process Wednesday meeting notes                   URGENT
  ◆  Update member registry from Notion                URGENT
  ◇  Regenerate EIP-4824 schemas                       UPCOMING
  ✓  Completed schema validation (Apr 1)

  3 pending · 1 critical · 1 done today
```

Rules:

- `⚡` for critical (overdue or due today)
- `◆` for urgent (due within 7 days, or in funding/governance categories)
- `◇` for upcoming (no immediate deadline)
- `✓` for recently completed (show max 3)
- Right-align the priority label
- Show due dates in human-readable format ("Apr 5", "3d left")
- Footer line: pending count · critical count · completed count
- Empty state: `  ○  No tasks in HEARTBEAT.md — the workspace is quiet`

---

### 4. THIS WEEK — Calendar (from `state.meetings`)

```
─── This Week ─────────────────────────────────────────────────────

  Mon 31  │
  Tue  1  │  ■ Team Sync 10:00                → notion.so/meet1
  Wed  2  │  ■ Sprint Review 14:00            → notion.so/meet2   ← today
  Thu  3  │
  Fri  4  │  ■ Coop Assembly 16:00            → notion.so/meet3
  Sat  5  │
  Sun  6  │
```

Rules:

- Show Mon-Sun of the current week
- Use `■` marker for days with meetings
- Show meeting title + time (24h format)
- Show Notion link as `→ notion.so/...` if available
- Mark today with `← today`
- Empty days show just the date
- Empty state: `  No meetings scheduled this week.`

---

### 5. FUNDING DEADLINES (from `state.funding`, only if upcoming exist)

```
─── Funding ───────────────────────────────────────────────────────

  ⚠  Artisan Grant R4 — 3 days left                   → artisan.fund/...
  ◇  Octant Epoch 8 — 21 days left                    → octant.app/...

```

Rules:

- Only render this section if `state.funding.upcoming` has entries
- `⚠` for deadlines ≤ 7 days
- `◇` for deadlines > 7 days
- Show platform/fund name, days remaining, URL
- Max 5 entries

---

### 6. RECENT CONTEXT (from `state.recentMemory`, only if entries exist)

```
─── Recent Context ────────────────────────────────────────────────

  Apr 1: Discussed treasury migration timeline with Giulio. Decided
         to proceed with Gnosis Chain. Artisan grant draft at 80%.
  Mar 31: Processed ReFi BCN weekly call notes. 3 action items created.
```

Rules:

- Only render if `state.recentMemory` has entries
- Show date + summary, wrapped at ~70 chars
- Max 3 entries
- This grounds the agent (and operator) in what happened recently

---

### 7. CHEATSHEET (always render)

```
─── Cheatsheet ────────────────────────────────────────────────────

  COMMANDS                            AGENT TIPS
  ──────────────────────              ────────────────────────────────
  npm run setup      Org setup        "Review the Artisan grant draft"
  npm run sync       Git sync         "Process the Sprint Review notes"
  npm run initialize This dashboard   "Update project X to Execute"
  /reflect           Save insight     "What funding deadlines are up?"
  /handoff           Team notes       "Summarize this week's progress"
```

Rules:

- Left column: essential commands (always the same set)
- Right column: **contextual** agent tips based on what's actually urgent
  - If critical tasks exist: suggest working on them
  - If meetings happened recently: suggest processing notes
  - If funding deadlines approaching: suggest reviewing them
  - If data is empty (template state): suggest setup commands
- If egregore is enabled (`state.federation.egregoreEnabled`), include `/reflect` and `/handoff`
- If egregore is not enabled, replace with `npm run generate:schemas` and general tips

---

### 8. FEDERATION (compact, always render)

```
─── Federation ────────────────────────────────────────────────────

  Upstream: organizational-os-template · Last sync: 12h ago
  Peers: regen-coordination-os, refi-dao-os, refi-bcn-os
  Skills: 6 active — meeting-processor, funding-scout, knowledge-curator, ...
```

Rules:

- Show upstream repo + last sync age
- List peer names (comma-separated)
- Show skills count + first 3 names + "..."
- If no peers: `Peers: none configured`
- If no upstream: `Upstream: none`

---

### 9. PROMPT (always render)

```
────────────────────────────────────────────────────────────────────

  What would you like to work on?

  Suggested:
  1. ⚡ Finalize the Artisan grant (deadline in 3 days)
  2. ◆  Process today's Sprint Review meeting notes
  3. ◇  Update member registry from latest Notion data
```

Rules:

- Always end with "What would you like to work on?"
- Generate 3 contextual suggestions based on priority:
  1. Most critical/urgent task
  2. Most relevant meeting or action item
  3. A maintenance/improvement task
- If workspace is in template state (all empty): suggest setup steps instead:
  1. `Run npm run setup to configure your organization`
  2. `Add members to data/members.yaml`
  3. `Create your first project in data/projects.yaml`

---

## Adaptive Behavior

### Empty / Template State

When the org name is "Your Organization Name" or most data is empty, the dashboard should acknowledge this gracefully:

```
╭──────────────────────────────────────────────────────────────────╮
│                                                                  │
│    ██████  ██████   ██████                                       │
│   ██    ██ ██   ██ ██                                            │
│   ██    ██ ██████  ██   ███                                      │
│   ██    ██ ██   ██ ██    ██                                      │
│    ██████  ██   ██  ██████          OS                           │
│                                                                  │
│   New workspace · Not yet configured                             │
│                                                                  │
╰──────────────────────────────────────────────────────────────────╯

─── Getting Started ───────────────────────────────────────────────

  This is a fresh org-os workspace. Let's set it up:

  1.  Run `npm run setup` — interactive configuration wizard
  2.  Edit SOUL.md — define your organization's values and mission
  3.  Edit IDENTITY.md — fill in organization details
  4.  Add members to data/members.yaml
  5.  Create projects in data/projects.yaml
  6.  Run `npm run generate:schemas` to create EIP-4824 outputs

  Need help? Ask me anything about setting up your workspace.
```

### Narrow Terminals

If the operator mentions terminal width issues, simplify:

- Drop the two-column cheatsheet layout (stack vertically)
- Shorten section dividers
- Abbreviate stage badges to single letter

### Notion Not Connected

If `state.status.notionConnected` is false, add a note in the status bar:

```
  Notion: not configured — set NOTION_API_KEY + database IDs in TOOLS.md
```

### Post-Initialization Behavior

After rendering the dashboard, you are in a conversational agent session. The operator will tell you what to work on. You have full context from the dashboard — reference it naturally. Don't re-read files you already know about from the initialization data.

When the operator selects a task or project:

1. Load the relevant files (HEARTBEAT.md, project markdown, meeting notes)
2. Provide a focused work plan
3. Start executing

You are the organization's operational agent. The dashboard was your entrance. Now get to work.
