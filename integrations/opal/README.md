# OPAL Integration for Organizational OS

**Location:** `integrations/opal/`  
**Type:** AI Knowledge Garden Bridge  
**Status:** Ready for Agent Development  
**Version:** 1.0.0

---

## Quick Reference for Agents

### What This Integration Does
Connects Organizational OS to **OPAL** (Open Protocol for AI Learning) — an AI-powered knowledge garden system that extracts entities from meetings/documents with human-in-the-loop review.

### Key Capabilities
- **Entity Extraction:** AI extracts people, organizations, patterns, concepts from text
- **Human Review:** All extractions go through approval queue
- **Knowledge Persistence:** Approved entities stored in org-os knowledge base
- **Meeting Pipeline:** Specialized workflow for meeting transcripts

### Integration Architecture
```
org-os instance
    └── integrations/opal/
        ├── src/
        │   ├── opal/           # OPAL command wrapper
        │   ├── integration/    # org-os data mapping
        │   └── unified/        # Combined API
        └── docs/               # Agent documentation (you are here)
```

### For Agent Development

**To use OPAL extraction in your agent:**
```typescript
import { OpalAdapter } from '../integrations/opal/src/opal/adapter';

const opal = new OpalAdapter({
  opalPath: '../../opal',
  orgOsPath: '../..'
});

// Process meeting
const entities = await opal.process('content/meetings/2026-03-21.md');

// Review extracted entities
const pending = await opal.getPending();
for (const entity of pending) {
  // Your agent logic here
}
```

### Documentation Files
- `API-REFERENCE.md` — Complete API documentation
- `ARCHITECTURE.md` — System design and data flow
- `SETUP-GUIDE.md` — Installation and configuration
- `WORKFLOWS.md` — Operational procedures
- `FAQ.md` — Common questions and troubleshooting
- `INTEGRATION-PATTERNS.md` — How to integrate with other systems

### Status
- ✅ Core implementation complete (9 TypeScript files)
- ✅ All 23 OPAL commands wrapped
- ✅ Meeting pipeline implemented
- ✅ Git sync with branch management
- ✅ Human review queue
- ✅ Full CLI interface
- 🟡 Ready for agent integration
- 🔵 Awaiting deployment testing

### Next Steps for Agents
1. Review `API-REFERENCE.md` for available methods
2. Check `INTEGRATION-PATTERNS.md` for connection points
3. Use `examples/` directory for usage patterns
4. Test with `npm run example:basic`

---
*Integration documented for agent development pickup*
