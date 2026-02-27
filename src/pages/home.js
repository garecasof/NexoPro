// NexoPro — Home Page (UX Simplificada)
import { fetchCategories, CATEGORY_GROUPS } from '../lib/supabase.js';
import { renderCategoryCard } from '../components/category-card.js';

export async function renderHome() {
  const content = document.getElementById('page-content');

  content.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:60vh;">
      <div style="font-size:1.5rem;animation:pulse 1.5s infinite;color:var(--primary);">Cargando NexoPro...</div>
    </div>`;

  const categories = await fetchCategories();

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

    <!-- CTA for professionals -->
    <div style="padding:12px 16px 32px;">
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
}
