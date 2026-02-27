// NexoPro — Login / Register Page
import { fetchCategories } from '../lib/supabase.js';
import { showToast } from '../lib/toast.js';

export async function renderLogin(params = {}) {
  const content = document.getElementById('page-content');
  const isRegister = params.mode === 'register';

  if (isRegister) {
    content.innerHTML = `
      <div style="display:flex;justify-content:center;align-items:center;height:50vh;">
        <div style="font-size:1.5rem;animation:pulse 1.5s infinite;">Preparando formulario...</div>
      </div>
    `;
  }

  // Build category options dynamically from Supabase
  const categories = await fetchCategories();
  const groupedCategories = categories.reduce((acc, cat) => {
    const groupName = cat.group || 'Servicios';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(cat);
    return acc;
  }, {});

  const categoryOptions = Object.entries(groupedCategories).map(([group, cats]) => {
    const groupLabel = group.charAt(0).toUpperCase() + group.slice(1);
    return `<optgroup label="${groupLabel}">
        ${cats.map(c => `<option value="${c.id}">${c.icon} ${c.name}</option>`).join('')}
      </optgroup>`;
  }).join('');

  content.innerHTML = `
    <div class="form-container">
      <!-- Logo -->
      <div class="form-hero">
        <div style="margin-bottom:16px;">
          <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" fill="#007BFF"/>
            <path d="M20 28C20 24 24 20 32 20C40 20 44 24 44 28C44 34 38 36 32 36" stroke="white" stroke-width="3" stroke-linecap="round"/>
            <circle cx="32" cy="44" r="2.5" fill="#00C853"/>
          </svg>
        </div>
        <h1>${isRegister ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
        <p>${isRegister ? 'Registrate como profesional en NexoPro' : 'Accedé a tu panel de profesional'}</p>
      </div>

      <!-- Toggle Login / Register -->
      <div style="display:flex;gap:4px;background:var(--gray-100);border-radius:var(--radius-full);padding:4px;margin-bottom:24px;">
        <button class="btn ${!isRegister ? 'btn-primary' : ''}" style="flex:1;padding:10px;border-radius:var(--radius-full);font-size:.85rem;${!isRegister ? '' : 'color:var(--gray-500);'}" onclick="window.location.hash='/login'" id="tab-login">
          Iniciar sesión
        </button>
        <button class="btn ${isRegister ? 'btn-primary' : ''}" style="flex:1;padding:10px;border-radius:var(--radius-full);font-size:.85rem;${isRegister ? '' : 'color:var(--gray-500);'}" onclick="window.location.hash='/login?mode=register'" id="tab-register">
          Registrarse
        </button>
      </div>

      <form id="auth-form" onsubmit="return false;">
        ${isRegister ? `
          <div class="form-group">
            <label class="form-label" for="reg-name">Nombre completo</label>
            <input class="form-input" type="text" id="reg-name" placeholder="Ej: Dr. Juan Pérez" required />
          </div>
        ` : ''}

        <div class="form-group">
          <label class="form-label" for="auth-email">Correo electrónico</label>
          <input class="form-input" type="email" id="auth-email" placeholder="tu@email.com" required />
        </div>

        <div class="form-group">
          <label class="form-label" for="auth-password">Contraseña</label>
          <input class="form-input" type="password" id="auth-password" placeholder="${isRegister ? 'Mínimo 6 caracteres' : 'Tu contraseña'}" minlength="6" required />
        </div>

        ${isRegister ? `
          <div class="form-group">
            <label class="form-label" for="reg-whatsapp">WhatsApp</label>
            <input class="form-input" type="tel" id="reg-whatsapp" placeholder="Ej: 5491100001111" required />
          </div>

          <div class="form-group">
            <label class="form-label" for="reg-category">Categoría profesional</label>
            <select class="form-select" id="reg-category" required>
              <option value="" disabled selected>Seleccioná tu rubro</option>
              ${categoryOptions}
            </select>
          </div>
        ` : ''}

        <button type="submit" class="btn btn-primary btn-block btn-lg mt-16" id="auth-submit-btn">
          ${isRegister ? 'Crear mi cuenta' : 'Iniciar sesión'}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </button>
      </form>

      ${!isRegister ? `
        <p style="text-align:center;margin-top:16px;font-size:.85rem;color:var(--gray-500);">
          ¿No tenés cuenta? <a href="#/login?mode=register" style="color:var(--primary);font-weight:600;">Registrate gratis</a>
        </p>
      ` : `
        <p style="text-align:center;margin-top:16px;font-size:.85rem;color:var(--gray-500);">
          ¿Ya tenés cuenta? <a href="#/login" style="color:var(--primary);font-weight:600;">Iniciá sesión</a>
        </p>
      `}
    </div>
  `;

  // Hallazgo #14: Validación de email en tiempo real
  const emailInput = document.getElementById('auth-email');
  emailInput.addEventListener('input', () => {
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
    emailInput.style.borderColor = emailInput.value.length > 0 ? (valid ? 'var(--success)' : 'var(--danger)') : '';
  });

  // Form submit handler
  document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('auth-submit-btn');
    btn.disabled = true;
    btn.textContent = isRegister ? 'Creando cuenta...' : 'Ingresando...';

    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;

    try {
      if (isRegister) {
        const name = document.getElementById('reg-name').value;
        const rawWhatsapp = document.getElementById('reg-whatsapp').value;
        const categoryId = document.getElementById('reg-category').value;

        // Limpiar número y usar detección de país por IP (phone.js)
        const { formatWhatsAppNumber } = await import('../lib/phone.js');
        const cleanWa = await formatWhatsAppNumber(rawWhatsapp);

        const { signUp, createProfile } = await import('../lib/supabase.js');
        const { data, error } = await signUp(email, password, { full_name: name });

        if (error) {
          showToast('❌ ' + error.message, 'error');
          btn.disabled = false;
          btn.textContent = 'Crear mi cuenta →';
          return;
        }

        // Create profile if signup successful
        if (data?.user) {
          await createProfile({
            id: data.user.id,
            full_name: name,
            category_id: categoryId,
            whatsapp: cleanWa,
            phone: '+' + cleanWa,
            description: '',
            is_active: true,
          });
        }

        showToast('✅ ¡Cuenta creada! Revisá tu email para confirmar.', 'success');
        setTimeout(() => { window.location.hash = '/dashboard'; }, 1500);
      } else {
        const { signIn } = await import('../lib/supabase.js');
        const { data, error } = await signIn(email, password);

        if (error) {
          showToast('❌ ' + error.message, 'error');
          btn.disabled = false;
          btn.textContent = 'Iniciar sesión →';
          return;
        }

        showToast('✅ ¡Sesión iniciada!', 'success');
        setTimeout(() => { window.location.hash = '/dashboard'; }, 1000);
      }
    } catch (err) {
      console.error('Auth error:', err);
      showToast('❌ Error de conexión. Intentá de nuevo.', 'error');
      btn.disabled = false;
      btn.textContent = isRegister ? 'Crear mi cuenta →' : 'Iniciar sesión →';
    }
  });
}

// showToast importado desde src/lib/toast.js
