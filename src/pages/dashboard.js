// NexoPro — Dashboard Page (Panel del Profesional)
import { getCurrentUser, fetchProfessionalById, signOut, updateProfile, getInitials, incrementMarketingPoints } from '../lib/supabase.js';
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

  // Get initials for avatar using shared utility
  const initials = getInitials(profile.full_name);
  const avatarBg = `hsl(${((profile.id || '1').charCodeAt(0) * 47) % 360}, 65%, 55%)`;

  // Define dynamic content
  content.innerHTML = `
    <!-- Dashboard Header -->
    <div class="dashboard-header" style="text-align:center;">
      <div class="dashboard-avatar" style="background:${profile.photo_url ? `url('${profile.photo_url}')` : avatarBg}; background-size: cover; background-position: center;">
        ${!profile.photo_url ? initials : ''}
      </div>
      <p class="dashboard-greeting">👋 ¡Bienvenido de vuelta!</p>
      <h1 class="dashboard-name">${profile.full_name}</h1>
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-value">${profile.marketing_points || 0}</div>
          <div class="stat-label">Puntos Nexo</div>
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

      <div class="section-header mt-16">
        <h2 class="section-title">🚀 Mi Marketing (Vuelo Pro)</h2>
      </div>

      <div class="dashboard-menu-item" style="background:linear-gradient(135deg,rgba(255,107,107,0.1),rgba(255,142,83,0.1));" id="menu-promote-profile">
        <div class="dashboard-menu-icon" style="background:linear-gradient(135deg,#FF6B6B,#FF8E53);color:white;">🚀</div>
        <div class="dashboard-menu-text">
          <div class="dashboard-menu-title">Promocionarme (+Puntos)</div>
          <div class="dashboard-menu-desc">Compartí tu perfil en WhatsApp o redes para subir de ranking.</div>
        </div>
        <span class="dashboard-menu-arrow">→</span>
      </div>

      <div class="dashboard-menu-item" style="background:linear-gradient(135deg,rgba(147,51,234,0.1),rgba(192,132,252,0.1));" id="menu-generate-flyer">
        <div class="dashboard-menu-icon" style="background:linear-gradient(135deg,#9333EA,#C084FC);color:white;">🎨</div>
        <div class="dashboard-menu-text">
          <div class="dashboard-menu-title">Crear Flyer (Instagram)</div>
          <div class="dashboard-menu-desc">Imágen lista para subir a tus Historias o Reels.</div>
        </div>
        <span class="dashboard-menu-arrow">→</span>
      </div>

      <div class="dashboard-menu-item" id="menu-referral">
        <div class="dashboard-menu-icon" style="background:var(--accent);color:white;">🤝</div>
        <div class="dashboard-menu-text">
          <div class="dashboard-menu-title">Invitar a un colega (VIP)</div>
          <div class="dashboard-menu-desc">Ganá visibilidad destacada invitando a otros profesionales.</div>
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

      <div class="toggle-container">
        <div>
          <div style="font-size:.9rem;font-weight:600;" id="toggle-label">Perfil ${profile.is_active !== false ? 'visible' : 'oculto'}</div>
          <div style="font-size:.75rem;color:var(--gray-500);" id="toggle-desc">${profile.is_active !== false ? 'Los clientes pueden encontrarte.' : 'Tu perfil está oculto de las búsquedas.'}</div>
        </div>
        <label class="toggle-switch">
          <input type="checkbox" ${profile.is_active !== false ? 'checked' : ''} id="toggle-visibility">
          <span class="toggle-track">
            <span class="toggle-knob"></span>
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

  // Promote Profile flow
  const promoteBtn = document.getElementById('menu-promote-profile');
  if (promoteBtn) {
    promoteBtn.addEventListener('click', async () => {
      const shareUrl = `${window.location.origin}/#/profile?id=${profile.id}`;
      const shareData = {
        title: `Perfil Profesional de ${profile.full_name}`,
        text: `¡Hola! Te recomiendo mis servicios en NexoPro. Podés ver mi perfil completo aquí:`,
        url: shareUrl
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          await incrementMarketingPoints(profile.id, 5); // +5 puntos por promo activa
          showToast('🚀 ¡Puntos ganados! Tu ranking ha subido.', 'success');
          renderDashboard(); // Refresh stats
        } catch (e) { }
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast('📋 Link copiado. ¡Compartilo para ganar puntos!', 'success');
        await incrementMarketingPoints(profile.id, 2); // +2 puntos por copia de link
        renderDashboard();
      }
    });
  }

  // Flyer Generator (Step 2: Kit de Marketing)
  const flyerBtn = document.getElementById('menu-generate-flyer');
  if (flyerBtn) {
    flyerBtn.addEventListener('click', async () => {
      showToast('🎨 Generando tu flyer premium...', 'success');

      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');

      // 1. Background (Gradient modern)
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
      gradient.addColorStop(0, '#0056CC');
      gradient.addColorStop(1, '#00C853');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1920);

      // Glassmorphism card
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.roundRect(90, 300, 900, 1320, 40);
      ctx.fill();

      // NexoPro Logo Top
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 80px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NexoPro', 540, 180);

      // User avatar (Placeholder or real)
      if (profile.photo_url) {
        try {
          // El método definitivo libre de CORS: Fetch -> Blob -> Base64
          const proxyUrl = 'https://corsproxy.io/?' + encodeURIComponent(profile.photo_url);
          const response = await fetch(proxyUrl);
          const blob = await response.blob();

          const base64data = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });

          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = () => {
              ctx.save();
              ctx.beginPath();
              ctx.arc(540, 500, 150, 0, Math.PI * 2, true);
              ctx.closePath();
              ctx.clip();
              // Cubrir proporcionalmente (cover flow logic simple)
              const size = Math.min(img.width, img.height);
              const x = (img.width - size) / 2;
              const y = (img.height - size) / 2;
              ctx.drawImage(img, x, y, size, size, 390, 350, 300, 300);
              ctx.restore();
              resolve();
            };
            img.onerror = reject;
            // Base64 Data URI (CORS free domain)
            img.src = base64data;
          });
        } catch (e) {
          console.error("Flyer image load error (Base64):", e);
          drawFallbackAvatar();
        }
      } else {
        drawFallbackAvatar();
      }

      function drawFallbackAvatar() {
        ctx.fillStyle = avatarBg;
        ctx.beginPath();
        ctx.arc(540, 500, 150, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 120px "Inter", sans-serif';
        ctx.fillText(initials, 540, 545);
      }

      // Name & Category
      ctx.fillStyle = '#2C2C2C';
      ctx.font = 'bold 90px "Inter", sans-serif';
      ctx.fillText(profile.full_name, 540, 800);

      ctx.fillStyle = '#007BFF';
      ctx.font = '60px "Inter", sans-serif';
      ctx.fillText(profile.category_name || 'Servicios Profesionales', 540, 900);

      const city = profile.address ? profile.address.split(',').pop().trim() : '';
      if (city) {
        ctx.fillStyle = '#6C757D';
        ctx.font = '50px "Inter", sans-serif';
        ctx.fillText(`📍 ${city}`, 540, 1000);
      }

      // Decorative Stars
      ctx.fillStyle = '#FF9500';
      ctx.font = '80px Arial';
      let stars = '⭐⭐⭐⭐⭐';
      if (profile.rating > 0) stars = '⭐'.repeat(Math.round(profile.rating));
      ctx.fillText(stars, 540, 1150);

      // CTA Bottom
      ctx.fillStyle = '#00C853';
      ctx.roundRect(190, 1350, 700, 120, 60);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 45px "Inter", sans-serif';
      ctx.fillText('¡Contactame por WhatsApp!', 540, 1430);

      // Export
      canvas.toBlob(async (blob) => {
        const file = new File([blob], `flyer-${profile.full_name.replace(/\s/g, '')}.png`, { type: 'image/png' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Mi Flyer',
              text: '¡Buscame en NexoPro!'
            });
            await incrementMarketingPoints(profile.id, 5);
          } catch (e) { }
        } else {
          // Fallback download
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = file.name;
          a.click();
          URL.revokeObjectURL(url);
          showToast('📸 Flyer descargado. ¡Subilo a tus redes!', 'success');
        }
      }, 'image/png');

    });
  }

  // Referral flow (Placeholder for Step 3)
  const referBtn = document.getElementById('menu-referral');
  if (referBtn) {
    referBtn.addEventListener('click', () => {
      const refUrl = `${window.location.origin}/#/register?ref=${profile.id}`;
      navigator.clipboard.writeText(refUrl);
      showToast('🤝 Link de invitación copiado. Compartilo con colegas.', 'success');
    });
  }
}
