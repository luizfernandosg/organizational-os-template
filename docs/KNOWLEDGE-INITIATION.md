# Knowledge Commons Initiation Plan

> Comprehensive plan for populating the org-os knowledge commons ecosystem
> 
> **Date:** March 21, 2026  
> **Version:** 1.0  
> **Model:** zen/kimi-k2.5

---

## Executive Summary

This plan provides a systematic approach to populate the newly constructed knowledge commons infrastructure (OPAL, Egregore, KOI, federation) with the rich organizational memory scattered across the ReFi ecosystem.

**Target Systems:**
- **refi-dao-os**: Global DAO governance layer (ReFi DAO)
- **refi-bcn-os**: Local node implementation (Barcelona)
- **regen-coordination-os**: Network coordination hub
- **org-os**: Core infrastructure platform

---

## 1. Knowledge Audit (What Exists Now)

### 1.1 Meeting Transcripts & Notes

| Location | Format | Volume | Quality | Priority |
|----------|--------|--------|---------|----------|
| ReFi DAO repos/docs | Markdown | ~40 files | Structured | P0 |
| Regen Coordination Meeting Notes | Markdown | ~15 files | Semi-structured | P0 |
| ReFi BCN content | Markdown/Catalan | ~25 files | Mixed | P1 |
| Notion (ReFi DAO) | Database + pages | 3 DBs, ~230 entries | Structured | P0 |
| GG24/Regenerant Catalunya | Markdown | ~10 files | Mixed | P1 |

### 1.2 Decisions Made (Where Documented)

| System | Registry Location | Status | Coverage |
|--------|---------------------|--------|----------|
| ReFi DAO | `data/governance.yaml` | Partial | Elections only |
| Regen Coordination | `docs/` ad-hoc | Missing | No formal registry |
| ReFi BCN | Implicit in documents | Missing | No formal registry |

