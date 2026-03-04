#!/bin/bash
# Quick start script for Mission Control deployment

echo "📊 Mission Control Dashboard - Quick Start"
echo "=========================================="
echo ""

# Check if git is configured
if ! git config user.email &> /dev/null; then
    echo "Setting up git..."
    git config --global user.email "drizzy@openclaw.local"
    git config --global user.name "Drizzy"
fi

# Option 1: Local testing
echo "Option 1: Test locally"
echo "Run: npm start"
echo "Visit: http://localhost:3000"
echo ""

# Option 2: Push to GitHub and deploy
echo "Option 2: Deploy to Render (recommended)"
echo ""
echo "Step 1: Create GitHub repo"
echo "  - Go to https://github.com/new"
echo "  - Name it 'mission-control'"
echo "  - Don't add README/gitignore (we have them)"
echo ""
echo "Step 2: Push this repo"
echo "  cd mission-control-dashboard"
echo "  git remote add origin https://github.com/YOUR_USERNAME/mission-control.git"
echo "  git branch -M main"
echo "  git push -u origin main"
echo ""
echo "Step 3: Deploy to Render"
echo "  - Go to https://dashboard.render.com"
echo "  - Click 'New' > 'Web Service'"
echo "  - Connect your GitHub account"
echo "  - Select 'mission-control' repo"
echo "  - Environment variables:"
echo "    - CLICKUP_TOKEN=pk_10935568_X9CYUYXG7KGVUHF0J6T86HMOTGN44AAP"
echo "  - Click 'Create Web Service'"
echo ""
echo "✅ Dashboard will be live in 2-3 minutes!"
echo ""
echo "📊 Once deployed:"
echo "  - Your dashboard URL: https://mission-control-xxxxx.onrender.com"
echo "  - Click the Refresh button to fetch ClickUp data"
echo "  - Auto-refreshes every 5 minutes"
echo ""
