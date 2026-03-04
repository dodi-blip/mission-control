#!/bin/bash

# Mission Control Data Sync Script
# Syncs workspace files to the dashboard data directory and pushes to GitHub

set -e

REPO_DIR="/root/.openclaw/workspace/mission-control-dashboard"
DATA_DIR="$REPO_DIR/data"
WORKSPACE_DIR="/root/.openclaw/workspace"

echo "🔄 Syncing Mission Control data files..."

# Create data directory if it doesn't exist
mkdir -p "$DATA_DIR"

# Sync files
echo "📋 Syncing HEARTBEAT.md..."
if [ -f "$WORKSPACE_DIR/HEARTBEAT.md" ]; then
  cp "$WORKSPACE_DIR/HEARTBEAT.md" "$DATA_DIR/HEARTBEAT.md"
  echo "  ✓ HEARTBEAT.md synced"
fi

echo "💡 Syncing ideas.md..."
if [ -f "$WORKSPACE_DIR/memory/ideas.md" ]; then
  cp "$WORKSPACE_DIR/memory/ideas.md" "$DATA_DIR/ideas.md"
  echo "  ✓ ideas.md synced"
fi

echo "⏰ Syncing crons.json..."
if [ -f "$WORKSPACE_DIR/.config/crons.json" ]; then
  cp "$WORKSPACE_DIR/.config/crons.json" "$DATA_DIR/crons.json"
  echo "  ✓ crons.json synced"
fi

# Check if there are changes
cd "$REPO_DIR"
if git diff --quiet data/; then
  echo "✅ No changes detected. Dashboard is up to date."
  exit 0
fi

# Commit and push changes
echo "📤 Pushing changes to GitHub..."
git add data/
git commit -m "Auto-sync: Update mission control data (HEARTBEAT, ideas, crons)" || true
git push origin main

echo "✅ Mission Control data synced and deployed!"
