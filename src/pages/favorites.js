// NexoPro — Favorites Page
import { fetchProfessionalById } from '../lib/supabase.js';
import { getFavorites } from '../lib/favorites.js';
import { renderProfessionalListCard } from '../components/professional-card.js';

export async function renderFavorites() {
    const content = document.getElementById('page-content');
    const favIds = getFavorites();

    if (favIds.length === 0) {
        content.innerHTML = `
      <div class="empty-state" style="padding-top:80px;">
        <div class="empty-state-icon">❤️</div>
        <div class="empty-state-title">Todavía no tenés favoritos</div>
        <div class="empty-state-desc" style="font-size:.9rem;color:var(--gray-500);max-width:280px;margin:8px auto 0;">
          Cuando veas un profesional que te interese, tocá el corazón ❤️ para guardarlo acá.
        </div>
        <a href="#/search" class="btn btn-primary" style="margin-top:20px;min-height:48px;font-size:1rem;">Buscar profesionales</a>
      </div>`;
        return;
    }

    content.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:60vh;">
      <div style="font-size:1.5rem;animation:pulse 1.5s infinite;color:var(--primary);">Cargando favoritos...</div>
    </div>`;

    // Fetch all favorite professionals
    const professionals = [];
    for (const id of favIds) {
        try {
            const pro = await fetchProfessionalById(id);
            if (pro) professionals.push(pro);
        } catch (e) { /* skip invalid */ }
    }

    if (professionals.length === 0) {
        content.innerHTML = `
      <div class="empty-state" style="padding-top:80px;">
        <div class="empty-state-icon">😕</div>
        <div class="empty-state-title">No pudimos cargar tus favoritos</div>
        <div class="empty-state-desc" style="font-size:.9rem;color:var(--gray-500);">
          Puede que los profesionales guardados ya no estén disponibles.
        </div>
        <a href="#/search" class="btn btn-primary" style="margin-top:20px;min-height:48px;font-size:1rem;">Buscar profesionales</a>
      </div>`;
        return;
    }

    content.innerHTML = `
    <div class="section">
      <div class="section-header" style="padding:16px 16px 8px;">
        <h2 class="section-title" style="font-size:1.15rem;">❤️ Mis Favoritos</h2>
        <span style="font-size:.85rem;color:var(--gray-500);">${professionals.length} guardado${professionals.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="professionals-list">
        ${professionals.map(pro => renderProfessionalListCard(pro)).join('')}
      </div>
    </div>`;
}
