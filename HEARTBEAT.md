# HEARTBEAT.md — Active Monitoring

_A living checklist of active tasks and system health checks. Agents consult this on every session. Update regularly — mark done, add new, remove stale._

---

## Active Tasks

### Funding
<!-- Add funding tasks with deadlines -->
- [ ] Review current funding opportunities in `data/funding-opportunities.yaml`
- [ ] _(Add specific opportunities and deadlines here)_

### Governance
<!-- Proposals, votes, decisions pending -->
- [ ] _(Add active governance items)_

### Operations
<!-- Meetings to process, reports to write, members to onboard -->
- [ ] _(Add operational tasks)_

### Technical
<!-- Schema regeneration, agent config, integrations -->
- [ ] Run `npm run generate:schemas` after data changes
- [ ] _(Add technical tasks)_

---

## System Health

### Agent Runtime
- [ ] Verify agent is operational (last heartbeat < 2h ago)
- [ ] Check Telegram bot connectivity
- [ ] Verify GitHub Actions are running

### Data Integrity
- [ ] `data/members.yaml` is up to date
- [ ] `data/projects.yaml` reflects current project statuses
- [ ] `.well-known/` schemas match current data

### Federation
- [ ] Check last sync with hub (see `federation.yaml`)
- [ ] Verify peer node connectivity

---

## Reminders

- [ ] Review meeting action items weekly
- [ ] Update `MEMORY.md` with key decisions
- [ ] Push knowledge contributions to federation hub
- [ ] Check funding deadlines every 7 days

---

## Recently Completed

_(Move completed items here with date — keep for 30 days then remove)_

---

_Last updated: [DATE]_
