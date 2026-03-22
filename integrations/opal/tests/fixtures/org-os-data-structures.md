# org-os Data Structures

This directory contains sample org-os YAML data structures for testing the OPAL bridge.

## members.yaml

Structure for organizational members:

```yaml
members:
  - id: alice
    name: Alice Johnson
    role: Lead Developer
    email: alice@example.com
    skills: [typescript, rust, distributed-systems]
    projects: [opal-bridge, knowledge-graph]
    availability: full-time
    joined_date: 2025-06-15
    
  - id: bob
    name: Bob Smith
    role: Product Manager
    email: bob@example.com
    skills: [product-strategy, user-research, coordination]
    projects: [opal-bridge]
    availability: full-time
    joined_date: 2025-08-20
    
  - id: carol
    name: Carol Williams
    role: UX Designer
    email: carol@example.com
    skills: [ui-design, user-research, figma]
    projects: [knowledge-graph]
    availability: part-time
    joined_date: 2026-01-10
```

## projects.yaml

Structure for project tracking:

```yaml
projects:
  - id: opal-bridge
    name: OPAL Bridge Integration
    description: Bridge between OPAL knowledge system and org-os
    status: active
    priority: high
    team: [alice, bob]
    start_date: 2026-02-01
    target_completion: 2026-04-15
    milestones:
      - name: Initial API
        status: completed
        date: 2026-02-15
      - name: Entity Extraction
        status: in-progress
        date: 2026-03-20
      - name: Human Review Pipeline
        status: planned
        date: 2026-04-01
    tags: [opal, ai, knowledge-management]
    
  - id: knowledge-graph
    name: Knowledge Graph Explorer
    description: Visualization and exploration tool for organizational knowledge
    status: planning
    priority: medium
    team: [alice, carol]
    start_date: 2026-04-01
    target_completion: 2026-06-30
    milestones:
      - name: Requirements Gathering
        status: in-progress
        date: 2026-03-15
    tags: [visualization, knowledge-graph, ui]
```

## meetings.yaml

Structure for meeting tracking:

```yaml
meetings:
  - id: meeting-001
    title: Weekly Coordination
    date: 2026-03-15
    time: 15:00-16:30 UTC
    duration_minutes: 90
    attendees: [alice, bob, carol]
    facilitator: alice
    type: coordination
    status: completed
    recording_url: https://example.com/recording/001
    transcript_path: content/meetings/2026-03-15-weekly-coordination.md
    decisions:
      - Adopt distributed coordination pattern
      - Move to bi-weekly meetings
    action_items:
      - id: ai-1
        task: Finalize API documentation
        owner: alice
        due_date: 2026-03-22
        status: pending
    tags: [weekly, coordination]
    
  - id: meeting-002
    title: Product Strategy Session
    date: 2026-03-20
    time: 14:00-16:00 UTC
    duration_minutes: 120
    attendees: [bob, carol]
    facilitator: bob
    type: strategy
    status: scheduled
    tags: [strategy, planning]
```

## finances.yaml

Structure for financial tracking:

```yaml
finances:
  grants:
    - id: grant-001
      name: ReFi Foundation Q1 Grant
      amount: 50000
      currency: USD
      status: active
      start_date: 2026-01-01
      end_date: 2026-06-30
      funder: ReFi Foundation
      reporting_requirements: monthly
      
  expenses:
    - id: exp-001
      category: infrastructure
      amount: 250
      currency: USD
      date: 2026-03-01
      description: Server hosting costs
      project: opal-bridge
      approved_by: bob
      
  budget:
    fiscal_year: 2026
    total_budget: 150000
    allocated:
      opal-bridge: 60000
      knowledge-graph: 40000
      operations: 50000
    spent_to_date: 15000
    remaining: 135000
```

## federation.yaml

Configuration for OPAL bridge:

```yaml
knowledge-commons:
  enabled: true
  opal-bridge:
    enabled: true
    opal_path: "../../opal"
    profile: "regen"
    auto_process: true
    review_required: true
    extract_patterns: true
    extract_people: true
    extract_organizations: true
    
  koi:
    enabled: false
    endpoint: "https://koi.regen.network"
    topics: ["regenerative-finance", "governance"]
    
git:
  remote: origin
  branch: main
  auto_sync: true
  
notifications:
  discord:
    webhook_url: "${DISCORD_WEBHOOK_URL}"
    channel: "#opal-updates"
```
