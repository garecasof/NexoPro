// NexoPro — Edit Reviews Page
import { getCurrentUser, fetchMyReviews, updateReviewStatus, recalculateRating } from '../lib/supabase.js';
import { showToast } from '../lib/toast.js';

export async function renderEditReviews() {
  const content = document.getElementById('page-content');

  // Loading state
  content.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:50vh;">
      <div style="font-size:1.5rem;animation:pulse 1.5s infinite;">Cargando tus reseñas...</div>
    </div>
  `;

  // Verify auth
  const user = await getCurrentUser();
  if (!user) {
    window.location.hash = '/login';
    return;
  }

  // Fetch current reviews
  const reviews = await fetchMyReviews(user.id);

  function renderReviewsList() {
    const pending = reviews.filter(r => r.status === 'pending');
    const approved = reviews.filter(r => r.status === 'approved');

    let html = '';

    // Pending Section
    if (pending.length > 0) {
      html += `
        <div class="section-header" style="margin-top:20px;">
          <h2 class="section-title" style="color:var(--primary);">Pendientes de aprobación (${pending.length})</h2>
        </div>
        ${pending.map(rev => `
          <div class="review-item" style="background:var(--blue-50);padding:16px;border-radius:var(--radius-md);margin-bottom:12px;box-shadow:var(--shadow-sm);border:1px solid var(--blue-200);">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
              <div>
                <h3 style="font-size:1rem;margin:0 0 2px;font-weight:600;color:var(--text);">${rev.reviewer_name}</h3>
                <div style="font-size:0.8rem;color:var(--gray-500);">${new Date(rev.created_at).toLocaleDateString('es-AR')}</div>
                ${rev.reviewer_phone ? `<div style="font-size:0.75rem;color:var(--gray-400);">📞 ${rev.reviewer_phone}</div>` : ''}
              </div>
              <div style="color:#FFA000;font-size:1.1rem;">
                ${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}
              </div>
            </div>
            ${rev.comment ? `<p style="font-size:0.9rem;color:var(--text);margin:0 0 12px 0;">"${rev.comment}"</p>` : ''}
            <div style="display:flex;gap:8px;">
              <button class="btn btn-primary btn-sm btn-approve" data-id="${rev.id}" style="padding:4px 12px;font-size:0.8rem;">Aprobar</button>
              <button class="btn btn-outline btn-sm btn-reject" data-id="${rev.id}" style="padding:4px 12px;font-size:0.8rem;color:var(--danger);border-color:var(--danger);">Rechazar</button>
            </div>
          </div>
        `).join('')}
      `;
    }

    // Approved Section
    html += `
      <div class="section-header" style="margin-top:24px;">
        <h2 class="section-title">Reseñas Publicadas (${approved.length})</h2>
      </div>
    `;

    if (approved.length === 0) {
      html += `
        <div class="empty-state" style="padding:40px 20px;">
          <div class="empty-state-icon">⭐</div>
          <div class="empty-state-title">No hay reseñas publicadas</div>
          <div class="empty-state-desc">Las reseñas que apruebes aparecerán aquí y en tu perfil público.</div>
        </div>
      `;
    } else {
      html += approved.map(rev => `
        <div class="review-item" style="background:var(--white);padding:16px;border-radius:var(--radius-md);margin-bottom:12px;box-shadow:var(--shadow-sm);border:1px solid var(--gray-200);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <div>
              <h3 style="font-size:1rem;margin:0 0 2px;font-weight:600;color:var(--text);">${rev.reviewer_name}</h3>
              <div style="font-size:0.8rem;color:var(--gray-500);">${new Date(rev.created_at).toLocaleDateString('es-AR')}</div>
            </div>
            <div style="color:#FFA000;font-size:1.1rem;">
              ${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}
            </div>
          </div>
          ${rev.comment ? `<p style="font-size:0.9rem;color:var(--text);margin:0;">"${rev.comment}"</p>` : ''}
        </div>
      `).join('');
    }

    return html;
  }

  function attachHandlers() {
    document.querySelectorAll('.btn-approve').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        btn.disabled = true;
        btn.textContent = '...';
        const { error } = await updateReviewStatus(id, 'approved');
        if (error) {
          showToast('❌ Error al aprobar', 'error');
          btn.disabled = false;
          btn.textContent = 'Aprobar';
        } else {
          await recalculateRating(user.id);
          showToast('✅ Reseña aprobada y publicada', 'success');
          renderEditReviews(); // Re-render everything
        }
      });
    });

    document.querySelectorAll('.btn-reject').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (confirm('¿Estás seguro de que querés rechazar esta reseña? No se mostrará en tu perfil.')) {
          btn.disabled = true;
          const { error } = await updateReviewStatus(id, 'rejected');
          if (error) {
            showToast('❌ Error al rechazar', 'error');
            btn.disabled = false;
          } else {
            showToast('⚠️ Reseña rechazada', 'success');
            renderEditReviews();
          }
        }
      });
    });
  }

  content.innerHTML = `
    <div class="form-container">
      <div style="display:flex;align-items:center;margin-bottom:24px;gap:12px;">
        <button onclick="window.location.hash='/dashboard'" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text);padding:4px;">←</button>
        <h1 style="margin:0;font-size:1.5rem;">Mis Reseñas</h1>
      </div>

      <div style="background:var(--primary);color:white;padding:16px;border-radius:var(--radius-lg);margin-bottom:24px;text-align:center;">
        <div style="font-size:2rem;font-weight:700;margin-bottom:4px;">${reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '-'}</div>
        <div style="font-size:0.9rem;opacity:0.9;">Calificación promedio de ${reviews.length} reseñas</div>
      </div>

      <div id="reviews-list-container">
        ${renderReviewsList()}
      </div>
      
      <div style="margin-top:24px;text-align:center;">
        <button class="btn btn-outline" style="width:100%;" id="btn-share-profile">
          📤 Compartir mi perfil
        </button>
      </div>
    </div>
  `;

  // Hallazgo #10: Compartir perfil con Web Share API
  document.getElementById('btn-share-profile').addEventListener('click', async () => {
    const profileUrl = `${window.location.origin}/#/profile?id=${user.id}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Mi perfil en NexoPro', url: profileUrl });
      } catch (e) { /* usuario canceló */ }
    } else {
      await navigator.clipboard.writeText(profileUrl);
      showToast('📋 Enlace copiado al portapapeles', 'success');
    }
  });

  attachHandlers();
}
