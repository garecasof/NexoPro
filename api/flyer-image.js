import https from 'https';

export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        const parsedUrl = new URL(url);
        if (!parsedUrl.hostname.includes('supabase.co')) {
            return res.status(403).json({ error: 'Only Supabase domains allowed' });
        }

        // Proxy the request
        https.get(url, (proxyRes) => {
            // Forward the exact content type from from Supabase
            res.setHeader('Content-Type', proxyRes.headers['content-type'] || 'image/jpeg');

            // The magic of this proxy: Add standard CORS headers for Canvas to ingest
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.setHeader('Cache-Control', 's-maxage=31536000, stale-while-revalidate'); // CDN Cache

            proxyRes.pipe(res);
        }).on('error', (err) => {
            console.error('Proxy Error:', err);
            res.status(500).json({ error: 'Internal Server Error fetching the image' });
        });

    } catch (error) {
        console.error('Proxy Error Catch:', error);
        res.status(500).json({ error: 'Invalid URL or Server Error' });
    }
}
