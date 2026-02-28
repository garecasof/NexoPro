// NexoPro — Dashboard Page (Panel del Profesional)
import { getCurrentUser, fetchProfessionalById, signOut, updateProfile } from '../lib/supabase.js';
import { showToast } from '../lib/toast.js';

export async function renderDashboard() {
  const content = document.getElementById('page-content');

  // Loading state
  content.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:50vh;">
      <div style="font-size:1.5rem;animation:pulse 1.5s infinite;">Cargando tu panel...</div>
    </div>
  `;

  // Verify auth
  const user = await getCurrentUser();
  if (!user) {
    window.location.hash = '/login';
    return;
  }

  // Fetch real profile from DB
  let profile = await fetchProfessionalById(user.id);

  // If fallback fails and returns demo, check if it's the right ID, otherwise provide a default
  if (!profile || profile.id !== user.id) {
    profile = {
      full_name: user.user_metadata?.full_name || 'Profesional Nuevo',
      rating: 0,
      review_count: 0
    };
  }

  // Get initials for avatar
  const getInitials = (name) => name ? name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase() : '';
  const initials = getInitials(profile.full_name);
  const avatarBg = `hsl(${((profile.id || '1').charCodeAt(0) * 47) % 360}, 65%, 55%)`;

  // Define dynamic content
  content.innerHTML = `
    <!-- Dashboard Header -->
    <div class="dashboard-header" style="text-align:center;">
      <div style="width:72px;height:72px;margin:0 auto 12px;border-radius:50%;background:${profile.photo_url ? `url('${profile.photo_url}')` : avatarBg};background-size:cover;background-position:center;color:white;display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:700;box-shadow:var(--shadow-md); border: 2px solid white;">
        ${!profile.photo_url ? initials : ''}
      </div>
      <p class="dashboard-greeting">👋 ¡Bienvenido de vuelta!</p>
      <h1 class="dashboard-name">${profile.full_name}</h1>
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-value">0</div>
          <div class="stat-label">Contactos</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${profile.rating > 0 ? profile.rating : '-'}</div>
          <div class="stat-label">Calificación</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${profile.review_count}</div>
          <div class="stat-label">Reseñas</div>
        </div>
      </div>
    </div>

    <!-- Dashboard Menu -->
    <div class="dashboard-menu">
      <div class="section-header mt-8">
        <h2 class="section-title">Mi Panel</h2>
      </div>

      <div class="dashboard-menu-item" onclick="window.location.hash='/edit-profile'" id="menu-edit-profile">
        <div class="dashboard-menu-icon blue">📝</div>
        <div class="dashboard-menu-text">
          <div class="dashboard-menu-title">Editar mi perfil</div>
          <div class="dashboard-menu-desc">Nombre, foto, descripción y datos de contacto.</div>
        </div>
        <span class="dashboard-menu-arrow">→</span>
      </div>

      <div class="dashboard-menu-item" onclick="window.location.hash='/edit-services'" id="menu-edit-services">
        <div class="dashboard-menu-icon green">🛠️</div>
        <div class="dashboard-menu-text">
          <div class="dashboard-menu-title">Mis servicios</div>
          <div class="dashboard-menu-desc">Agregar, editar o eliminar servicios publicados.</div>
        </div>
        <span class="dashboard-menu-arrow">→</span>
      </div>

      <div class="dashboard-menu-item" onclick="window.location.hash='/edit-reviews'" id="menu-reviews">
        <div class="dashboard-menu-icon orange">⭐</div>
        <div class="dashboard-menu-text">
          <div class="dashboard-menu-title">Mis reseñas</div>
          <div class="dashboard-menu-desc">Ver las opiniones que dejaron tus clientes.</div>
        </div>
        <span class="dashboard-menu-arrow">→</span>
      </div>

      <div class="dashboard-menu-item" onclick="window.location.hash='/edit-location'" id="menu-location">
        <div class="dashboard-menu-icon blue">📍</div>
        <div class="dashboard-menu-text">
          <div class="dashboard-menu-title">Mi ubicación</div>
          <div class="dashboard-menu-desc">Actualizar tu dirección y punto en el mapa.</div>
        </div>
        <span class="dashboard-menu-arrow">→</span>
      </div>

      <div class="dashboard-menu-item" onclick="window.location.hash='/stats'" id="menu-stats">
        <div class="dashboard-menu-icon green">📊</div>
        <div class="dashboard-menu-text">
          <div class="dashboard-menu-title">Estadísticas</div>
          <div class="dashboard-menu-desc">Visualizaciones de perfil y contactos recibidos.</div>
        </div>
        <span class="dashboard-menu-arrow">→</span>
      </div>

      <!-- Visibility toggle -->
      <style>
        .toggle-switch input:checked + .toggle-track { background: var(--accent); }
        .toggle-switch input:checked + .toggle-track .toggle-knob { transform: translateX(22px); }
        .toggle-track { background: #ccc; }
        .toggle-knob { transform: translateX(0); }
      </style>
      <div style="background:var(--white);border-radius:var(--radius-md);padding:18px;margin-top:12px;box-shadow:var(--shadow-sm);display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-size:.9rem;font-weight:600;" id="toggle-label">Perfil ${profile.is_active !== false ? 'visible' : 'oculto'}</div>
          <div style="font-size:.75rem;color:var(--gray-500);" id="toggle-desc">${profile.is_active !== false ? 'Los clientes pueden encontrarte.' : 'Tu perfil está oculto de las búsquedas.'}</div>
        </div>
        <label class="toggle-switch" style="position:relative;display:inline-block;width:50px;height:28px;">
          <input type="checkbox" ${profile.is_active !== false ? 'checked' : ''} id="toggle-visibility" style="opacity:0;width:0;height:0;position:absolute;">
          <span class="toggle-track" style="position:absolute;cursor:pointer;inset:0;border-radius:var(--radius-full);transition:var(--transition);">
            <span class="toggle-knob" style="position:absolute;top:3px;left:3px;width:22px;height:22px;background:white;border-radius:50%;transition:var(--transition);"></span>
          </span>
        </label>
      </div>

      <!-- Logout -->
      <button class="btn btn-outline btn-block mt-24" id="btn-logout" style="color:var(--danger);border-color:var(--danger);">
        Cerrar sesión
      </button>
    </div>
  `;

  // Attach logout handler
  document.getElementById('btn-logout').addEventListener('click', async () => {
    const btn = document.getElementById('btn-logout');
    btn.textContent = 'Cerrando sesión...';
    btn.disabled = true;
    await signOut();
    window.location.hash = '/login';
  });

  // Hallazgo #3: Toggle de visibilidad conectado a Supabase
  const toggleVis = document.getElementById('toggle-visibility');
  if (toggleVis) {
    toggleVis.addEventListener('change', async (e) => {
      const isActive = e.target.checked;
      try {
        const result = await updateProfile(user.id, { is_active: isActive });
        if (result.error) {
          showToast('❌ Error al cambiar visibilidad: ' + (result.error.message || 'desconocido'), 'error');
          e.target.checked = !isActive; // revert
        } else {
          // Actualizar textos visualmente
          document.getElementById('toggle-label').textContent = isActive ? 'Perfil visible' : 'Perfil oculto';
          document.getElementById('toggle-desc').textContent = isActive ? 'Los clientes pueden encontrarte.' : 'Tu perfil está oculto de las búsquedas.';
          showToast(isActive ? '✅ Perfil visible para clientes' : '⚠️ Perfil oculto', isActive ? 'success' : '');
        }
      } catch (err) {
        showToast('❌ Error inesperado: ' + err.message, 'error');
        e.target.checked = !isActive;
      }
    });
  }
}
