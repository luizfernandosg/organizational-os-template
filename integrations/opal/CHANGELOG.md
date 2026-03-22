# Changelog

All notable changes to the OPAL Bridge package are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-03-21

### Added

#### Core Features
- **Initial release** of OPAL Bridge for Organizational OS
- AI-powered entity extraction from meetings, documents, and content
- Human-in-the-loop review workflow for extracted entities
- Natural language semantic search across knowledge base
- Research quest system for deep topic investigation
- Handoff notes for team context transfer
- Activity tracking and logging

#### API & SDK
- `OpalBridge` class with full programmatic API
- TypeScript definitions for all interfaces
- Factory function `createOpalBridge()` for easy instantiation
- Support for all OPAL operations: process, review, approve, reject, ask, quest, handoff

#### CLI
- Complete CLI with 12 commands:
  - `status` - Check OPAL connection status
  - `process` - Extract entities from content
  - `review` - Review pending entities
  - `approve` / `reject` - Entity approval workflow
  - `ask` - Semantic search
  - `quest` / `quest-continue` - Research quests
  - `handoff` - Create handoff notes
  - `activity` - View recent activity
  - `sync` / `federate` - KOI federation (when enabled)
- Global `--config` option for custom configuration paths
- Color-coded output with `chalk`
- Spinner indicators with `ora`

#### Federation Support
- KOI (Knowledge Commons Interchange) compatibility
- Hub-node topology support (regen-coordination-os as hub)
- Bidirectional sync (upstream/downstream)
- Configurable conflict resolution strategies
- Entity filtering and exclusion patterns
- Automatic sync scheduling via cron

#### Configuration
- YAML-based configuration via `federation.yaml`
- Profile-based OPAL configuration
- Granular capture settings (meetings, documents, decisions, handoffs)
- Review policy configuration
- Federation settings with hub/node modes

#### Documentation
- Comprehensive setup guide with prerequisites
- Step-by-step installation instructions
- Configuration walkthrough with examples
- Complete workflow documentation covering:
  - Meeting processing workflow
  - Document ingestion workflow
  - Review and approval workflow
  - Federation workflow
  - Quest workflow
  - Handoff workflow
- Full API reference with all classes, methods, and interfaces
- CLI command reference
- Error codes and troubleshooting guide

#### Deployment
- GitHub Actions CI/CD workflow (`.github/workflows/opal-bridge.yml`)
  - Automated testing on PR
  - Build and package releases
  - Integration testing with real OPAL
  - Automated deployment to hub and nodes
  - Security scanning with CodeQL
- Deployment scripts:
  - `deploy-to-hub.sh` - Deploy to regen-coordination-os with federation
  - `deploy-to-node.sh` - Deploy to refi-dao-os or refi-bcn-os
  - Support for dry-run mode
  - Automatic backup before deployment
  - Health check installation
  - Rollback capability

### Architecture

```
org-os instance
    └── packages/opal-bridge/
        ├── src/
        │   ├── index.ts          # Main adapter & API
        │   └── cli.ts            # Command-line interface
        ├── dist/                 # Compiled output
        ├── scripts/
        │   ├── deploy-to-hub.sh      # Hub deployment
        │   └── deploy-to-node.sh     # Node deployment
        ├── docs/
        │   ├── SETUP-GUIDE.md    # Installation guide
        │   ├── WORKFLOWS.md      # Operational workflows
        │   └── API-REFERENCE.md  # Complete API docs
        ├── .github/workflows/
        │   └── opal-bridge.yml   # CI/CD pipeline
        ├── package.json          # Package manifest
        ├── tsconfig.json         # TypeScript config
        └── CHANGELOG.md          # This file
```

### Dependencies

#### Production
- `commander@^11.1.0` - CLI framework
- `chalk@^5.3.0` - Terminal styling
- `ora@^8.0.1` - Spinner indicators
- `yaml@^2.3.4` - YAML parsing

#### Development
- `typescript@^5.3.0` - TypeScript compiler
- `jest@^29.7.0` - Testing framework
- `@types/node@^20.10.0` - Node.js types
- `@types/jest@^29.5.0` - Jest types

### Supported Platforms
- Node.js 18+
- Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+)
- macOS 12 Monterey+
- Windows 10/11 (via WSL2)

### Known Limitations
- Requires separate OPAL installation
- Federation features require KOI network setup
- Entity extraction accuracy depends on content quality
- Semantic search requires indexed knowledge base

---

## Migration Guides

### Upgrading from Pre-1.0

If you were using an early development version:

1. **Backup your configuration:**
   ```bash
   cp federation.yaml federation.yaml.backup
   ```

2. **Update package:**
   ```bash
   npm install -g @org-os/opal-bridge@latest
   ```

3. **Update configuration format:**
   - Move settings under `knowledge-commons.opal-bridge`
   - Add `enabled: true` flags
   - Update federation section if using KOI

4. **Verify installation:**
   ```bash
   opal-bridge status
   ```

---

## Future Roadmap

### [1.1.0] - Planned
- Webhook support for real-time notifications
- GraphQL API endpoint
- Enhanced entity relationship mapping
- Machine learning model improvements
- REST API server mode

### [1.2.0] - Planned
- Multi-language entity extraction
- PDF processing integration
- Image entity extraction (OCR)
- Audio transcription integration
- Advanced search filters

### [2.0.0] - Planned
- Breaking: Remove deprecated CLI options
- Breaking: Simplified configuration format
- New: Plugin architecture
- New: Custom entity types
- New: Web dashboard

---

## Contributing

When contributing changes:

1. Update this CHANGELOG with your changes
2. Follow [Keep a Changelog](https://keepachangelog.com/) format
3. Use semantic versioning for version bumps
4. Add migration guides for breaking changes

---

## References

- [OPAL Repository](https://github.com/luizfernandosg/opal)
- [Organizational OS](https://github.com/luizfernandosg/org-os)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

---

*Last updated: 2026-03-21*
