// Vercel serverless function for comics API with Blob storage
import { put, list, del } from '@vercel/blob';

// Get all comics from Blob storage
async function getComics() {
    try {
        const { blobs } = await list({
            prefix: 'comics/',
        });

        // Convert blobs to comics data
        const comics = [];
        for (const blob of blobs) {
            try {
                const response = await fetch(blob.url);
                const comicData = await response.json();
                comics.push(comicData);
            } catch (error) {
                console.error('Error loading comic from blob:', error);
                // Skip corrupted comics
            }
        }

        // Return most recent comics first, limit to 100
        return comics
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 100);
    } catch (error) {
        console.error('Error reading comics from Blob storage:', error);
        return [];
    }
}

// Save a new comic to Blob storage
async function saveComic(comicData) {
    try {
        const { story, style, imageUrl, createdAt } = comicData;

        // Validate required fields
        if (!story || !style || !imageUrl) {
            throw new Error('Missing required fields: story, style, imageUrl');
        }

        const comicId = Date.now() + Math.random();
        const newComic = {
            id: comicId,
            story: story.substring(0, 500), // Limit story length
            style,
            imageUrl,
            createdAt: createdAt || new Date().toISOString(),
            isPublic: true
        };

        // Save comic to Blob storage
        const filename = `comics/comic-${comicId}.json`;
        const blob = await put(filename, JSON.stringify(newComic), {
            access: 'public',
            addRandomSuffix: false
        });

        console.log('Comic saved to Blob storage:', blob.url);

        // Clean up old comics if we have too many
        await cleanupOldComics();

        return newComic;
    } catch (error) {
        console.error('Error saving comic to Blob storage:', error);
        throw error;
    }
}

// Clean up old comics to keep storage manageable
async function cleanupOldComics() {
    try {
        const { blobs } = await list({
            prefix: 'comics/',
        });

        // If we have more than 1000 comics, delete the oldest ones
        if (blobs.length > 1000) {
            // Sort by upload time (oldest first)
            const sortedBlobs = blobs.sort((a, b) => new Date(a.uploadedAt) - new Date(b.uploadedAt));

            // Delete the oldest 100 comics
            const blobsToDelete = sortedBlobs.slice(0, 100);

            for (const blob of blobsToDelete) {
                try {
                    await del(blob.url);
                } catch (error) {
                    console.error('Error deleting old comic blob:', error);
                }
            }

            console.log(`Cleaned up ${blobsToDelete.length} old comics`);
        }
    } catch (error) {
        console.error('Error during cleanup:', error);
        // Don't throw - cleanup failures shouldn't stop new saves
    }
}

export default async function handler(req, res) {
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
            const comics = await getComics();
            res.status(200).json({
                success: true,
                comics,
                storage: 'vercel-blob',
                count: comics.length
            });
        } catch (error) {
            console.error('GET /api/comics error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to load comics',
                storage: 'vercel-blob'
            });
        }
    } else if (req.method === 'POST') {
        try {
            const comic = await saveComic(req.body);
            res.status(200).json({
                success: true,
                comic,
                storage: 'vercel-blob'
            });
        } catch (error) {
            console.error('POST /api/comics error:', error);
            res.status(400).json({
                success: false,
                error: error.message,
                storage: 'vercel-blob'
            });
        }
    } else {
        res.status(405).json({
            success: false,
            error: 'Method not allowed',
            storage: 'vercel-blob'
        });
    }
}