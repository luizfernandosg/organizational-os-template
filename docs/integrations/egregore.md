# Egregore Integration

**Package:** `packages/egregore-core/`  
**Source:** [github.com/Curve-Labs/egregore-core](https://github.com/Curve-Labs/egregore-core)  
**Status:** ✅ **Integrated & Active in refi-bcn-os**  
**Type:** Git-based AI Memory

---

## What is Egregore?

Egregore is a **shared intelligence layer for Claude Code teams** by Curve Labs:

- Git-based persistent memory across AI sessions
- Async handoffs between team members
- Accumulated knowledge across sessions and people
- No servers/accounts required — everything local via Git
- Works with Claude Code (native) and OpenCode (via adapter)

---

## Architecture

```
org-os instance
    └── packages/egregore-core/
        ├── README.md            # This documentation
        ├── opencode-adapter/     # OpenCode compatibility
        │   ├── README.md
        │   ├── opencode-to-egregore.js
        │   └── package.json
        └── (egregore submodule or dependency)

egregore-memory/              # Git repo for shared memory (gitignored)
├── reflections/
├── handoffs/
├── quests/
└── .git/
```

---

## Quick Start

```bash
# Already integrated in refi-bcn-os

# For other instances:
git submodule add https://github.com/Curve-Labs/egregore-core.git packages/egregore-core

# Or via org-os setup:
npm run setup
# → Select "Egregore-assisted" path
```

---

## Key Commands

### Claude Code (Native)
| Command | Purpose |
|---------|---------|
| `/reflect` | Capture decisions, insights, patterns |
| `/handoff` | Leave notes for team/next session |
| `/quest` | Start/contribute to research exploration |
| `/ask` | Ask questions routed to team knowledge |
| `/activity` | See recent team activity |
| `/save` | Commit and push contributions |

### OpenCode (via Adapter)
| Command | Equivalent |
|---------|------------|
| `/ask "Reflect: ..."` | `/reflect` |
| `/ask "Handoff: ..."` | `/handoff` |
| `/ask "Quest: ..."` | `/quest` |
| `/ask "Show activity"` | `/activity` |

---

## Configuration (federation.yaml)

```yaml
knowledge-commons:
  enabled: true
  
# Egregore selected via setup path
# Path: "Egregore-assisted" or "Hybrid"

# Runtime-specific:
agent:
  runtime: "openclaw"  # or "cursor", "claude"
  
# Egregore memory repo
customizations:
  - path: "egregore-memory/"
    reason: "Shared AI memory (git submodule)"
    type: "addition"
    maintain_on_sync: false
```

---

## Integration Points

### With Org OS
- **AGENTS.md** — Agent reads SOUL.md, IDENTITY.md, then uses egregore for continuity
- **MEMORY.md** — Long-term decisions synced with egregore reflections
- **HEARTBEAT.md** — Active tasks captured as handoffs
- **memory/** — Daily logs → egregore reflections

### With OPAL
- OPAL extracts entities → egregore captures as reflections
- Egregore handoffs include OPAL extraction context
- Combined: AI extraction + team knowledge continuity

### With KOI
- Egregore handoffs can include KOI RID references
- KOI network events → egregore reflections
- Combined: Network sync + team memory

---

## Dual Runtime Support

**Claude Code:**
- Native `/reflect`, `/handoff`, `/quest`
- Zero configuration

**OpenCode:**
- Via `opencode-adapter/`
- `/ask "Reflect: ..."` pattern
- Same Git-based persistence

**Both share:** Same `egregore-memory/` repo, same knowledge base.

---

## Use Cases

### Cross-Session Continuity
```
Session 1: Research regenerative agriculture
  → /reflect "Found 3 key papers on soil carbon"
  → /quest "Soil carbon sequestration models"

Session 2 (next day):
  → /activity shows previous work
  → /ask "What papers did I find yesterday?"
  → AI answers from egregore memory
```

### Team Handoffs
```
Luiz: /handoff "Research incomplete — need soil data from Catalonia. Assign to @giulio."

Giulio (later):
  → /activity shows Luiz's handoff
  → /quest continue "Soil carbon models" from Luiz's context
```

### Decision Tracking
```
/decision made: "Move treasury to Gnosis Chain"
  → /reflect captures rationale
  → Egregore stores with timestamp
  → Future /ask "Why did we choose Gnosis?" → AI retrieves rationale
```

---

## For Developers

### OpenCode Adapter

Location: `packages/egregore-core/opencode-adapter/`

```javascript
const { EgregoreOpencodeAdapter } = require('./opencode-to-egregore');

const adapter = new EgregoreOpencodeAdapter({
  memoryRepo: './egregore-memory',
  user: 'luiz'
});

// Handle OpenCode /ask
await adapter.handleAsk('Reflect: Key insight from today');
```

### Extending Egregore

Add custom workflows to `egregore-memory/.opal/workflows/`:
- Custom templates for org-specific knowledge
- Integration with org-os data structures

---

## File References

- Core: `packages/egregore-core/README.md`
- Adapter: `packages/egregore-core/opencode-adapter/`
- Source: `github.com/Curve-Labs/egregore-core`
- Active instance: `refi-bcn-os/` (dual runtime active)

---

## Status

- ✅ **Core integration:** Git submodule configured
- ✅ **OpenCode adapter:** Complete (3 files)
- ✅ **Dual runtime:** Claude Code + OpenCode
- ✅ **Active deployment:** refi-bcn-os
- ✅ **Setup paths:** Egregore-assisted, Hybrid available

**Production-ready** — actively used in refi-bcn-os

---

*Egregore integrated — Git-based AI memory for team continuity*
