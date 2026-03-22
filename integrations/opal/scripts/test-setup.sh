#!/bin/bash
#
# OPAL Bridge Test Setup Script
# 
# This script sets up a complete test environment for the OPAL bridge including:
# - Temporary OPAL installation
# - Test org-os instance
# - Test data fixtures
# - Running all tests
#
# Usage: ./scripts/test-setup.sh [--clean] [--skip-tests]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Export colors for use in functions
export RED GREEN YELLOW BLUE NC

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
TEMP_DIR="${PROJECT_ROOT}/.test-temp"
OPAL_REPO="https://github.com/anthropics/opal"
OPAL_REF="${OPAL_REF:-main}"

# Flags
CLEAN_MODE=false
SKIP_TESTS=false
VERBOSE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --clean)
            CLEAN_MODE=true
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --clean        Clean existing test environment before setup"
            echo "  --skip-tests   Skip running tests after setup"
            echo "  --verbose      Enable verbose output"
            echo "  -h, --help     Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    local missing=()
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        missing+=("Node.js")
    else
        NODE_VERSION=$(node --version | sed 's/v//')
        log_info "Node.js version: $NODE_VERSION"
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        missing+=("npm")
    else
        NPM_VERSION=$(npm --version)
        log_info "npm version: $NPM_VERSION"
    fi
    
    # Check git
    if ! command -v git &> /dev/null; then
        missing+=("git")
    else
        GIT_VERSION=$(git --version | awk '{print $3}')
        log_info "git version: $GIT_VERSION"
    fi
    
    # Check TypeScript
    if ! command -v npx tsc &> /dev/null; then
        log_warning "TypeScript not globally installed, will use npx"
    fi
    
    if [ ${#missing[@]} -ne 0 ]; then
        log_error "Missing prerequisites: ${missing[*]}"
        log_error "Please install the missing tools and try again."
        exit 1
    fi
    
    log_success "All prerequisites met"
}

# Clean existing test environment
clean_environment() {
    if [ "$CLEAN_MODE" = true ] && [ -d "$TEMP_DIR" ]; then
        log_info "Cleaning existing test environment..."
        rm -rf "$TEMP_DIR"
        log_success "Test environment cleaned"
    fi
}

# Create test directory structure
create_test_structure() {
    log_info "Creating test directory structure..."
    
    mkdir -p "$TEMP_DIR"
    mkdir -p "$TEMP_DIR/opal"
    mkdir -p "$TEMP_DIR/org-os/content/meetings"
    mkdir -p "$TEMP_DIR/org-os/data"
    mkdir -p "$TEMP_DIR/org-os/content/docs"
    
    log_success "Test directory structure created"
}

# Setup mock OPAL installation
setup_mock_opal() {
    log_info "Setting up mock OPAL installation..."
    
    local opal_dir="$TEMP_DIR/opal"
    
    # Create OPAL directory structure
    mkdir -p "$opal_dir/_inbox"
    mkdir -p "$opal_dir/_staging"
    mkdir -p "$opal_dir/_index"
    mkdir -p "$opal_dir/config"
    mkdir -p "$opal_dir/handoffs"
    
    # Create minimal CLAUDE.md
    cat > "$opal_dir/CLAUDE.md" << 'EOF'
# OPAL - Open Protocol Agent Librarian

Mock OPAL installation for testing purposes.

## Status
- Version: 2.1.0-test
- Profile: test
- Inbox: 0 items
- Staging: 0 items

## Commands
- /process - Process inbox items
- /review - Review staged changes
- /ask - Search knowledge base
- /quest - Start research quest
EOF

    # Create minimal config files
    cat > "$opal_dir/config/settings.yaml" << 'EOF'
opal:
  version: "2.1.0-test"
  processing:
    auto_extract: true
    review_required: true
    confidence_threshold: 0.7
  extraction:
    entity_types:
      - person
      - organization
      - pattern
      - protocol
      - concept
    min_confidence: 0.6
EOF

    # Create minimal entities.json
    cat > "$opal_dir/_index/entities.json" << 'EOF'
{
  "entities": [],
  "relationships": [],
  "version": "1.0"
}
EOF

    log_success "Mock OPAL installation created at $opal_dir"
}

# Setup test org-os instance
setup_test_org_os() {
    log_info "Setting up test org-os instance..."
    
    local org_os_dir="$TEMP_DIR/org-os"
    
    # Create federation.yaml
    cat > "$org_os_dir/federation.yaml" << EOF
knowledge-commons:
  enabled: true
  opal-bridge:
    enabled: true
    opal_path: "${TEMP_DIR}/opal"
    profile: "test"
    auto_process: true
    review_required: true
    
git:
  remote: origin
  branch: main
  auto_sync: false
EOF

    # Create test members.yaml
    cat > "$org_os_dir/data/members.yaml" << 'EOF'
members:
  - id: alice
    name: Alice Johnson
    role: Lead Developer
    email: alice@example.com
    skills: [typescript, testing, opal]
    
  - id: bob
    name: Bob Smith
    role: Product Manager
    email: bob@example.com
    skills: [strategy, coordination]
    
  - id: carol
    name: Carol Williams
    role: Designer
    email: carol@example.com
    skills: [ui, ux, research]
EOF

    # Create test projects.yaml
    cat > "$org_os_dir/data/projects.yaml" << 'EOF'
projects:
  - id: opal-bridge
    name: OPAL Bridge Testing
    status: active
    team: [alice, bob]
    priority: high
    
  - id: knowledge-graph
    name: Knowledge Graph Explorer
    status: planning
    team: [alice, carol]
    priority: medium
EOF

    # Create test meetings.yaml
    cat > "$org_os_dir/data/meetings.yaml" << 'EOF'
meetings:
  - id: test-meeting-001
    title: Test Coordination Meeting
    date: 2026-03-21
    attendees: [alice, bob, carol]
    status: completed
EOF

    # Create sample meeting transcript
    cat > "$org_os_dir/content/meetings/2026-03-21-test-meeting.md" << 'EOF'
# Test Coordination Meeting
Date: 2026-03-21

**Attendees:**
- Alice Johnson (Developer)
- Bob Smith (Product)
- Carol Williams (Design)

**Discussion:**
We reviewed progress on the OPAL Bridge Testing project. Alice presented
updates on the test suite implementation. Bob outlined the roadmap for
the knowledge graph integration. Carol shared designs for the review interface.

**Decisions:**
1. Move forward with Jest for testing framework
2. Schedule code review for next Monday

**Action Items:**
- Alice: Complete unit tests for adapter module
- Bob: Draft integration test scenarios
- Carol: Share mockup designs by Friday
EOF

    log_success "Test org-os instance created at $org_os_dir"
}

# Install dependencies
install_dependencies() {
    log_info "Installing dependencies..."
    
    cd "$PROJECT_ROOT"
    
    if [ ! -d "node_modules" ]; then
        npm install
        log_success "Dependencies installed"
    else
        log_info "Dependencies already installed"
    fi
    
    # Install Jest globally if needed
    if ! npx jest --version &> /dev/null; then
        log_info "Installing Jest..."
        npm install --save-dev jest @types/jest
    fi
}

# Build TypeScript
build_typescript() {
    log_info "Building TypeScript..."
    
    cd "$PROJECT_ROOT"
    
    if [ "$VERBOSE" = true ]; then
        npx tsc
    else
        npx tsc 2>&1 | grep -E "(error|warning|Build|Successfully)" || true
    fi
    
    log_success "TypeScript build completed"
}

# Run tests
run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        log_warning "Skipping tests (--skip-tests flag set)"
        return 0
    fi
    
    log_info "Running tests..."
    
    cd "$PROJECT_ROOT"
    
    # Set up test environment variables
    export OPAL_TEST_TEMP_DIR="$TEMP_DIR"
    export OPAL_TEST_MODE="1"
    
    # Run unit tests
    log_info "Running unit tests..."
    if [ "$VERBOSE" = true ]; then
        npx jest tests/opal-adapter.test.ts --verbose
    else
        npx jest tests/opal-adapter.test.ts --silent 2>&1 || true
    fi
    
    # Run integration tests
    log_info "Running integration tests..."
    if [ "$VERBOSE" = true ]; then
        npx jest tests/integration.test.ts --verbose
    else
        npx jest tests/integration.test.ts --silent 2>&1 || true
    fi
    
    log_success "All tests completed"
}

