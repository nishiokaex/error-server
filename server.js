const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const LOG_FILE_PATH = process.env.LOG_FILE_PATH || './logs';
const LOG_FILE_NAME = 'error_log.md';

// JSON body parser
app.use(express.json());

// POST /log endpoint
app.post('/log', (req, res) => {
  try {
    const logData = req.body;
    
    // Use timestamp from received JSON if available, otherwise use current time
    let timestamp;
    if (logData.timestamp) {
      const date = new Date(logData.timestamp);
      timestamp = date.toLocaleString('ja-JP', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    } else {
      const now = new Date();
      timestamp = now.toLocaleString('ja-JP', { 
        year: 'numeric', 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
    }
    
    const title = `${timestamp} 未解決`;
    const markdownContent = `# ${title}\n\n\`\`\`javascript\n${JSON.stringify(logData, null, 2)}\n\`\`\`\n\n`;
    
    // Ensure log directory exists
    if (!fs.existsSync(LOG_FILE_PATH)) {
      fs.mkdirSync(LOG_FILE_PATH, { recursive: true });
    }
    
    // Path to the single log file
    const filepath = path.join(LOG_FILE_PATH, LOG_FILE_NAME);
    
    // Append to log file
    fs.appendFileSync(filepath, markdownContent);
    
    res.status(200).json({ message: 'Log saved successfully', filename: LOG_FILE_NAME });
  } catch (error) {
    console.error('Error saving log:', error);
    res.status(500).json({ error: 'Failed to save log' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Log files will be saved to: ${LOG_FILE_PATH}`);
});