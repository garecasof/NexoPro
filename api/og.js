// Minimal test function
export default function handler(req, res) {
    const { id } = req.query || {};
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`<h1>OG Test</h1><p>ID: ${id || 'no id'}</p>`);
}
