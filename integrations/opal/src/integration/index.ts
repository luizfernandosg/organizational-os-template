/**
 * OPAL Bridge Integration Layer
 * 
 * Provides bidirectional synchronization between OPAL (Open Protocol Agent Librarian)
 * and Organizational OS data structures.
 */

// Entity Mapper
export {
  EntityMapper,
  createEntityMapper,
  mapEntityToOrgOs,
  mapOrgOsToOpal,
  OpalEntity,
  OrgOsMember,
  OrgOsProject,
  OrgOsPattern,
  OrgOsMeeting,
  OrgOsDecision,
  OrgOsActionItem,
  MappingConfig,
  MappingResult
} from './entity-mapper.js';

// Git Sync
export {
  GitSync,
  createGitSync,
  syncOpalStaging,
  GitSyncConfig,
  StagingChange,
  SyncResult,
  CommitOptions,
  BranchInfo,
  ConflictStatus
} from './git-sync.js';

// Meeting Pipeline
export {
  MeetingPipeline,
  createMeetingPipeline,
  processMeetingTranscript,
  MeetingTranscript,
  TranscriptMetadata,
  ExtractedMeeting,
  ExtractedAttendee,
  ExtractedDecision,
  ExtractedActionItem,
  ExtractedTopic,
  MeetingPipelineConfig,
  PipelineResult,
  CalendarEvent
} from './meeting-pipeline.js';

// Schema Bridge
export {
  SchemaBridge,
  createSchemaBridge,
  translateOpalSchema,
  validateSchemaBridge,
  OpalSchema,
  OpalResourceType,
  OpalDimension,
  OrgOsSchema,
  OrgOsDomain,
  OrgOsEntityType,
  SchemaBridgeConfig,
  BridgeResult,
  CustomMapping
} from './schema-bridge.js';

// Config Loader
export {
  ConfigLoader,
  createConfigLoader,
  loadMergedConfig,
  validateConfig,
  generateOpalConfigForOrgOs,
  OrgOsConfig,
  OrgOsIdentity,
  OrgOsAgentConfig,
  OpalConfig,
  OpalFederationConfig,
  MergedConfig,
  BridgeConfig,
  ResolvedConfig,
  ConfigValidationResult
} from './config-loader.js';
