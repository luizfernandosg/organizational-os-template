#!/bin/bash
#
# Deploy OPAL Bridge to Node (refi-dao-os or refi-bcn-os)
#
# This script deploys the OPAL bridge to a node instance with
# local knowledge capture and optional federation to the hub.
#
# Usage: ./deploy-to-node.sh <node-name> [options]
#   node-name:   Target node (refi-dao-os or refi-bcn-os)
#   Options:
#     --dry-run     Preview changes without deploying
#     --force       Skip confirmation prompts
#     --local-only  Disable federation, local-only mode
#     --help        Show this help message
#

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_DIR="$(dirname "$SCRIPT_DIR")"

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
NODE_NAME=""
DRY_RUN=false
FORCE=false
LOCAL_ONLY=false

if [[ $# -eq 0 ]]; then
    log_error "No node name specified"
    echo "Usage: $0 <node-name> [options]"
    echo "Run '$0 --help' for more information"
    exit 1
fi

NODE_NAME="$1"
shift

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
        --local-only)
            LOCAL_ONLY=true
            shift
            ;;
        --help)
            echo "Deploy OPAL Bridge to Node (refi-dao-os or refi-bcn-os)"
            echo ""
            echo "Usage: $0 <node-name> [options]"
            echo ""
            echo "Arguments:"
            echo "  node-name     Target node: refi-dao-os or refi-bcn-os"
            echo ""
            echo "Options:"
            echo "  --dry-run     Preview changes without deploying"
            echo "  --force       Skip confirmation prompts"
            echo "  --local-only  Disable federation, local-only mode"
            echo "  --help        Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  NODE_USER      SSH user for deployment (default: deploy)"
            echo "  NODE_HOST      SSH host for deployment"
            echo "  NODE_SSH_KEY   Path to SSH private key"
            echo ""
            echo "Examples:"
            echo "  $0 refi-dao-os"
            echo "  $0 refi-bcn-os --dry-run"
            echo "  $0 refi-dao-os --local-only"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate node name
case "$NODE_NAME" in
    refi-dao-os|refi-bcn-os)
        ;;
    *)
        log_error "Invalid node name: $NODE_NAME"
        log_error "Valid nodes: refi-dao-os, refi-bcn-os"
        exit 1
        ;;
esac

# Node-specific configuration
case "$NODE_NAME" in
    refi-dao-os)
        DEPLOY_USER="${NODE_USER:-deploy}"
        DEPLOY_HOST="${NODE_HOST:-dao.regen.network}"
        NODE_DISPLAY_NAME="ReFi DAO"
        NODE_LOCATION="Global"
        ;;
    refi-bcn-os)
        DEPLOY_USER="${NODE_USER:-deploy}"
        DEPLOY_HOST="${NODE_HOST:-bcn.regen.network}"
        NODE_DISPLAY_NAME="ReFi Barcelona"
        NODE_LOCATION="Barcelona, Spain"
        ;;
esac

SSH_KEY="${NODE_SSH_KEY:-${HOME}/.ssh/node_deploy}"
NODE_PATH="/opt/org-os/${NODE_NAME}"
BACKUP_RETENTION_DAYS=30

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
log_info "Running pre-deployment checks for ${NODE_NAME}..."

# Verify package integrity
if [[ ! -f "$PACKAGE_DIR/package.json" ]]; then
    log_error "package.json not found in $PACKAGE_DIR"
    exit 1
fi

PACKAGE_NAME=$(jq -r '.name' "$PACKAGE_DIR/package.json")
PACKAGE_VERSION=$(jq -r '.version' "$PACKAGE_DIR/package.json")

log_info "Deploying ${PACKAGE_NAME}@${PACKAGE_VERSION} to ${NODE_DISPLAY_NAME}"

