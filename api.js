const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();
const COMICS_FILE = path.join(__dirname, 'comics-database.json');

// Initialize comics database file if it doesn't exist
async function initDatabase() {
    try {
        await fs.access(COMICS_FILE);
    } catch (error) {
        // File doesn't exist, create it
        await fs.writeFile(COMICS_FILE, JSON.stringify([]));
    }
}

// Get all comics
router.get('/comics', async (req, res) => {
    try {
        const data = await fs.readFile(COMICS_FILE, 'utf8');
        const comics = JSON.parse(data);

        // Return most recent comics first, limit to 100 for performance
        const recentComics = comics
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 100);

        res.json({ success: true, comics: recentComics });
    } catch (error) {
        console.error('Error reading comics:', error);
        res.status(500).json({ success: false, error: 'Failed to load comics' });
    }
});

// Save a new comic
router.post('/comics', async (req, res) => {
    try {
        const { story, style, imageUrl, createdAt } = req.body;

        // Validate required fields
        if (!story || !style || !imageUrl) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: story, style, imageUrl'
            });
        }

        const newComic = {
            id: Date.now() + Math.random(), // Simple ID generation
            story: story.substring(0, 500), // Limit story length
            style,
            imageUrl,
            createdAt: createdAt || new Date().toISOString(),
            isPublic: true
        };

        // Read existing comics
        const data = await fs.readFile(COMICS_FILE, 'utf8');
        const comics = JSON.parse(data);

        // Add new comic
        comics.push(newComic);

        // Keep only the most recent 1000 comics to prevent file from growing too large
        if (comics.length > 1000) {
            comics.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            comics.splice(1000);
        }

        // Save back to file
        await fs.writeFile(COMICS_FILE, JSON.stringify(comics, null, 2));

        res.json({ success: true, comic: newComic });
    } catch (error) {
        console.error('Error saving comic:', error);
        res.status(500).json({ success: false, error: 'Failed to save comic' });
    }
});

// Initialize database on startup
initDatabase();

module.exports = router;
