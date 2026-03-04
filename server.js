const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();

const CLICKUP_TOKEN = process.env.CLICKUP_TOKEN || 'pk_10935568_X9CYUYXG7KGVUHF0J6T86HMOTGN44AAP';
const CLICKUP_API = 'https://api.clickup.com/api/v2';
const WORKSPACE_PATH = process.env.WORKSPACE_PATH || '/root/.openclaw/workspace';

app.use(express.static('public'));
app.use(express.json());

// Cache for API data
let cachedData = {
  tasks: [],
  reminders: [],
  crons: [],
  ideas: [],
  timestamp: null
};

// Read HEARTBEAT.md for reminders
function getReminders() {
  try {
    const heartbeatPath = path.join(WORKSPACE_PATH, 'HEARTBEAT.md');
    if (!fs.existsSync(heartbeatPath)) return [];
    
    const content = fs.readFileSync(heartbeatPath, 'utf8');
    const reminders = [];
    
    // Parse markdown list items as reminders
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^-\s+(.+?)(?:\s*-\s*(.+))?$/);
      if (match) {
        reminders.push({
          title: match[1],
          description: match[2] || '',
          source: 'HEARTBEAT.md'
        });
      }
    }
    
    return reminders;
  } catch (e) {
    console.log('Error reading HEARTBEAT.md:', e.message);
    return [];
  }
}

// Read ideas.md for ideas list
function getIdeas() {
  try {
    const ideasPath = path.join(WORKSPACE_PATH, 'memory', 'ideas.md');
    if (!fs.existsSync(ideasPath)) return [];
    
    const content = fs.readFileSync(ideasPath, 'utf8');
    const ideas = [];
    
    // Parse markdown list items as ideas
    const lines = content.split('\n');
    for (const line of lines) {
      const match = line.match(/^-\s+(.+?)(?:\s*-\s*(.+))?$/);
      if (match && !line.includes('|') && !line.includes('#')) {
        ideas.push({
          title: match[1],
          description: match[2] || '',
          status: 'backlog'
        });
      }
    }
    
    return ideas.slice(0, 10); // Top 10 ideas
  } catch (e) {
    console.log('Error reading ideas.md:', e.message);
    return [];
  }
}

// Get cron jobs from config file or crontab
function getCronJobs() {
  const crons = [];
  
  // Try reading from workspace cron config
  try {
    const cronsPath = path.join(WORKSPACE_PATH, '.config', 'crons.json');
    if (fs.existsSync(cronsPath)) {
      const content = fs.readFileSync(cronsPath, 'utf8');
      const config = JSON.parse(content);
      
      if (Array.isArray(config)) {
        config.forEach(cron => {
          crons.push({
            name: cron.name || 'Unnamed',
            description: cron.description || '',
            schedule: cron.schedule || '*',
            displayTime: cron.displayTime || cron.schedule,
            frequency: cron.frequency || 'Unknown',
            nextRun: cron.nextRun || new Date().toISOString(),
            timezone: cron.timezone || 'UTC'
          });
        });
      }
      
      return crons;
    }
  } catch (e) {
    console.log('Note: Could not read crons.json:', e.message);
  }
  
  // Fallback: try crontab (may not work in container)
  try {
    const { execSync } = require('child_process');
    const result = execSync('crontab -l 2>/dev/null || echo ""', { encoding: 'utf8' });
    const lines = result.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('#') || !line.trim()) continue;
      
      const parts = line.split(/\s+/);
      if (parts.length < 6) continue;
      
      const [minute, hour, day, month, weekday, ...cmdParts] = parts;
      const command = cmdParts.join(' ');
      
      let name = command;
      const match = command.match(/(?:openclaw|cron).*?([a-z-]+)/i);
      if (match) name = match[1];
      
      crons.push({
        name,
        description: command,
        schedule: `${minute} ${hour} * * ${weekday}`,
        displayTime: `${hour}:${minute}`,
        frequency: 'Daily',
        nextRun: calculateNextRun(minute, hour, weekday),
        timezone: 'Local'
      });
    }
  } catch (e) {
    // Silently fail - crontab may not be available
  }
  
  return crons;
}

// Simple cron schedule parser
function calculateNextRun(minute, hour, weekday) {
  const now = new Date();
  const next = new Date(now);
  
  // Very simple: if hour is specified, next run is tomorrow at that hour
  if (hour !== '*') {
    next.setDate(next.getDate() + 1);
    next.setHours(parseInt(hour), parseInt(minute), 0);
  } else {
    next.setMinutes(next.getMinutes() + parseInt(minute));
  }
  
  return next.toISOString();
}