if [[ "$DRY_RUN" == true ]]; then
    log_info "DRY RUN MODE - No changes will be made"
    echo ""
    echo "Planned actions:"
    echo "  1. SSH to ${DEPLOY_USER}@${DEPLOY_HOST}"
    echo "  2. Backup existing installation to ${NODE_PATH}/backups/"
    echo "  3. Deploy new version to ${NODE_PATH}/packages/opal-bridge/"
    echo "  4. Run post-deploy configuration:"
    echo "     - Configure federation.yaml for node-specific settings"
    if [[ "$LOCAL_ONLY" == false ]]; then
        echo "     - Configure federation to hub (regen-coordination-os)"
        echo "     - Setup upstream/downstream knowledge sync"
    else
        echo "     - Disable federation (local-only mode)"
    fi
    echo "     - Setup local knowledge capture workflows"
    echo "     - Configure meeting processing"
    echo "  5. Restart services if needed"
    echo ""
    exit 0
fi

# Confirmation prompt
if [[ "$FORCE" == false ]]; then
    echo ""
    echo "This will deploy OPAL Bridge to ${NODE_DISPLAY_NAME} at ${DEPLOY_HOST}"
    if [[ "$LOCAL_ONLY" == true ]]; then
        echo "Mode: LOCAL-ONLY (no federation)"
    else
        echo "Mode: FEDERATED (syncs to hub)"
    fi
    echo ""
    read -p "Continue? [y/N] " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Deployment cancelled"
        exit 0
    fi
fi

# Deployment
log_info "Starting deployment to ${NODE_DISPLAY_NAME}..."

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
BACKUP_DIR="${NODE_PATH}/backups/opal-bridge-$(date +%Y%m%d-%H%M%S)"
ssh_cmd "sudo mkdir -p '$BACKUP_DIR' && sudo cp -r '${NODE_PATH}/packages/opal-bridge' '$BACKUP_DIR/' 2>/dev/null || true"
ssh_cmd "sudo find '${NODE_PATH}/backups/' -maxdepth 1 -type d -mtime +${BACKUP_RETENTION_DAYS} -exec rm -rf {} + 2>/dev/null || true"
log_success "Backup created at ${BACKUP_DIR}"

# 2. Deploy new version
log_info "Deploying package files..."
ssh_cmd "sudo mkdir -p '${NODE_PATH}/packages/opal-bridge'"

# Create tarball and transfer
TEMP_DIR=$(mktemp -d)
tar -czf "${TEMP_DIR}/opal-bridge.tar.gz" -C "$PACKAGE_DIR" dist package.json README.md
scp_cmd "${TEMP_DIR}/opal-bridge.tar.gz" "${DEPLOY_USER}@${DEPLOY_HOST}:/tmp/"
rm -rf "$TEMP_DIR"

# Extract on remote
ssh_cmd "sudo tar -xzf /tmp/opal-bridge.tar.gz -C '${NODE_PATH}/packages/opal-bridge' && sudo rm /tmp/opal-bridge.tar.gz"
log_success "Package deployed"

# 3. Install dependencies
log_info "Installing dependencies..."
ssh_cmd "cd '${NODE_PATH}/packages/opal-bridge' && sudo npm ci --production"
log_success "Dependencies installed"

# 4. Configure node
log_info "Configuring ${NODE_DISPLAY_NAME}..."

if [[ "$LOCAL_ONLY" == true ]]; then
    # Local-only configuration (no federation)
    ssh_cmd "sudo tee '${NODE_PATH}/federation.yaml' > /dev/null" << EOF
# Local-only configuration for ${NODE_NAME}
knowledge-commons:
  enabled: true
  
  # Node identity (for local reference only)
  node:
    id: "${NODE_NAME}"
    name: "${NODE_DISPLAY_NAME}"
    location: "${NODE_LOCATION}"
    mode: "local"
  
  # OPAL Bridge configuration
  opal-bridge:
    enabled: true
    opal_path: "../../opal"
    profile: "${NODE_NAME}"
    auto_process: true
    review_required: true
    
    # Local knowledge capture
    capture:
      meetings: true
      documents: true
      decisions: true
      handoffs: true
    
    # Workflow configuration
    workflows:
      meeting_processing:
        enabled: true
        auto_extract: true
        review_meeting_notes: true
      document_ingestion:
        enabled: true
        auto_extract: true
        review_documents: true
