# Setup Paths for Organizational OS

**Version:** 1.0.0  
**Date:** 2026-03-21  
**Applies to:** org-os v3.1+

---

## Overview

Organizational OS supports **multiple setup paths** to accommodate different working styles and team needs. Choose the path that best fits your context:

| Path | Best For | AI-Assisted | Git Coordination | Complexity |
|------|----------|-------------|------------------|------------|
| **Egregore-assisted** | Teams wanting AI memory & continuity | ✅ Full | ✅ Git-based | Medium |
| **Filesystem-native** | Direct editors, minimal setup fans | ⚠️ Optional | ⚠️ Standard git | Low |
| **Hybrid** | Flexible teams, context-switchers | ✅ Toggle | ✅ Both modes | Medium |

---

## Path A: Egregore-Assisted

### Description
AI-augmented coordination with persistent team memory. Uses [egregore-core](https://github.com/Curve-Labs/egregore-core) for cross-session, cross-team knowledge sharing.

### Ideal For
- Distributed teams with async workflows
- Knowledge-intensive work (research, strategy, governance)
- Teams using AI assistants (Claude Code, OpenCode, Cursor)
- Situations where context handoffs matter

### What You Get
- ✅ `/reflect` — Capture decisions and insights (persists to Git)
- ✅ `/handoff` — Leave notes for team/next session
- ✅ `/quest` — Track research explorations
- ✅ `/activity` — See what the team has been doing
- ✅ Git-based memory (no external SaaS required)
- ✅ Works offline, full history in your repo

### Setup
```bash
npm run setup
# → Choose path: "Egregore-assisted"
# → Select agent runtime: openclaw | cursor | custom
# → Egregore package auto-enabled
```

### Daily Workflow
```bash
# 1. Start session
/reflect "Picking up from yesterday's governance call..."

# 2. Do work, make decisions

# 3. Capture insights
/reflect "Decision: Moving treasury to Gnosis Chain for lower fees"

# 4. Handoff if async
/handoff "Need @giulio to review the multisig config before we execute"

# 5. End session — egregore auto-commits to Git
```

### Runtime Compatibility
| Runtime | Support | Notes |
|---------|---------|-------|
| Claude Code | ✅ Native | Zero config |
| OpenCode | ✅ Via adapter | Use `/ask "Reflect: ..."` |
| Cursor | ⚠️ Partial | File-based, no slash commands |
| OpenClaw | ✅ Compatible | Git-based memory works |

---

## Path B: Filesystem-Native

### Description
Direct file editing with minimal abstraction. Human-centric, AI-optional. Use when you want full control and minimal magic.

### Ideal For
- Solo operators who prefer direct editing
- Teams with strong documentation discipline
- Situations requiring minimal dependencies
- High-security contexts (no external AI services)

### What You Get
- ✅ Direct file editing (SOUL.md, IDENTITY.md, data/*.yaml)
- ✅ Standard git workflow (add, commit, push)
- ✅ Optional agent runtime (can add later)
- ✅ No mandatory AI integration
- ✅ Full transparency — everything visible in files

### Setup
```bash
npm run setup
# → Choose path: "Filesystem-native"
# → Agent runtime: "none" (can enable later)
# → Packages: Select only what you need
```

### Daily Workflow
```bash
# 1. Edit files directly
vim data/projects.yaml
vim memory/2026-03-21.md

# 2. Standard git workflow
git add .
git commit -m "Update: New project added"
git push

# 3. Optional: Run schema generation
npm run generate:schemas
```

### When to Use AI Anyway
Even on the filesystem path, you can still:
- Use agents occasionally by running with `openclaw` or other runtime
- Keep AI assistance lightweight and on-demand
- Maintain full file visibility and control

---

## Path C: Hybrid

### Description
Best of both worlds. Enable both egregore-assisted and filesystem-native modes, choose per-workflow.

### Ideal For
- Teams with mixed preferences
- Context-switching between deep work and coordination
- Gradual adoption (start filesystem, add egregore later)
- Flexibility-first organizations

### What You Get
- ✅ Toggle between modes per session
- ✅ Egregore available for complex coordination
- ✅ Filesystem fallback for quick edits
- ✅ Same Git repo, same data files
- ✅ Team members can choose their preferred mode

### Setup
```bash
npm run setup
# → Choose path: "Hybrid"
# → Select both "egregore" and other packages
# → Configure runtimes for both modes
```

### Daily Workflow — Context-Dependent
```bash
# Deep work session (filesystem)
vim docs/STRATEGY.md
git commit -m "Draft: Q2 strategy"

# Team coordination session (egregore)
/reflect "Reviewing @giulio's strategy draft"
/ask "What are the open questions?"
/handoff "Need feedback on Section 3 by Thursday"

# Back to filesystem for final edits
vim docs/STRATEGY.md
git commit -m "Final: Q2 strategy approved"
```

---

## Comparing Paths

### Decision Matrix

| Situation | Egregore | Filesystem | Hybrid |
|-----------|----------|------------|--------|
| Solo operator | ✅ | ✅✅ | ⚠️ Overkill |
| Small team (2-4) | ✅✅ | ✅ | ✅ |
| Large team (5+) | ✅✅ | ⚠️ | ✅ |
| Async-heavy | ✅✅ | ⚠️ | ✅ |
| Real-time sync | ✅ | ✅ | ✅ |
| Minimal dependencies | ⚠️ | ✅✅ | ⚠️ |
| AI-native workflow | ✅✅ | ⚠️ | ✅ |
| Human-first workflow | ⚠️ | ✅✅ | ✅ |
| Security-sensitive | ⚠️ Review | ✅✅ | ⚠️ |
| Offline-first | ✅✅ | ✅✅ | ✅✅ |

Legend: ✅✅ = excellent fit, ✅ = good fit, ⚠️ = consider tradeoffs

---

## Switching Paths

### Can I Change Later?

**Yes.** Your choice at setup is not permanent.

### Egregore → Filesystem
```bash
# Simply stop using egregore commands
# Your files remain the source of truth
# The egregore memory repo stays but becomes inactive

# Optional: Remove egregore package
# Edit federation.yaml: egregore: false
# Or re-run: npm run setup
```

### Filesystem → Egregore
```bash
# 1. Enable egregore package
npm run setup
# → Select "egregore" from packages

# 2. Or manual:
# Edit federation.yaml: egregore: true
# git submodule add https://github.com/Curve-Labs/egregore-core.git packages/egregore-core

# 3. Initialize egregore memory
cd packages/egregore-core
npx create-egregore@latest --local
```

### Either → Hybrid
```bash
# Hybrid is about mindset, not config
# Simply use both approaches as needed
# No setup changes required
```

---

## Extension: Custom Paths

### Adding Your Own Path

The path system is extensible. To add a custom path:

1. **Create path config** in `config/paths/your-path.yaml`
2. **Add to setup script** in `scripts/setup-org-os.mjs`
3. **Document** in this file (PR to org-os)

### Example: Enterprise Path
```yaml
# config/paths/enterprise.yaml
name: "Enterprise"
description: "Compliance-heavy with audit trails"
features:
  - audit_logging: true
  - approval_workflows: true
  - egregore: false  # Disable for compliance
  - filesystem: true
  - multi_tenant: true
```

### Example: Research Path
```yaml
# config/paths/research.yaml
name: "Research Lab"
description: "Heavy quest/exploration tracking"
features:
  - egregore: true
  - quest_tracking: enhanced
  - citations: true
  - filesystem: true
```

---

## Path-Specific Configuration

### Egregore Path Config

```yaml
# In federation.yaml (auto-generated by setup)
packages:
  egregore: true

agent:
  runtime: "openclaw"  # or cursor, custom
  proactive: true      # Egregore benefits from proactive agents
  
# Egregore-specific settings
customizations:
  - path: "egregore-memory/"
    reason: "AI memory repo (git submodule)"
    type: "addition"
    maintain_on_sync: false
```

### Filesystem Path Config

```yaml
# In federation.yaml
packages:
  egregore: false      # Not needed
  meetings: true       # Still useful for structure
  projects: true
  
agent:
  runtime: "none"      # Or "cursor" for light assistance
  proactive: false     # Human initiates all actions
```

### Hybrid Path Config

```yaml
# In federation.yaml
packages:
  egregore: true       # Available
  meetings: true
  projects: true
  coordination: true   # Useful for hybrid teams
  
agent:
  runtime: "openclaw"  # Flexible runtime
  proactive: true      # Can be toggled per workflow
```

---

## Troubleshooting

### "Egregore commands not working"
- Check: Did you select the egregore package? `cat federation.yaml | grep egregore`
- Check: Is egregore-core installed? `ls packages/egregore-core/`
- Check: For OpenCode, are you using the adapter? See `opencode-adapter/README.md`

### "Want to switch paths mid-project"
- Safe to switch — your data files remain the source of truth
- Egregore memory is additive, not destructive
- Can run both paths in parallel (hybrid mode)

### "Team members want different paths"
- Perfect use case for **Hybrid** path
- Each person chooses their mode per session
- Same files, same git repo, different workflows

### "Filesystem path feels too manual"
- Try adding light agent assistance: `agent: { runtime: "cursor" }`
- Keep filesystem as primary, agents as helpers
- Gradual adoption beats forced change

---

## Best Practices

### For Egregore Path
1. **Reflect early and often** — Don't wait for perfect insights
2. **Use handoffs for async** — Context carries forward automatically
3. **Commit regularly** — Egregore commits are lightweight, do them frequently
4. **Review activity weekly** — `/activity` gives team-wide context

### For Filesystem Path
1. **Edit in small chunks** — Easier to review and commit
2. **Write descriptive commits** — Your future self will thank you
3. **Use schema validation** — `npm run validate:schemas` catches errors
4. **Document decisions** — Even without `/reflect`, capture rationale in files

### For Hybrid Path
1. **Choose consciously** — "This session needs egregore or filesystem?"
2. **Don't double-work** — Don't `/reflect` AND write the same thing manually
3. **Sync regularly** — Git is your common ground
4. **Respect team preferences** — Some prefer one mode, that's fine

---

## References

- **Egregore Core:** `packages/egregore-core/README.md`
- **OpenCode Adapter:** `packages/egregore-core/opencode-adapter/README.md`
- **Package Registry:** `docs/PACKAGES.md`
- **Federation Spec:** `federation.yaml` (annotated)
- **Setup Script:** `scripts/setup-org-os.mjs`

---

*Choose your path. The destination is the same: effective coordination.*
