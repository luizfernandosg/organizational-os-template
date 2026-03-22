#!/bin/bash
#
# Deploy OPAL Bridge to regen-coordination-os (Hub)
#
# This script deploys the OPAL bridge to the hub instance with
# federation features enabled for network-wide knowledge coordination.
#
# Usage: ./deploy-to-hub.sh [options]
#   Options:
#     --dry-run     Preview changes without deploying
#     --force       Skip confirmation prompts
#     --help        Show this help message
#

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"
HUB_NAME="regen-coordination-os"
DEPLOY_USER="${HUB_USER:-deploy}"
DEPLOY_HOST="${HUB_HOST:-hub.regen-coordination.org}"
SSH_KEY="${HUB_SSH_KEY:-${HOME}/.ssh/hub_deploy}"
HUB_PATH="/opt/org-os/${HUB_NAME}"
ENABLE_FEDERATION="${ENABLE_FEDERATION:-true}"
BACKUP_RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Parse arguments
DRY_RUN=false
FORCE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --force)
            FORCE=true
            shift
            ;;
        --help)
            echo "Deploy OPAL Bridge to regen-coordination-os (Hub)"
            echo ""
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --dry-run     Preview changes without deploying"
            echo "  --force       Skip confirmation prompts"
            echo "  --help        Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  HUB_USER      SSH user for deployment (default: deploy)"
            echo "  HUB_HOST      SSH host for deployment"
            echo "  HUB_SSH_KEY   Path to SSH private key"
            echo "  ENABLE_FEDERATION  Enable federation features (default: true)"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validation
if [[ ! -f "${SSH_KEY}" && "$DRY_RUN" == false ]]; then
    log_warning "SSH key not found at ${SSH_KEY}"
    log_info "Attempting to use SSH agent..."
fi

if [[ ! -d "$PACKAGE_DIR/dist" ]]; then
    log_error "Build artifacts not found. Run 'npm run build' first."
    exit 1
fi

# Pre-deployment checks
log_info "Running pre-deployment checks..."

# Check Node.js version compatibility
NODE_VERSION=$(node --version 2>/dev/null | cut -d'v' -f2 | cut -d'.' -f1) || NODE_VERSION=""
if [[ -n "$NODE_VERSION" && "$NODE_VERSION" -lt 18 ]]; then
    log_warning "Node.js version ${NODE_VERSION} detected. OPAL Bridge requires Node.js 18+"
fi

# Verify package integrity
if [[ ! -f "$PACKAGE_DIR/package.json" ]]; then
    log_error "package.json not found in $PACKAGE_DIR"
    exit 1
fi

PACKAGE_NAME=$(jq -r '.name' "$PACKAGE_DIR/package.json")
PACKAGE_VERSION=$(jq -r '.version' "$PACKAGE_DIR/package.json")

log_info "Deploying ${PACKAGE_NAME}@${PACKAGE_VERSION} to ${HUB_NAME}"

if [[ "$DRY_RUN" == true ]]; then
    log_info "DRY RUN MODE - No changes will be made"
    echo ""
    echo "Planned actions:"
    echo "  1. SSH to ${DEPLOY_USER}@${DEPLOY_HOST}"
    echo "  2. Backup existing installation to ${HUB_PATH}/backups/"
    echo "  3. Deploy new version to ${HUB_PATH}/packages/opal-bridge/"
    echo "  4. Run post-deploy configuration:"
    echo "     - Configure federation.yaml for network coordination"
    echo "     - Enable KOI federation features"
    echo "     - Setup shared knowledge sync"
    echo "     - Configure review workflows"
    echo "  5. Restart services if needed"
    echo ""
    exit 0
fi

# Confirmation prompt
if [[ "$FORCE" == false ]]; then
    echo ""
    echo "This will deploy OPAL Bridge to ${HUB_NAME} at ${DEPLOY_HOST}"
    echo "Federation will be ${ENABLE_FEDERATION == true ? 'ENABLED' : 'DISABLED'}"
    echo ""
    read -p "Continue? [y/N] " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
fi

# Deployment
log_info "Starting deployment to ${HUB_NAME}..."

# SSH command helper
ssh_cmd() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$DEPLOY_USER@$DEPLOY_HOST" "$@"
}

# SCP command helper
scp_cmd() {
    scp -i "$SSH_KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null "$@"
}

# 1. Create backup
log_info "Creating backup..."
BACKUP_DIR="${HUB_PATH}/backups/opal-bridge-$(date +%Y%m%d-%H%M%S)"
ssh_cmd "sudo mkdir -p '$BACKUP_DIR' && sudo cp -r '${HUB_PATH}/packages/opal-bridge' '$BACKUP_DIR/' 2>/dev/null || true"
ssh_cmd "sudo find '${HUB_PATH}/backups/' -maxdepth 1 -type d -mtime +${BACKUP_RETENTION_DAYS} -exec rm -rf {} + 2>/dev/null || true"
log_success "Backup created at ${BACKUP_DIR}"

# 2. Deploy new version
log_info "Deploying package files..."
ssh_cmd "sudo mkdir -p '${HUB_PATH}/packages/opal-bridge'"

# Create tarball and transfer
TEMP_DIR=$(mktemp -d)
tar -czf "${TEMP_DIR}/opal-bridge.tar.gz" -C "$PACKAGE_DIR" dist package.json README.md
scp_cmd "${TEMP_DIR}/opal-bridge.tar.gz" "${DEPLOY_USER}@${DEPLOY_HOST}:/tmp/"
rm -rf "$TEMP_DIR"

