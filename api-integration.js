// Enhanced API Integration for Nano Banana API
class NanoBananaAPI {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
        this.model = 'gemini-2.5-flash-image-preview';
        this.rateLimiter = new RateLimiter();
    }

    async generateComic(description, style) {
        try {
            // Check rate limits
            if (!this.rateLimiter.canMakeRequest()) {
                throw new Error('Rate limit exceeded. Please wait before generating another comic.');
            }

            const prompt = this.createStylePrompt(description, style);

            const response = await this.callAPI(prompt);
            return await this.processResponse(response);

        } catch (error) {
            console.error('Comic generation failed:', error);
            throw error;
        }
    }

    createStylePrompt(description, style) {
        // First, sanitize and enhance the description
        const sanitizedDescription = this.sanitizeAndEnhanceDescription(description);

        const styleGuides = {
            comic: {
                style: "classic comic book style with bold black outlines, vibrant primary colors, and dramatic lighting",
                format: "perfectly organized 2x2 grid of square panels (4 panels total) with thick black borders",
                characteristics: "Dynamic poses, expressive faces, clear action sequences, vibrant colors"
            },
            ghibli: {
                style: "Studio Ghibli anime style with soft watercolor textures, natural earth tones, and gentle lighting",
                format: "2x2 grid of square panels with soft rounded borders, like a picture book layout",
                characteristics: "Whimsical characters, detailed nature backgrounds, peaceful atmosphere, magical elements"
            },
            superhero: {
                style: "modern superhero comic style with dramatic angles, bold colors, and dynamic action poses",
                format: "2x2 grid layout with bold rectangular panels and dramatic panel borders",
                characteristics: "Heroic proportions, dynamic action, energy effects, dramatic lighting"
            },
            disney: {
                style: "Disney animation style with smooth gradients, warm colors, and magical lighting",
                format: "2x2 grid of rounded square panels like animated movie storyboards",
                characteristics: "Expressive characters, magical elements, heartwarming moments, family-friendly"
            },
            manga: {
                style: "Japanese manga style with detailed line work, screentones, and expressive character designs",
                format: "traditional 2x2 manga panel grid with clean white borders and precise layouts",
                characteristics: "Large expressive eyes, detailed backgrounds, emotional emphasis, clean line work"
            },
            pixar: {
                style: "Pixar 3D animation style with realistic lighting, detailed textures, and vibrant colors",
                format: "2x2 grid of square panels like Pixar movie storyboards",
                characteristics: "3D rendered look, expressive characters, detailed environments, warm lighting"
            },
            watercolor: {
                style: "soft watercolor painting style with flowing colors, gentle textures, and artistic brushstrokes",
                format: "2x2 grid of square panels with soft, painted borders",
                characteristics: "Flowing colors, artistic brushstrokes, dreamy atmosphere, soft textures"
            },
            minimalist: {
                style: "clean minimalist illustration style with simple shapes, limited colors, and clear compositions",
                format: "2x2 grid of perfectly square panels with clean white borders and minimal design",
                characteristics: "Simple shapes, limited color palette, clean compositions, geometric elements"
            }
        };

        const guide = styleGuides[style] || styleGuides.comic;

        return `Create a comic strip in ${guide.style} showing a day's story in exactly 4 panels arranged in a 2x2 grid format.

CRITICAL LAYOUT REQUIREMENTS:
- MUST be a 2x2 grid (2 panels wide, 2 panels tall)
- Each panel should be perfectly square or rectangular
- Clear, thick borders separating each panel
- ${guide.format}
- Overall image should be SQUARE format (equal width and height)
- Perfect square aspect ratio (1:1)

STORY: "${sanitizedDescription}"

PANEL BREAKDOWN:
Panel 1 (Top Left): Morning/Beginning activities - show the start of the day
Panel 2 (Top Right): Key daytime events - main activities or interactions  
Panel 3 (Bottom Left): Important moments - special events or turning points
Panel 4 (Bottom Right): Evening/Conclusion - how the day ended

STYLE REQUIREMENTS:
- ${guide.characteristics}
- ${guide.style}
- Consistent character design across all 4 panels
- Show clear time progression from morning to evening
- Include environmental details and atmosphere
- NO TEXT, WORDS, OR SPEECH BUBBLES anywhere in the image
- Focus purely on visual storytelling

QUALITY REQUIREMENTS:
- High resolution, professional quality artwork
- Clear visual flow between panels
- Proper lighting and shading
- Detailed backgrounds that support the story
- Expressive character poses and emotions`;
    }

    sanitizeAndEnhanceDescription(description) {
        // List of negative keywords to filter out or transform
        const negativePatterns = [
            /\b(hate|angry|mad|furious|rage|violence|fight|attack|hurt|pain|sad|depressed|miserable|terrible|awful|horrible|worst|disaster|catastrophe|nightmare|hell|damn|stupid|idiot|kill|die|death|dead|murder|blood|war|weapons|guns|bombs|destruction|chaos)\b/gi,
            /\b(fired|unemployed|broke|bankruptcy|divorce|breakup|accident|injury|hospital|sick|illness|disease|cancer|covid|virus|pandemic)\b/gi
        ];

        let sanitized = description;

        // Transform negative content to positive alternatives
        const positiveTransforms = {
            'hate': 'dislike',
            'angry': 'determined',
            'mad': 'excited',
            'furious': 'energetic',
            'fight': 'discussion',
            'attack': 'approach',
            'hurt': 'tired',
            'pain': 'effort',
            'sad': 'thoughtful',
            'depressed': 'quiet',
            'miserable': 'contemplative',
            'terrible': 'challenging',
            'awful': 'difficult',
            'horrible': 'unusual',
            'worst': 'most challenging',
            'disaster': 'unexpected event',
            'nightmare': 'vivid dream',
            'fired': 'changed jobs',
            'broke': 'budget-conscious',
            'divorce': 'life change',
            'accident': 'unexpected event',
            'sick': 'resting',
            'hospital': 'medical visit'
        };

        // Apply positive transformations
        Object.entries(positiveTransforms).forEach(([negative, positive]) => {
            const regex = new RegExp(`\\b${negative}\\b`, 'gi');
            sanitized = sanitized.replace(regex, positive);
        });

        // Add positive framing if the description seems too negative
        if (negativePatterns.some(pattern => pattern.test(description))) {
            sanitized = `Despite some challenges, here's how the day unfolded: ${sanitized}. Focus on the positive moments, growth, and resilience shown throughout the day.`;
        }

        // Enhance the description with visual storytelling prompts
        sanitized += ` Show this as a heartwarming, positive story with clear visual progression throughout the day. Include details about locations, people's expressions, activities, and the overall atmosphere of each moment.`;

        return sanitized;
    }

    async callAPI(prompt) {
        const url = `${this.baseUrl}/models/${this.model}:generateContent`;

        const requestBody = {
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
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': this.apiKey
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(`API Error ${response.status}: ${errorData?.error?.message || 'Unknown error'}`);
        }

        return await response.json();
    }

    async processResponse(data) {
        if (!data.candidates || !data.candidates[0]) {
            throw new Error('No content generated');
        }

        const candidate = data.candidates[0];

        if (!candidate.content || !candidate.content.parts) {
            throw new Error('Invalid response format');
        }

        let imageUrl = null;
        let textResponse = '';

        for (const part of candidate.content.parts) {
            if (part.text) {
                textResponse += part.text;
            }

            if (part.inlineData) {
                try {
                    imageUrl = await this.convertInlineDataToUrl(part.inlineData);
                } catch (error) {
                    console.error('Error processing inline data:', error);
                }
            }
        }

        if (!imageUrl) {
            throw new Error('No image was generated in the response');
        }

        return {
            imageUrl,
            description: textResponse,
            metadata: {
                generatedAt: new Date().toISOString(),
                model: this.model
            }
        };
    }

    async convertInlineDataToUrl(inlineData) {
        try {
            const { data, mimeType } = inlineData;

            // Convert base64 to blob
            const byteCharacters = atob(data);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: mimeType });

            return URL.createObjectURL(blob);

        } catch (error) {
            console.error('Error converting inline data:', error);
            throw new Error('Failed to process generated image');
        }
    }
}

