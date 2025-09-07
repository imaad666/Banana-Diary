// Health check endpoint for Vercel
export default function handler(req, res) {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        platform: 'vercel'
    });
}
