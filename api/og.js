// NexoPro — Open Graph API (Vercel Serverless Function)
// Serves rich previews for WhatsApp, Facebook, Twitter, etc.

const SUPABASE_URL = 'https://dsdvjpdacezgmqlozzei.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jHULIs_rMehwQA5sGQ4j4w_C-aa4pZG';

// Bot user-agents that request OG previews
const BOT_UA = /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Slackbot|TelegramBot|Pinterest|Discordbot|Googlebot|bingbot/i;

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing id parameter' });
    }

    try {
        // Fetch professional from Supabase
        const response = await fetch(
            `${SUPABASE_URL}/rest/v1/profiles?id=eq.${id}&select=*,categories(name,icon)`,
            {
                headers: {
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
            }
        );

        const data = await response.json();
        const pro = data?.[0];

        if (!pro) {
            return res.status(404).send(buildHTML({
                title: 'NexoPro — Tu directorio de profesionales',
                description: 'Encontrá al profesional que necesitás cerca tuyo.',
                image: '',
                url: req.headers.host || 'nexopro.vercel.app',
            }));
        }

        const categoryName = pro.categories?.name || 'Profesional';
        const categoryIcon = pro.categories?.icon || '👤';
        const city = pro.address ? pro.address.split(',').pop().trim() : '';
        const stars = '⭐'.repeat(Math.min(Math.round(pro.rating || 0), 5));

        const title = `${pro.full_name} — ${categoryName}`;
        const description = `${stars} ${pro.rating || 0}/5 · ${categoryIcon} ${categoryName}${city ? ` · 📍 ${city}` : ''}\n${pro.description || 'Encontrá este profesional en NexoPro.'}`;
        const image = pro.photo_url || '';
        const url = `https://${req.headers.host || 'nexopro.vercel.app'}/#/profile?id=${id}`;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600');
        return res.status(200).send(buildHTML({ title, description, image, url }));

    } catch (err) {
        console.error('OG Error:', err);
        return res.status(500).send(buildHTML({
            title: 'NexoPro — Tu directorio de profesionales',
            description: 'Encontrá al profesional que necesitás cerca tuyo.',
            image: '',
            url: req.headers.host || 'nexopro.vercel.app',
        }));
    }
}

function buildHTML({ title, description, image, url }) {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>

  <!-- Open Graph / Facebook / WhatsApp -->
  <meta property="og:type" content="profile" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  ${image ? `<meta property="og:image" content="${escapeHtml(image)}" />` : ''}
  <meta property="og:url" content="${escapeHtml(url)}" />
  <meta property="og:site_name" content="NexoPro" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${image ? `<meta name="twitter:image" content="${escapeHtml(image)}" />` : ''}

  <!-- Redirect real users to the SPA -->
  <meta http-equiv="refresh" content="0;url=${escapeHtml(url)}" />
</head>
<body>
  <p>Redirigiendo a <a href="${escapeHtml(url)}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;
}

function escapeHtml(str) {
    return (str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
