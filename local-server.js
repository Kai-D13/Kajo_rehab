#!/usr/bin/env node

const express = require('express');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('www')); // ZMP builds to www folder, not dist

// Serve static files from www
app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'www', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build not found. Please run "npm run build" first.');
  }
});

// Serve admin reception
app.get('/admin', (req, res) => {
  const adminPath = path.join(__dirname, 'admin-reception-enhanced.html');
  if (fs.existsSync(adminPath)) {
    res.sendFile(adminPath);
  } else {
    res.status(404).send('Admin reception not found.');
  }
});

// API endpoints for testing
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: 'local_development'
  });
});

// Mock Zalo OA endpoint for testing
app.post('/api/test-zalo-oa', (req, res) => {
  console.log('📱 Mock Zalo OA message:', req.body);
  res.json({ 
    success: true, 
    message: 'Mock OA message sent successfully',
    data: req.body
  });
});

// Fallback for SPA routing
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'www', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build not found. Please run "npm run build" first.');
  }
});

app.listen(PORT, () => {
  console.log(`
🚀 Kajo Mini App Local Development Server
📍 Server running on: http://localhost:${PORT}
🏥 Mini App: http://localhost:${PORT}
👨‍⚕️ Admin Reception: http://localhost:${PORT}/admin
🔗 Health Check: http://localhost:${PORT}/api/health

⚡ Hot reload: Changes to dist/ will be served immediately
🔧 To rebuild: npm run build
🎯 To test admin: Open http://localhost:${PORT}/admin
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down server gracefully...');
  process.exit(0);
});

module.exports = app;
