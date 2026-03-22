#!/bin/bash
#
# OPAL Bridge Installation Validation Script
#
# Pre-flight checks for OPAL bridge installation to ensure:
# - OPAL is properly cloned and accessible
# - Node.js version is compatible
# - Git configuration is valid
# - federation.yaml is properly configured
#
# Usage: ./scripts/validate-install.sh [--fix] [--quiet]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Export colors for use in functions
export RED GREEN YELLOW BLUE CYAN NC

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Minimum required versions
MIN_NODE_VERSION="18.0.0"
MIN_NPM_VERSION="9.0.0"

# Flags
FIX_MODE=false
QUIET_MODE=false
VERBOSE=false
EXIT_CODE=0

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --fix)
            FIX_MODE=true
            shift
            ;;
        --quiet)
            QUIET_MODE=true
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
            echo "  --fix      Attempt to fix detected issues automatically"
            echo "  --quiet    Only output errors"
            echo "  --verbose  Show detailed output"
            echo "  -h, --help Show this help message"
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
    [ "$QUIET_MODE" = false ] && echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    [ "$QUIET_MODE" = false ] && echo -e "${GREEN}[PASS]${NC} $1"
}

log_warning() {
    [ "$QUIET_MODE" = false ] && echo -e "${YELLOW}[WARN]${NC} $1"
    ((CHECKS_WARNING++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((CHECKS_FAILED++))
    EXIT_CODE=1
}

log_detail() {
    [ "$VERBOSE" = true ] && echo -e "${CYAN}      ${NC} $1"
}

# Version comparison function
version_compare() {
    if [[ "$1" == "$2" ]]; then
        return 0
    fi
    local IFS=.
    local i ver1=($1) ver2=($2)
    for ((i=0; i<${#ver1[@]}; i++)); do
        if [[ -z ${ver2[i]} ]]; then
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]})); then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]})); then
            return 2
        fi
    done
    return 0
}

# Check Node.js installation and version
check_node() {
    log_info "Checking Node.js installation..."
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed"
        log_detail "Please install Node.js $MIN_NODE_VERSION or later"
        log_detail "Visit: https://nodejs.org/"
        return 1
    fi
    
    NODE_VERSION=$(node --version | sed 's/v//')
    log_detail "Found Node.js version: $NODE_VERSION"
    
    version_compare "$NODE_VERSION" "$MIN_NODE_VERSION"
    local result=$?
    
    if [[ $result -eq 2 ]]; then
        log_error "Node.js version $NODE_VERSION is too old (minimum: $MIN_NODE_VERSION)"
        log_detail "Please upgrade Node.js: https://nodejs.org/"
        return 1
    else
        log_success "Node.js version $NODE_VERSION is compatible"
        ((CHECKS_PASSED++))
    fi
}

# Check npm installation and version
check_npm() {
    log_info "Checking npm installation..."
    
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed"
        log_detail "npm is required for dependency management"
        return 1
    fi
    
    NPM_VERSION=$(npm --version)
    log_detail "Found npm version: $NPM_VERSION"
    
    version_compare "$NPM_VERSION" "$MIN_NPM_VERSION"
    local result=$?
    
    if [[ $result -eq 2 ]]; then
        log_warning "npm version $NPM_VERSION is old (recommended: $MIN_NPM_VERSION or later)"
    else
        log_success "npm version $NPM_VERSION is compatible"
        ((CHECKS_PASSED++))
    fi
}

# Check Git installation and configuration
check_git() {
    log_info "Checking Git installation and configuration..."
    
    if ! command -v git &> /dev/null; then
        log_error "Git is not installed"
        log_detail "Git is required for version control and OPAL sync"
        return 1
    fi
    
    GIT_VERSION=$(git --version | awk '{print $3}')
    log_detail "Found Git version: $GIT_VERSION"
    
    # Check Git configuration
    local git_user_name=$(git config user.name 2>/dev/null || echo "")
    local git_user_email=$(git config user.email 2>/dev/null || echo "")
    
    if [[ -z "$git_user_name" ]]; then
        log_warning "Git user.name is not set"
        log_detail "Run: git config --global user.name \"Your Name\""
        
        if [ "$FIX_MODE" = true ]; then
            log_info "Auto-fixing git user.name..."
            git config user.name "OPAL Bridge User"
            log_success "Git user.name configured"
        fi
    else
        log_detail "Git user.name: $git_user_name"
    fi
    
    if [[ -z "$git_user_email" ]]; then
        log_warning "Git user.email is not set"
        log_detail "Run: git config --global user.email \"your@email.com\""
        
        if [ "$FIX_MODE" = true ]; then
            log_info "Auto-fixing git user.email..."
            git config user.email "opal-bridge@localhost"
            log_success "Git user.email configured"
        fi
    else
        log_detail "Git user.email: $git_user_email"
    fi
    
    # Check if we're in a git repository
    if [ -d "$PROJECT_ROOT/.git" ]; then
        log_success "Git repository detected"
        ((CHECKS_PASSED++))
    else
        log_warning "Not in a Git repository"
        log_detail "Initialize with: git init"
    fi
}

