# Organizational OS Knowledge Commons Index

_Framework reference for the Organizational OS knowledge commons — standards, patterns, and templates for agent-native organizational coordination._

---

## Knowledge Commons Vision

The **Organizational OS** provides the foundational framework for the **Regen Agency Knowledge Commons**. This knowledge base serves as:

- **Framework reference** — Standards and patterns for organizational OS implementation
- **Template documentation** — How to use and customize the organizational OS template
- **Upstream guidance** — Direction for downstream nodes and implementations
- **Knowledge infrastructure** — Semantic patterns, schemas, and agent coordination

This is a **framework/template** knowledge commons — reference material rather than operational content. For operational knowledge, see downstream nodes like ReFi DAO and ReFi BCN.

---

## Structure

```
knowledge/
├── INDEX.md              # This file — knowledge commons navigation
├── <domain>/             # Domain-specific knowledge areas
│   ├── from-nodes/       # Contributions from network nodes (rare for framework)
│   │   └── <node-name>/  # Node-specific contributions (read-only)
│   ├── YYYY-MM-DD-topic.md  # Framework updates and pattern documentation
│   └── README.md         # Domain overview
└── README.md             # Knowledge commons overview
```

### Knowledge Domains

| Domain | Description | Status |
|--------|-------------|--------|
| **framework-standards** | Organizational OS standards, schemas, specifications | 🟡 Planned |
| **template-usage** | How to use and customize the organizational OS template | 🟡 Planned |
| **knowledge-infrastructure** | Agent systems, knowledge graphs, federation patterns | 🟡 Planned |
| **agent-coordination** | Multi-agent coordination patterns, agent dojo concepts | 🟡 Planned |

---

## Contribution Guidelines

### For Framework Maintainers

1. **Create or edit** knowledge files in relevant domain directories
2. **Use frontmatter** for metadata:
   ```yaml
   ---
   title: "Topic Title"
   date: "2026-03-21"
   author: "author-name"
   domain: "domain-name"
   tags: ["tag1", "tag2"]
   source_refs: []
   ---
   ```
3. **Maintain upstream/downstream clarity** — document how patterns propagate
4. **Update this INDEX** when adding new domains
5. **Version framework changes** — this is reference code for the ecosystem

### From Network Nodes

Framework contributions are typically:

1. **Pattern extraction** — Documenting what works in downstream nodes
2. **Template improvements** — Proposing changes to upstream standards
3. **Bug reports/fixes** — Framework issues and resolutions
4. **Via pull request** — Direct contribution to framework repo

---

## Sync Protocols

### Template/Framework Distribution

As the **upstream framework**, org-os distributes knowledge differently than operational nodes:

- **Downstream sync**: Template changes flow to forked repositories via git
- **Pattern extraction**: Working patterns from nodes may become framework standards
- **Version alignment**: Nodes sync with framework versions monthly
- **Manual review**: Template changes affect all downstream nodes

### Federation Position

```
org-os (framework) → regen-coordination-os (hub) → All network nodes
                   → Individual organizational OS forks
```

---

## Domain Mappings

### Framework Standards

**Topics:** EIP-4824 schemas, federation.yaml spec, package structure, agent configuration
**Maintainers:** Framework developers, Regen Coordination
**Downstream:** All organizational OS implementations
**Pattern Source:** Regen Coordination, ReFi DAO, ReFi BCN operational learnings

### Template Usage

**Topics:** Setup instructions, customization patterns, migration guides
**Maintainers:** Framework documentation team
**Downstream:** New organizational OS adopters
**Pattern Source:** Common questions and setup friction points

### Knowledge Infrastructure

**Topics:** Koi-net integration, semantic protocols, knowledge graph patterns
**Maintainers:** Knowledge infrastructure developers
**Downstream:** All nodes using knowledge commons
**Pattern Source:** Koi-net development, semantic web standards

### Agent Coordination

**Topics:** Multi-agent patterns, agent dojo concept, autopoietic coordination
**Maintainers:** Agent runtime developers, framework designers
**Downstream:** All nodes running agents
**Pattern Source:** OpenClaw, regen-eliza, operational agent experience

---

## Agent Dojo Concept

The **Agent Dojo** is the knowledge commons for AI agents learning to coordinate regenerative systems. As the framework layer, org-os defines:

- **Structural patterns** — How knowledge commons are organized
- **Sync protocols** — How knowledge flows between nodes
- **Agent interfaces** — How agents interact with knowledge
- **Semantic standards** — Shared vocabularies and schemas

### Agent Dojo Principles

1. **Agents are first-class participants** — Knowledge is structured for both human and agent consumption
2. **Knowledge flows to where it's needed** — Semantic routing, not hierarchical distribution
3. **Local autonomy, global coherence** — Nodes maintain independence while sharing patterns
4. **Learning is continuous** — Agents improve through operational experience

### Implementation

Downstream nodes implement the Agent Dojo concept:
- **Regen Coordination OS** — Hub knowledge aggregation and distribution
- **ReFi DAO** — Articulation org knowledge and network coordination
- **ReFi BCN** — Local node expertise and cooperative-Web3 bridging
- **All network nodes** — Local context + network contribution

---

## Hub Knowledge Aggregation

As the **framework upstream**, org-os is different from operational nodes:

- **Not a knowledge aggregator** — That's the hub's (Regen Coordination) role
- **Pattern source** — Framework patterns flow down to all nodes
- **Reference implementation** — Other nodes compare against this standard
- **Change propagation** — Template updates affect all forks

### Knowledge Flow

```
org-os (patterns) → regen-coordination-os (hub aggregations)
                  → ReFi DAO (articulation)
                  → ReFi BCN (local node)
                  → All network nodes
```

---

## Framework-Specific Notes

### Template vs. Operational

This is a **template/framework** repository. Key differences from operational nodes:

| Aspect | Framework (org-os) | Operational Node (e.g., ReFi BCN) |
|--------|-------------------|-----------------------------------|
| Content | Patterns, standards, templates | Operational knowledge, meeting notes |
| Knowledge-commons | Reference documentation | Active knowledge base |
| Sync direction | Downstream (to forks) | Bidirectional (with hub) |
| Agent runtime | Usually "none" | Usually "openclaw" or "cursor" |
| federation.yaml | Template values | Populated values |

### Using This Template

When creating a new organizational OS from this template:

1. **Fork this repository** or use as template
2. **Populate `federation.yaml`** with your organization's details
3. **Fill in identity files** (SOUL.md, IDENTITY.md, USER.md)
4. **Create knowledge/ directory** and INDEX.md (use this file as reference)
5. **Populate `knowledge/`** with your operational domains
6. **Connect to hub** via federation.yaml peers/upstream

---

## Related Resources

- **AGENTS.md** — Agent operating manual for organizational OS workspaces
- **federation.yaml** — Network articulation and knowledge-commons config
- **BOOTSTRAP.md** — First-time setup instructions
- **Regen Coordination Hub** — https://hub.regencoordination.xyz
- **Downstream nodes:**
  - ReFi DAO — `03 Libraries/refi-dao-os/knowledge/INDEX.md`
  - ReFi BCN — `03 Libraries/refi-bcn-os/knowledge/INDEX.md`

---

## Changelog

- **2026-03-21** — Created INDEX.md, established framework knowledge commons structure

---

*Framework reference for the Regen Agency Knowledge Commons — stewarded by the Organizational OS project for the regenerative coordination ecosystem.*
