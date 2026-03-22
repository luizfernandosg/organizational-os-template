/**
 * Git Sync - Synchronize OPAL _staging/ changes to git
 * 
 * Handles:
 * - Commits with proper messages
 * - Branch management for review workflows
 * - PR creation for commons mode
 * - Conflict resolution with org-os data
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import path from 'path';

// ============================================================================
// Type Definitions
// ============================================================================

export interface GitSyncConfig {
  orgOsPath: string;
  opalPath: string;
  remoteName?: string;
  defaultBranch?: string;
  commonsMode?: boolean;
  requiredApprovals?: number;
  autoMerge?: boolean;
  gitUserName?: string;
  gitUserEmail?: string;
}

export interface StagingChange {
  type: 'entity' | 'meeting' | 'pattern' | 'project' | 'decision' | 'action_item';
  entityType: string;
  entityId: string;
  entityName: string;
  action: 'create' | 'update' | 'delete';
  sourceFile: string;
  confidence: number;
  timestamp: Date;
}

export interface SyncResult {
  success: boolean;
  branch?: string;
  commitHash?: string;
  prNumber?: number;
  prUrl?: string;
  changes: StagingChange[];
  error?: string;
}

export interface CommitOptions {
  message?: string;
  author?: string;
  date?: Date;
  sign?: boolean;
}

export interface BranchInfo {
  current: string;
  all: string[];
  remote: string[];
}

export interface ConflictStatus {
  hasConflicts: boolean;
  conflictedFiles: string[];
  resolutionNeeded: boolean;
}

// ============================================================================
// Git Sync Class
// ============================================================================

export class GitSync {
  private config: GitSyncConfig;
  private stagingPath: string;

  constructor(config: GitSyncConfig) {
    this.config = {
      remoteName: 'origin',
      defaultBranch: 'main',
      commonsMode: false,
      requiredApprovals: 3,
      autoMerge: false,
      ...config
    };
    this.stagingPath = path.join(config.opalPath, '_staging');
  }

  // ==========================================================================
  // Initialization & Validation
  // ==========================================================================

  /**
   * Initialize git sync, validate repo state
   */
  async initialize(): Promise<void> {
    if (!this.isGitRepo(this.config.orgOsPath)) {
      throw new Error(`Not a git repository: ${this.config.orgOsPath}`);
    }

    // Configure git user if provided
    if (this.config.gitUserName) {
      this.execGit(['config', 'user.name', this.config.gitUserName], false);
    }
    if (this.config.gitUserEmail) {
      this.execGit(['config', 'user.email', this.config.gitUserEmail], false);
    }
  }

  /**
   * Check if path is a git repository
   */
  private isGitRepo(repoPath: string): boolean {
    try {
      execSync('git rev-parse --git-dir', { cwd: repoPath, stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  }

  // ==========================================================================
  // Staging Discovery
  // ==========================================================================

  /**
   * Discover changes in OPAL _staging/
   */
  async discoverChanges(): Promise<StagingChange[]> {
    if (!existsSync(this.stagingPath)) {
      return [];
    }

    const changes: StagingChange[] = [];
    const entries = readdirSync(this.stagingPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Check entity type directories
        const entityType = entry.name;
        const typePath = path.join(this.stagingPath, entityType);
        const files = readdirSync(typePath);

        for (const file of files) {
          if (file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.md')) {
            const change = this.parseStagingFile(
              path.join(typePath, file),
              entityType
            );
            if (change) {
              changes.push(change);
            }
          }
        }
      } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
        // Root-level staging files
        const change = this.parseStagingFile(
          path.join(this.stagingPath, entry.name),
          'unknown'
        );
        if (change) {
          changes.push(change);
        }
      }
    }

    return changes;
  }

  /**
   * Parse a single staging file to extract change metadata
   */
  private parseStagingFile(filePath: string, entityType: string): StagingChange | null {
    try {
      const content = readFileSync(filePath, 'utf-8');
      const stats = statSync(filePath);

      // Extract YAML frontmatter if present
      let metadata: any = {};
      if (content.startsWith('---')) {
        const endIndex = content.indexOf('---', 3);
        if (endIndex !== -1) {
          const frontmatter = content.substring(3, endIndex).trim();
          // Simple YAML parsing for key fields
          const nameMatch = frontmatter.match(/name:\s*(.+)/);
          const idMatch = frontmatter.match(/id:\s*(.+)/);
          const actionMatch = frontmatter.match(/staging_action:\s*(.+)/);
          const confidenceMatch = frontmatter.match(/confidence:\s*(\d+\.?\d*)/);

          metadata = {
            name: nameMatch?.[1]?.trim(),
            id: idMatch?.[1]?.trim(),
            action: (actionMatch?.[1]?.trim() as 'create' | 'update' | 'delete') || 'create',
            confidence: parseFloat(confidenceMatch?.[1] || '0.8')
          };
        }
      }

      // Also check for JSON metadata files
      const metaPath = filePath.replace(/\.(yaml|yml|md)$/, '.meta.json');
      if (existsSync(metaPath)) {
        const metaContent = readFileSync(metaPath, 'utf-8');
        const meta = JSON.parse(metaContent);
        metadata = { ...metadata, ...meta };
      }

      return {
        type: this.inferChangeType(entityType, metadata),
        entityType: metadata.entity_type || entityType,
        entityId: metadata.id || path.basename(filePath, path.extname(filePath)),
        entityName: metadata.name || path.basename(filePath, path.extname(filePath)),
        action: metadata.action || 'create',
        sourceFile: filePath,
        confidence: metadata.confidence || 0.8,
        timestamp: stats.mtime
      };
    } catch (error) {
      console.warn(`Failed to parse staging file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Infer the change type from entity type and metadata
   */
  private inferChangeType(
    entityType: string,
    metadata: any
  ): StagingChange['type'] {
    if (metadata.type) return metadata.type;
    if (entityType === 'meetings') return 'meeting';
    if (entityType === 'patterns') return 'pattern';
    if (entityType === 'projects') return 'project';
    if (entityType === 'decisions') return 'decision';
    if (entityType === 'action_items') return 'action_item';
    return 'entity';
  }

  // ==========================================================================
  // Sync Operations
  // ==========================================================================

  /**
   * Sync staging changes to git
   */
  async sync(options: CommitOptions = {}): Promise<SyncResult> {
    try {
      // Check for conflicts first
      const conflicts = this.checkConflicts();
      if (conflicts.hasConflicts) {
        return {
          success: false,
          changes: [],
          error: `Conflicts detected in: ${conflicts.conflictedFiles.join(', ')}`
        };
      }

      // Discover changes
      const changes = await this.discoverChanges();
      if (changes.length === 0) {
        return { success: true, changes: [] };
      }

      // Create branch if in commons mode
      let branch = this.getCurrentBranch();
      if (this.config.commonsMode) {
        branch = await this.createFeatureBranch(changes);
      }

      // Stage files
      this.stageChanges(changes);

      // Commit
      const commitHash = await this.commit(changes, options);

      // Push
      this.pushBranch(branch);

      // Create PR if in commons mode
      let prNumber: number | undefined;
      let prUrl: string | undefined;
      if (this.config.commonsMode) {
        const pr = await this.createPullRequest(branch, changes);
        prNumber = pr.number;
        prUrl = pr.url;
      }

      return {
        success: true,
        branch,
        commitHash,
        prNumber,
        prUrl,
        changes
      };
    } catch (error) {
      return {
        success: false,
        changes: [],
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Stage all changes from _staging/
   */
  private stageChanges(changes: StagingChange[]): void {
    for (const change of changes) {
      // Stage the source file and any metadata
      this.execGit(['add', change.sourceFile]);
      
      const metaPath = change.sourceFile.replace(/\.(yaml|yml|md)$/, '.meta.json');
      if (existsSync(metaPath)) {
        this.execGit(['add', metaPath]);
      }
    }

    // Also stage any data files that were updated by entity-mapper
    this.execGit(['add', 'data/']);
    this.execGit(['add', 'knowledge/']);
  }

  /**
   * Create a commit with proper message
   */
  private async commit(
    changes: StagingChange[],
    options: CommitOptions
  ): Promise<string> {
    const message = options.message || this.generateCommitMessage(changes);
    
    const args = ['commit', '-m', message];
    
    if (options.author) {
      args.push('--author', options.author);
    }
    if (options.date) {
      args.push('--date', options.date.toISOString());
    }
    if (options.sign) {
      args.push('-S');
    }

    const result = this.execGit(args);
    
    // Extract commit hash
    const hashMatch = result.match(/\[.+ ([a-f0-9]+)\]/);
    return hashMatch?.[1] || 'unknown';
  }

  /**
   * Generate a conventional commit message from changes
   */
  private generateCommitMessage(changes: StagingChange[]): string {
    if (changes.length === 1) {
      const change = changes[0];
      const action = change.action === 'create' ? 'add' : 
                    change.action === 'update' ? 'update' : 'remove';
      return `${action}(${change.type}): ${change.entityName}`;
    }

    // Group by type
    const byType = changes.reduce((acc, change) => {
      acc[change.type] = (acc[change.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const typeSummary = Object.entries(byType)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');

    return `feat(knowledge): sync ${changes.length} entities from OPAL (${typeSummary})`;
  }

  // ==========================================================================
  // Branch Management
  // ==========================================================================

  /**
   * Get current git branch
   */
  getCurrentBranch(): string {
    return this.execGit(['branch', '--show-current']).trim();
  }

  /**
   * List all branches
   */
  listBranches(): BranchInfo {
    const current = this.getCurrentBranch();
    const all = this.execGit(['branch', '--format=%(refname:short)'])
      .trim()
      .split('\n')
      .filter(Boolean);
    const remote = this.execGit(['branch', '-r', '--format=%(refname:short)'])
      .trim()
      .split('\n')
      .filter(Boolean);

    return { current, all, remote };
  }

  /**
   * Create a feature branch for review workflow
   */
  async createFeatureBranch(changes: StagingChange[]): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const typeCount = changes.length === 1 
      ? changes[0].type 
      : 'batch';
    
    const branchName = `opal-sync/${typeCount}-${timestamp}`;
    
    // Ensure we're on default branch and up to date
    this.execGit(['checkout', this.config.defaultBranch!]);
    this.execGit(['pull', this.config.remoteName!, this.config.defaultBranch!]);
    
    // Create and checkout new branch
    this.execGit(['checkout', '-b', branchName]);
    
    return branchName;
  }

  /**
   * Push branch to remote
   */
  private pushBranch(branch: string): void {
    this.execGit(['push', '-u', this.config.remoteName!, branch]);
  }

  /**
   * Delete a branch (local and remote)
   */
  async deleteBranch(branch: string, remote = false): Promise<void> {
    if (remote) {
      this.execGit(['push', this.config.remoteName!, '--delete', branch]);
    }
    
    // Switch to default branch first if needed
    if (this.getCurrentBranch() === branch) {
      this.execGit(['checkout', this.config.defaultBranch!]);
    }
    
    this.execGit(['branch', '-D', branch]);
  }

  // ==========================================================================
  // Pull Request Management
  // ==========================================================================

  /**
   * Create a pull request for commons mode
   */
  private async createPullRequest(
    branch: string,
    changes: StagingChange[]
  ): Promise<{ number: number; url: string }> {
    // Check if gh CLI is available
    try {
      execSync('which gh', { stdio: 'pipe' });
    } catch {
      throw new Error('GitHub CLI (gh) is required for PR creation in commons mode');
    }

    const title = this.generateCommitMessage(changes);
    const body = this.generatePRBody(changes);

    const result = execSync(
      `gh pr create --title "${title}" --body "${body}" --base ${this.config.defaultBranch} --head ${branch}`,
      { cwd: this.config.orgOsPath, encoding: 'utf-8' }
    );

    // Extract PR number and URL from output
    const prMatch = result.match(/\/pull\/(\d+)/);
    const urlMatch = result.match(/(https:\/\/github\.com\/[^\s]+)/);

    return {
      number: prMatch ? parseInt(prMatch[1], 10) : 0,
      url: urlMatch?.[1] || ''
    };
  }

  /**
   * Generate PR body with change details
   */
  private generatePRBody(changes: StagingChange[]): string {
    const lines = [
      '## OPAL Knowledge Sync',
      '',
      `This PR contains ${changes.length} entity update${changes.length > 1 ? 's' : ''} from OPAL processing.`,
      '',
      '### Changes',
      ''
    ];

    for (const change of changes) {
      lines.push(`- **${change.action}** \`${change.entityName}\` (${change.type}) - ${Math.round(change.confidence * 100)}% confidence`);
    }

    lines.push('');
    lines.push('### Review Checklist');
    lines.push('- [ ] Entity names are accurate');
    lines.push('- [ ] Descriptions are clear');
    lines.push('- [ ] Relationships are correct');
    lines.push('- [ ] No duplicate entries');

    if (this.config.requiredApprovals && this.config.requiredApprovals > 0) {
      lines.push('');
      lines.push(`This PR requires ${this.config.requiredApprovals} approvals before merging.`);
    }

    return lines.join('\n');
  }

  /**
   * List open pull requests
   */
  async listPullRequests(): Promise<Array<{ number: number; title: string; branch: string; state: string }>> {
    try {
      const result = execSync(
        `gh pr list --json number,title,headRefName,state`,
        { cwd: this.config.orgOsPath, encoding: 'utf-8' }
      );
      return JSON.parse(result);
    } catch {
      return [];
    }
  }

  /**
   * Vote on a pull request (commons mode)
   */
  async voteOnPR(prNumber: number, vote: 'approve' | 'request-changes' | 'comment'): Promise<void> {
    const cmd = vote === 'approve' ? 'review --approve' : 
                vote === 'request-changes' ? 'review --request-changes' : 
                'comment';
    
    execSync(
      `gh pr ${cmd} ${prNumber}`,
      { cwd: this.config.orgOsPath, stdio: 'inherit' }
    );
  }

  /**
   * Merge an approved pull request
   */
  async mergePR(prNumber: number, method: 'merge' | 'squash' | 'rebase' = 'squash'): Promise<void> {
    execSync(
      `gh pr merge ${prNumber} --${method} --auto`,
      { cwd: this.config.orgOsPath, stdio: 'inherit' }
    );
  }

  // ==========================================================================
  // Conflict Resolution
  // ==========================================================================

  /**
   * Check for merge conflicts
   */
  checkConflicts(): ConflictStatus {
    try {
      // Check for unmerged files
      const result = this.execGit(['diff', '--name-only', '--diff-filter=U']);
      const conflictedFiles = result.trim().split('\n').filter(Boolean);

      return {
        hasConflicts: conflictedFiles.length > 0,
        conflictedFiles,
        resolutionNeeded: conflictedFiles.length > 0
      };
    } catch {
      return {
        hasConflicts: true,
        conflictedFiles: [],
        resolutionNeeded: true
      };
    }
  }

  /**
   * Attempt automatic conflict resolution for simple cases
   */
  async resolveConflicts(strategy: 'ours' | 'theirs' | 'union' = 'theirs'): Promise<boolean> {
    const status = this.checkConflicts();
    if (!status.hasConflicts) {
      return true;
    }

    // For YAML data files, try to merge intelligently
    for (const file of status.conflictedFiles) {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        // Use git checkout with strategy
        this.execGit(['checkout', `--${strategy}`, '--', file]);
      }
    }

    // Mark as resolved
    this.execGit(['add', '.']);

    // Check if all resolved
    const newStatus = this.checkConflicts();
    return !newStatus.hasConflicts;
  }

  /**
   * Get conflict details for a file
   */
  getConflictDetails(filePath: string): { ours: string; theirs: string; base?: string } | null {
    try {
      const fullPath = path.join(this.config.orgOsPath, filePath);
      if (!existsSync(fullPath)) {
        return null;
      }

      const content = readFileSync(fullPath, 'utf-8');
      
      // Parse conflict markers
      const oursMatch = content.match(/<<<<<<< ours\n([\s\S]*?)=======/);
      const theirsMatch = content.match(/=======\n([\s\S]*?)>>>>>>> theirs/);

      if (oursMatch && theirsMatch) {
        return {
          ours: oursMatch[1].trim(),
          theirs: theirsMatch[1].trim()
        };
      }

      return null;
    } catch {
      return null;
    }
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  /**
   * Execute git command and return output
   */
  private execGit(args: string[], throwOnError = true): string {
    try {
      return execSync(`git ${args.join(' ')}`, {
        cwd: this.config.orgOsPath,
        encoding: 'utf-8',
        stdio: throwOnError ? 'pipe' : 'pipe'
      });
    } catch (error) {
      if (throwOnError) {
        throw new Error(`Git command failed: git ${args.join(' ')}`);
      }
      return '';
    }
  }

  /**
   * Get git status
   */
  getStatus(): { ahead: number; behind: number; modified: string[]; staged: string[] } {
    const status = this.execGit(['status', '--porcelain', '-b']);
    const lines = status.trim().split('\n');

    // Parse branch status
    const branchLine = lines[0];
    const aheadMatch = branchLine.match(/ahead (\d+)/);
    const behindMatch = branchLine.match(/behind (\d+)/);

    // Parse file status
    const modified: string[] = [];
    const staged: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (line.length < 2) continue;

      const indexStatus = line[0];
      const workTreeStatus = line[1];
      const file = line.slice(3);

      if (indexStatus !== ' ' && indexStatus !== '?') {
        staged.push(file);
      }
      if (workTreeStatus !== ' ') {
        modified.push(file);
      }
    }

    return {
      ahead: aheadMatch ? parseInt(aheadMatch[1], 10) : 0,
      behind: behindMatch ? parseInt(behindMatch[1], 10) : 0,
      modified,
      staged
    };
  }

  /**
   * Fetch latest changes from remote
   */
  fetch(remote = 'origin'): void {
    this.execGit(['fetch', remote]);
  }

  /**
   * Pull latest changes
   */
  pull(branch?: string): void {
    const target = branch || this.config.defaultBranch!;
    this.execGit(['pull', this.config.remoteName!, target]);
  }

  /**
   * Clean up merged/stale branches
   */
  async cleanupBranches(dryRun = false): Promise<string[]> {
    const branches = this.listBranches();
    const deleted: string[] = [];

    for (const branch of branches.all) {
      // Skip default branch and current branch
      if (branch === this.config.defaultBranch || branch === branches.current) {
        continue;
      }

      // Check if branch is merged
      try {
        this.execGit(['merge-base', '--is-ancestor', branch, this.config.defaultBranch!]);
        
        if (!dryRun) {
          await this.deleteBranch(branch, false);
        }
        deleted.push(branch);
      } catch {
        // Not merged, skip
      }
    }

    return deleted;
  }
}

// ============================================================================
// Export convenience functions
// ============================================================================

export function createGitSync(config: GitSyncConfig): GitSync {
  return new GitSync(config);
}

export async function syncOpalStaging(
  config: GitSyncConfig,
  options?: CommitOptions
): Promise<SyncResult> {
  const sync = new GitSync(config);
  await sync.initialize();
  return sync.sync(options);
}
