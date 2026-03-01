import { fetchCategories, CATEGORY_GROUPS, fetchVIPTalents } from '../lib/supabase.js';
import { renderCategoryCard } from '../components/category-card.js';
import { renderProfessionalCard } from '../components/professional-card.js';
import { showToast } from '../lib/toast.js';

export async function renderHome() {
  const content = document.getElementById('page-content');

  content.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:60vh;">
      <div style="font-size:1.5rem;animation:pulse 1.5s infinite;color:var(--primary);">Cargando NexoPro...</div>
    </div>`;

  const categories = await fetchCategories();
  const vipTalents = await fetchVIPTalents();

  // Colores suaves para cada grupo
  const groupColors = {
    salud: { bg: '#EBF4FF', border: '#BFDBFE', accent: '#2563EB' },
    legal: { bg: '#EEF2FF', border: '#C7D2FE', accent: '#4F46E5' },
    tecnico: { bg: '#FFF7ED', border: '#FED7AA', accent: '#EA580C' },
    construccion: { bg: '#FEF9C3', border: '#FDE68A', accent: '#CA8A04' },
    automotor: { bg: '#F0FDF4', border: '#BBF7D0', accent: '#16A34A' },
    servicios: { bg: '#FDF2F8', border: '#FBCFE8', accent: '#DB2777' },
    inmuebles: { bg: '#ECFEFF', border: '#A5F3FC', accent: '#0891B2' },
    bienestar: { bg: '#FAF5FF', border: '#E9D5FF', accent: '#9333EA' },
  };

  content.innerHTML = `
    <div class="hero" style="text-align: center;">
      <div class="hero-content" style="max-width: 600px; margin: 0 auto;">
        <h1>¿Qué necesitás<br>resolver hoy?</h1>
        <p>Encontrá al profesional ideal cerca tuyo.</p>
        <div class="search-bar" id="home-search-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ADB5BD" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" placeholder="Ej: electricista, médico, abogado..." id="home-search-input" />
          <button class="search-btn" id="home-search-btn" aria-label="Buscar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Category Groups — Clean, big, centered -->
    ${CATEGORY_GROUPS.map(group => {
    const groupCats = categories.filter(c => c.group === group.id);
    if (groupCats.length === 0) return '';
    const colors = groupColors[group.id] || { bg: '#F8F9FA', border: '#DEE2E6', accent: '#495057' };
    return `
        <div class="category-group-section" style="margin:12px 16px;border-radius:16px;background:${colors.bg};border:1.5px solid ${colors.border};padding:16px 12px 12px;overflow:hidden;">
          <h2 style="text-align:center;font-size:1.25rem;font-weight:800;color:${colors.accent};margin-bottom:14px;letter-spacing:0.5px;">
            ${group.name}
          </h2>
          <div class="categories-grid" style="gap:10px;">
            ${groupCats.map(cat => renderCategoryCard(cat)).join('')}
          </div>
        </div>`;
  }).join('')}

    <!-- VIP / New Talents Section (Step 3: Ganamos Todos) -->
    ${vipTalents.length > 0 ? `
      <div style="margin:24px 16px 12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <h2 style="font-size:1.15rem;font-weight:800;color:var(--dark);">✨ Novedades VIP</h2>
          <span style="font-size:.75rem;background:var(--accent);color:white;padding:4px 8px;border-radius:12px;font-weight:700;text-transform:uppercase;">Nuevos Talentos</span>
        </div>
        <div class="pro-carousel" style="display:flex;overflow-x:auto;gap:12px;padding-bottom:8px;scrollbar-width:none;-ms-overflow-style:none;">
          ${vipTalents.map(pro => renderProfessionalCard(pro)).join('')}
        </div>
      </div>
    ` : ''}

    <!-- CTA for sharing -->
    <div style="padding:0 16px 20px;">
      <div style="background:linear-gradient(135deg, #FF6B6B, #FF8E53);border-radius:var(--radius-lg);padding:24px 20px;color:var(--white);text-align:center;box-shadow:0 8px 24px rgba(255,107,107,0.25);">
        <div style="font-size:2.5rem;margin-bottom:8px;">📣</div>
        <h3 style="font-size:1.15rem;font-weight:800;margin-bottom:6px;">Ayudanos a crecer</h3>
        <p style="font-size:.9rem;opacity:.95;margin-bottom:16px;">¿Te gusta NexoPro? Compartí la app en tus redes o con tus amigos para que más profesionales consigan trabajo.</p>
        <button id="cta-share-app" class="btn" style="background:var(--white);color:#FF6B6B;width:100%;font-size:1rem;font-weight:800;padding:14px;border:none;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.1);display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
          Compartir aplicación ❤️
        </button>
      </div>
    </div>

    <!-- CTA for professionals -->
    <div style="padding:0 16px 32px;">
      <div style="background:linear-gradient(135deg,var(--primary),var(--primary-dark));border-radius:var(--radius-lg);padding:28px 20px;color:var(--white);text-align:center;">
        <h3 style="font-size:1.15rem;font-weight:800;margin-bottom:6px;">¿Sos profesional?</h3>
        <p style="font-size:.9rem;opacity:.85;margin-bottom:16px;">Registrate gratis y empezá a recibir clientes hoy.</p>
        <a href="#/register" class="btn btn-accent btn-lg" id="cta-register" style="display:inline-flex;min-height:48px;font-size:1rem;">
          Registrarme ahora
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  `;

  // Search event
  const searchInput = document.getElementById('home-search-input');
  const searchBtn = document.getElementById('home-search-btn');

  const doSearch = () => {
    const q = searchInput.value.trim();
    window.location.hash = `/search?q=${encodeURIComponent(q)}`;
  };

  searchBtn.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });

  // Share App event
  const shareAppBtn = document.getElementById('cta-share-app');
  if (shareAppBtn) {
    shareAppBtn.addEventListener('click', async () => {
      const shareData = {
        title: 'NexoPro — Directorio de Profesionales',
        text: '¡Encontrá a los mejores profesionales o registrá tus servicios en NexoPro! Es 100% gratis.',
        url: window.location.origin
      };

      try {
        // Generar la imagen dinámicamente usando un canvas para asegurar máxima compatibilidad (PNG)
        // ya que la API no siempre admite SVGs nativos en WhatsApp/Instagram.
        const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 64 64">
          <rect width="64" height="64" rx="14" fill="#007BFF"/>
          <path d="M20 44V20L36 38V20" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M36 20H42.5C46.64 20 50 23.36 50 27.5C50 31.64 46.64 35 42.5 35H36" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="44" cy="43" r="5" fill="#00C853"/>
        </svg>`;

        const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, 512, 512);
            URL.revokeObjectURL(svgUrl);

            canvas.toBlob((blob) => {
              if (blob) {
                const file = new File([blob], 'nexopro-apoya-nuestra-app.png', { type: 'image/png' });
                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                  shareData.files = [file];
                }
              }
              resolve();
            }, 'image/png');
          };
          img.onerror = reject;
          img.src = svgUrl;
        });

      } catch (err) {
        console.warn('No se pudo adjuntar la imagen al share:', err);
      }

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (e) { /* user cancelled */ }
      } else {
        // Fallback for desktop browsers that don't support Web Share API
        try {
          await navigator.clipboard.writeText(shareData.url);
          showToast('📋 Link copiado para compartir', 'success');
        } catch (e) {
          showToast('No se pudo copiar el link', 'error');
        }
      }
    });
  }
}
