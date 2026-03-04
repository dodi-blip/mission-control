# Mission Control - Deployment Guide

## 🚀 Quick Deploy to Render (Free)

### Step 1: Push to GitHub

```bash
cd mission-control-dashboard
git remote add origin https://github.com/YOUR_USERNAME/mission-control.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Render

1. Go to https://dashboard.render.com
2. Click **"New"** → **"Web Service"**
3. Select "Build and deploy from a Git repository"
4. Connect your GitHub account if needed
5. Select your `mission-control` repo
6. Render will auto-detect `render.yaml` with:
   - **Name**: mission-control
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

7. Add environment variable:
   - **Key**: `CLICKUP_TOKEN`
   - **Value**: `pk_10935568_X9CYUYXG7KGVUHF0J6T86HMOTGN44AAP`

8. Click **"Create Web Service"**

Render will build and deploy in ~2-3 minutes. You'll get a URL like:
```
https://mission-control-xxxxx.onrender.com
```

---

## 🔧 Local Testing

```bash
cd mission-control-dashboard
npm install
PORT=3000 npm start
```

Visit: http://localhost:3000

Click **"↻ Refresh"** to fetch latest ClickUp data.

---

## 📊 Dashboard Sections

- **🚀 Current Work**: Tasks marked "in progress"
- **📋 Task Queue**: All other active tasks
- **⏳ Waiting on Dodi**: Tasks with "dodi" in the name
- **✅ Recent Completions**: Last 10 closed tasks
- **🔴 Blockers**: Urgent priority items
- **Health Summary**: Load, blockers, queue count

---

## ⚡ How It Works

1. **Backend** (Express) fetches from ClickUp API every 5 min
2. **Frontend** (HTML/CSS/JS) displays cached data
3. **Refresh Button** pulls latest data on-demand
4. **Auto-Refresh** every 5 minutes in background
5. **Rate Limiting**: ~50 req/min on free ClickUp tier

---

## 🔐 Security Notes

- Token is in environment variable (not in code)
- Free Render tier: may sleep after 15 min idle
- API key rotates monthly in production

---

## 🛠️ Common Issues

**Dashboard shows "No items"?**
- Wait 5-10 seconds and click Refresh
- Check ClickUp workspace has tasks assigned
- Verify token in Render env vars

**Port conflicts locally?**
- Change: `PORT=3001 npm start`

**Deploy stuck?**
- Check Render logs: Dashboard → Logs
- Verify GitHub connection is active
- Re-deploy via "Redeploy" button

---

## 📝 Next Steps

After deploy, update these files:
1. Edit `server.js` to add more data categories
2. Modify `public/index.html` for custom styling
3. Add project filtering/sorting
4. Create detailed task view modal

---

**Deployed Dashboard**: *(URL will appear after Render deploy)*
