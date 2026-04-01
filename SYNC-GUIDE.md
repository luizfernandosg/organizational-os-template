# GitHub Sync Guide for Org-OS Users

**Quick guide for syncing your changes without needing git knowledge**

---

## Two Essential Commands

### 1. Initialize (First Time Only)

```bash
npm run setup
```

This sets up your organization for the first time. Run it once when you fork the template.

---

### 2. Sync Your Changes

```bash
npm run sync
```

This syncs your local changes with GitHub. Use it frequently!

---

## The Easy Way: Interactive Menu

Just type:

```bash
npm run sync
```

You'll see a friendly menu:

```
🔄 Organizational OS - GitHub Sync

What would you like to do?
  📊 Check status      - See what changed
  ⬇️  Pull changes     - Get latest from GitHub
  🚀 Push changes      - Commit and send to GitHub
  🔄 Full Sync         - Pull, check, commit, and push
  📚 Help              - Learn more
```

Pick what you need!

---

## Common Workflows

### Scenario 1: Starting Your Day

```bash
npm run sync
# Select: ⬇️  Pull changes
```

This gets any updates your team made.

---

### Scenario 2: You Made Changes, Ready to Save

```bash
npm run sync
# Select: 🚀 Push changes
# It will ask for a commit message
# Type something like: "Updated member list and meeting notes"
```

---

### Scenario 3: End of Day Complete Sync

```bash
npm run sync
# Select: 🔄 Full Sync
```

This does everything:

1. Gets latest from GitHub
2. Shows your changes
3. Asks if you want to commit
4. Pushes everything

---

### Scenario 4: Just Want to Check What Changed?

```bash
npm run sync
# Select: 📊 Check status
```

---

## Quick Commands (For the Impatient)

```bash
npm run sync -- pull      # Get latest changes
npm run sync -- status    # Check what changed
npm run sync -- push      # Commit and push
npm run sync -- full      # Complete sync
```

---

## Tips for Writing Commit Messages

When the sync command asks for a commit message, be clear and descriptive:

- ✅ **Good**: "Add Sarah Chen as treasurer, update Q2 budget"
- ✅ **Good**: "Update meeting notes from April 2nd sync call"
- ✅ **Good**: "Fix typo in governance document"
- ❌ **Vague**: "updates"
- ❌ **Vague**: "changes"
- ❌ **Empty**: Just hitting enter

---

## What If Something Goes Wrong?

### "I see confusing git errors"

1. Don't panic! Errors are usually easy to fix.
2. Try again with:
   ```bash
   npm run sync -- status
   ```
3. This shows exactly what's happening.

### "I want to see exactly what changed"

```bash
npm run sync -- status
```

This shows every file that changed.

### "Someone else changed something I changed"

This is a "merge conflict." Here's what to do:

1. Pull to get their changes:

   ```bash
   npm run sync
   # Select: ⬇️  Pull changes
   ```

2. Open your editor and look for lines with `<<<<<<<` (git will show you)
3. Decide which version you want to keep
4. Remove the conflict markers
5. Try syncing again:
   ```bash
   npm run sync -- push
   ```

---

## Where to Get Help

- **Quick help**: `npm run sync -- help`
- **Full commands guide**: Check `docs/COMMANDS.md`
- **Issues**: GitHub Issues section
- **Questions**: GitHub Discussions section

---

## What's Really Happening?

**Simplifying git into 4 operations:**

| Command    | What It Does                     | For Beginners                       |
| ---------- | -------------------------------- | ----------------------------------- |
| **Pull**   | Get latest updates from GitHub   | Like downloading the latest version |
| **Status** | See what changed locally         | Like checking your notebook         |
| **Commit** | Save your changes with a message | Like saving a document with a note  |
| **Push**   | Send your changes to GitHub      | Like uploading to the cloud         |

---

## Remember

- **Start work**: `npm run sync -- pull`
- **During work**: `npm run sync -- status` (whenever you want to check)
- **End work**: `npm run sync -- push` or `npm run sync -- full`

That's it! You don't need to know git—just use `npm run sync`.

---

## See Also

- [Complete Commands Guide](docs/COMMANDS.md)
- [Setup Instructions](docs/SETUP.md)
- [Organization Identity](docs/EIP4824-GUIDE.md)

_Built for organizations by the Regen Coordination community_
