# Data Sync for Mission Control

The Mission Control dashboard displays your workspace data (ClickUp tasks, reminders, crons, ideas). To keep the dashboard in sync with your workspace files, use the sync script.

## Files Synced

- **HEARTBEAT.md** → `data/HEARTBEAT.md` (reminders)
- **memory/ideas.md** → `data/ideas.md` (ideas backlog)
- **.config/crons.json** → `data/crons.json` (scheduled jobs)

## Automatic Sync (Recommended)

A cron job runs **every 30 minutes** to automatically sync your workspace files:

```bash
*/30 * * * * /root/.openclaw/workspace/mission-control-dashboard/sync-data.sh >> /tmp/mission-control-sync.log 2>&1
```

**Check the sync log:**
```bash
tail -f /tmp/mission-control-sync.log
```

## Manual Sync

If you need an immediate sync (e.g., after updating ideas.md), run:

```bash
/root/.openclaw/workspace/mission-control-dashboard/sync-data.sh
```

The script will:
1. Copy your workspace files to the `data/` directory
2. Detect changes
3. Commit and push to GitHub if anything changed
4. Render auto-deploys the new version

## What Happens

**After you update:**
- `HEARTBEAT.md` → Reminders section updates within 30 min
- `memory/ideas.md` → Ideas backlog updates within 30 min
- `.config/crons.json` → Scheduled automation updates within 30 min

**On the dashboard:**
- Click **"↻ Refresh"** to see the latest data immediately
- Auto-refresh every 5 minutes will also pick up changes

## Troubleshooting

If the sync doesn't work:

```bash
# Check the log
cat /tmp/mission-control-sync.log

# Run manually to see errors
/root/.openclaw/workspace/mission-control-dashboard/sync-data.sh

# Verify Git is set up
cd /root/.openclaw/workspace/mission-control-dashboard
git remote -v
git status
```

---

**Manual vs Automatic:**
- **Automatic (every 30 min):** Fire and forget — updates happen in the background
- **Manual:** Useful for immediate updates or testing