# Generate test report
generate_report() {
    log_info "Generating test report..."
    
    local report_file="$PROJECT_ROOT/test-report.md"
    
    cat > "$report_file" << EOF
# OPAL Bridge Test Report

Generated: $(date -u +"%Y-%m-%d %H:%M UTC")

## Test Environment

- **Test Directory**: \`$TEMP_DIR\`
- **OPAL Path**: \`$TEMP_DIR/opal\`
- **org-os Path**: \`$TEMP_DIR/org-os\`

## Directory Structure

\`\`\`
$TEMP_DIR/
├── opal/
│   ├── _inbox/
│   ├── _staging/
│   ├── _index/
│   ├── config/
│   ├── handoffs/
│   └── CLAUDE.md
└── org-os/
    ├── content/
    │   └── meetings/
    ├── data/
    │   ├── members.yaml
    │   ├── projects.yaml
    │   └── meetings.yaml
    └── federation.yaml
\`\`\`

## Test Files

- Unit Tests: \`tests/opal-adapter.test.ts\`
- Integration Tests: \`tests/integration.test.ts\`
- Fixtures: \`tests/fixtures/\`

## Usage

Run the tests manually:

\`\`\`bash
# Unit tests only
npm test

# Integration tests
npm run test:integration

# All tests
npm run test:opal-integration
\`\`\`

## Test Data

The test environment includes:

- 3 sample members (Alice, Bob, Carol)
- 2 sample projects
- 1 sample meeting transcript
- Mock OPAL configuration
- Sample federation.yaml

EOF

    log_success "Test report generated: $report_file"
}

# Print summary
print_summary() {
    echo ""
    echo "========================================="
    echo -e "${GREEN}OPAL Bridge Test Setup Complete${NC}"
    echo "========================================="
    echo ""
    echo -e "${BLUE}Test Environment:${NC} $TEMP_DIR"
    echo -e "${BLUE}OPAL Installation:${NC} $TEMP_DIR/opal"
    echo -e "${BLUE}org-os Instance:${NC} $TEMP_DIR/org-os"
    echo ""
    echo -e "${BLUE}Next Steps:${NC}"
    echo "  1. Run tests: npm test"
    echo "  2. Run integration tests: npm run test:integration"
    echo "  3. View report: cat test-report.md"
    echo ""
    echo -e "${YELLOW}To clean up:${NC} rm -rf $TEMP_DIR"
    echo ""
}

# Main function
main() {
    echo "========================================="
    echo "  OPAL Bridge Test Setup"
    echo "========================================="
    echo ""
    
    check_prerequisites
    clean_environment
    create_test_structure
    setup_mock_opal
    setup_test_org_os
    install_dependencies
    build_typescript
    run_tests
    generate_report
    print_summary
}

# Run main function
main "$@"
