const express = require('express');
const axios = require('axios');
const app = express();

const CLICKUP_TOKEN = 'pk_10935568_X9CYUYXG7KGVUHF0J6T86HMOTGN44AAP';
const CLICKUP_API = 'https://api.clickup.com/api/v2';

app.use(express.static('public'));
app.use(express.json());

// Cache for API data
let cachedData = {
  tasks: [],
  timestamp: null
};

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
    
    // Get tasks from each space
    for (const space of spacesRes.data.spaces) {
      try {
        const tasksRes = await axios.get(
          `${CLICKUP_API}/space/${space.id}/task?archived=false&limit=100&include_closed=true`,
          { headers: { Authorization: CLICKUP_TOKEN } }
        );
        
        if (tasksRes.data.tasks) {
          allTasks = allTasks.concat(tasksRes.data.tasks);
        }
      } catch (e) {
        console.log(`Error fetching tasks from space ${space.id}`);
      }
    }
    
    // Categorize tasks
    const categorized = categorizeTasks(allTasks);
    
    cachedData = {
      tasks: categorized,
      timestamp: new Date().toISOString(),
      teamId
    };
    
    return cachedData;
  } catch (error) {
    console.error('ClickUp API Error:', error.message);
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
