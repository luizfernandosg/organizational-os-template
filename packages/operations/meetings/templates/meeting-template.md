---
id: meeting-YYYYMMDD-HHMM
type: meeting
title: "Meeting Title"
date: YYYY-MM-DDTHH:MM:00Z
participants:
  - member-id-1
  - member-id-2
status: planned # planned, completed, cancelled
duration: PT1H # ISO-8601 duration (optional)
notion_url: "" # Notion page URL (optional, for /initialize dashboard links)
---

# {{title}}

**Date**: {{date}}  
**Participants**: {{participants}}  
**Status**: {{status}}

## Agenda

1. Agenda item 1
2. Agenda item 2
3. Agenda item 3

## Notes

[Meeting notes here]

## Decisions

- [ ] Decision 1 (#decision-1)
- [ ] Decision 2 (#decision-2)

## Action Items

- [ ] Action item 1 (@assignee, due: YYYY-MM-DD) #action-1
- [ ] Action item 2 (@assignee, due: YYYY-MM-DD) #action-2

## Related

- Related proposal: [[proposal-id]]
- Related project: [[project-id]]
