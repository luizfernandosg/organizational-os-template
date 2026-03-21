# OPAL Integration

**Package:** `packages/opal-bridge/`  
**Source:** [github.com/omniharmonic/opal](https://github.com/omniharmonic/opal)  
**Status:** ✅ **Complete & Ready**  
**Type:** AI-powered Knowledge Garden

---

## What is OPAL?

OPAL (Open Protocol Agent Librarian) is an **AI-powered knowledge garden** for Claude Code:

- Extracts entities (people, orgs, patterns, concepts) from documents
- Human-in-the-loop review before adding to knowledge base
- 23 slash commands for knowledge management
- Local-first with Git-based persistence
- Multi-template support (regen template for ecological knowledge)

---

## Architecture

```
org-os instance
    └── packages/opal-bridge/
        ├── src/
        │   ├── cli.ts            # CLI: setup, process, review, ask, status
        │   ├── index.ts          # Main OpalBridge class
        │   └── integration/      # Org OS integration layers
        │       ├── entity-mapper.ts      # OPAL ↔ org-os mapping
        │       ├── git-sync.ts           # Branch management, PRs
        │       ├── meeting-pipeline.ts   # Meeting processing
        │       ├── schema-bridge.ts      # Template bridging
        │       └── config-loader.ts      # Config merging
        ├── tests/                # Full test suite
        ├── docs/                 # Setup guide, workflows, API reference
        └── examples/             # Usage examples
```

---

## Quick Start

```bash
# 1. Install dependencies
cd packages/opal-bridge
npm install
npm run build

# 2. Setup in an org-os instance
npx opal-bridge setup --opal-path ../../opal --profile regen

# 3. Process a meeting
npx opal-bridge process content/meetings/2026-03-21.md

# 4. Review extracted entities
npx opal-bridge review --interactive

# 5. Search knowledge base
npx opal-bridge ask "What funding models do we use?"
```

---

## Key Commands

| Command | Purpose | Usage |
|---------|---------|-------|
| `/setup` | Initialize OPAL in instance | `npx opal-bridge setup` |
| `/process` | Extract entities from content | `npx opal-bridge process <file>` |
| `/review` | Human review of staging | `npx opal-bridge review` |
| `/ask` | Search knowledge base | `npx opal-bridge ask <query>` |
| `/status` | Show bridge health | `npx opal-bridge status` |

---

## Configuration (federation.yaml)

```yaml
knowledge-commons:
  enabled: true
  opal-bridge:
    enabled: true
    opal_path: "../../opal"        # Path to OPAL installation
    profile: "regen"                # Template: regen, opl, default
    auto_process: true              # Auto-extract on new content
    review_required: true           # Human approval required
    
    # Meeting pipeline settings
    meeting_sources:
      - meetily
      - otter
      - fathom
      - read_ai
```

---

## Integration Points

### Input Sources
- `content/meetings/*.md` — Meeting transcripts
- `content/docs/*.md` — Documents
- `data/*.yaml` — Structured data (auto-converted)

### Output Destinations
- `knowledge/entities/` — Approved entities
- `data/members.yaml` — People & organizations
- `data/projects.yaml` — Projects & patterns
- `knowledge/patterns/` — Recognized patterns

### Review Workflow
```
Content → OPAL /process → _staging/ → Human /review → Approved → knowledge/
```

---

## Meeting Pipeline

**Supported Sources:**
- **Meetily** — AI meeting notes
- **Otter.ai** — Transcription service
- **Fathom** — Video meeting analysis
- **Read.ai** — Meeting intelligence
- **Manual** — Markdown transcripts

**Extraction:**
- Attendees → `data/members.yaml`
- Decisions → `data/meetings.yaml` decisions
- Action Items → `data/meetings.yaml` action_items
- Topics → `knowledge/topics/`
- Key Points → `knowledge/insights/`

---

## Without KOI

OPAL bridge works **standalone** — no network required:
- Local knowledge extraction and review
- Git-based persistence
- Human-in-the-loop for all additions
- Instance-specific knowledge gardens

For network sharing, add KOI bridge separately.

---

## For Developers

### Adding New Entity Types

Edit `src/integration/entity-mapper.ts`:

```typescript
const entityMappers = {
  person: (opalEntity) => ({
    id: generateId('person', opalEntity.name),
    name: opalEntity.name,
    role: opalEntity.properties?.role,
    organization: opalEntity.properties?.organization
  }),
  // Add your type here
};
```

### Custom Templates

Create `templates/<name>/`:
- `dimensions.json` — Knowledge dimensions
- `examples/` — Training examples
- Update `federation.yaml`: `profile: "<name>"`

---

## File References

- Implementation: `packages/opal-bridge/`
- Tests: `packages/opal-bridge/tests/`
- Docs: `packages/opal-bridge/docs/`
- Examples: `packages/opal-bridge/examples/`
- Source OPAL: `../../opal/` (git submodule or cloned)

---

## Status

- ✅ **Core implementation:** 4,053 lines TypeScript
- ✅ **Integration layers:** 111KB (entity mapper, git sync, meeting pipeline)
- ✅ **Testing:** 15 test files, full coverage
- ✅ **Documentation:** Setup guide, workflows, API reference
- ✅ **Deployment scripts:** Hub and node deployment ready
- 🟡 **Deployment:** Ready for testing in refi-bcn-os

---

*OPAL bridge complete — AI-powered knowledge extraction with human review*
