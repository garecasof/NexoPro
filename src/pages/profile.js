// NexoPro — Profile Page
import { fetchProfessionalById, createPublicReview, updateReviewByToken, getInitials, incrementMarketingPoints } from '../lib/supabase.js';
import { showToast } from '../lib/toast.js';
import { isFavorite } from '../lib/favorites.js';
import { loadLeaflet } from '../main.js';

export async function renderProfile(params = {}) {
  const content = document.getElementById('page-content');
  const proId = params.id;

  // Loading state
  content.innerHTML = `
      <div style="display:flex;justify-content:center;align-items:center;height:60vh;">
        <div style="font-size:1.5rem;animation:pulse 1.5s infinite;color:var(--primary);">Cargando perfil...</div>
      </div>
    `;

  const pro = await fetchProfessionalById(proId);

  if (!pro) {
    content.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">😕</div>
        <div class="empty-state-title">Profesional no encontrado</div>
        <div class="empty-state-desc">El perfil que buscás no está disponible.</div>
        <a href="#/" class="btn btn-primary">Volver al inicio</a>
      </div>
    `;
    return;
  }

  const initials = getInitials(pro.full_name);
  const avatarBg = `hsl(${(pro.id.charCodeAt(0) * 47) % 360}, 65%, 55%)`;

  // Generate simple captcha
  const captchaA = Math.floor(Math.random() * 9) + 1;
  const captchaB = Math.floor(Math.random() * 9) + 1;
  const captchaAnswer = captchaA + captchaB;

  content.innerHTML = `
    <!-- Back Button -->
    <div style="padding:16px 16px 0;">
      <button class="btn-back" onclick="history.back()" aria-label="Volver">←</button>
    </div>

    <!-- Profile Header -->
    <div class="profile-header">
      <div class="profile-avatar" style="display:flex;align-items:center;justify-content:center;background:${pro.photo_url ? `url('${pro.photo_url}')` : avatarBg};background-size:cover;background-position:center;color:white;font-size:2.2rem;font-weight:800;">
        ${!pro.photo_url ? initials : ''}
      </div>
      <h1 class="profile-name" style="font-size:1.5rem;">${pro.full_name}</h1>
      <p class="profile-specialty">${pro.category_name || 'Profesional'}</p>
      <div class="profile-rating">
        <span style="color:var(--star);">★</span> ${pro.rating}
        <span style="opacity:.7">(${pro.review_count} reseñas)</span>
      </div>
      ${pro.is_verified ? `
        <div class="profile-verified">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Verificado
        </div>
      ` : ''}
      ${pro.license_number ? `
        <div style="background:var(--gray-100);border-radius:8px;padding:6px 16px;margin-top:8px;font-size:0.85rem;color:var(--text);">
          📜 Matrícula: <strong>${pro.license_number}</strong>
        </div>
      ` : ''}
      <button class="fav-btn" data-proid="${pro.id}" 
        style="margin-top:12px;padding:10px 24px;border-radius:var(--radius-full);border:2px solid var(--gray-300);
        background:var(--white);cursor:pointer;font-size:1rem;display:inline-flex;align-items:center;gap:8px;
        box-shadow:var(--shadow-sm);transition:transform .15s ease;min-height:48px;"
        onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        ${isFavorite(pro.id) ? '❤️' : '🤍'} ${isFavorite(pro.id) ? 'Guardado en favoritos' : 'Guardar en favoritos'}
      </button>
    </div>

    <!-- Action Buttons -->
    <div class="profile-actions">
      <a href="https://wa.me/${(pro.whatsapp || '').replace(/\\D/g, '')}?text=${encodeURIComponent('Hola, te contacto desde NexoPro. Me gustaría consultarte sobre tus servicios.')}" target="_blank" class="profile-action-btn whatsapp" id="profile-wa-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
        WhatsApp
      </a>
      <a href="tel:${pro.phone}" class="profile-action-btn call" id="profile-call-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        Llamar
      </a>
      <button class="profile-action-btn" id="profile-share-btn" style="background:var(--gray-200);color:var(--text);border:none;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>
        Compartir
      </button>
      <button class="profile-action-btn" id="profile-pass-data-btn" style="background:#E3F2FD;color:#1976D2;border:none;flex:1.5;">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
        Pasar el dato (+1 punto)
      </button>
    </div>

    <!-- About -->
    <div class="profile-section">
      <h2 class="profile-section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        Acerca de
      </h2>
      <p style="font-size:.9rem;color:var(--gray-600);line-height:1.6;">${pro.description || 'Sin descripción aún.'}</p>
    </div>

    <!-- Info Grid -->
    <div class="profile-section" style="padding-top:0;">
      <div class="profile-info-grid">
        <div class="profile-info-item">
          <div class="profile-info-label">📍 Dirección</div>
          <div class="profile-info-value">${pro.address || 'No especificada'}</div>
        </div>
        <div class="profile-info-item">
          <div class="profile-info-label">📞 Teléfono</div>
          <div class="profile-info-value">${pro.phone || 'No especificado'}</div>
        </div>
        ${pro.license_number ? `
        <div class="profile-info-item">
          <div class="profile-info-label">🪪 Matrícula</div>
          <div class="profile-info-value">${pro.license_number}</div>
        </div>
        ` : ''}
        <div class="profile-info-item">
          <div class="profile-info-label">⭐ Calificación</div>
          <div class="profile-info-value">${pro.rating} / 5.0</div>
        </div>
      </div>
    </div>

    <!-- Services -->
    ${pro.services && pro.services.length > 0 ? `
    <div class="profile-section" style="padding-top:0;">
      <h2 class="profile-section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/></svg>
        Servicios
      </h2>
      ${pro.services.map(s => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 14px;background:var(--white);border-radius:var(--radius-md);margin-bottom:8px;box-shadow:var(--shadow-sm);">
          <span style="font-size:.9rem;font-weight:600;">${s.title}</span>
          <span style="font-size:.85rem;color:var(--primary);font-weight:700;">${s.price_range}</span>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <!-- Map -->
    <div class="profile-section" style="padding-top:0;">
      <h2 class="profile-section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        Ubicación
      </h2>
      <div class="profile-map" id="profile-map"></div>
    </div>

    <!-- Reviews -->
    <div class="profile-section" style="padding-top:0;">
      <h2 class="profile-section-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--star)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        Reseñas (${pro.reviews?.length || 0})
      </h2>
      ${(pro.reviews || []).map(r => `
        <div class="review-card">
          <div class="review-header">
            <div class="review-avatar">${r.reviewer_name[0]}</div>
            <div>
              <div class="review-name">${r.reviewer_name}</div>
              <div class="review-date">${new Date(r.created_at).toLocaleDateString('es-AR')}</div>
            </div>
          </div>
          <div class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
          <div class="review-text">${r.comment}</div>
        </div>
      `).join('')}

      <!-- Leave a Review Form -->
      <div style="margin-top:24px;background:var(--gray-50);border-radius:var(--radius-lg);padding:20px;border:1px solid var(--gray-200);">
        <h3 style="font-size:1rem;font-weight:700;margin:0 0 16px;">✍️ Dejá tu opinión</h3>
        <form id="review-form" onsubmit="return false;">
          <div class="form-group">
            <label class="form-label" for="rv-name">Tu nombre</label>
            <input class="form-input" type="text" id="rv-name" placeholder="Ej: María García" required />
          </div>
          <div class="form-group">
            <label class="form-label" for="rv-phone">Tu teléfono (no se mostrará)</label>
            <input class="form-input" type="tel" id="rv-phone" placeholder="Ej: 3884001234" required />
            <p style="font-size:0.7rem;color:var(--gray-500);margin-top:4px;">Se usa para evitar reseñas duplicadas y para que puedas editar tu opinión después.</p>
          </div>
          <div class="form-group">
            <label class="form-label">Calificación</label>
            <div id="rv-stars" style="display:flex;gap:6px;font-size:2rem;cursor:pointer;">
              <span data-star="1" style="color:var(--gray-300);">★</span>
              <span data-star="2" style="color:var(--gray-300);">★</span>
              <span data-star="3" style="color:var(--gray-300);">★</span>
              <span data-star="4" style="color:var(--gray-300);">★</span>
              <span data-star="5" style="color:var(--gray-300);">★</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="rv-comment">Tu comentario</label>
            <textarea class="form-input" id="rv-comment" rows="3" placeholder="Contá tu experiencia con este profesional..." required></textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="rv-captcha">Verificación: ¿Cuánto es ${captchaA} + ${captchaB}?</label>
            <input class="form-input" type="number" id="rv-captcha" placeholder="Tu respuesta" required style="max-width:150px;" />
          </div>
          <button type="submit" class="btn btn-primary btn-block" id="rv-submit-btn">Enviar Reseña</button>
        </form>
      </div>

      <!-- Edit Review Form (hidden by default) -->
      <div style="margin-top:16px;">
        <button class="btn btn-outline btn-block" id="rv-toggle-edit" style="font-size:0.85rem;">📝 ¿Ya dejaste una reseña? Editala aquí</button>
        <div id="rv-edit-section" style="display:none;margin-top:12px;background:var(--white);border-radius:var(--radius-md);padding:16px;border:1px solid var(--gray-200);">
          <div class="form-group">
            <label class="form-label" for="rv-edit-token">Código de edición</label>
            <input class="form-input" type="text" id="rv-edit-token" placeholder="Pegá el código que se te envió al dejar la reseña" />
          </div>
          <div class="form-group">
            <label class="form-label">Nueva calificación</label>
            <div id="rv-edit-stars" style="display:flex;gap:6px;font-size:2rem;cursor:pointer;">
              <span data-star="1" style="color:var(--gray-300);">★</span>
              <span data-star="2" style="color:var(--gray-300);">★</span>
              <span data-star="3" style="color:var(--gray-300);">★</span>
              <span data-star="4" style="color:var(--gray-300);">★</span>
              <span data-star="5" style="color:var(--gray-300);">★</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="rv-edit-comment">Nuevo comentario</label>
            <textarea class="form-input" id="rv-edit-comment" rows="3" placeholder="Escribí tu nueva opinión..."></textarea>
          </div>
          <button class="btn btn-primary btn-block" id="rv-edit-submit">Actualizar Reseña</button>
        </div>
      </div>
    </div>
  `;

  // ── Star Rating Logic ──
  let selectedRating = 0;
  const starsContainer = document.getElementById('rv-stars');
  starsContainer.querySelectorAll('[data-star]').forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.star);
      starsContainer.querySelectorAll('[data-star]').forEach(s => {
        s.style.color = parseInt(s.dataset.star) <= selectedRating ? '#FFA000' : 'var(--gray-300)';
      });
    });
    star.addEventListener('mouseenter', () => {
      const hoverVal = parseInt(star.dataset.star);
      starsContainer.querySelectorAll('[data-star]').forEach(s => {
        s.style.color = parseInt(s.dataset.star) <= hoverVal ? '#FFB300' : 'var(--gray-300)';
      });
    });
    starsContainer.addEventListener('mouseleave', () => {
      starsContainer.querySelectorAll('[data-star]').forEach(s => {
        s.style.color = parseInt(s.dataset.star) <= selectedRating ? '#FFA000' : 'var(--gray-300)';
      });
    });
  });

  // ── Edit Star Rating Logic ──
  let editRating = 0;
  const editStars = document.getElementById('rv-edit-stars');
  editStars.querySelectorAll('[data-star]').forEach(star => {
    star.addEventListener('click', () => {
      editRating = parseInt(star.dataset.star);
      editStars.querySelectorAll('[data-star]').forEach(s => {
        s.style.color = parseInt(s.dataset.star) <= editRating ? '#FFA000' : 'var(--gray-300)';
      });
    });
  });

  // ── Toggle Edit Section ──
  document.getElementById('rv-toggle-edit').addEventListener('click', () => {
    const section = document.getElementById('rv-edit-section');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
  });

  // ── Submit New Review ──
  document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('rv-submit-btn');

    // Validate captcha
    const captchaInput = parseInt(document.getElementById('rv-captcha').value);
    if (captchaInput !== captchaAnswer) {
      showToast('❌ Respuesta incorrecta. Intentá de nuevo.', 'error');
      return;
    }

    if (selectedRating === 0) {
      showToast('⚠️ Seleccioná una calificación (1 a 5 estrellas)', 'error');
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Enviando...';

    const reviewData = {
      profile_id: proId,
      reviewer_name: document.getElementById('rv-name').value.trim(),
      reviewer_phone: document.getElementById('rv-phone').value.trim(),
      rating: selectedRating,
      comment: document.getElementById('rv-comment').value.trim(),
      status: 'pending'
    };

    const { data, error } = await createPublicReview(reviewData);

    if (error) {
      showToast('❌ ' + error.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Enviar Reseña';
      return;
    }

    // Show the edit token to the user
    if (data?.edit_token) {
      showToast('✅ ¡Reseña enviada! Guardá tu código: ' + data.edit_token, 'success');
      // Also show it prominently
      const form = document.getElementById('review-form');
      form.innerHTML = `
        <div style="text-align:center;padding:20px;">
          <div style="font-size:2rem;margin-bottom:12px;">✅</div>
          <h3 style="margin:0 0 8px;">¡Gracias por tu opinión!</h3>
          <p style="font-size:0.9rem;color:var(--gray-500);margin-bottom:16px;">Tu reseña será revisada por el profesional antes de publicarse.</p>
          <div style="background:var(--gray-100);padding:12px;border-radius:8px;margin-bottom:8px;">
            <p style="font-size:0.8rem;color:var(--gray-500);margin:0 0 4px;">Tu código de edición (guardalo):</p>
            <code style="font-size:1.1rem;font-weight:700;color:var(--primary);word-break:break-all;">${data.edit_token}</code>
          </div>
          <p style="font-size:0.75rem;color:var(--gray-500);">Con este código podés modificar tu reseña en el futuro.</p>
        </div>
      `;
    } else {
      showToast('✅ ¡Reseña enviada! Será revisada antes de publicarse.', 'success');
    }
  });

  // ── Submit Edit Review ──
  document.getElementById('rv-edit-submit').addEventListener('click', async () => {
    const token = document.getElementById('rv-edit-token').value.trim();
    const comment = document.getElementById('rv-edit-comment').value.trim();

    if (!token) {
      showToast('⚠️ Ingresá tu código de edición', 'error');
      return;
    }
    if (editRating === 0 && !comment) {
      showToast('⚠️ Cambiá la calificación o el comentario', 'error');
      return;
    }

    const updates = {};
    if (editRating > 0) updates.rating = editRating;
    if (comment) updates.comment = comment;

    const btn = document.getElementById('rv-edit-submit');
    btn.disabled = true;
    btn.textContent = 'Actualizando...';

    const { data, error } = await updateReviewByToken(token, updates);

    if (error) {
      showToast('❌ Código inválido o error al actualizar', 'error');
    } else {
      showToast('✅ Reseña actualizada. Será revisada nuevamente.', 'success');
    }

    btn.disabled = false;
    btn.textContent = 'Actualizar Reseña';
  });

  // Share button
  const shareBtn = document.getElementById('profile-share-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const host = window.location.origin;
      // Use OG-friendly URL so WhatsApp/Facebook read the meta tags
      const shareUrl = `${host}/api/og?id=${pro.id}`;
      const shareTitle = `${pro.full_name} — ${pro.category_name || 'Profesional'}`;
      const shareText = `Mirá el perfil de ${pro.full_name} en NexoPro`;

      if (navigator.share) {
        try {
          await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
        } catch (e) { /* user cancelled */ }
      } else {
        // Fallback: copy to clipboard
        try {
          await navigator.clipboard.writeText(shareUrl);
          showToast('📋 Link copiado al portapapeles', 'success');
        } catch (e) {
          showToast('No se pudo copiar el link', 'error');
        }
      }
    });
  }

  // Pass Data button (WhatsApp recommendation)
  const passDataBtn = document.getElementById('profile-pass-data-btn');
  if (passDataBtn) {
    passDataBtn.addEventListener('click', async () => {
      const catName = pro.category_name || 'Profesional';
      const city = pro.address ? ` en ${pro.address.split(',').pop().trim()}` : '';
      const shareUrl = `${window.location.origin}/#/profile?id=${pro.id}`;
      const text = `¡Hola! Te paso el dato de este ${catName}${city} que encontré en NexoPro: ${pro.full_name}. Podés ver su perfil acá: ${shareUrl}`;

      const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(waUrl, '_blank');

      // Dar punto al profesional por ser compartido
      await incrementMarketingPoints(pro.id, 1);
    });
  }

  // Initialize map with lazy loading
  setTimeout(async () => {
    try {
      const L = await loadLeaflet();
      if (L && pro.latitude && pro.longitude) {
        const map = L.map('profile-map').setView([pro.latitude, pro.longitude], 15);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap'
        }).addTo(map);
        L.marker([pro.latitude, pro.longitude])
          .addTo(map)
          .bindPopup(`<b>${pro.full_name}</b><br>${pro.address}`)
          .openPopup();
      }
    } catch (err) {
      console.warn('Map could not be loaded:', err);
      const mapEl = document.getElementById('profile-map');
      if (mapEl) mapEl.innerHTML = '<div style="padding:20px;text-align:center;font-size:0.85rem;color:var(--gray-600);">Mapa no disponible</div>';
    }
  }, 100);
}
