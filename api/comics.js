// Vercel serverless function for comics API
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const COMICS_FILE = '/tmp/comics-database.json';

// Initialize comics database
function initDatabase() {
    if (!existsSync(COMICS_FILE)) {
        writeFileSync(COMICS_FILE, JSON.stringify([]));
    }
}

// Get all comics
function getComics() {
    try {
        initDatabase();
        const data = readFileSync(COMICS_FILE, 'utf8');
        const comics = JSON.parse(data);

        // Return most recent comics first, limit to 100
        return comics
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 100);
    } catch (error) {
        console.error('Error reading comics:', error);
        return [];
    }
}

// Save a new comic
function saveComic(comicData) {
    try {
        initDatabase();
        const { story, style, imageUrl, createdAt } = comicData;

        // Validate required fields
        if (!story || !style || !imageUrl) {
            throw new Error('Missing required fields: story, style, imageUrl');
        }

        const newComic = {
            id: Date.now() + Math.random(),
            story: story.substring(0, 500), // Limit story length
            style,
            imageUrl,
            createdAt: createdAt || new Date().toISOString(),
            isPublic: true
        };

        // Read existing comics
        const data = readFileSync(COMICS_FILE, 'utf8');
        const comics = JSON.parse(data);

        // Add new comic
        comics.push(newComic);

        // Keep only the most recent 1000 comics
        if (comics.length > 1000) {
            comics.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            comics.splice(1000);
        }

        // Save back to file
        writeFileSync(COMICS_FILE, JSON.stringify(comics, null, 2));

        return newComic;
    } catch (error) {
        console.error('Error saving comic:', error);
        throw error;
    }
}

export default function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'GET') {
        try {
            const comics = getComics();
            res.status(200).json({ success: true, comics });
        } catch (error) {
            res.status(500).json({ success: false, error: 'Failed to load comics' });
        }
    } else if (req.method === 'POST') {
        try {
            const comic = saveComic(req.body);
            res.status(200).json({ success: true, comic });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    } else {
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
}
