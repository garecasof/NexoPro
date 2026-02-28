// NexoPro — Edit Location Page
import { getCurrentUser, fetchProfessionalById, updateLocation } from '../lib/supabase.js';
import { loadLeaflet } from '../main.js';
import { showToast } from '../lib/toast.js';

export async function renderEditLocation() {
  const content = document.getElementById('page-content');

  // Loading state
  content.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:50vh;">
      <div style="font-size:1.5rem;animation:pulse 1.5s infinite;">Cargando ubicación...</div>
    </div>
  `;

  // Verify auth
  const user = await getCurrentUser();
  if (!user) {
    window.location.hash = '/login';
    return;
  }

  // Fetch current profile for location data
  const profile = await fetchProfessionalById(user.id);
  const currentAddress = profile?.address || '';
  const currentLat = profile?.latitude || -24.1858;  // Default: San Salvador de Jujuy
  const currentLng = profile?.longitude || -65.2995;

  content.innerHTML = `
    <div class="form-container">
      <div style="display:flex;align-items:center;margin-bottom:24px;gap:12px;">
        <button class="btn-back" onclick="window.location.hash='/dashboard'" aria-label="Volver">←</button>
        <h1 style="margin:0;font-size:1.5rem;">Mi Ubicación</h1>
      </div>

      <div style="background:var(--blue-50);padding:16px;border-radius:var(--radius-md);margin-bottom:24px;border:1px solid var(--blue-200);color:var(--blue-800);font-size:0.9rem;">
        📍 Marcá en el mapa tu zona de cobertura o dirección principal para aparecer en las búsquedas cercanas de los clientes.
      </div>

      <form id="edit-location-form" onsubmit="return false;">
        <div class="form-group">
          <label class="form-label" for="el-address">Dirección o Zona de cobertura</label>
          <input class="form-input" type="text" id="el-address" value="${currentAddress}" placeholder="Ej: Palermo, CABA o Todo GBA" required />
        </div>

        <div class="form-group">
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:8px;">
            <label class="form-label" style="margin:0;">Ubicación exacta (Mapa)</label>
            <button type="button" id="btn-geolocate" class="btn btn-outline" style="padding:4px 8px;font-size:0.75rem;display:flex;align-items:center;gap:4px;">
              📍 Usar mi ubicación actual
            </button>
          </div>
          <div id="map" style="height:300px;border-radius:var(--radius-md);background:var(--gray-200);width:100%;z-index:0;"></div>
          <p style="font-size:0.75rem;color:var(--gray-500);margin-top:8px;">Arrastrá el pin rojo para marcar tu ubicación exacta.</p>
        </div>

        <input type="hidden" id="el-lat" value="${currentLat}" />
        <input type="hidden" id="el-lng" value="${currentLng}" />

        <button type="submit" class="btn btn-primary btn-block btn-lg mt-16" id="el-submit-btn">
          Guardar Ubicación
        </button>
      </form>
    </div>
  `;

  // Initialize Map with Lazy Loading
  setTimeout(async () => {
    try {
      const L = await loadLeaflet();
      const map = L.map('map').setView([currentLat, currentLng], 13);

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO'
      }).addTo(map);

      // Custom marker icon
      const markerIcon = L.divIcon({
        className: 'custom-pin',
        html: '<div style="background:var(--danger);width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 3px 6px rgba(0,0,0,0.3);transform:translate(-50%,-100%);"></div>',
        iconAnchor: [0, 0]
      });

      const marker = L.marker([currentLat, currentLng], {
        icon: markerIcon,
        draggable: true
      }).addTo(map);

      marker.on('dragend', function (e) {
        const position = marker.getLatLng();
        document.getElementById('el-lat').value = position.lat;
        document.getElementById('el-lng').value = position.lng;
      });

      // Geolocation Button Logic
      document.getElementById('btn-geolocate').addEventListener('click', () => {
        const btn = document.getElementById('btn-geolocate');
        const originalText = btn.innerHTML;
        btn.innerHTML = '⏳ Obteniendo...';
        btn.disabled = true;

        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            map.setView([lat, lng], 15);
            marker.setLatLng([lat, lng]);
            document.getElementById('el-lat').value = lat;
            document.getElementById('el-lng').value = lng;

            btn.innerHTML = '✅ Ubicación encontrada';
            setTimeout(() => {
              btn.innerHTML = originalText;
              btn.disabled = false;
            }, 2000);
          }, (error) => {
            console.error("Error obteniendo ubicación:", error);
            showToast('❌ No se pudo obtener la ubicación. Permisos denegados o error de red.', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
          }, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        } else {
          showToast('❌ Tu navegador no soporta geolocalización', 'error');
          btn.innerHTML = originalText;
          btn.disabled = false;
        }
      });

    } catch (e) {
      console.error("Error cargando mapa:", e);
      document.getElementById('map').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--gray-600);padding:20px;text-align:center;">El mapa no pudo cargar. Comprobá tu conexión a internet e intentá de nuevo.</div>';
    }
  }, 100);

  // Submit handler
  document.getElementById('edit-location-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('el-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    const address = document.getElementById('el-address').value;
    const lat = parseFloat(document.getElementById('el-lat').value);
    const lng = parseFloat(document.getElementById('el-lng').value);

    const { error } = await updateLocation(user.id, lat, lng, address);

    if (error) {
      showToast('❌ Error al guardar ubicación', 'error');
      btn.disabled = false;
      btn.textContent = 'Guardar Ubicación';
    } else {
      showToast('✅ Ubicación actualizada', 'success');
      setTimeout(() => {
        window.location.hash = '/dashboard';
      }, 1000);
    }
  });
}

// showToast importado desde src/lib/toast.js