EOF
    log_success "Local-only configuration applied"
else
    # Federated configuration (syncs to hub)
    ssh_cmd "sudo tee '${NODE_PATH}/federation.yaml' > /dev/null" << EOF
# Federated configuration for ${NODE_NAME}
knowledge-commons:
  enabled: true
  
  # Node identity
  node:
    id: "${NODE_NAME}"
    name: "${NODE_DISPLAY_NAME}"
    location: "${NODE_LOCATION}"
    mode: "federated"
  
  # Federation to hub
  federation:
    enabled: true
    hub:
      id: "regen-coordination-os"
      name: "Regen Coordination Hub"
      endpoint: "https://hub.regen-coordination.org/knowledge"
      trusted: true
    
    # Sync settings
    sync:
      upstream: true      # Push local knowledge to hub
      downstream: true    # Pull shared knowledge from hub
      interval: 3600      # Sync every hour
      conflict_resolution: "timestamp-wins"
    
    # Entity sharing
    share_entities: ["person", "organization", "pattern", "protocol"]
    upstream_filters:
      - "public*"
      - "shared*"
    exclude_patterns: ["private*", "draft*"]
  
  # OPAL Bridge configuration
  opal-bridge:
    enabled: true
    opal_path: "../../opal"
    profile: "${NODE_NAME}"
    auto_process: true
    review_required: true
    
    # Federation-specific settings
    federation:
      sync_entities: ["person", "organization", "pattern", "protocol", "concept"]
      publish_approved_only: true
    
    # Local knowledge capture
    capture:
      meetings: true
      documents: true
      decisions: true
      handoffs: true
    
    # Workflow configuration
    workflows:
      meeting_processing:
        enabled: true
        auto_extract: true
        review_meeting_notes: true
        share_after_approval: true
      document_ingestion:
        enabled: true
        auto_extract: true
        review_documents: true
        share_after_approval: true
EOF
    log_success "Federation configuration applied"
fi

# 5. Setup local directories
log_info "Setting up local knowledge directories..."
ssh_cmd "sudo mkdir -p '${NODE_PATH}/knowledge/{local,staging,approved,upstream,downstream}'"
ssh_cmd "sudo chmod 755 '${NODE_PATH}/knowledge'"
ssh_cmd "sudo mkdir -p '${NODE_PATH}/content/{meetings,docs,handoffs}'"

# 6. Setup meeting processing workflow
log_info "Setting up meeting processing workflow..."
cat << 'EOF' | ssh_cmd "cat > /tmp/process-meetings.sh && sudo mv /tmp/process-meetings.sh '${NODE_PATH}/scripts/process-meetings.sh' && sudo chmod +x '${NODE_PATH}/scripts/process-meetings.sh'"
#!/bin/bash
# Process new meeting notes through OPAL

NODE_PATH="/opt/org-os/${NODE_NAME}"
MEETINGS_DIR="${NODE_PATH}/content/meetings"

# Find unprocessed meeting files
find "$MEETINGS_DIR" -name "*.md" -type f | while read -r file; do
    # Skip already processed files (check for marker)
    if ! grep -q "<!-- OPAL-PROCESSED -->" "$file"; then
        echo "Processing: $file"
        cd "$NODE_PATH" && npx opal-bridge process "$file" --config federation.yaml
        
        # Add processed marker
        echo "<!-- OPAL-PROCESSED -->" >> "$file"
    fi
done
EOF

# Setup cron for meeting processing
ssh_cmd "(crontab -l 2>/dev/null | grep -v 'process-meetings'; echo '*/15 * * * * ${NODE_PATH}/scripts/process-meetings.sh >> ${NODE_PATH}/logs/meetings.log 2>&1') | crontab -"

