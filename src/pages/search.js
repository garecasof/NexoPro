// NexoPro — Search Page (UX Simplificada)
import { fetchCategories, fetchAllCategories, fetchProfessionals } from '../lib/supabase.js';
import { renderProfessionalListCard } from '../components/professional-card.js';
import { getUserLocation, filterByProximity, RADIUS_OPTIONS, DEFAULT_RADIUS } from '../lib/geolocation.js';
import { showToast } from '../lib/toast.js';

function normalize(str) {
  return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export async function renderSearch(params = {}) {
  const content = document.getElementById('page-content');
  const query = params.q || '';
  const categoryId = params.category || '';
  const parentCategoryId = params.parent_category || '';

  content.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:60vh;">
      <div style="font-size:1.5rem;animation:pulse 1.5s infinite;color:var(--primary);">Buscando...</div>
    </div>`;

  const dbFilters = {};
  if (categoryId) dbFilters.category_id = categoryId;
  if (parentCategoryId) dbFilters.parent_category_id = parentCategoryId;

  const [categories, allCategories, rawProfessionals] = await Promise.all([
    fetchCategories(),
    fetchAllCategories(),
    fetchProfessionals(dbFilters)
  ]);

  // Client-side text search (accent-insensitive)
  let allResults = rawProfessionals;
  if (query) {
    const q = normalize(query);
    allResults = rawProfessionals.filter(pro =>
      normalize(pro.full_name).includes(q) ||
      normalize(pro.description).includes(q) ||
      normalize(pro.category_name).includes(q) ||
      normalize(pro.address).includes(q)
    );

    // Expand: match parent categories + their subcategories
    const matchingCatIds = new Set();
    const directMatches = allCategories.filter(cat => normalize(cat.name).includes(q));
    for (const cat of directMatches) {
      matchingCatIds.add(cat.id);
      for (const sub of allCategories) {
        if (sub.parent_id === cat.id) matchingCatIds.add(sub.id);
      }
    }
    if (matchingCatIds.size > 0) {
      const existingIds = new Set(allResults.map(p => p.id));
      for (const pro of rawProfessionals) {
        if (matchingCatIds.has(pro.category_id) && !existingIds.has(pro.id)) {
          allResults.push(pro);
        }
      }
    }
  }

  const activeCatName = categoryId
    ? categories.find(c => c.id === categoryId)?.name || 'Todos'
    : 'Todos';

  // GPS state (internal, not shown to user)
  let userLocation = null;
  let nearbyMode = false;
  let currentRadius = DEFAULT_RADIUS;

  // Si el usuario ya dio permiso de ubicación previamente, la calculamos en silencio
  try {
    const perm = await navigator.permissions.query({ name: 'geolocation' });
    if (perm.state === 'granted') {
      userLocation = await getUserLocation();
      // Agrega 'distance' a todos sin filtrar por radio (radius=0)
      allResults = filterByProximity(allResults, userLocation.lat, userLocation.lng, 0);
    }
  } catch (e) {
    // Ignorar si el navegador no soporta permissions.query
  }

  function buildResultsHTML(results) {
    if (results.length > 0) {
      return `<div class="professionals-list" id="pro-results-list">
        ${results.map(pro => renderProfessionalListCard(pro, userLocation)).join('')}
      </div>`;
    }
    const msg = nearbyMode
      ? 'No encontramos profesionales cerca tuyo todavía 😔'
      : (query ? 'No encontramos ese servicio todavía 😔' : 'Aún no hay profesionales en esta categoría.');
    return `<div class="empty-state" id="pro-results-list">
      <div class="empty-state-icon">🔍</div>
      <div class="empty-state-title">${msg}</div>
      <div class="empty-state-desc" style="font-size:.9rem;color:var(--gray-500);margin-top:4px;">
        ${nearbyMode ? 'Probá ampliando la búsqueda o buscá en otra categoría.' : 'Probá con otra palabra o elegí una categoría.'}
      </div>
      <button class="btn btn-primary" onclick="window.location.hash='/search'" style="margin-top:16px;min-height:48px;font-size:1rem;">Ver todos</button>
    </div>`;
  }

  // Render main layout
  content.innerHTML = `
    <div style="padding:16px;">
      <div class="search-bar" style="box-shadow:var(--shadow-md);">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ADB5BD" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" placeholder="Ej: plomero, médico, técnico..." id="search-input" value="${query}" />
        <button class="search-btn" id="search-btn" aria-label="Buscar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
      </div>
    </div>

    <!-- Simple GPS button — no visible radius controls -->
    <div style="padding:0 16px 12px;display:flex;gap:10px;align-items:center;">
      <button id="btn-near-me" class="btn-near-me" style="min-height:44px;font-size:.9rem;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        Buscar cerca de mi casa
      </button>
    </div>

    <div style="padding:0 16px 8px;">
      <div class="filter-tabs" id="category-tabs">
        <button class="filter-tab ${!categoryId ? 'active' : ''}" data-cat="">Todos</button>
        ${categories.map(cat => `
          <button class="filter-tab ${categoryId === cat.id ? 'active' : ''}" data-cat="${cat.id}">
            ${cat.icon} ${cat.name}
          </button>`).join('')}
      </div>
    </div>

    <div class="section">
      <div class="section-header">
        <h2 class="section-title" id="results-title" style="font-size:1.1rem;">
          ${categoryId ? activeCatName : (query ? `Resultados: "${query}"` : 'Todos los profesionales')}
        </h2>
        <span style="font-size:.85rem;color:var(--gray-500);" id="results-count">
          ${allResults.length} resultado${allResults.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div id="results-wrapper">${buildResultsHTML(allResults)}</div>
    </div>`;

  // ── Helpers
  function refreshResults(results) {
    document.getElementById('results-wrapper').innerHTML = buildResultsHTML(results);
    document.getElementById('results-count').textContent =
      `${results.length} resultado${results.length !== 1 ? 's' : ''}`;
    document.getElementById('results-title').textContent = nearbyMode
      ? '📍 Profesionales cerca tuyo'
      : (categoryId ? activeCatName : (query ? `Resultados: "${query}"` : 'Todos los profesionales'));
  }

  // ── Near Me (auto-expand, no visible radius controls)
  document.getElementById('btn-near-me').addEventListener('click', async () => {
    const btn = document.getElementById('btn-near-me');

    // Toggle off
    if (nearbyMode) {
      nearbyMode = false;
      userLocation = null;
      btn.className = 'btn-near-me';
      btn.style.minHeight = '44px';
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        Buscar cerca de mi casa`;
      refreshResults(allResults);
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `<span style="display:inline-block;animation:spin 1s linear infinite;">⟳</span> Buscando tu ubicación...`;
    try {
      userLocation = await getUserLocation();
      nearbyMode = true;

      // Auto-expand radius until we find results
      let nearby = [];
      for (const opt of RADIUS_OPTIONS) {
        nearby = filterByProximity(allResults, userLocation.lat, userLocation.lng, opt.value);
        if (nearby.length > 0 || opt.value === 0) {
          currentRadius = opt.value;
          break;
        }
      }

      btn.disabled = false;
      btn.className = 'btn-near-me btn-near-me-active';
      btn.innerHTML = `📍 Cerca tuyo · Toca para ver todos`;

      refreshResults(nearby);
      if (nearby.length > 0) {
        showToast(`📍 ${nearby.length} profesional${nearby.length > 1 ? 'es' : ''} cerca tuyo`, 'success');
      } else {
        showToast('No encontramos profesionales con ubicación cargada cerca tuyo', '');
      }
    } catch (err) {
      btn.disabled = false;
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        Buscar cerca de mi casa`;
      showToast('No pudimos obtener tu ubicación. Activá el GPS e intentá de nuevo.', 'error');
    }
  });

  // ── Search
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const doSearch = () => {
    const q = searchInput.value.trim();
    window.location.hash = `/search?q=${encodeURIComponent(q)}${categoryId ? '&category=' + categoryId : ''}`;
  };
  searchBtn.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

  // ── Category Filters
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const cat = tab.dataset.cat;
      const q = searchInput.value.trim();
      let hash = '/search';
      const parts = [];
      if (q) parts.push(`q=${encodeURIComponent(q)}`);
      if (cat) parts.push(`category=${cat}`);
      if (parts.length) hash += '?' + parts.join('&');
      window.location.hash = hash;
    });
  });
}
