---
description: Initialize org-os workspace — render visual dashboard with projects, tasks, calendar, and cheatsheets
---

Load the **org-os-init** skill for detailed formatting instructions.

Here is the current organizational state as structured JSON:

```json
!`node scripts/initialize.mjs`
```

Render the full org-os initialization dashboard following the skill's visual language specification. Use ASCII block-letter art for the org name banner, Unicode box-drawing for panels, and the prescribed status indicators for all items.

After rendering the dashboard, ask what the operator would like to work on — with 3 contextual suggestions based on what's most urgent in the data.