# 7. Setup federation sync (if not local-only)
if [[ "$LOCAL_ONLY" == false ]]; then
    log_info "Setting up federation sync..."
    cat << 'EOF' | ssh_cmd "cat > /tmp/federation-sync.sh && sudo mv /tmp/federation-sync.sh '${NODE_PATH}/scripts/federation-sync.sh' && sudo chmod +x '${NODE_PATH}/scripts/federation-sync.sh'"
#!/bin/bash
# Federation sync script for node

NODE_PATH="/opt/org-os/${NODE_NAME}"
HUB_ENDPOINT="https://hub.regen-coordination.org/knowledge"

echo "[$(date)] Starting federation sync..."

# Sync upstream (local -> hub)
cd "$NODE_PATH" && npx opal-bridge sync --direction upstream --config federation.yaml

# Sync downstream (hub -> local)
cd "$NODE_PATH" && npx opal-bridge sync --direction downstream --config federation.yaml

echo "[$(date)] Federation sync completed"
EOF

    # Setup cron for federation sync
    ssh_cmd "(crontab -l 2>/dev/null | grep -v 'federation-sync'; echo '0 * * * * ${NODE_PATH}/scripts/federation-sync.sh >> ${NODE_PATH}/logs/federation.log 2>&1') | crontab -"
    log_success "Federation sync scheduled hourly"
fi

# 8. Post-deployment validation
log_info "Running post-deployment validation..."

VALIDATION_OUTPUT=$(ssh_cmd "cd '${NODE_PATH}' && npx opal-bridge status --config federation.yaml 2>&1" || true)

if echo "$VALIDATION_OUTPUT" | grep -q "connected"; then
    log_success "OPAL Bridge is connected and operational"
else
    log_warning "OPAL Bridge status check returned:"
    echo "$VALIDATION_OUTPUT"
fi

# 9. Health check script
cat << 'EOF' | ssh_cmd "cat > /tmp/opal-health-check.sh && sudo mv /tmp/opal-health-check.sh '${NODE_PATH}/scripts/opal-health-check.sh' && sudo chmod +x '${NODE_PATH}/scripts/opal-health-check.sh'"
#!/bin/bash
# Health check for OPAL Bridge node

NODE_PATH="/opt/org-os/${NODE_NAME}"
STATUS=$(cd "$NODE_PATH" && npx opal-bridge status --config federation.yaml 2>&1)

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
ssh_cmd "cd '${NODE_PATH}/backups' && ls -t | grep 'opal-bridge-' | tail -n +11 | xargs -r rm -rf"

# Summary
echo ""
log_success "Deployment to ${NODE_DISPLAY_NAME} completed successfully!"
echo ""
echo "Summary:"
echo "  Package: ${PACKAGE_NAME}@${PACKAGE_VERSION}"
echo "  Target: ${DEPLOY_HOST}"
echo "  Path: ${NODE_PATH}"
echo "  Mode: ${LOCAL_ONLY == true ? 'Local-only' : 'Federated'}"
echo "  Backup: ${BACKUP_DIR}"
echo ""
echo "Next steps:"
echo "  1. Test the deployment: ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'npx opal-bridge status'"
if [[ "$LOCAL_ONLY" == false ]]; then
    echo "  2. Test federation: ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'npx opal-bridge sync --dry-run'"
fi
echo "  3. Process a meeting: ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'npx opal-bridge process content/meetings/YYYY-MM-DD.md'"
echo "  4. Review configuration: ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'cat ${NODE_PATH}/federation.yaml'"
echo ""
echo "To rollback:"
echo "  ssh ${DEPLOY_USER}@${DEPLOY_HOST} 'sudo rm -rf ${NODE_PATH}/packages/opal-bridge && sudo cp -r ${BACKUP_DIR}/opal-bridge ${NODE_PATH}/packages/'"
echo ""
