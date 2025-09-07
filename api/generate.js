// Vercel serverless function to proxy Gemini API calls securely
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        // Get API key from environment (secure on backend)
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' });
        }

        // Call Gemini API
        const geminiResponse = await fetch(
            'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        response_modalities: ['Text', 'Image'],
                        temperature: 0.7,
                        topP: 0.8,
                        topK: 40
                    }
                })
            }
        );

        if (!geminiResponse.ok) {
            const errorData = await geminiResponse.json().catch(() => null);
            return res.status(geminiResponse.status).json({
                error: `Gemini API Error: ${errorData?.error?.message || 'Unknown error'}`
            });
        }

        const data = await geminiResponse.json();
        res.json(data);

    } catch (error) {
        console.error('Error in generate API:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