// Fetch tasks from ClickUp
async function fetchClickUpData() {
  try {
    // Get team (workspace) info first
    const teamRes = await axios.get(`${CLICKUP_API}/team`, {
      headers: { Authorization: CLICKUP_TOKEN }
    });
    
    const teamId = teamRes.data.teams[0].id;
    
    // Get all spaces in workspace
    const spacesRes = await axios.get(`${CLICKUP_API}/team/${teamId}/space?archived=false`, {
      headers: { Authorization: CLICKUP_TOKEN }
    });
    
    let allTasks = [];
    
    // Get tasks from each space via lists
    for (const space of spacesRes.data.spaces) {
      try {
        // First, get all lists in this space
        const listsRes = await axios.get(
          `${CLICKUP_API}/space/${space.id}/list?archived=false`,
          { headers: { Authorization: CLICKUP_TOKEN } }
        );
        
        // Then get tasks from each list
        for (const list of listsRes.data.lists) {
          try {
            const tasksRes = await axios.get(
              `${CLICKUP_API}/list/${list.id}/task?archived=false&limit=100&include_closed=true`,
              { headers: { Authorization: CLICKUP_TOKEN } }
            );
            
            if (tasksRes.data.tasks) {
              allTasks = allTasks.concat(tasksRes.data.tasks);
            }
          } catch (e) {
            console.log(`Error fetching tasks from list ${list.id}:`, e.response?.status, e.response?.data?.err || e.message);
          }
        }
      } catch (e) {
        console.log(`Error fetching lists from space ${space.id}:`, e.response?.status, e.response?.data?.err || e.message);
      }
    }
    
    // Add clickable URLs to tasks
    allTasks = allTasks.map(task => ({
      ...task,
      url: `https://app.clickup.com/t/${task.id}`
    }));
    
    // Categorize tasks
    const categorized = categorizeTasks(allTasks);
    
    // Get additional data
    const reminders = getReminders();
    const crons = getCronJobs();
    const ideas = getIdeas();
    
    cachedData = {
      tasks: categorized,
      reminders,
      crons,
      ideas,
      timestamp: new Date().toISOString(),
      teamId
    };
    
    return cachedData;
  } catch (error) {
    console.error('ClickUp API Error:', error.response?.status, error.response?.data || error.message);
    console.error('Token status:', CLICKUP_TOKEN ? 'Present' : 'MISSING');
    return cachedData; // Return cached data if API fails
  }
}

// Categorize tasks into sections
function categorizeTasks(tasks) {
  const result = {
    current: [],        // Assigned to me, in progress
    queue: [],          // Assigned to me, not started
    completed: [],      // Recently completed
    waitingOnDodi: [],  // Awaiting decision/approval
    health: {
      blockers: [],
      load: 0
    }
  };
  
  const now = new Date();
  const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
  
  tasks.forEach(task => {
    // Check if task is recent completion
    if (task.status && task.status.status === 'closed') {
      const closedAt = task.date_closed ? new Date(parseInt(task.date_closed)) : null;
      if (closedAt && closedAt > sevenDaysAgo) {
        result.completed.push(task);
      }
      return;
    }
    
    // Check if waiting on Dodi (look for keywords or assignee)
    if (task.name && (task.name.toLowerCase().includes('dodi') || task.name.toLowerCase().includes('waiting'))) {
      result.waitingOnDodi.push(task);
      return;
    }
    
    // Check priority for blockers
    if (task.priority && task.priority.priority === 'urgent') {
      result.health.blockers.push(task);
    }
    
    // Categorize by status
    if (task.status && task.status.status === 'in progress') {
      result.current.push(task);
    } else if (task.status) {
      result.queue.push(task);
    }
  });
  
  result.health.load = result.current.length;
  result.completed = result.completed.slice(0, 10); // Last 10 completions
  
  return result;
}

// API endpoint for refresh
app.get('/api/refresh', async (req, res) => {
  const data = await fetchClickUpData();
  res.json(data);
});

// API endpoint for status
app.get('/api/status', (req, res) => {
  res.json(cachedData);
});

// Serve dashboard
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// Initial data load on startup
fetchClickUpData().then(() => {
  console.log('Initial ClickUp data loaded');
});

// Periodic refresh every 5 minutes
setInterval(fetchClickUpData, 5 * 60 * 1000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mission Control running on port ${PORT}`);
});
