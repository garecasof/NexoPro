// NexoPro — Stats Page
import { getCurrentUser, fetchMyStats } from '../lib/supabase.js';

export async function renderStats() {
  const content = document.getElementById('page-content');

  // Loading state
  content.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:50vh;">
      <div style="font-size:1.5rem;animation:pulse 1.5s infinite;">Cargando métricas...</div>
    </div>
  `;

  // Verify auth
  const user = await getCurrentUser();
  if (!user) {
    window.location.hash = '/login';
    return;
  }

  // Fetch current stats
  const stats = await fetchMyStats(user.id);

  content.innerHTML = `
    <div class="form-container">
      <div style="display:flex;align-items:center;margin-bottom:24px;gap:12px;">
        <button class="btn-back" onclick="window.location.hash='/dashboard'" aria-label="Volver">←</button>
        <h1 style="margin:0;font-size:1.5rem;">Estadísticas</h1>
      </div>

      <div style="background:var(--gray-50);padding:20px;border-radius:var(--radius-lg);margin-bottom:24px;">
        <h2 style="font-size:1.1rem;margin:0 0 16px;">Rendimiento últimos 30 días</h2>
        
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
          <!-- Card 1 -->
          <div style="background:var(--white);border-radius:var(--radius-md);padding:16px;box-shadow:var(--shadow-sm);border:1px solid var(--gray-200);">
            <div style="font-size:0.85rem;color:var(--gray-500);margin-bottom:8px;">Visitas a tu perfil</div>
            <div style="font-size:1.8rem;font-weight:700;color:var(--primary);">${stats.profile_views}</div>
            <div style="font-size:0.75rem;color:var(--success);margin-top:4px;font-weight:600;">↗ ${stats.views_trend} vs. mes pasado</div>
          </div>
          
          <!-- Card 2 -->
          <div style="background:var(--white);border-radius:var(--radius-md);padding:16px;box-shadow:var(--shadow-sm);border:1px solid var(--gray-200);">
            <div style="font-size:0.85rem;color:var(--gray-500);margin-bottom:8px;">Clics a WhatsApp</div>
            <div style="font-size:1.8rem;font-weight:700;color:var(--green);">${stats.whatsapp_clicks}</div>
            <div style="font-size:0.75rem;color:var(--success);margin-top:4px;font-weight:600;">↗ ${stats.clicks_trend} vs. mes pasado</div>
          </div>
        </div>

        <!-- Card 3 -->
        <div style="background:var(--white);border-radius:var(--radius-md);padding:16px;box-shadow:var(--shadow-sm);border:1px solid var(--gray-200);">
          <div style="font-size:0.85rem;color:var(--gray-500);margin-bottom:8px;">Apariciones en búsquedas</div>
          <div style="font-size:1.8rem;font-weight:700;color:var(--text);">${stats.search_appearances}</div>
          <div style="font-size:0.75rem;color:var(--gray-500);margin-top:4px;">Veces que tu perfil apareció en listados</div>
        </div>
      </div>

      <!-- Quick tips -->
      <div style="border-left:4px solid var(--accent);background:var(--white);padding:16px;border-radius:var(--radius-md);box-shadow:var(--shadow-sm);">
        <h3 style="font-size:0.95rem;margin:0 0 8px;">💡 Tip para crecer</h3>
        <p style="font-size:0.85rem;color:var(--gray-500);margin:0;line-height:1.5;">Completá tu descripción, agregá más servicios detallados y pedile a tus clientes que te dejen reseñas. Los perfiles completos reciben hasta un <b>300% más</b> de contactos.</p>
      </div>

    </div>
  `;
}
