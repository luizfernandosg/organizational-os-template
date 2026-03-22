# Mock OPAL Configuration

This file contains sample OPAL configuration files for testing purposes.

## config/settings.yaml

```yaml
# OPAL Core Settings
opal:
  version: "2.1.0"
  
  # Processing Configuration
  processing:
    auto_extract: true
    extract_on_save: true
    review_required: true
    confidence_threshold: 0.7
    
  # Extraction Settings
  extraction:
    enabled: true
    entity_types:
      - person
      - organization
      - pattern
      - protocol
      - concept
    min_confidence: 0.6
    max_entities_per_doc: 50
    
  # Semantic Search
  embeddings:
    enabled: true
    provider: openai
    model: text-embedding-3-small
    dimensions: 1536
    
  # Review Queue
  review:
    enabled: true
    auto_approve_high_confidence: false
    high_confidence_threshold: 0.9
    notifications: true
    
  # Integrations
  integrations:
    meetily:
      enabled: false
    fathom:
      enabled: false
    telegram:
      enabled: false
    rss:
      enabled: false
```

## config/schema.yaml

```yaml
# OPAL Schema Definition
schema:
  version: "1.0"
  
  resource_types:
    person:
      fields:
        - name: name
          type: string
          required: true
        - name: email
          type: string
          required: false
        - name: role
          type: string
          required: false
        - name: skills
          type: array
          required: false
        - name: projects
          type: relation
          target: project
          cardinality: many
      dimensions:
        - availability
        - seniority
        - department
        
    organization:
      fields:
        - name: name
          type: string
          required: true
        - name: type
          type: enum
          values: [DAO, Foundation, Network, Council, Coop]
          required: true
        - name: focus
          type: string
          required: false
        - name: location
          type: string
          required: false
        - name: members
          type: relation
          target: person
          cardinality: many
      dimensions:
        - size
        - maturity
        - sector
        
    project:
      fields:
        - name: name
          type: string
          required: true
        - name: description
          type: text
          required: true
        - name: status
          type: enum
          values: [planning, active, completed, archived]
          required: true
        - name: team
          type: relation
          target: person
          cardinality: many
        - name: start_date
          type: date
          required: false
        - name: target_completion
          type: date
          required: false
      dimensions:
        - priority
        - category
        
    pattern:
      fields:
        - name: name
          type: string
          required: true
        - name: description
          type: text
          required: true
        - name: category
          type: enum
          values: [governance, economics, coordination, technology]
          required: true
        - name: principles
          type: array
          required: false
      dimensions:
        - complexity
        - maturity
        
    protocol:
      fields:
        - name: name
          type: string
          required: true
        - name: description
          type: text
          required: true
        - name: category
          type: string
          required: true
        - name: properties
          type: array
          required: false
      dimensions:
        - security_level
        - adoption_stage
        
    concept:
      fields:
        - name: name
          type: string
          required: true
        - name: description
          type: text
          required: true
        - name: domain
          type: string
          required: false
        - name: abbreviation
          type: string
          required: false
      dimensions:
        - abstraction_level
        - relevance
```

## .opal/config.yaml

```yaml
# User Knowledge Configuration
profile:
  name: "regen"
  description: "Regenerative ecosystem knowledge base"
  
sources:
  meetings:
    path: "content/meetings"
    type: "transcript"
    auto_process: true
    
  documents:
    path: "content/docs"
    type: "document"
    auto_process: false
    
  data:
    path: "data"
    type: "yaml"
    auto_sync: true
    
schema_path: "config/schema.yaml"

extraction:
  model: "claude-3-opus-20240229"
  temperature: 0.3
  max_tokens: 4000
  
output:
  entity_index: "_index/entities.json"
  staging_dir: "_staging"
  inbox_dir: "_inbox"
```

## config/integrations.yaml

```yaml
# Integration Configuration
integrations:
  meetily:
    enabled: false
    db_path: null
    
  fathom:
    enabled: false
    api_key: null
    
  otter:
    enabled: false
    api_key: null
    
  read_ai:
    enabled: false
    api_key: null
    
  luma:
    enabled: false
    
  telegram:
    enabled: false
    bot_token: null
    channels: []
    
  rss:
    enabled: false
    feeds: []
    
  youtube:
    enabled: false
    api_key: null
    
  notion:
    enabled: false
    token: null
    databases: []
    
  github:
    enabled: false
    token: null
    repos: []
```

## config/processing.yaml

```yaml
# Processing Pipeline Configuration
pipeline:
  inbox:
    watch: true
    patterns: ["*.md", "*.txt", "*.yaml"]
    
  classify:
    enabled: true
    use_ai: true
    
  preprocess:
    enabled: true
    cleanup_transcripts: true
    normalize_whitespace: true
    
  extract:
    enabled: true
    entity_types: [person, organization, pattern, protocol, concept]
    generate_relationships: true
    
  reconcile:
    enabled: true
    check_duplicates: true
    fuzzy_match: true
    semantic_match: true
    
  stage:
    enabled: true
    format: json
    
  review:
    enabled: true
    require_approval: true
    
  commit:
    enabled: true
    update_index: true
    git_commit: true
```
