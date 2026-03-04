# Mission Control Dashboard

Real-time operations dashboard for Drizzy, pulling data from ClickUp and local memory.

## Features

- **Current Work**: Tasks in progress
- **Task Queue**: Scheduled items
- **Recent Completions**: Last 10 finished tasks
- **Waiting on Dodi**: Decision/approval items
- **Health Summary**: Blockers and current load
- **On-Demand Refresh**: Click button to fetch latest data
- **Auto-Refresh**: Updates every 5 minutes

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: HTML5 + CSS3 + Vanilla JS
- **Data Source**: ClickUp API

## Local Setup

```bash
npm install
npm start
# Visit http://localhost:3000
```

## Deploy to Render

1. Push this repo to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Web Service"
4. Connect your GitHub repo
5. Render will auto-detect `render.yaml` and deploy

**Render Config:**
- Plan: Free (auto-hibernates after 15 min of inactivity)
- Node version: 18.x
- Start command: `node server.js`

## Environment Variables

ClickUp token is hardcoded in `server.js`. To make it secure:
1. Set `CLICKUP_TOKEN` env var in Render dashboard
2. Update `server.js` line 3 to use: `const CLICKUP_TOKEN = process.env.CLICKUP_TOKEN;`

## API Endpoints

- `GET /` - Dashboard UI
- `GET /api/refresh` - Fetch latest data from ClickUp
- `GET /api/status` - Current cached status

## Performance Notes

- ClickUp API has rate limits (~50 req/min for free accounts)
- Data cached after fetch, auto-refreshes every 5 minutes
- Frontend refreshes on-demand via button
- Free Render tier may have cold starts (first load after 15 min idle)

## Future Enhancements

- Filter by project/list
- Task detail view
- Custom status categories
- Dark/light theme toggle
- Mobile-responsive improvements
