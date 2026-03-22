# OPAL Bridge Testing & Validation

This directory contains comprehensive testing and validation for the OPAL bridge package.

## Test Structure

```
tests/
├── opal-adapter.test.ts       # Unit tests for OPAL command wrapper
├── integration.test.ts        # End-to-end workflow tests
├── setup.ts                   # Test environment setup
└── fixtures/                  # Test data and mock files
    ├── sample-meeting-transcript.md
    ├── opal-extraction-output.json
    ├── org-os-data-structures.md
    └── opal-config.md

scripts/
├── test-setup.sh              # Setup test environment
└── validate-install.sh        # Pre-flight validation

examples/
├── basic-usage.ts             # Basic API usage example
└── meeting-workflow.ts        # Complete meeting processing workflow
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm run test:watch
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run all tests (unit + integration)
npm run test:opal-integration
```

### Test Setup Script

```bash
# Setup test environment and run all tests
npm run test:setup

# Clean and rebuild
npm run test:setup -- --clean

# Setup without running tests
npm run test:setup -- --skip-tests
```

## Validation

### Pre-flight Checks

```bash
# Validate installation
npm run validate

# Auto-fix issues where possible
npm run validate -- --fix

# Verbose output
npm run validate -- --verbose
```

This checks:
- Node.js version (>= 18.0.0)
- npm installation
- Git configuration
- OPAL installation
- federation.yaml configuration
- Dependencies

## Examples

### Basic Usage

```bash
# Run basic usage example
npm run example:basic
```

Demonstrates:
- Setting up the OPAL bridge
- Processing content files
- Reviewing extracted entities
- Querying the knowledge base

### Meeting Workflow

```bash
# Run complete meeting workflow example
npm run example:workflow
```

Demonstrates:
- Meeting transcript processing
- Entity extraction
- Human-in-the-loop review
- Action item extraction
- Research quest creation
- Team handoffs

## Test Fixtures

### Sample Meeting Transcript

`tests/fixtures/sample-meeting-transcript.md` - A realistic meeting transcript from ReFi DAO Barcelona with:
- Multiple participants
- Discussion notes
- Decisions
- Action items
- Patterns identified

### OPAL Extraction Output

`tests/fixtures/opal-extraction-output.json` - Example of OPAL entity extraction output including:
- People with attributes and action items
- Organizations with relationships
- Patterns and protocols
- Confidence scores

### org-os Data Structures

`tests/fixtures/org-os-data-structures.md` - Documentation of YAML data structures:
- members.yaml
- projects.yaml
- meetings.yaml
- finances.yaml
- federation.yaml

### OPAL Configuration

`tests/fixtures/opal-config.md` - Mock OPAL configuration files:
- settings.yaml
- schema.yaml
- integrations.yaml
- processing.yaml

## Writing Tests

### Unit Test Pattern

```typescript
import { OpalBridge, OpalConfig } from '../src/index.js';

describe('Feature Name', () => {
  let bridge: OpalBridge;

  beforeEach(async () => {
    const config: OpalConfig = {
      opalPath: tempOpalDir,
      orgOsPath: tempOrgOsDir,
      profile: 'test'
    };
    bridge = new OpalBridge(config);
    await bridge.initialize();
  });

  test('should do something', async () => {
    const result = await bridge.someMethod();
    expect(result).toBeDefined();
  });
});
```

### Integration Test Pattern

```typescript
describe('Integration: Workflow Name', () => {
  test('complete workflow', async () => {
    // Step 1: Setup
    await bridge.initialize();
    
    // Step 2: Process
    const entities = await bridge.process(filePath);
    
    // Step 3: Verify
    expect(entities).toHaveLength(expectedCount);
  });
});
```

## Continuous Integration

For CI environments:

```yaml
# Example GitHub Actions workflow
- name: Setup
  run: npm ci

- name: Validate
  run: npm run validate

- name: Test
  run: |
    npm test
    npm run test:integration
```

## Troubleshooting

### Tests Failing

1. Run validation to check environment:
   ```bash
   npm run validate -- --verbose
   ```

2. Clean and rebuild:
   ```bash
   npm run test:setup -- --clean
   ```

3. Check Node.js version:
   ```bash
   node --version  # Should be >= 18.0.0
   ```

### OPAL Not Found

1. Ensure OPAL is cloned at the expected location (usually `../../opal`)
2. Check federation.yaml has correct `opal_path`
3. Run validation with fix mode:
   ```bash
   npm run validate -- --fix
   ```

## Test Coverage

The test suite covers:

- **Unit Tests (opal-adapter.test.ts)**
  - Initialization and configuration
  - Entity extraction
  - Review workflows (approve, reject, edit)
  - Knowledge ingestion
  - Quest management
  - Error handling

- **Integration Tests (integration.test.ts)**
  - Meeting processing pipeline
  - Entity extraction and review
  - Knowledge ingestion
  - Research quest workflows
  - Handoff workflows
  - Git sync verification
  - End-to-end workflows

## Contributing

When adding new features:

1. Add unit tests for new methods
2. Add integration tests for workflows
3. Update fixtures if needed
4. Run full test suite before committing
5. Update this README with new test patterns
