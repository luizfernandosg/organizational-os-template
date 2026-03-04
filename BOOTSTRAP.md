# BOOTSTRAP.md — First-Run Onboarding

_Run this ritual when deploying an agent in this workspace for the first time. After completion, this file can be archived or left as documentation._

---

## Onboarding Checklist

### Step 1: Understand the Organization

- [ ] Read `SOUL.md` completely — internalize values and voice
- [ ] Read `IDENTITY.md` — note org name, type, chain addresses
- [ ] Read `USER.md` — understand the primary operator
- [ ] Read `MEMORY.md` — check key decisions and active context
- [ ] Read `HEARTBEAT.md` — identify urgent tasks

### Step 2: Understand the Workspace

- [ ] Review `federation.yaml` — understand network relationships, enabled skills, channels
- [ ] Check `data/members.yaml` — who are the members?
- [ ] Check `data/projects.yaml` — what projects are active?
- [ ] Check `packages/operations/meetings/` — any recent meetings to process?
- [ ] Check `skills/` — what capabilities are available?

### Step 3: Check System Connections

- [ ] Verify Telegram channel access (if configured)
- [ ] Verify GitHub access (if configured)
- [ ] Verify Safe API access (if treasury management enabled)
- [ ] Check `.well-known/` — are schemas generated and current?

### Step 4: Initialize Memory

- [ ] Create today's memory file: `memory/YYYY-MM-DD.md`
- [ ] Write a brief onboarding note to memory:
  ```
  # [DATE]
  ## Agent Initialization
  - First session in this workspace
  - Org: [name from IDENTITY.md]
  - Active projects: [count]
  - Skills loaded: [list]
  - Ready for operations
  ```
- [ ] Update `MEMORY.md` "Active Context" with onboarding complete

### Step 5: Run First Heartbeat

- [ ] Review `HEARTBEAT.md` tasks
- [ ] Mark any already-completed tasks as done
- [ ] Add any new tasks identified during onboarding
- [ ] Notify operator that agent is operational

### Step 6: Confirm with Operator

Write a brief initialization summary to the operator:

```
Initialization complete for [Org Name].

I've read your organizational files and I'm ready to help with:
- [List active skills]

I noticed:
- [Key context from MEMORY.md]
- [Urgent items from HEARTBEAT.md]

What would you like to work on first?
```

---

## Post-Bootstrap

Once initialization is complete:
- This file can be archived (move to `docs/bootstrap-completed-YYYY-MM-DD.md`)
- Future sessions use the standard startup sequence in `AGENTS.md`
- Update `memory/YYYY-MM-DD.md` with "Bootstrap complete" entry

---

_Bootstrap is a one-time ritual. The standard session startup sequence (in AGENTS.md) handles all subsequent sessions._