// Rate Limiter Class
class RateLimiter {
    constructor() {
        this.requests = [];
        this.maxRequestsPerMinute = 20;
        this.maxRequestsPerDay = 200;
    }

    canMakeRequest() {
        const now = Date.now();
        const oneMinute = 60 * 1000;
        const oneDay = 24 * 60 * 60 * 1000;

        // Clean old requests
        this.requests = this.requests.filter(timestamp =>
            now - timestamp < oneDay
        );

        // Check daily limit
        if (this.requests.length >= this.maxRequestsPerDay) {
            return false;
        }

        // Check per-minute limit
        const recentRequests = this.requests.filter(timestamp =>
            now - timestamp < oneMinute
        );

        if (recentRequests.length >= this.maxRequestsPerMinute) {
            return false;
        }

        // Record this request
        this.requests.push(now);
        return true;
    }

    getTimeUntilNextRequest() {
        const now = Date.now();
        const oneMinute = 60 * 1000;

        const recentRequests = this.requests.filter(timestamp =>
            now - timestamp < oneMinute
        );

        if (recentRequests.length < this.maxRequestsPerMinute) {
            return 0;
        }

        const oldestRecentRequest = Math.min(...recentRequests);
        return oneMinute - (now - oldestRecentRequest);
    }

    getRemainingRequests() {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        const todayRequests = this.requests.filter(timestamp =>
            now - timestamp < oneDay
        );

        return {
            daily: this.maxRequestsPerDay - todayRequests.length,
            perMinute: this.maxRequestsPerMinute - todayRequests.filter(timestamp =>
                now - timestamp < 60 * 1000
            ).length
        };
    }
}

// Enhanced Error Handling
class APIError extends Error {
    constructor(message, status, details) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.details = details;
    }
}

// Export for use in main app
if (typeof window !== 'undefined') {
    window.NanoBananaAPI = NanoBananaAPI;
    window.RateLimiter = RateLimiter;
    window.APIError = APIError;
}
