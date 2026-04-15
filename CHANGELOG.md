# CHANGELOG.md — org-os Change History

All notable changes to the org-os framework are documented here. Format follows [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Added

- Initial version control system with semantic versioning

### Changed

### Deprecated

### Removed

### Fixed

### Security

---

## [1.0.0] — 2026-04-02

### Initial Release

**Status:** Stable  
**Framework:** Organizational OS template with EIP-4824 compliance

#### Added

**Core Architecture**

- `MASTERPROMPT.md` — Complete agent operating manual
- `SOUL.md` — Organization values and mission framework
- `IDENTITY.md` — On-chain and off-chain identity structure
- `AGENTS.md` — Multi-agent coordination patterns and guidelines
- `USER.md` — Operator profile and preferences system

**Memory & Knowledge**

- `MEMORY.md` — Long-term operational memory index
- `memory/YYYY-MM-DD.md` — Daily session note structure
- Knowledge commons framework with `knowledge/INDEX.md`
- PARA-based organizational learning system

**Operations**

- `packages/operations/` — Meeting notes, projects, finances structure
- EIP-4824 schema generation and validation
- Operational workflow templates

**Federation & Network**

- `federation.yaml` — Peer network articulation
- Multi-org coordination patterns
- Skill distribution framework

**Agent Coordination**

- Subagent delegation patterns (swarms, pipelines, parallel research)
- Autopoietic coordination principles (6 coordination patterns)
- Agent Dojo framework for distributed learning

**Skills System**

- Skill directory structure with `SKILL.md` templates
- Pattern for skill distribution via federation
- Built-in skills framework

**Safety & Governance**

- Safety policy with autonomous action boundaries
- Approval requirements for external communication
- Governance policy integration points (Hats, Gardens DAO, Snapshot)

**Tools & Scripts**

- `npm run setup` — Interactive configuration wizard
- `npm run generate:schemas` — EIP-4824 schema generation
- `npm run validate:schemas` — Identity and schema validation
- Repository cloning and indexing scripts
- GitHub synchronization utilities

**Documentation**

- README with comprehensive setup guide
- Bootstrap guide for first-time setup
- Agent guide for agent runtimes
- Sync guide for federation coordination
- Deployment guides for various environments

**Packages**

- Quartz documentation builder integration
- Paperclip agents app integration
- Integration framework for external tools

#### Framework Features

- **Deterministic startup sequence** — Consistent session initialization
- **Memory continuity** — Session memory survives agent context resets
- **Multi-agent ecosystem** — Coordinate multiple AI agents with clear roles
- **Federation ready** — Connect to peer organizational OS instances
- **EIP-4824 compliant** — Web3 organizational identification standard
- **Governance-aware** — Built-in patterns for DAO and cooperative structures
- **Knowledge commons** — Semantic knowledge routing for multi-agent systems
- **Skill sharing** — Distribute capabilities across federation peers

#### Supported Environments

- OpenClaw source runtime
- Cursor IDE integration
- Custom MCP servers
- GitHub-based workflows
- Web3 integration points

---

## Release Information

### How to Reference Versions

**In federation.yaml** (upstream reference):

```yaml
upstream:
  org-os-framework:
    version: "1.0.0"
    repository: "https://github.com/organizational-os/organizational-os-template"
```

**In package.json** (framework version):

```json
{
  "version": "1.0.0"
}
```

**In instance deployments** (fork versions):
Add build metadata to track your instance:

```
1.0.0+instance-name-YYYY-MM-DD
```

---

## Notes for Operators & Agents

### What Changed From Earlier?

This is the initial versioned release. All core features are now tracked against version `1.0.0`.

### If You Forked Before Version Tracking

Update your instance:

1. **Merge this VERSION.md and CHANGELOG.md into your fork**
2. **Update package.json version** to reflect your modifications
3. **Add instance tag** if you want to track your deployment separately
4. **Log changes** in CHANGELOG.md under a new section for your instance

Example:

```markdown
## [1.0.0-myorg] — 2026-04-02

### Instance-Specific Changes

- Customized SOUL.md for ReFi BCN mission
- Added custom skill: funding-intelligence
```

### Downstream Instance Tracking

If you're running org-os in production, update your IDENTITY.md:

```markdown
## Version Info

- **Framework:** 1.0.0
- **Instance:** my-org-main
- **Deployment Date:** 2026-04-02
- **Last Updated:** 2026-04-02
```

---

## Semantic Versioning Rules

From this point forward, org-os follows [Semantic Versioning 2.0.0](https://semver.org/):

- **MAJOR**: Breaking changes (architecture, schemas, data structures)
- **MINOR**: New features, new skills, non-breaking enhancements
- **PATCH**: Bug fixes, doc updates, performance improvements

See `VERSION.md` for detailed versioning guide.

---

_Last updated: 2026-04-02_  
_For version tracking and instance management, see VERSION.md_