# Check OPAL installation
check_opal() {
    log_info "Checking OPAL installation..."
    
    local opal_path=""
    
    # Check if OPAL path is configured in federation.yaml
    if [ -f "$PROJECT_ROOT/federation.yaml" ]; then
        log_detail "Found federation.yaml, checking OPAL path..."
        
        # Extract opal_path from federation.yaml
        opal_path=$(grep -A 5 "opal-bridge:" "$PROJECT_ROOT/federation.yaml" 2>/dev/null | 
                    grep "opal_path:" | 
                    sed 's/.*opal_path:[[:space:]]*//' | 
                    tr -d '"' || echo "")
        
        if [[ -n "$opal_path" ]]; then
            log_detail "Configured OPAL path: $opal_path"
            
            # Resolve relative path
            if [[ ! "$opal_path" = /* ]]; then
                opal_path="$PROJECT_ROOT/$opal_path"
            fi
        fi
    fi
    
    # Check default locations
    if [[ -z "$opal_path" ]] || [[ ! -d "$opal_path" ]]; then
        local possible_paths=(
            "$PROJECT_ROOT/../../opal"
            "$PROJECT_ROOT/../opal"
            "$PROJECT_ROOT/opal"
            "$(dirname $PROJECT_ROOT)/opal"
        )
        
        for path in "${possible_paths[@]}"; do
            log_detail "Checking: $path"
            if [ -d "$path" ] && [ -f "$path/CLAUDE.md" ]; then
                opal_path="$path"
                log_detail "Found OPAL at: $path"
                break
            fi
        done
    fi
    
    # Validate OPAL directory
    if [[ -n "$opal_path" ]] && [ -d "$opal_path" ]; then
        log_detail "OPAL directory found: $opal_path"
        
        # Check for CLAUDE.md
        if [ -f "$opal_path/CLAUDE.md" ]; then
            log_success "OPAL installation validated (CLAUDE.md found)"
            ((CHECKS_PASSED++))
            
            # Check OPAL structure
            local required_dirs=("_inbox" "_staging" "_index")
            for dir in "${required_dirs[@]}"; do
                if [ -d "$opal_path/$dir" ]; then
                    log_detail "✓ $dir/ directory exists"
                else
                    log_warning "Missing OPAL directory: $dir/"
                    
                    if [ "$FIX_MODE" = true ]; then
                        mkdir -p "$opal_path/$dir"
                        log_success "Created $dir/ directory"
                    fi
                fi
            done
        else
            log_error "OPAL installation incomplete (CLAUDE.md missing)"
            log_detail "Expected CLAUDE.md at: $opal_path/CLAUDE.md"
            return 1
        fi
    else
        log_error "OPAL installation not found"
        log_detail "Expected OPAL at: $PROJECT_ROOT/../../opal or configured path"
        log_detail "Clone OPAL: git clone https://github.com/anthropics/opal.git"
        return 1
    fi
}

# Check federation.yaml configuration
check_federation() {
    log_info "Checking federation.yaml configuration..."
    
    local federation_file="$PROJECT_ROOT/federation.yaml"
    
    if [ ! -f "$federation_file" ]; then
        log_error "federation.yaml not found"
        log_detail "Expected at: $federation_file"
        log_detail "Create one based on the example in README.md"
        
        if [ "$FIX_MODE" = true ]; then
            log_info "Creating default federation.yaml..."
            
            cat > "$federation_file" << 'EOF'
knowledge-commons:
  enabled: true
  opal-bridge:
    enabled: true
    opal_path: "../../opal"
    profile: "default"
    auto_process: false
    review_required: true
EOF
            log_success "Created default federation.yaml"
        fi
        
        return 1
    fi
    
    log_success "federation.yaml found"
    ((CHECKS_PASSED++))
    
    # Check YAML validity
    if command -v python3 &> /dev/null; then
        if python3 -c "import yaml; yaml.safe_load(open('$federation_file'))" 2>/dev/null; then
            log_success "federation.yaml is valid YAML"
            ((CHECKS_PASSED++))
        else
            log_error "federation.yaml contains invalid YAML"
            return 1
        fi
    else
        log_warning "Python3 not available, skipping YAML validation"
    fi
    
    # Check required sections
    log_detail "Checking required configuration sections..."
    
    if grep -q "opal-bridge:" "$federation_file"; then
        log_detail "✓ opal-bridge section found"
    else
        log_error "Missing opal-bridge section in federation.yaml"
    fi
    
    if grep -q "opal_path:" "$federation_file"; then
        log_detail "✓ opal_path configured"
    else
        log_warning "opal_path not configured in federation.yaml"
    fi
    
    if grep -q "profile:" "$federation_file"; then
        log_detail "✓ profile configured"
    else
        log_warning "profile not configured in federation.yaml"
    fi
}

# Check package.json and dependencies
check_dependencies() {
    log_info "Checking package.json and dependencies..."
    
    if [ ! -f "$PROJECT_ROOT/package.json" ]; then
        log_error "package.json not found"
        log_detail "Expected at: $PROJECT_ROOT/package.json"
        return 1
    fi
    
    log_success "package.json found"
    ((CHECKS_PASSED++))
    
    # Check if node_modules exists
    if [ -d "$PROJECT_ROOT/node_modules" ]; then
        log_success "Dependencies installed (node_modules exists)"
        ((CHECKS_PASSED++))
        
        # Check for key dependencies
        local key_deps=("commander" "chalk" "ora" "yaml")
        for dep in "${key_deps[@]}"; do
            if [ -d "$PROJECT_ROOT/node_modules/$dep" ]; then
                log_detail "✓ $dep installed"
            else
                log_warning "$dep not found in node_modules"
            fi
        done
    else
        log_warning "Dependencies not installed (node_modules missing)"
        log_detail "Run: npm install"
        
        if [ "$FIX_MODE" = true ]; then
            log_info "Installing dependencies..."
            cd "$PROJECT_ROOT" && npm install
            log_success "Dependencies installed"
        fi
    fi
    
    # Check TypeScript
    if [ -f "$PROJECT_ROOT/tsconfig.json" ]; then
        log_success "tsconfig.json found"
        ((CHECKS_PASSED++))
    else
        log_warning "tsconfig.json not found"
    fi
}

# Check test environment
check_tests() {
    log_info "Checking test environment..."
    
    # Check test directory
    if [ -d "$PROJECT_ROOT/tests" ]; then
        log_success "Tests directory exists"
        ((CHECKS_PASSED++))
        
        local test_files=("opal-adapter.test.ts" "integration.test.ts")
        for file in "${test_files[@]}"; do
            if [ -f "$PROJECT_ROOT/tests/$file" ]; then
                log_detail "✓ $file found"
            else
                log_warning "Missing test file: $file"
            fi
        done
    else
        log_warning "Tests directory not found"
    fi
    
    # Check Jest configuration
    if [ -f "$PROJECT_ROOT/jest.config.js" ] || [ -f "$PROJECT_ROOT/jest.config.ts" ] || 
       grep -q "jest" "$PROJECT_ROOT/package.json" 2>/dev/null; then
        log_success "Jest configured"
        ((CHECKS_PASSED++))
    else
        log_warning "Jest configuration not found"
    fi
}

# Print system information
print_system_info() {
    log_info "System Information:"
    
    log_detail "Operating System: $(uname -s)"
    log_detail "Architecture: $(uname -m)"
    log_detail "Shell: $SHELL"
    
    if command -v node &> /dev/null; then
        log_detail "Node path: $(which node)"
    fi
    
    log_detail "Project root: $PROJECT_ROOT"
    
    # Check disk space
    local available_space=$(df -h "$PROJECT_ROOT" | tail -1 | awk '{print $4}')
    log_detail "Available disk space: $available_space"
}

# Print final summary
print_summary() {
    echo ""
    echo "========================================="
    if [ $EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}Validation PASSED${NC}"
    else
        echo -e "${RED}Validation FAILED${NC}"
    fi
    echo "========================================="
    echo ""
    echo -e "${GREEN}Passed:${NC} $CHECKS_PASSED"
    echo -e "${YELLOW}Warnings:${NC} $CHECKS_WARNING"
    echo -e "${RED}Failed:${NC} $CHECKS_FAILED"
    echo ""
    
    if [ $EXIT_CODE -ne 0 ]; then
        echo -e "${YELLOW}To fix issues, run:${NC}"
        echo "  $0 --fix"
        echo ""
        echo -e "${YELLOW}For more details, run:${NC}"
        echo "  $0 --verbose"
    else
        echo -e "${GREEN}Your OPAL Bridge installation is ready!${NC}"
        echo ""
        echo -e "${BLUE}Next steps:${NC}"
        echo "  1. Run tests: npm test"
        echo "  2. Build: npm run build"
        echo "  3. Start using: npx opal-bridge status"
    fi
    echo ""
}

# Main function
main() {
    [ "$QUIET_MODE" = false ] && echo "========================================="
    [ "$QUIET_MODE" = false ] && echo "  OPAL Bridge Installation Validator"
    [ "$QUIET_MODE" = false ] && echo "========================================="
    [ "$QUIET_MODE" = false ] && echo ""
    
    [ "$FIX_MODE" = true ] && log_info "Fix mode enabled - will attempt to fix issues"
    [ "$VERBOSE" = true ] && log_info "Verbose mode enabled"
    
    print_system_info
    
    check_node
    check_npm
    check_git
    check_opal
    check_federation
    check_dependencies
    check_tests
    
    print_summary
    
    exit $EXIT_CODE
}

# Run main function
main "$@"
