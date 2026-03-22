/**
 * Schema Bridge - Bridge OPAL's regen template with org-os structure
 * 
 * Features:
 * - Map OPAL dimensions to org-os domains
 * - Taxonomy translation
 * - Custom schema extensions for org-os
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import path from 'path';
import YAML from 'yaml';

// ============================================================================
// Type Definitions - OPAL Schema
// ============================================================================

export interface OpalSchema {
  resource_types: OpalResourceType[];
  dimensions: OpalDimension[];
  relationships: OpalRelationship[];
}

export interface OpalResourceType {
  id: string;
  name: string;
  plural?: string;
  description?: string;
  directory: string;
  icon?: string;
  fields: OpalField[];
  regen_class?: string;
  keywords?: string[];
}

export interface OpalField {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  dimension?: string;
  to?: string;
  of?: string;
  options?: string[];
}

export interface OpalDimension {
  id: string;
  name: string;
  description?: string;
  values: OpalDimensionValue[];
}

export interface OpalDimensionValue {
  id: string;
  name: string;
  description?: string;
  sdg?: string[];
}

export interface OpalRelationship {
  id: string;
  name: string;
  description?: string;
  from: string[];
  to: string[];
  inverse?: string;
  bidirectional?: boolean;
}

// ============================================================================
// Type Definitions - OrgOS Schema
// ============================================================================

export interface OrgOsSchema {
  domains: OrgOsDomain[];
  entityTypes: OrgOsEntityType[];
  relationships: OrgOsRelationship[];
}

export interface OrgOsDomain {
  id: string;
  name: string;
  description?: string;
  tags: string[];
}

export interface OrgOsEntityType {
  id: string;
  name: string;
  plural?: string;
  description?: string;
  storage: 'yaml' | 'markdown' | 'hybrid';
  path: string;
  fields: OrgOsField[];
}

export interface OrgOsField {
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  references?: string;
}

export interface OrgOsRelationship {
  id: string;
  name: string;
  from: string;
  to: string;
  cardinality: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

// ============================================================================
// Type Definitions - Bridge Configuration
// ============================================================================

export interface SchemaBridgeConfig {
  orgOsPath: string;
  opalPath: string;
  opalProfile?: string;
  customMappings?: CustomMapping[];
  autoExtend?: boolean;
}

export interface CustomMapping {
  opalType: string;
  orgOsType: string;
  fieldMappings?: FieldMapping[];
  dimensionMappings?: DimensionMapping[];
}

export interface FieldMapping {
  opalField: string;
  orgOsField: string;
  transform?: 'direct' | 'slugify' | 'date' | 'array' | 'reference';
}

export interface DimensionMapping {
  opalDimension: string;
  orgOsDomain: string;
  valueMappings?: Record<string, string>;
}

export interface BridgeResult {
  success: boolean;
  schema?: OrgOsSchema;
  mappings?: AppliedMapping[];
  error?: string;
}

export interface AppliedMapping {
  opalType: string;
  orgOsType: string;
  path: string;
  status: 'mapped' | 'created' | 'skipped' | 'conflict';
}

// ============================================================================
// Schema Bridge Class
// ============================================================================

export class SchemaBridge {
  private config: SchemaBridgeConfig;
  private opalSchema: OpalSchema | null = null;

  constructor(config: SchemaBridgeConfig) {
    this.config = {
      opalProfile: 'default',
      autoExtend: true,
      ...config
    };
  }

  // ==========================================================================
  // OPAL Schema Loading
  // ==========================================================================

  /**
   * Load OPAL schema from .opal/schema.yaml
   */
  async loadOpalSchema(): Promise<OpalSchema> {
    const schemaPath = path.join(
      this.config.opalPath,
      '.opal',
      'schema.yaml'
    );

    if (!existsSync(schemaPath)) {
      // Try to load from profile
      const profileSchemaPath = path.join(
        this.config.opalPath,
        '.opal',
        'profiles',
        this.config.opalProfile!,
        'schema.yaml'
      );

      if (existsSync(profileSchemaPath)) {
        return this.parseOpalSchema(profileSchemaPath);
      }

      // Load default regen template
      const regenTemplatePath = path.join(
        this.config.opalPath,
        '.claude',
        'templates',
        'regen',
        'manifest.yaml'
      );

      if (existsSync(regenTemplatePath)) {
        return this.parseOpalSchemaFromManifest(regenTemplatePath);
      }

      throw new Error(`OPAL schema not found at ${schemaPath}`);
    }

    return this.parseOpalSchema(schemaPath);
  }

  private parseOpalSchema(schemaPath: string): OpalSchema {
    const content = readFileSync(schemaPath, 'utf-8');
    const parsed = YAML.parse(content);

    return {
      resource_types: parsed.resource_types || parsed.schema?.resource_types || [],
      dimensions: parsed.dimensions || parsed.schema?.dimensions || [],
      relationships: parsed.relationships || parsed.schema?.relationships || []
    };
  }

  private parseOpalSchemaFromManifest(manifestPath: string): OpalSchema {
    const content = readFileSync(manifestPath, 'utf-8');
    const parsed = YAML.parse(content);

    return {
      resource_types: parsed.schema?.resource_types || [],
      dimensions: parsed.schema?.dimensions || [],
      relationships: parsed.schema?.relationships || []
    };
  }

  // ==========================================================================
  // Schema Translation
  // ==========================================================================

  /**
   * Translate OPAL schema to org-os schema
   */
  async translateToOrgOs(): Promise<BridgeResult> {
    try {
      this.opalSchema = await this.loadOpalSchema();

      const orgOsSchema: OrgOsSchema = {
        domains: this.translateDimensions(),
        entityTypes: this.translateResourceTypes(),
        relationships: this.translateRelationships()
      };

      // Apply custom mappings
      if (this.config.customMappings) {
        this.applyCustomMappings(orgOsSchema);
      }

      // Auto-extend with org-os specific types
      if (this.config.autoExtend) {
        this.extendWithOrgOsTypes(orgOsSchema);
      }

      // Save schema
      await this.saveOrgOsSchema(orgOsSchema);

      // Generate mapping report
      const mappings = this.generateMappingReport();

      return {
        success: true,
        schema: orgOsSchema,
        mappings
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Translate OPAL dimensions to org-os domains
   */
  private translateDimensions(): OrgOsDomain[] {
    if (!this.opalSchema) return [];

    return this.opalSchema.dimensions.map(dim => ({
      id: this.slugify(dim.id),
      name: dim.name,
      description: dim.description,
      tags: [dim.id, 'opal-imported']
    }));
  }

  /**
   * Translate OPAL resource types to org-os entity types
   */
  private translateResourceTypes(): OrgOsEntityType[] {
    if (!this.opalSchema) return [];

    return this.opalSchema.resource_types.map(type => {
      // Determine storage strategy
      let storage: OrgOsEntityType['storage'] = 'markdown';
      let entityPath = type.directory;

      // Map to org-os paths based on type
      if (type.id === 'person' || type.id === 'organization') {
        storage = 'yaml';
        entityPath = 'data/members.yaml';
      } else if (type.id === 'project') {
        storage = 'yaml';
        entityPath = 'data/projects.yaml';
      } else if (type.id === 'pattern') {
        storage = 'hybrid';
        entityPath = 'knowledge/patterns/';
      } else if (type.id === 'meeting') {
        storage = 'yaml';
        entityPath = 'data/meetings.yaml';
      }

      return {
        id: this.slugify(type.id),
        name: type.name,
        plural: type.plural,
        description: type.description,
        storage,
        path: entityPath,
        fields: type.fields.map(f => this.translateField(f))
      };
    });
  }

  /**
   * Translate a single OPAL field to org-os field
   */
  private translateField(opalField: OpalField): OrgOsField {
    let fieldType = opalField.type;
    let references: string | undefined;

    // Map OPAL types to org-os types
    switch (opalField.type) {
      case 'reference':
        fieldType = 'string';
        references = opalField.to;
        break;
      case 'references':
        fieldType = 'array';
        references = opalField.to;
        break;
      case 'list':
        fieldType = 'array';
        break;
      case 'dimension':
        fieldType = 'string';
        break;
      case 'enum':
        fieldType = 'string';
        break;
      case 'text':
        fieldType = 'text';
        break;
      case 'url':
        fieldType = 'string';
        break;
    }

    return {
      name: opalField.name,
      type: fieldType,
      required: opalField.required,
      description: opalField.description,
      references
    };
  }

  /**
   * Translate OPAL relationships to org-os relationships
   */
  private translateRelationships(): OrgOsRelationship[] {
    if (!this.opalSchema) return [];

    return this.opalSchema.relationships.map(rel => ({
      id: this.slugify(rel.id),
      name: rel.name,
      from: rel.from[0] || 'unknown',
      to: rel.to[0] || 'unknown',
      cardinality: rel.bidirectional ? 'many-to-many' : 'one-to-many'
    }));
  }

  // ==========================================================================
  // Custom Mappings & Extensions
  // ==========================================================================

  /**
   * Apply custom mappings to org-os schema
   */
  private applyCustomMappings(schema: OrgOsSchema): void {
    if (!this.config.customMappings) return;

    for (const mapping of this.config.customMappings) {
      const entityType = schema.entityTypes.find(
        et => et.id === this.slugify(mapping.opalType)
      );

      if (!entityType) continue;

      // Apply field mappings
      if (mapping.fieldMappings) {
        for (const fm of mapping.fieldMappings) {
          const field = entityType.fields.find(f => f.name === fm.opalField);
          if (field) {
            field.name = fm.orgOsField;
          }
        }
      }

      // Apply dimension mappings (translate tags)
      if (mapping.dimensionMappings) {
        for (const dm of mapping.dimensionMappings) {
          const domain = schema.domains.find(d => d.id === this.slugify(dm.opalDimension));
          if (domain) {
            domain.id = this.slugify(dm.orgOsDomain);
            domain.name = dm.orgOsDomain;
          }
        }
      }
    }
  }

  /**
   * Extend schema with org-os specific entity types
   */
  private extendWithOrgOsTypes(schema: OrgOsSchema): void {
    // Add member type if not present
    if (!schema.entityTypes.some(et => et.id === 'member')) {
      schema.entityTypes.push({
        id: 'member',
        name: 'Member',
        plural: 'Members',
        description: 'Organizational member (person or organization)',
        storage: 'yaml',
        path: 'data/members.yaml',
        fields: [
          { name: 'id', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'role', type: 'string' },
          { name: 'type', type: 'string' },
          { name: 'joined', type: 'date' },
          { name: 'wallet', type: 'string' },
          { name: 'email', type: 'string' },
          { name: 'telegram', type: 'string' }
        ]
      });
    }

    // Add funding opportunity type
    if (!schema.entityTypes.some(et => et.id === 'funding-opportunity')) {
      schema.entityTypes.push({
        id: 'funding-opportunity',
        name: 'Funding Opportunity',
        plural: 'Funding Opportunities',
        description: 'Grant or funding opportunity',
        storage: 'yaml',
        path: 'data/funding-opportunities.yaml',
        fields: [
          { name: 'id', type: 'string', required: true },
          { name: 'name', type: 'string', required: true },
          { name: 'funder', type: 'string' },
          { name: 'amount', type: 'string' },
          { name: 'deadline', type: 'date' },
          { name: 'status', type: 'string' }
        ]
      });
    }
  }

  // ==========================================================================
  // Schema Persistence
  // ==========================================================================

  /**
   * Save org-os schema to file
   */
  private async saveOrgOsSchema(schema: OrgOsSchema): Promise<void> {
    const schemaDir = path.join(this.config.orgOsPath, '.org-os');
    if (!existsSync(schemaDir)) {
      mkdirSync(schemaDir, { recursive: true });
    }

    const schemaPath = path.join(schemaDir, 'schema.yaml');
    writeFileSync(schemaPath, YAML.stringify(schema), 'utf-8');
  }

  /**
   * Load org-os schema
   */
  async loadOrgOsSchema(): Promise<OrgOsSchema | null> {
    const schemaPath = path.join(this.config.orgOsPath, '.org-os', 'schema.yaml');
    
    if (!existsSync(schemaPath)) {
      return null;
    }

    try {
      const content = readFileSync(schemaPath, 'utf-8');
      return YAML.parse(content);
    } catch {
      return null;
    }
  }

  // ==========================================================================
  // Taxonomy Translation
  // ==========================================================================

  /**
   * Translate a value from OPAL taxonomy to org-os taxonomy
   */
  translateValue(
    dimensionId: string,
    valueId: string,
    customMappings?: Record<string, string>
  ): string {
    // Check custom mappings first
    if (customMappings?.[valueId]) {
      return customMappings[valueId];
    }

    // Default mappings for common dimensions
    const defaultMappings: Record<string, Record<string, string>> = {
      'civic_sector': {
        'governance': 'governance-political',
        'economic': 'economic-resource-sharing',
        'environment': 'environmental-sustainability',
        'food': 'food-agriculture'
      },
      'civic_scale': {
        'household': 'local-household',
        'neighborhood': 'local-neighborhood',
        'municipal': 'regional-municipal',
        'bioregional': 'regional-bioregional',
        'national': 'national',
        'international': 'international',
        'planetary': 'planetary'
      },
      'ecological_domain': {
        'soil-carbon': 'agriculture-soil',
        'biodiversity': 'ecology-biodiversity',
        'blue-carbon': 'marine-coastal',
        'forest-carbon': 'forestry-carbon',
        'agroforestry': 'agriculture-forestry'
      }
    };

    return defaultMappings[dimensionId]?.[valueId] || valueId;
  }

  /**
   * Generate taxonomy bridge file for federation
   */
  async generateTaxonomyBridge(): Promise<string> {
    if (!this.opalSchema) {
      this.opalSchema = await this.loadOpalSchema();
    }

    const bridge: Record<string, any> = {
      'opal-version': '1.0',
      'org-os-version': '3.0',
      mappings: {}
    };

    for (const dimension of this.opalSchema.dimensions) {
      bridge.mappings[dimension.id] = {
        'opal-dimension': dimension.name,
        'org-os-domain': this.translateDimensionName(dimension.name),
        values: {}
      };

      for (const value of dimension.values) {
        bridge.mappings[dimension.id].values[value.id] = {
          'opal-value': value.name,
          'org-os-tag': this.translateValue(dimension.id, value.id),
          description: value.description
        };
      }
    }

    // Save bridge file
    const bridgePath = path.join(
      this.config.orgOsPath,
      '.org-os',
      'opal-taxonomy-bridge.yaml'
    );
    writeFileSync(bridgePath, YAML.stringify(bridge), 'utf-8');

    return bridgePath;
  }

  private translateDimensionName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  // ==========================================================================
  // Validation & Reporting
  // ==========================================================================

  /**
   * Validate schema compatibility
   */
  async validate(): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    try {
      const opalSchema = await this.loadOpalSchema();
      const orgOsSchema = await this.loadOrgOsSchema();

      if (!orgOsSchema) {
        errors.push('OrgOS schema not found. Run translateToOrgOs() first.');
        return { valid: false, errors };
      }

      // Check that all OPAL types have mappings
      for (const opalType of opalSchema.resource_types) {
        const mapped = orgOsSchema.entityTypes.some(
          et => et.id === this.slugify(opalType.id)
        );
        if (!mapped) {
          errors.push(`OPAL type "${opalType.id}" has no org-os mapping`);
        }
      }

      // Check for field type compatibility
      for (const entityType of orgOsSchema.entityTypes) {
        for (const field of entityType.fields) {
          if (!this.isValidFieldType(field.type)) {
            errors.push(`Invalid field type "${field.type}" in ${entityType.id}.${field.name}`);
          }
        }
      }

      return { valid: errors.length === 0, errors };
    } catch (error) {
      errors.push(`Validation failed: ${error instanceof Error ? error.message : String(error)}`);
      return { valid: false, errors };
    }
  }

  private isValidFieldType(type: string): boolean {
    const validTypes = [
      'string', 'number', 'boolean', 'date', 'datetime',
      'text', 'array', 'object', 'reference', 'url'
    ];
    return validTypes.includes(type);
  }

  /**
   * Generate mapping report
   */
  private generateMappingReport(): AppliedMapping[] {
    if (!this.opalSchema) return [];

    return this.opalSchema.resource_types.map(type => {
      let orgOsType = this.slugify(type.id);
      let status: AppliedMapping['status'] = 'mapped';

      // Check for special mappings
      if (type.id === 'person') {
        orgOsType = 'member';
      } else if (type.id === 'organization') {
        orgOsType = 'member';
        status = 'mapped';
      }

      return {
        opalType: type.id,
        orgOsType,
        path: type.directory,
        status
      };
    });
  }

  /**
   * Generate schema documentation
   */
  async generateDocumentation(): Promise<string> {
    const orgOsSchema = await this.loadOrgOsSchema();
    if (!orgOsSchema) {
      throw new Error('No org-os schema found. Run translateToOrgOs() first.');
    }

    const lines = [
      '# OrgOS Schema Documentation',
      '',
      'Auto-generated from OPAL schema translation.',
      '',
      '## Domains',
      ''
    ];

    for (const domain of orgOsSchema.domains) {
      lines.push(`### ${domain.name}`);
      lines.push('');
      if (domain.description) {
        lines.push(domain.description);
        lines.push('');
      }
      lines.push(`**Tags:** ${domain.tags.join(', ')}`);
      lines.push('');
    }

    lines.push('## Entity Types');
    lines.push('');

    for (const entityType of orgOsSchema.entityTypes) {
      lines.push(`### ${entityType.name}`);
      lines.push('');
      if (entityType.description) {
        lines.push(entityType.description);
        lines.push('');
      }
      lines.push(`- **Storage:** ${entityType.storage}`);
      lines.push(`- **Path:** ${entityType.path}`);
      lines.push('');
      lines.push('| Field | Type | Required | Description |');
      lines.push('|-------|------|----------|-------------|');
      
      for (const field of entityType.fields) {
        const required = field.required ? 'Yes' : 'No';
        const desc = field.description || '';
        lines.push(`| ${field.name} | ${field.type} | ${required} | ${desc} |`);
      }
      
      lines.push('');
    }

    lines.push('## Relationships');
    lines.push('');

    for (const rel of orgOsSchema.relationships) {
      lines.push(`- **${rel.name}**: ${rel.from} → ${rel.to} (${rel.cardinality})`);
    }

    const docPath = path.join(this.config.orgOsPath, '.org-os', 'SCHEMA.md');
    writeFileSync(docPath, lines.join('\n'), 'utf-8');

    return docPath;
  }

  // ==========================================================================
  // Utility Methods
  // ==========================================================================

  private slugify(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

// ============================================================================
// Export convenience functions
// ============================================================================

export function createSchemaBridge(config: SchemaBridgeConfig): SchemaBridge {
  return new SchemaBridge(config);
}

export async function translateOpalSchema(
  config: SchemaBridgeConfig
): Promise<BridgeResult> {
  const bridge = new SchemaBridge(config);
  return bridge.translateToOrgOs();
}

export async function validateSchemaBridge(
  config: SchemaBridgeConfig
): Promise<{ valid: boolean; errors: string[] }> {
  const bridge = new SchemaBridge(config);
  return bridge.validate();
}
