const express = require('express');
const path = require('path');
const apiRoutes = require('./api');

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' })); // Allow larger payloads for images
app.use(express.static('.'));

// API routes
app.use('/api', apiRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve index.html for all other routes (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`🍌 Banana Diary running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/health`);
    console.log(`📡 API available at: http://localhost:${PORT}/api/comics`);
});
