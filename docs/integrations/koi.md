# KOI Integration

**Package:** `packages/koi-bridge/`  
**Source:** BlockScience/Metagov/RMIT KOI-net  
**Status:** 🟡 **Skeleton Ready, Implementation TBD**  
**Type:** Distributed Knowledge Graph

---

## What is KOI?

KOI (Knowledge Organization Infrastructure) is a **distributed protocol for federated knowledge graphs**:

- Network-wide knowledge sharing via RIDs (Repository Independent Data)
- Event-driven sync (NEW/UPDATE/FORGET)
- Node types: partial (lightweight) or full (coordinator)
- Python-based with TypeScript bridge
- Real-time or batched sync

---

## Architecture

```
org-os instance (KOI Bridge)
    └── packages/koi-bridge/
        ├── src/
        │   ├── index.ts          # Main KoiBridge class
        │   ├── bridge.ts         # KOI-net HTTP client
        │   ├── rid.ts            # RID generation/validation
        │   ├── events.ts         # Event broadcast/listen
        │   └── git-sync.ts       # Git ↔ KOI sync
        └── cli.ts                # CLI: setup, sync, query, poll
```

**Network Topology:**
```
[Your Instance] ←→ [KOI Coordinator] ←→ [Other Instances]
     ↓                    ↓                  ↓
  Git repo          Event routing      Git repos
```

---

## Quick Start (When Implemented)

```bash
# Setup KOI connection
cd packages/koi-bridge
npm install
npm run build

npx koi-bridge setup --coordinator https://koi.regen.network/koi-net

# Sync local knowledge to network
npx koi-bridge sync

# Query federated knowledge
npx koi-bridge query "regenerative agriculture patterns"

# Poll for network updates
npx koi-bridge poll
```

---

## Key Commands (Planned)

| Command | Purpose | Status |
|---------|---------|--------|
| `setup` | Register with coordinator | 🟡 Skeleton |
| `sync` | Push local → network | 🟡 Skeleton |
| `query` | Search federated knowledge | 🟡 Skeleton |
| `poll` | Pull network → local | 🟡 Skeleton |
| `status` | Show network health | 🟡 Skeleton |

---

## Configuration (federation.yaml)

```yaml
knowledge-commons:
  enabled: true
  koi-bridge:
    enabled: true
    coordinator_url: "https://koi.regen.network/koi-net"
    node_type: "partial"  # partial | full
    sync_schedule: "*/15 * * * *"  # Every 15 min
    
    # Auto-sync settings
    auto_broadcast: true    # Push on git commit
    auto_pull: true         # Poll coordinator
    review_required: true   # Human approval for sensitive
```

---

## Integration Points

### Input (Local → Network)
- `knowledge/` directory changes
- `data/*.yaml` updates
- Git commits with knowledge tags

### Output (Network → Local)
- Incoming RIDs from other nodes
- Federation-wide search results
- Cross-instance notifications

### RID Types
| Type | Purpose | Example |
|------|---------|---------|
| `person` | Individual | `rid:koinet:person:luiz` |
| `org` | Organization | `rid:koinet:org:refi-bcn` |
| `pattern` | Knowledge pattern | `rid:koinet:pattern:qf` |
| `project` | Project | `rid:koinet:project:regenerant` |
| `decision` | Governance decision | `rid:koinet:decision:regen-42` |
| `meeting` | Meeting record | `rid:koinet:meeting:2026-03-21` |

---

## Without OPAL

KOI bridge works **standalone** — no AI required:
- Direct file monitoring
- Git commit hooks
- Manual or scheduled sync
- Structured data exchange

For AI extraction, add OPAL bridge separately.

---

## Hybrid: KOI + OPAL

**Best of both:**
1. **OPAL** extracts entities from content → staging
2. **Human reviews** → approves high-quality entities
3. **KOI** broadcasts approved RIDs to network
4. **Other nodes** receive → enrich local knowledge

**Latency target:** <30 min from capture to network (with optimizations)

---

## For Developers

### Implementation Status

| Module | Status | Notes |
|--------|--------|-------|
| `src/bridge.ts` | 🟡 Skeleton | HTTP client to coordinator |
| `src/rid.ts` | 🟡 Skeleton | RID generation |
| `src/events.ts` | 🟡 Skeleton | Event handling |
| `src/git-sync.ts` | 🟡 Skeleton | Git integration |
| `src/index.ts` | 🟡 Skeleton | Main class |
| `src/cli.ts` | 🟡 Skeleton | CLI interface |
| Tests | 🔵 Planned | — |
| Docs | 🔵 Planned | — |

### Next Steps for Implementation

1. **Build KOI HTTP client** — Connect to coordinator
2. **Implement RID handling** — Generate, validate, parse
3. **Event system** — Broadcast and listen
4. **Git hooks** — Auto-sync on commit
5. **CLI commands** — Full command suite
6. **Test suite** — Integration tests
7. **Documentation** — Setup guide, API reference

---

## File References

- Skeleton: `packages/koi-bridge/` (README.md, package.json, tsconfig.json)
- TypeScript bridge reference: `../../koi-net-integration/`
- Python KOI: `../../koi-net/`

---

## Status

- 🟡 **Skeleton:** README, package structure defined
- 🔵 **Implementation:** Not started — needs development
- 🔵 **Testing:** Not started
- 🔵 **Deployment:** Not ready

**Effort estimate:** 2-3 days for full implementation (similar scope to opal-bridge)

---

*KOI bridge skeleton ready — needs implementation for distributed knowledge graphs*
