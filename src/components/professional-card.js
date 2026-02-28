// NexoPro — Professional Card Component (con Favoritos)
import { formatDistance } from '../lib/geolocation.js';
import { isFavorite, toggleFavorite } from '../lib/favorites.js';
import { showToast } from '../lib/toast.js';

function getInitials(name) {
  return (name || '').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

// Card for home scroll  
export function renderProfessionalCard(pro) {
  const initials = getInitials(pro.full_name);
  const avatarBg = `hsl(${(pro.id.charCodeAt(0) * 47) % 360}, 65%, 55%)`;
  const fav = isFavorite(pro.id);
  return `
    <div class="professional-card" onclick="window.location.hash='/profile?id=${pro.id}'" id="pro-card-${pro.id}">
      <div class="professional-card-img" style="display:flex;align-items:center;justify-content:center;background:${pro.photo_url ? `url('${pro.photo_url}')` : avatarBg};background-size:cover;background-position:center;color:white;font-size:2rem;font-weight:800;position:relative;">
        ${!pro.photo_url ? initials : ''}
        <button class="fav-btn" data-proid="${pro.id}" onclick="event.stopPropagation()"
          style="position:absolute;top:8px;right:8px;width:36px;height:36px;border-radius:50%;
          background:rgba(255,255,255,0.9);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;
          font-size:1.1rem;box-shadow:0 2px 6px rgba(0,0,0,0.15);transition:transform .15s ease;"
          onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
          ${fav ? '❤️' : '🤍'}
        </button>
      </div>
      <div class="professional-card-body">
        <span class="professional-card-category">${pro.category_name || ''}</span>
        <h3 class="professional-card-name">${pro.full_name}</h3>
        <div class="professional-card-footer">
          <div class="professional-card-rating">★ <span>${pro.rating || 0}</span></div>
          <div class="professional-card-location">📍 ${pro.address ? pro.address.split(',').pop().trim() : 'Sin dirección'}</div>
        </div>
      </div>
    </div>`;
}

// Card for search results (list style)
export function renderProfessionalListCard(pro, userLocation = null) {
  const initials = getInitials(pro.full_name);
  const avatarBg = `hsl(${(pro.id.charCodeAt(0) * 47) % 360}, 65%, 55%)`;
  const profileLink = `window.location.hash='/profile?id=${pro.id}'`;
  const fav = isFavorite(pro.id);

  return `
    <div class="pro-list-card" id="pro-list-${pro.id}" style="background:#ffffff;border-radius:18px;padding:16px;gap:16px;display:flex;align-items:flex-start;position:relative;box-shadow:0 4px 15px rgba(0,0,0,0.04);border:1px solid #f8f9fa;">
      
      <!-- Fav button -->
      <button class="fav-btn" data-proid="${pro.id}" onclick="event.stopPropagation()"
        style="position:absolute;top:12px;right:12px;width:36px;height:36px;border-radius:50%;
        background:#ffffff;border:1px solid #eaebec;cursor:pointer;
        display:flex;align-items:center;justify-content:center;font-size:1.1rem;
        box-shadow:0 2px 5px rgba(0,0,0,0.05);transition:transform .15s ease;z-index:10;"
        onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
        ${fav ? '❤️' : '🤍'}
      </button>

      <!-- Avatar & Rating Column -->
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div onclick="${profileLink}"
          style="display:flex;align-items:center;justify-content:center;
          background:${pro.photo_url ? `url('${pro.photo_url}')` : avatarBg};
          background-size:cover;background-position:center;
          color:white;font-size:1.3rem;font-weight:700;
          width:68px;height:68px;min-width:68px;border-radius:16px;cursor:pointer;
          box-shadow:0 2px 8px rgba(0,0,0,0.06);">
          ${!pro.photo_url ? initials : ''}
        </div>
        <!-- Modern Floating Rating Pill -->
        <div style="font-size:.85rem;color:#1a1a1a;font-weight:800;display:flex;align-items:center;gap:4px;
          background:#ffffff;padding:4px 12px;border-radius:20px;
          box-shadow:0 2px 8px rgba(0,0,0,0.1);border:1px solid #f1f3f5;
          margin-top:-12px;z-index:2;cursor:default;">
          ⭐ ${pro.rating || 0}
        </div>
      </div>

      <!-- Info Column -->
      <div onclick="${profileLink}" style="flex:1;cursor:pointer;padding-top:2px;padding-right:45px;">
        <div style="font-size:.85rem;font-weight:800;color:#0066FF;margin-bottom:3px;letter-spacing:-0.2px;">
          ${pro.category_name || ''}
        </div>
        <div style="font-size:1.2rem;font-weight:800;color:#111827;margin-bottom:6px;line-height:1.2;letter-spacing:-0.3px;">
          ${pro.full_name}
        </div>
        
        <div style="display:flex;flex-direction:column;gap:6px;">
          <div style="font-size:.85rem;color:#6b7280;display:flex;align-items:center;gap:4px;">
            📍 <span>${pro.address ? pro.address.split(',').pop().trim() : 'Sin dirección'}</span>
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${pro.distance != null ? `<div style="background:#EBF3FF;color:#0d6efd;padding:4px 10px;border-radius:12px;font-size:.8rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;">📌 ${formatDistance(pro.distance)}</div>` : ''}
            ${pro.is_verified ? '<div style="background:#E5FDF4;color:#059669;padding:4px 10px;border-radius:12px;font-size:.8rem;font-weight:700;display:inline-flex;align-items:center;gap:4px;">✓ Verificado</div>' : ''}
          </div>
        </div>
      </div>

      <!-- Action Column (WhatsApp) -->
      <div style="display:flex;flex-direction:column;align-items:center;gap:4px;margin-top:24px;">
        <a href="https://wa.me/${(pro.whatsapp || '').replace(/\\D/g, '')}" target="_blank" onclick="event.stopPropagation()"
          style="display:flex;align-items:center;justify-content:center;
          width:52px;height:52px;border-radius:50%;
          background:#25D366;color:white;text-decoration:none;
          box-shadow:0 4px 12px rgba(37,211,102,0.3);
          transition:transform .15s ease;" 
          onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"
          aria-label="WhatsApp" id="wa-btn-${pro.id}">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .611.611l4.458-1.495A11.935 11.935 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.316 0-4.478-.658-6.32-1.793l-.378-.236-3.278 1.098 1.098-3.278-.236-.378A9.96 9.96 0 0 1 2 12C2 6.486 6.486 2 12 2s10 4.486 10 10-4.486 10-10 10z"/></svg>
        </a>
        <span style="font-size:.7rem;color:#6b7280;font-weight:600;margin-top:2px;">Contactar</span>
      </div>
    </div>`;
}

// Global click handler for favorite buttons
export function initFavoriteButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.fav-btn');
    if (!btn) return;
    e.stopPropagation();
    const proId = btn.dataset.proid;
    const added = toggleFavorite(proId);
    btn.textContent = added ? '❤️' : '🤍';
    btn.style.transform = 'scale(1.3)';
    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
    showToast(added ? '❤️ Guardado en favoritos' : '💔 Removido de favoritos', added ? 'success' : '');
  });
}
