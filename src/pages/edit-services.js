// NexoPro — Edit Services Page
import { getCurrentUser, fetchMyServices, createService, deleteService } from '../lib/supabase.js';
import { showToast } from '../lib/toast.js';

export async function renderEditServices() {
  const content = document.getElementById('page-content');

  // Loading state
  content.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:50vh;">
      <div style="font-size:1.5rem;animation:pulse 1.5s infinite;">Cargando tus servicios...</div>
    </div>
  `;

  // Verify auth
  const user = await getCurrentUser();
  if (!user) {
    window.location.hash = '/login';
    return;
  }

  // Fetch current services
  let services = await fetchMyServices(user.id);

  // 1. Render initial skeleton layout
  content.innerHTML = `
    <div class="form-container">
      <div style="display:flex;align-items:center;margin-bottom:24px;gap:12px;">
        <button class="btn-back" onclick="window.location.hash='/dashboard'" aria-label="Volver">←</button>
        <h1 style="margin:0;font-size:1.5rem;">Mis Servicios</h1>
      </div>

      <div id="services-list-container">
        <!-- List will be injected here -->
      </div>

      <div class="section-header mt-8" style="margin-top:32px;">
        <h2 class="section-title">Agregar Nuevo Servicio</h2>
      </div>

      <form id="add-service-form" style="background:var(--gray-50);padding:20px;border-radius:var(--radius-lg);border:1px dashed var(--gray-300);" onsubmit="return false;">
        <div class="form-group">
          <label class="form-label" for="ns-title">Título del servicio</label>
          <input class="form-input" type="text" id="ns-title" placeholder="Ej: Consulta inicial, Reparación de PC..." required />
        </div>

        <div class="form-group">
          <label class="form-label" for="ns-price">Precio (opcional)</label>
          <input class="form-input" type="text" id="ns-price" placeholder="Ej: $15.000, A convenir, Desde $5.000..." />
        </div>

        <div class="form-group">
          <label class="form-label" for="ns-desc">Descripción (opcional)</label>
          <textarea class="form-input" id="ns-desc" rows="2" placeholder="Detallá qué incluye el servicio..."></textarea>
        </div>

        <button type="submit" class="btn btn-primary btn-block" id="ns-submit-btn">
          + Agregar Servicio
        </button>
      </form>
    </div>
  `;

  // 2. Function to render only the list items inside the container
  function updateServicesList() {
    const listContainer = document.getElementById('services-list-container');

    if (services.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state" style="padding:40px 20px;">
          <div class="empty-state-icon">🛠️</div>
          <div class="empty-state-title">Aún no tenés servicios</div>
          <div class="empty-state-desc">Agregá tu primer servicio para que los clientes sepan qué ofrecés y tus tarifas.</div>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = services.map(srv => `
      <div class="service-item" style="background:var(--white);padding:16px;border-radius:var(--radius-md);margin-bottom:12px;box-shadow:var(--shadow-sm);border:1px solid var(--gray-200);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div>
            <h3 style="font-size:1rem;margin:0 0 4px;font-weight:600;color:var(--text);">${srv.title}</h3>
            <div style="font-size:0.9rem;color:var(--primary);font-weight:600;margin-bottom:8px;">${srv.price_range || 'A convenir'}</div>
            ${srv.description ? `<p style="font-size:0.85rem;color:var(--gray-500);margin:0;">${srv.description}</p>` : ''}
          </div>
          <button class="btn-delete-service" data-id="${srv.id}" style="background:none;border:none;color:var(--danger);font-size:1.2rem;cursor:pointer;padding:4px;">🗑️</button>
        </div>
      </div>
    `).join('');

    // Attach delete listeners specific to these new items
    document.querySelectorAll('.btn-delete-service').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const id = e.currentTarget.dataset.id;
        if (confirm('¿Estás seguro de que querés eliminar este servicio?')) {
          const { error } = await deleteService(id);
          if (error) {
            showToast('❌ Error al eliminar', 'error');
          } else {
            services = services.filter(s => s.id !== id);
            showToast('✅ Servicio eliminado', 'success');
            updateServicesList();
          }
        }
      });
    });
  }

  // 3. Attach submit listener ONCE for the form
  document.getElementById('add-service-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('ns-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Agregando...';

    const newService = {
      profile_id: user.id,
      title: document.getElementById('ns-title').value,
      price_range: document.getElementById('ns-price').value,
      description: document.getElementById('ns-desc').value,
      is_active: true
    };

    const { data, error } = await createService(newService);

    if (error) {
      showToast('❌ Error: ' + error.message, 'error');
    } else if (data) {
      services.push(data);
      showToast('✅ Servicio agregado', 'success');
      document.getElementById('add-service-form').reset();
      updateServicesList();
    }

    btn.disabled = false;
    btn.textContent = '+ Agregar Servicio';
  });

  // Call it initially
  updateServicesList();
}

// showToast importado desde src/lib/toast.js
