// Configuration file for Banana Diary
const CONFIG = {
    // Gemini API Configuration
    // For development, use local key. For production, it will be injected by Vercel
    GEMINI_API_KEY: window.GEMINI_API_KEY || 'AIzaSyC_vBTXaWKWBOFB9FuSHrSVo7kuF_bGREQ',
    GEMINI_API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta',

    // App Configuration
    APP_NAME: 'Banana Diary',
    VERSION: '1.0.0',

    // Comic Generation Settings
    MAX_DESCRIPTION_LENGTH: 1000,
    SUPPORTED_STYLES: [
        'comic',
        'ghibli',
        'superhero',
        'disney',
        'manga'
    ],

    // Pagination Settings
    ENTRIES_PER_PAGE: 6,

    // API Limits (as per Nano Banana Hackathon)
    API_LIMITS: {
        IMAGES_PER_MINUTE: 20,
        REQUESTS_PER_DAY: 200
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Make available globally
window.CONFIG = CONFIG;
