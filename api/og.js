// NexoPro — Open Graph API (Vercel Serverless Function)
const https = require('https');

const SUPABASE_URL = 'https://dsdvjpdacezgmqlozzei.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jHULIs_rMehwQA5sGQ4j4w_C-aa4pZG';

function supabaseGet(path) {
    return new Promise((resolve, reject) => {
        const url = `${SUPABASE_URL}${path}`;
        const options = {
            headers: {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
        };
        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

function escapeHtml(str) {
    return (str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function buildHTML({ title, description, image, url }) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta property="og:type" content="profile" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:site_name" content="NexoPro" />
  <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}
  <meta http-equiv="refresh" content="0;url=${escapeHtml(url)}" />
</head>
<body>
  <p>Redirigiendo a <a href="${escapeHtml(url)}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;
}

module.exports = async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(buildHTML({
            title: 'NexoPro — Tu directorio de profesionales',
            description: 'Encontra al profesional que necesitas cerca tuyo.',
            image: '',
            url: 'https://nexo-pro.vercel.app',
        }));
    }

    try {
        const data = await supabaseGet(`/rest/v1/profiles?id=eq.${id}&select=*,categories(name,icon)`);
        const pro = data && data[0];

        if (!pro) {
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            return res.status(200).send(buildHTML({
                title: 'NexoPro — Tu directorio de profesionales',
                description: 'Encontra al profesional que necesitas cerca tuyo.',
                image: '',
                url: 'https://nexo-pro.vercel.app',
            }));
        }

        const categoryName = (pro.categories && pro.categories.name) || 'Profesional';
        const city = pro.address ? pro.address.split(',').pop().trim() : '';

        const title = pro.full_name + ' — ' + categoryName;
        const description = 'Rating ' + (pro.rating || 0) + '/5 - ' + categoryName + (city ? ' - ' + city : '') + ' - ' + (pro.description || 'Encontralo en NexoPro');
        const image = pro.photo_url || '';
        const url = 'https://nexo-pro.vercel.app/#/profile?id=' + id;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        return res.status(200).send(buildHTML({ title, description, image, url }));

    } catch (err) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(buildHTML({
            title: 'NexoPro — Tu directorio de profesionales',
            description: 'Encontra al profesional que necesitas cerca tuyo.',
            image: '',
            url: 'https://nexo-pro.vercel.app',
        }));
    }
};
