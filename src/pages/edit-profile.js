// NexoPro — Edit Profile Page
import { getCurrentUser, fetchProfessionalById, updateProfile, fetchCategories, fetchSubcategories, uploadProfilePhoto, LICENSE_REQUIRED_GROUPS } from '../lib/supabase.js';
import { showToast } from '../lib/toast.js';

function getInitials(name) {
  if (!name) return '';
  return name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
}

export async function renderEditProfile() {
  const content = document.getElementById('page-content');

  // Loading state
  content.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:50vh;">
      <div style="font-size:1.5rem;animation:pulse 1.5s infinite;">Cargando perfil...</div>
    </div>
  `;

  // Verify auth
  const user = await getCurrentUser();
  if (!user) {
    window.location.hash = '/login';
    return;
  }

  // Fetch current profile and categories in parallel
  const [profileResult, categories] = await Promise.all([
    fetchProfessionalById(user.id),
    fetchCategories()
  ]);

  let profile = profileResult;
  if (!profile || profile.id !== user.id) {
    profile = {
      full_name: user.user_metadata?.full_name || '',
      category_id: '',
      description: '',
      whatsapp: '',
      address: '',
      photo_url: '',
      license_number: ''
    };
  }

  // Determine if current category_id is a subcategory
  // If so, find its parent to preselect the main category dropdown
  let currentParentId = profile.category_id || '';
  let currentSubId = '';

  // Check if the profile's category is actually a subcategory by looking through parents
  for (const cat of categories) {
    const subs = await fetchSubcategories(cat.id);
    const match = subs.find(s => s.id === profile.category_id);
    if (match) {
      currentParentId = cat.id;
      currentSubId = profile.category_id;
      break;
    }
  }

  // Group categories dynamically
  const groupedCategories = categories.reduce((acc, cat) => {
    const groupName = cat.group || 'Servicios';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(cat);
    return acc;
  }, {});

  const categoryOptions = Object.entries(groupedCategories).map(([group, cats]) => {
    const groupLabel = group.charAt(0).toUpperCase() + group.slice(1);
    return `<optgroup label="${groupLabel}">
      ${cats.map(c => `<option value="${c.id}" data-group="${c.group || ''}" ${currentParentId === c.id ? 'selected' : ''}>${c.icon} ${c.name}</option>`).join('')}
    </optgroup>`;
  }).join('');

  // Get current group to determine license visibility
  const currentCat = categories.find(c => c.id === currentParentId);
  const showLicense = currentCat ? LICENSE_REQUIRED_GROUPS.includes(currentCat.group) : false;

  // Load subcategories for current parent
  let subcatOptions = '';
  if (currentParentId) {
    const subs = await fetchSubcategories(currentParentId);
    if (subs.length > 0) {
      subcatOptions = subs.map(s => `<option value="${s.id}" ${currentSubId === s.id ? 'selected' : ''}>${s.icon} ${s.name}</option>`).join('');
    }
  }

  content.innerHTML = `
    <div class="form-container">
      <div style="display:flex;align-items:center;margin-bottom:24px;gap:12px;">
        <button class="btn-back" onclick="window.location.hash='/dashboard'" aria-label="Volver">←</button>
        <h1 style="margin:0;font-size:1.5rem;">Editar Mi Perfil</h1>
      </div>

      <form id="edit-profile-form" onsubmit="return false;">
        <!-- Avatar Upload -->
        <div class="form-group" style="text-align:center; display:flex; flex-direction:column; align-items:center;">
          <div style="position:relative; width:100px; height:100px; margin-bottom:12px;">
            <div id="ep-avatar-preview" style="width:100px; height:100px; border-radius:50%; background-color:var(--primary); background-image:${profile.photo_url ? `url('${profile.photo_url}')` : 'none'}; background-size:cover; background-position:center; display:flex; align-items:center; justify-content:center; color:white; font-weight:800; font-size:2.2rem; overflow:hidden;">
                ${!profile.photo_url ? getInitials(profile.full_name) : ''}
            </div>
            <label for="ep-photo-upload" style="position:absolute; bottom:0; right:0; background:var(--accent); color:white; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:var(--shadow-sm); transition:transform .2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </label>
            <input type="file" id="ep-photo-upload" accept="image/*" style="display:none;" />
          </div>
          <p style="font-size:0.8rem;color:var(--gray-500);margin:0;">Formatos JPG, PNG (Max 2MB)</p>
        </div>

        <div class="form-group">
          <label class="form-label" for="ep-name">Nombre completo o de la empresa</label>
          <input class="form-input" type="text" id="ep-name" value="${profile.full_name || ''}" required />
        </div>

        <div class="form-group">
          <label class="form-label" for="ep-category">Categoría profesional (Rubro)</label>
          <select class="form-select" id="ep-category" required>
            <option value="" disabled ${!currentParentId ? 'selected' : ''}>Seleccioná tu rubro</option>
            ${categoryOptions}
          </select>
        </div>

        <!-- Specialty (subcategory) - dynamic -->
        <div class="form-group" id="ep-specialty-group" style="display:${subcatOptions ? 'block' : 'none'};">
          <label class="form-label" for="ep-specialty">Especialidad</label>
          <select class="form-select" id="ep-specialty">
            <option value="">Seleccioná tu especialidad</option>
            ${subcatOptions}
          </select>
        </div>

        <!-- License / Matrícula - dynamic -->
        <div class="form-group" id="ep-license-group" style="display:${showLicense ? 'block' : 'none'};">
          <label class="form-label" for="ep-license">Matrícula / Registro Profesional</label>
          <input class="form-input" type="text" id="ep-license" value="${profile.license_number || ''}" placeholder="Ej: MP 12345 o CPCE T°312 F°89" />
          <p style="font-size:0.75rem;color:var(--gray-500);margin-top:4px;">Este dato se mostrará en tu perfil público para dar confianza a tus clientes</p>
        </div>

        <div class="form-group">
          <label class="form-label" for="ep-desc">Descripción (Sobre mí/nosotros)</label>
          <textarea class="form-input" id="ep-desc" rows="4" placeholder="Escribí un breve resumen de tu experiencia y servicios...">${profile.description || ''}</textarea>
        </div>

        <div class="form-group">
          <label class="form-label" for="ep-whatsapp">WhatsApp de contacto</label>
          <input class="form-input" type="tel" id="ep-whatsapp" value="${profile.whatsapp || ''}" placeholder="Ej: 5491100001111" required />
          <p style="font-size:0.75rem;color:var(--gray-500);margin-top:4px;">Debe incluir el código de país (ej: 549 para Argentina)</p>
        </div>

        <div class="form-group">
          <label class="form-label" for="ep-address">Dirección o Zona de cobertura</label>
          <input class="form-input" type="text" id="ep-address" value="${profile.address || ''}" placeholder="Ej: Palermo, CABA o Todo GBA" />
        </div>

        <button type="submit" class="btn btn-primary btn-block btn-lg mt-16" id="ep-submit-btn">
          Guardar Cambios
        </button>
      </form>
    </div>
  `;

  // ── Dynamic Category Change Handler ──
  const categorySelect = document.getElementById('ep-category');
  categorySelect.addEventListener('change', async () => {
    const selectedCatId = categorySelect.value;
    const selectedOption = categorySelect.options[categorySelect.selectedIndex];
    const selectedGroup = selectedOption.dataset.group || '';

    // Toggle license field
    const licenseGroup = document.getElementById('ep-license-group');
    licenseGroup.style.display = LICENSE_REQUIRED_GROUPS.includes(selectedGroup) ? 'block' : 'none';

    // Load subcategories for the selected parent
    const specialtyGroup = document.getElementById('ep-specialty-group');
    const specialtySelect = document.getElementById('ep-specialty');
    const subs = await fetchSubcategories(selectedCatId);

    if (subs.length > 0) {
      specialtySelect.innerHTML = `
        <option value="">Seleccioná tu especialidad</option>
        ${subs.map(s => `<option value="${s.id}">${s.icon} ${s.name}</option>`).join('')}
      `;
      specialtyGroup.style.display = 'block';
    } else {
      specialtySelect.innerHTML = '<option value="">Sin especialidades</option>';
      specialtyGroup.style.display = 'none';
    }
  });

  // Handle photo preview
  let selectedFile = null;
  document.getElementById('ep-photo-upload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast('⚠️ La imagen no debe superar los 2MB', 'error');
        e.target.value = '';
        return;
      }
      selectedFile = file;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const preview = document.getElementById('ep-avatar-preview');
        preview.style.backgroundImage = `url('${ev.target.result}')`;
        preview.innerHTML = ''; // Clear initials
      };
      reader.readAsDataURL(file);
    }
  });

  // Submit handler
  document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('ep-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Guardando...';

    // Upload photo first if selected
    if (selectedFile) {
      btn.textContent = 'Subiendo foto...';
      const { error: photoError } = await uploadProfilePhoto(user.id, selectedFile);
      if (photoError) {
        console.error('Photo upload error:', photoError);
        showToast('❌ Error al subir la foto: ' + (photoError.message || 'Verificá el bucket "avatars"'), 'error');
        btn.disabled = false;
        btn.textContent = 'Guardar Cambios';
        return;
      }
    }

    // Pick the most specific category: specialty if chosen, otherwise main category
    const specialtyVal = document.getElementById('ep-specialty').value;
    const mainCatVal = document.getElementById('ep-category').value;
    const finalCategoryId = specialtyVal || mainCatVal;

    const rawWhatsapp = document.getElementById('ep-whatsapp').value;
    // Limpiar número y usar detección de país por IP (phone.js)
    const { formatWhatsAppNumber } = await import('../lib/phone.js');
    const cleanWa = await formatWhatsAppNumber(rawWhatsapp);

    const updates = {
      full_name: document.getElementById('ep-name').value,
      category_id: finalCategoryId,
      description: document.getElementById('ep-desc').value,
      whatsapp: cleanWa,
      phone: '+' + cleanWa,
      address: document.getElementById('ep-address').value,
      license_number: document.getElementById('ep-license').value || null,
      updated_at: new Date().toISOString()
    };

    btn.textContent = 'Guardando datos...';
    const { error } = await updateProfile(user.id, updates);

    if (error) {
      showToast('❌ Error al guardar datos: ' + error.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Guardar Cambios';
    } else {
      showToast('✅ Perfil actualizado correctamente', 'success');
      setTimeout(() => {
        window.location.hash = '/dashboard';
      }, 1000);
    }
  });
}

// showToast importado desde src/lib/toast.js
