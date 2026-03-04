# HEARTBEAT.md

## Daily Reminders

### Google Ads API Billing Check (include in morning brief TO-DO list)
- Status: Waiting for quota approval + billing account activation
- Show in: Morning brief as priority task
- Action: Once billing is active, run sync script: `cd ~/.openclaw/workspace/.config && node google-ads-sync.js`
- Context: See `memory/google-ads-setup.md` for full details

### Meta Ads Setup (include in TO-DO when ready)
- Status: Paused — app is live, need redirect URI fix
- Action: Add `https://furnicher.com/auth/callback` to app Valid OAuth Redirect URIs
- Context: See `memory/meta-ads-setup.md` for full details

### Marketing Automation Setup (include in morning brief TO-DO list)
- Status: Ready to launch — waiting for: (1) which month to plan first, (2) discount %s (storewide + extra for existing customers)
- Show in: Morning brief as priority task (not separate message)
- Context: ClickUp connected, team roles mapped, workflow designed
- Remove from TO-DO once month + discounts confirmed

### Daily Hello + EOD Recap — ✅ LIVE
- Morning brief: 08:00 Dubai time daily (cron: morning-brief)
  - Includes: Your ClickUp tasks (today + upcoming), overdue tasks from colleagues, emails, calendar
- EOD recap: 17:00 Dubai time daily (cron: eod-recap)
- Friday meeting prep: 08:00 Amsterdam time every Friday (cron: friday-meeting-prep)
- Note: Crons are set to Dubai timezone. If Dodi travels, update timezone in crons.

## Periodic Checks (rotate, 2-4x per day)
- Email: Check for urgent unread (dodi@furnicher.com, dodi@interioreditions.com)
- Calendar: Upcoming events in next 24-48h