# Extract on remote
ssh_cmd "sudo tar -xzf /tmp/opal-bridge.tar.gz -C '${HUB_PATH}/packages/opal-bridge' && sudo rm /tmp/opal-bridge.tar.gz"
log_success "Package deployed"

# 3. Install dependencies
log_info "Installing dependencies..."
ssh_cmd "cd '${HUB_PATH}/packages/opal-bridge' && sudo npm ci --production"
log_success "Dependencies installed"

# 4. Configure federation
log_info "Configuring federation..."

if [[ "$ENABLE_FEDERATION" == "true" ]]; then
    ssh_cmd "sudo tee '${HUB_PATH}/federation.yaml' > /dev/null" << 'EOF'
# Federation configuration for regen-coordination-os (Hub)
knowledge-commons:
  enabled: true
  
  # Hub configuration for network coordination
  hub:
    enabled: true
    hub_id: "regen-coordination-os"
    name: "Regen Coordination Hub"
    role: "coordinator"
    
    # Network nodes
    nodes:
      - id: "refi-dao-os"
        name: "ReFi DAO"
        endpoint: "https://dao.regen.network/knowledge"
        capabilities: ["sync", "federate"]
      - id: "refi-bcn-os"
        name: "ReFi Barcelona"
        endpoint: "https://bcn.regen.network/knowledge"
        capabilities: ["sync", "federate"]
    
    # Synchronization settings
    sync:
      interval: "3600"  # seconds
      conflict_resolution: "hub-wins"
      auto_approve_trusted: true
      trusted_nodes: ["refi-dao-os", "refi-bcn-os"]
  
  # OPAL Bridge configuration
  opal-bridge:
    enabled: true
    opal_path: "../../opal"
    profile: "regen-hub"
    auto_process: true
    review_required: true
    
    # Federation-specific settings
    federation:
      sync_entities: ["person", "organization", "pattern", "protocol", "concept"]
      exclude_patterns: ["draft*", "private*"]
      require_approval_for: ["organization", "protocol"]
    
    # Knowledge capture
    capture:
      meetings: true
      documents: true
      decisions: true
      handoffs: true
EOF
    log_success "Federation configured for hub"
else
    log_info "Federation disabled - using standalone configuration"
    ssh_cmd "sudo tee '${HUB_PATH}/federation.yaml' > /dev/null" << 'EOF'
# Standalone configuration (no federation)
knowledge-commons:
  enabled: true
  
  opal-bridge:
    enabled: true
    opal_path: "../../opal"
    profile: "regen"
    auto_process: true
    review_required: true
EOF
fi

# 5. Setup shared directories
log_info "Setting up shared knowledge directories..."
ssh_cmd "sudo mkdir -p '${HUB_PATH}/knowledge/{shared,upstream,downstream}'"
ssh_cmd "sudo chmod 755 '${HUB_PATH}/knowledge'"

# 6. Configure cron for federation sync (if enabled)
if [[ "$ENABLE_FEDERATION" == "true" ]]; then
    log_info "Setting up federation sync cron..."
    ssh_cmd "(crontab -l 2>/dev/null | grep -v 'opal-bridge-federate'; echo '0 * * * * cd ${HUB_PATH} && npx opal-bridge federate --config federation.yaml') | crontab -"
    log_success "Federation sync scheduled hourly"
fi

# 7. Post-deployment validation
log_info "Running post-deployment validation..."

VALIDATION_OUTPUT=$(ssh_cmd "cd '${HUB_PATH}' && npx opal-bridge status --config federation.yaml 2>&1" || true)

if echo "$VALIDATION_OUTPUT" | grep -q "connected"; then
    log_success "OPAL Bridge is connected and operational"
else
    log_warning "OPAL Bridge status check returned:"
    echo "$VALIDATION_OUTPUT"
fi

# 8. Health check
cat << 'EOF' | ssh_cmd "cat > /tmp/opal-health-check.sh && sudo mv /tmp/opal-health-check.sh '${HUB_PATH}/scripts/opal-health-check.sh' && sudo chmod +x '${HUB_PATH}/scripts/opal-health-check.sh'"
#!/bin/bash
# Health check for OPAL Bridge

HUB_PATH="/opt/org-os/regen-coordination-os"
STATUS=$(cd "$HUB_PATH" && npx opal-bridge status --config federation.yaml 2>&1)

if echo "$STATUS" | grep -q "connected"; then
    echo "OK: OPAL Bridge operational"
    exit 0
else
    echo "ERROR: OPAL Bridge not connected"
    echo "$STATUS"
    exit 1
fi
EOF

log_success "Health check script installed"

# Cleanup old backups (keep only last 10)
ssh_cmd "cd '${HUB_PATH}/backups' && ls -t | grep 'opal-bridge-' | tail -n +11 | xargs -r rm -rf"

# Summary
echo ""
log_success "Deployment to ${HUB_NAME} completed successfully!"
echo ""
echo "Summary:"
echo "  Package: ${PACKAGE_NAME}@${PACKAGE_VERSION}"
echo "  Target: ${DEPLOY_HOST}"
echo "  Path: ${HUB_PATH}"
echo "  Federation: ${ENABLE_FEDERATION}"
echo "  Backup: ${BACKUP_DIR}"
echo ""
echo "Next steps:"
echo "  1. Test the deployment: ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'npx opal-bridge status'"
echo "  2. Check federation status (if enabled): ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'npx opal-bridge federate --dry-run'"
echo "  3. Review configuration: ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'cat ${HUB_PATH}/federation.yaml'"
echo ""
echo "To rollback:"
echo "  ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'sudo rm -rf ${HUB_PATH}/packages/opal-bridge && sudo cp -r ${BACKUP_DIR}/opal-bridge ${HUB_PATH}/packages/'"
echo ""