**Critical Unrecorded Decisions:**
1. **March 18, 2026 Monty Meeting** — Membership criteria, council size (5-7), election process
2. **ReFi DAO v3 Governance Model** — Community ratification pending (May 1)
3. **Gardener Authority Boundaries** — CAN/CANNOT list (Luiz's role)
4. **Local Node Expansion Strategy** — Which nodes to prioritize

### 1.3 Patterns Recognized (Where Noted)

| Pattern | Source | Status | Commons Ready |
|---------|--------|--------|---------------|
| Distributed Coordination | Meeting transcripts | Noted | Needs extraction |
| Circular Funding Models | Pedro's research | Implicit | Needs formalization |
| Quadratic Voting | GG24 context | Documented | Ready |
| Local Node Onboarding | Toolkit content | Structured | Ready |
| Federation Patterns | `federation.yaml` | Structured | Already in commons |
| Agent Dojo Patterns | `AGENTS.md` | Structured | Ready |

### 1.4 People/Orgs (Where Catalogued)

| Registry | Location | Entities | Completeness |
|----------|----------|----------|--------------|
| Members | `refi-dao-os/data/members.yaml` | 16 entries | Role-based only |
| Nodes | `regen-coordination-os/data/nodes.yaml` | 16 nodes | Active |
| Projects | `refi-dao-os/data/projects.yaml` | 8 projects | Active |
| Programs | `regen-coordination-os/data/programs.yaml` | 12 programs | Active |
| Relationships | `refi-dao-os/data/relationships.yaml` | 4 relations | Minimal |

---

## 2. Processing Priority (What to Capture First)

### P0: Critical Decisions Without Documentation — URGENT

| Item | Source | Risk if Lost | Effort | Owner |
|------|--------|--------------|--------|-------|
| Monty Meeting outcomes (March 18) | Meeting notes expected | HIGH | 2-4 hrs | Agent + Luiz |
| ReFi DAO v3 ratification criteria | Implicit in proposal | HIGH | 4-6 hrs | Agent |
| Council election process final | Proposal + Monty input | HIGH | 2-3 hrs | Agent |
| Gardener authority boundaries | v3 proposal + meetings | HIGH | 3-4 hrs | Agent + Luiz |
| Cross-network funding splits | GG24 docs, meetings | MEDIUM | 2-3 hrs | Agent |

### P1: Recent Meetings (Fresh Memory) — HIGH PRIORITY

| Meeting | Date | Type | Source | Effort |
|---------|------|------|--------|--------|
| Monty Meeting | 2026-03-18 | Governance | Expected notes | 2 hrs |
| Council Sync (Regen Coordination) | 2025-07-04 | Coordination | Notes exist | 1 hr |
| ReFi BCN Strategy | 2025-06-26 | Local | Proposta document | 2 hrs |
| Eurecat Regen Hub | 2026-03-03 | Partnership | Meeting notes | 1.5 hrs |
| Agent Voice Swarm | 2026-03-20 | Operations | `VOICE-EXTRACT-*` files | 4 hrs |

### P2: Historical Patterns — MEDIUM PRIORITY

| Pattern | Source Documents | Effort | Value |
|---------|------------------|--------|-------|
| Distributed coordination | Multiple meeting notes | 4-6 hrs | HIGH — core pattern |
| Local node formation | Toolkit + Barcelona docs | 3-4 hrs | HIGH — replication |
| Funding flow models | `finances.yaml`, GG docs | 3-4 hrs | MEDIUM — treasury |
| Governance evolution | `MEMORY.md`, proposals | 4-6 hrs | HIGH — context |
| Agent Dojo patterns | `AGENTS.md`, skills | 2-3 hrs | MEDIUM — operations |
| CopyFair principles | `Regen Agency.md` | 2 hrs | MEDIUM — legal |

### P3: Entity Profiles — LOWER PRIORITY

| Entity Type | Count | Source | Effort |
|-------------|-------|--------|--------|
| Individual stewards | ~12 | Members.yaml, docs | 6-8 hrs |
| Local nodes | ~8 | Nodes.yaml, websites | 4-6 hrs |
| Partner orgs | ~10 | Relationships, mentions | 4-6 hrs |
| Projects/initiatives | ~15 | Projects.yaml, content | 6-8 hrs |
| Funding sources | ~8 | Finances.yaml, docs | 3-4 hrs |

---

## 3. Migration Strategy (How to Get It Into Knowledge Commons)

### 3.1 Technical Infrastructure

**OPAL Bridge Configuration:**
```yaml
knowledge-commons:
  enabled: true
  opal-bridge:
    enabled: true
    profile: "regen"
    auto_process: true
    review_required: true
    extract_patterns: true
    extract_people: true
    extract_organizations: true
```

**KOI-Net Integration:**
```yaml
sync:
  protocol: git  # Current
  # future: koi-net real-time
  
topics:
  - regenerative-finance
  - local-governance
  - network-coordination
  - knowledge-infrastructure
```

### 3.2 Batch Processing with OPAL

**Phase 1: Document Ingestion (Weeks 1-2)**

Sources to Ingest:
1. **Notion Databases** — Proposals DB (17 entries), Docs DB (124 entries), Resources Hub (~95 files)
2. **GitHub Repositories** — ReFi-DAO-Website, ReFi-Barcelona, Local-ReFi-Toolkit, Regenerant-Catalunya
3. **Meeting Notes** — Regen Coordination council calls, ReFi DAO governance calls, ReFi BCN local meetings

**Phase 2: Knowledge Graph Construction (Weeks 3-4)**

Graph Nodes: People, Organizations, Projects, Decisions, Patterns, Meetings

Graph Edges:
- `participated_in` (person → meeting)
- `decided_at` (decision → meeting)
- `leads` (person → project)
- `funds` (organization → project)
- `implements` (project → pattern)
- `references` (document → document)

### 3.3 Manual Curation for Sensitive Items

| Category | Handling | Reviewer |
|----------|----------|----------|
| Financial details | Redact specifics, keep patterns | Treasurer |
| Personal contact info | Exclude from commons | Privacy lead |
| Unratified proposals | Mark "DRAFT" clearly | Gardener |
| Personnel discussions | Summarize, anonymize | Council |
| Pre-decision deliberations | Keep in private notes | Participants |

### 3.4 Human Review Workflow

Review Roles:
- **Gardener (Luiz)** — Governance decisions, strategy patterns (2-3 hrs/week)
- **Agent Core** — Automated extraction, formatting, linking (Continuous)
- **Council Members** — Policy decisions, ratification (1 hr/week)
- **Node Leads** — Local content verification (1-2 hrs/week)
- **Hub Operator** — Cross-node consistency, federation (2-3 hrs/week)

### 3.5 Quality Thresholds

Minimum Quality Criteria:
- **Completeness:** All mandatory fields populated
- **Accuracy:** Cross-referenced with source documents
- **Linking:** Minimum 2 cross-references per document
- **Formatting:** Follows org-os templates
- **Metadata:** Frontmatter complete with dates, authors, tags

Quality Gates:
1. Automated validation (schema, links, format)
2. Peer review (factual accuracy, completeness)
3. Gardener approval (strategic alignment)
4. Commons publication + cross-node sync

---

## 4. Timeline & Resources

### 4.1 Week-by-Week Plan

#### Week 1: Foundation (March 24-30, 2026)

| Task | Owner | Effort | Deliverable |
|------|-------|--------|-------------|
| Document Monty Meeting outcomes | Agent + Luiz | 4 hrs | Decision records DR-2026-001 to 006 |
| Configure OPAL bridge for ReFi DAO | Agent | 6 hrs | `opal-bridge-config.yaml` |
| Ingest Notion Proposals DB | Agent | 4 hrs | 17 proposals in `knowledge/` |
| Create decision registry workflow | Agent | 3 hrs | `docs/DECISION-RECORD-WORKFLOW.md` |
| Review Week 1 output | Luiz | 2 hrs | Approved P0 decisions in commons |

**Success Metrics:** 6 critical decisions documented and approved

#### Week 2: Meeting Processing (March 31-April 6)

| Task | Owner | Effort | Deliverable |
|------|-------|--------|-------------|
| Process P1 meetings (5 meetings) | Agent | 8 hrs | Structured notes in `packages/operations/meetings/` |
| Populate `data/meetings.yaml` | Agent | 2 hrs | 5+ meeting entries |
| Extract action items to HEARTBEAT | Agent | 2 hrs | Updated `HEARTBEAT.md` |
| Create meeting processing SOP | Agent | 3 hrs | `docs/MEETING-PROCESSING-SOP.md` |
| Node operator training (async) | Agent + Nodes | 4 hrs | 3 nodes trained |

**Success Metrics:** 5 meetings processed with decisions + action items

#### Week 3: Pattern Extraction (April 7-13)

| Task | Owner | Effort | Deliverable |
|------|-------|--------|-------------|
| Extract distributed coordination pattern | Agent | 4 hrs | Pattern documented |
| Extract local node formation pattern | Agent | 4 hrs | Pattern documented |
| Extract funding flow patterns | Agent | 3 hrs | Pattern documented |
| Document pattern template | Agent | 2 hrs | `templates/pattern-document.md` |
| Link patterns to projects | Agent | 3 hrs | Cross-references in project files |

**Success Metrics:** 3 core patterns documented

#### Week 4: Entity Enrichment (April 14-20)

| Task | Owner | Effort | Deliverable |
|------|-------|--------|-------------|
| Create steward profiles | Agent | 6 hrs | `data/entities/stewards/` |
| Enrich node profiles | Agent | 4 hrs | Updated `data/nodes.yaml` |
| Map cross-network relationships | Agent | 4 hrs | Relationship graph |
| Generate EIP-4824 schemas | Agent | 3 hrs | `.well-known/dao.json` updated |
| Create entity profile template | Agent | 2 hrs | `templates/entity-profile.md` |

**Success Metrics:** 12 steward profiles created, 16 nodes enriched

#### Week 5-6: Cross-Node Sync & Federation (April 21-May 4)

| Task | Owner | Effort | Deliverable |
|------|-------|--------|-------------|
| Configure node-to-hub sync | Agent | 6 hrs | `federation.yaml` sync configs |
| First hub aggregation run | Agent | 4 hrs | Aggregated knowledge in hub |
| Test cross-node search | Agent | 3 hrs | Working federated search |
| Document federation workflow | Agent | 3 hrs | `docs/FEDERATION-WORKFLOW.md` |
| Hub operator training | Agent + Hub | 4 hrs | Hub operator trained |

**Success Metrics:** Knowledge flowing from 3 nodes to hub

#### Week 7-8: Quality & Polish (May 5-18)

| Task | Owner | Effort | Deliverable |
|------|-------|--------|-------------|
| Comprehensive quality audit | Agent + Reviewers | 8 hrs | Quality report with gaps |
| Fill critical gaps | Agent | 6 hrs | Missing content added |
| Create commons user guide | Agent | 4 hrs | `docs/KNOWLEDGE-COMMONS-GUIDE.md` |
| Create contributor guidelines | Agent | 3 hrs | `CONTRIBUTING.md` |
| Community launch prep | Agent + Council | 4 hrs | Launch materials ready |

**Success Metrics:** 95%+ content passes quality gates

### 4.2 Who Does What (Human vs Agent)

**Agent Responsibilities (Automated):**
- Document ingestion — Continuous via OPAL, Notion API, Git
- Entity extraction — Per document using NLP, regex, schema mapping
- Format normalization — Per document using templates, linters
- Cross-reference generation — Per document using graph analysis
- Link validation — Daily via link checker, schema validator
- Index updates — Real-time for search index, knowledge graph
- Schema generation — On change via EIP-4824 generator
- Meeting processing — As received via meeting-processor skill
- Action item tracking — Continuous via HEARTBEAT monitor

**Human Responsibilities (Review/Approval):**
- Decision verification — Per decision by Gardener (Luiz)
- Sensitive content review — Per batch by Privacy/Treasury leads
- Strategic pattern approval — Per pattern by Council
- Quality gate approval — Weekly by Hub operator
- Cross-node conflict resolution — As needed by Federation stewards
- Commons governance changes — As needed by Council

### 4.3 Estimated Effort Summary

| Phase | Agent Hours | Human Hours | Duration |
|-------|-------------|-------------|----------|
| Week 1: Foundation | 17 | 6 | 5 days |
| Week 2: Meetings | 15 | 4 | 5 days |
| Week 3: Patterns | 16 | 2 | 5 days |
| Week 4: Entities | 19 | 3 | 5 days |
| Week 5-6: Federation | 20 | 4 | 10 days |
| Week 7-8: Quality | 21 | 8 | 10 days |
| **Total** | **108** | **27** | **40 days** |

### 4.4 Success Metrics

**Phase Success Metrics:**
- Week 1: 6 critical decisions documented
- Week 2: 5 meetings processed
- Week 3: 3 patterns documented
- Week 4: 12 stewards, 16 nodes profiled
- Week 5-6: 3 nodes ↔ hub sync active
- Week 7-8: 95%+ pass rate

**Overall Success Metrics (8-Week Target):**
- Documents in commons: 150+
- Decisions documented: 25+
- Meetings processed: 20+
- Patterns catalogued: 10+
- Entity profiles: 50+
- Cross-references: 300+
- Searchable knowledge: 100%
- Node operators trained: 5+
- Hub aggregations: 2+

---

## 5. Risk Mitigation

### 5.1 Sensitive Information Handling

**Risk Assessment:**
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Financial details exposed | Medium | High | Auto-redaction + treasurer review |
| Personal info leaked | Low | High | Exclude from ingestion pipeline |
| Pre-decision content published | Medium | Medium | "DRAFT" watermark + approval gate |
| Conflicting versions confusion | Medium | Medium | Version control + source attribution |
| Duplicate documents | High | Low | Deduplication algorithms + manual review |

**Access Tiers:**
- **Public** — Patterns, governance docs, approved decisions (All access)
- **Network** — Node details, coordination info (Node members)
- **Core** — Financials, personnel, pre-decision (Council + Gardener)
- **Private** — Individual notes, drafts (Individual only)

### 5.2 Conflicting Versions

**Version Conflict Scenarios:**
- Same meeting, multiple notes → Hash comparison + timestamp → Merge + human review
- Decision evolved over time → Decision ID tracking → Version history + current state
- Node vs hub divergence → Federation sync monitoring → Hub wins + node notification
- Notion vs Git divergence → Last-modified comparison → Human determines source of truth

### 5.3 Duplicate Detection

**Duplicate Detection Methods:**
| Method | Implementation | Effectiveness |
|--------|----------------|---------------|
| Content hash | SHA-256 of normalized content | 99% exact duplicates |
| Title similarity | Levenshtein distance < 10 | 85% near-duplicates |
| Semantic similarity | Embedding cosine similarity > 0.95 | 80% semantic duplicates |
| Cross-reference analysis | Shared sources, dates, participants | 75% content overlap |

### 5.4 Quality Control

**Quality Gates:**
| Gate | Check | Automated? | Reviewer |
|------|-------|------------|----------|
| Schema validation | YAML/JSON valid | Yes | Agent |
| Link validation | All internal links resolve | Yes | Agent |
| Completeness | Required fields present | Yes | Agent |
| Format compliance | Template adherence | Yes | Agent |
| Factual accuracy | Matches source | No | Domain expert |
| Strategic alignment | Fits org values | No | Gardener |
| Privacy compliance | No sensitive data | No | Privacy lead |

**Continuous Quality Monitoring:**
- **Daily:** Automated link/schema checks
- **Weekly:** Quality dashboard review
- **Monthly:** Comprehensive quality audit
- **Quarterly:** Commons health assessment

### 5.5 Risk Register

| Risk ID | Risk | Likelihood | Impact | Mitigation | Owner |
|---------|------|------------|--------|------------|-------|
| R1 | Key person (Luiz) unavailable | Medium | High | Document all decisions; train backup | Agent |
| R2 | Notion API rate limits | Medium | Medium | Batch processing; retry logic | Agent |
| R3 | Node operator resistance | Low | Medium | Training; clear value prop | Hub operator |
| R4 | Scope creep (too much content) | Medium | Medium | Stick to P0-P2 priority; defer P3 | Gardener |
| R5 | Technical failures (OPAL/KOI) | Low | High | Fallback to git-only; manual sync | Agent |
| R6 | Quality degradation over time | Medium | Medium | Automated monitoring; periodic audits | Agent + Hub |
| R7 | Privacy breach | Low | High | Auto-redaction; human review | Privacy lead |
| R8 | Community rejection of commons | Low | High | Involve early; demonstrate value | Council |

---

## Appendix A: Key File References

### Configuration Files
| File | Path |
|------|------|
| ReFi DAO federation | `03 Libraries/refi-dao-os/federation.yaml` |
| Regen Coordination federation | `03 Libraries/regen-coordination-os/federation.yaml` |
| ReFi DAO skills | `03 Libraries/refi-dao-os/skills/INDEX.md` |
| Regen Coordination skills | `03 Libraries/regen-coordination-os/skills/INDEX.md` |

### Knowledge Architecture
| File | Path |
|------|------|
| Knowledge commons architecture | `.agent/output/regen-agency-knowledge-commons-architecture.md` |
| Egregore integration | `.agent/output/org-os-egregore-integration-summary.md` |
| ReFi DAO knowledge | `03 Libraries/refi-dao-os/knowledge/INDEX.md` |

### Data Registries
| File | Path |
|------|------|
| Members registry | `03 Libraries/refi-dao-os/data/members.yaml` |
| Projects registry | `03 Libraries/refi-dao-os/data/projects.yaml` |
| Governance registry | `03 Libraries/refi-dao-os/data/governance.yaml` |
| Nodes registry | `03 Libraries/regen-coordination-os/data/nodes.yaml` |
| Programs registry | `03 Libraries/regen-coordination-os/data/programs.yaml` |

---

*Knowledge Commons Initiation Plan — generated March 21, 2026 by Knowledge Commons Initiation Planner*
