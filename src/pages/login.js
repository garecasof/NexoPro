// NexoPro — Login / Register Page (Wizard mejorado para adultos mayores)
import { fetchCategories } from '../lib/supabase.js';
import { showToast } from '../lib/toast.js';

export async function renderLogin(params = {}) {
  const content = document.getElementById('page-content');
  const isRegister = params.mode === 'register';

  // Build category options once
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

  // State for registration wizard
  let currentStep = 1;
  const totalSteps = 3;

  function renderContent() {
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
                    <h1>${isRegister ? 'Crear mi cuenta profesional' : 'Iniciar sesión'}</h1>
                    <p>${isRegister ? 'Registrate en 3 pasos simples' : 'Accedé a tu panel de profesional'}</p>
                </div>

                <!-- Toggle Login / Register -->
                <div style="display:flex;gap:4px;background:var(--gray-100);border-radius:var(--radius-full);padding:4px;margin-bottom:24px;">
                    <button class="btn ${!isRegister ? 'btn-primary' : ''}" style="flex:1;padding:10px;border-radius:var(--radius-full);font-size:.85rem;${!isRegister ? '' : 'color:var(--gray-600);'}" id="tab-login">
                        Iniciar sesión
                    </button>
                    <button class="btn ${isRegister ? 'btn-primary' : ''}" style="flex:1;padding:10px;border-radius:var(--radius-full);font-size:.85rem;${isRegister ? '' : 'color:var(--gray-600);'}" id="tab-register">
                        Registrarse
                    </button>
                </div>

                <form id="auth-form" onsubmit="return false;">
                    ${!isRegister ? renderLoginForm() : renderRegisterWizard()}
                </form>

                ${!isRegister ? `
                    <p style="text-align:center;margin-top:24px;font-size:1rem;color:var(--gray-600);">
                        ¿No tenés cuenta? <a href="#/login?mode=register" style="color:var(--primary);font-weight:700;text-decoration:underline;">Registrate gratis</a>
                    </p>
                ` : `
                    <p style="text-align:center;margin-top:24px;font-size:1rem;color:var(--gray-600);">
                        ¿Ya tenés cuenta? <a href="#/login" style="color:var(--primary);font-weight:700;text-decoration:underline;">Iniciá sesión</a>
                    </p>
                `}
            </div>
        `;

    attachEventListeners();
  }

  function renderLoginForm() {
    return `
            <div class="form-group">
                <label class="form-label" for="auth-email">Correo electrónico</label>
                <input class="form-input" type="email" id="auth-email" placeholder="ej: nombre@correo.com" required />
            </div>

            <div class="form-group">
                <label class="form-label" for="auth-password">Contraseña</label>
                <input class="form-input" type="password" id="auth-password" placeholder="Tu contraseña" required />
            </div>

            <button type="submit" class="btn btn-primary btn-block btn-lg mt-16" id="auth-submit-btn">
                Entrar ahora
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
        `;
  }

  function renderRegisterWizard() {
    let stepHtml = '';

    if (currentStep === 1) {
      stepHtml = `
                <div style="background:var(--blue-50);padding:12px;border-radius:var(--radius-md);margin-bottom:20px;text-align:center;font-weight:700;color:var(--primary);">
                    PASO 1 DE 3: DATOS DE ACCESO
                </div>
                <div class="form-group">
                    <label class="form-label" for="reg-name">Mi nombre completo o profesional</label>
                    <input class="form-input" type="text" id="reg-name" placeholder="Ej: Juan Pérez" required />
                </div>
                <div class="form-group">
                    <label class="form-label" for="auth-email">Mi correo electrónico</label>
                    <input class="form-input" type="email" id="auth-email" placeholder="ej: nombre@correo.com" required />
                </div>
                <div class="form-group">
                    <label class="form-label" for="auth-password">Elegí una contraseña (mín. 6 letras o números)</label>
                    <input class="form-input" type="password" id="auth-password" placeholder="Escribí tu contraseña acá" minlength="6" required />
                </div>
                <button type="button" class="btn btn-primary btn-block btn-lg mt-16" id="btn-next">
                    Siguiente paso (2/3) →
                </button>
            `;
    } else if (currentStep === 2) {
      stepHtml = `
                <div style="background:var(--blue-50);padding:12px;border-radius:var(--radius-md);margin-bottom:20px;text-align:center;font-weight:700;color:var(--primary);">
                    PASO 2 DE 3: CONTACTO
                </div>
                <div class="form-group">
                    <label class="form-label" for="reg-whatsapp">Mi número de WhatsApp</label>
                    <input class="form-input" type="tel" id="reg-whatsapp" placeholder="Ej: 5493881234567" required />
                    <p style="font-size:0.9rem;color:var(--gray-600);margin-top:8px;">💡 Poné el código de área (ej: 0388) sin el 0 y tu número sin el 15.</p>
                </div>
                <div style="display:grid;grid-template-columns:1fr 2fr;gap:12px;" class="mt-24">
                    <button type="button" class="btn btn-outline" id="btn-prev">Atrás</button>
                    <button type="button" class="btn btn-primary btn-lg" id="btn-next">Siguiente paso (3/3) →</button>
                </div>
            `;
    } else if (currentStep === 3) {
      stepHtml = `
                <div style="background:var(--blue-50);padding:12px;border-radius:var(--radius-md);margin-bottom:20px;text-align:center;font-weight:700;color:var(--primary);">
                    PASO 3 DE 3: MI PROFESIÓN
                </div>
                <div class="form-group">
                    <label class="form-label" for="reg-category">¿A qué te dedicás? (Rubro)</label>
                    <select class="form-select" id="reg-category" required>
                        <option value="" disabled selected>Tocá para elegir tu rubro</option>
                        ${categoryOptions}
                    </select>
                </div>
                <div style="display:grid;grid-template-columns:1fr 2fr;gap:12px;" class="mt-24">
                    <button type="button" class="btn btn-outline" id="btn-prev">Atrás</button>
                    <button type="submit" class="btn btn-primary btn-lg" id="auth-submit-btn">Terminar registro ✅</button>
                </div>
            `;
    }

    return stepHtml;
  }

  // Temporary storage for input values during wizard steps
  let wizardData = {
    name: '',
    email: '',
    password: '',
    whatsapp: '',
    category: ''
  };

  function saveWizardData() {
    if (document.getElementById('reg-name')) wizardData.name = document.getElementById('reg-name').value;
    if (document.getElementById('auth-email')) wizardData.email = document.getElementById('auth-email').value;
    if (document.getElementById('auth-password')) wizardData.password = document.getElementById('auth-password').value;
    if (document.getElementById('reg-whatsapp')) wizardData.whatsapp = document.getElementById('reg-whatsapp').value;
    if (document.getElementById('reg-category')) wizardData.category = document.getElementById('reg-category').value;
  }

  function restoreWizardData() {
    if (document.getElementById('reg-name')) document.getElementById('reg-name').value = wizardData.name;
    if (document.getElementById('auth-email')) document.getElementById('auth-email').value = wizardData.email;
    if (document.getElementById('auth-password')) document.getElementById('auth-password').value = wizardData.password;
    if (document.getElementById('reg-whatsapp')) document.getElementById('reg-whatsapp').value = wizardData.whatsapp;
    if (document.getElementById('reg-category')) document.getElementById('reg-category').value = wizardData.category;
  }

  function attachEventListeners() {
    // Tab switching
    document.getElementById('tab-login').onclick = () => { window.location.hash = '/login'; };
    document.getElementById('tab-register').onclick = () => { window.location.hash = '/login?mode=register'; };

    // Wizard buttons
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');

    if (btnNext) {
      btnNext.onclick = () => {
        // Simple validation before next
        if (currentStep === 1) {
          const email = document.getElementById('auth-email').value;
          const pass = document.getElementById('auth-password').value;
          if (!document.getElementById('reg-name').value || !email || !pass) {
            showToast('⚠️ Por favor, completá todos los campos', 'error');
            return;
          }
          if (pass.length < 6) {
            showToast('⚠️ La contraseña debe tener al menos 6 caracteres', 'error');
            return;
          }
        }
        if (currentStep === 2 && !document.getElementById('reg-whatsapp').value) {
          showToast('⚠️ Necesitamos tu WhatsApp para que te contacten', 'error');
          return;
        }

        saveWizardData();
        currentStep++;
        renderContent();
        restoreWizardData();
      };
    }

    if (btnPrev) {
      btnPrev.onclick = () => {
        saveWizardData();
        currentStep--;
        renderContent();
        restoreWizardData();
      };
    }

    // Real-time email validation
    const emailInput = document.getElementById('auth-email');
    if (emailInput) {
      emailInput.addEventListener('input', () => {
        const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value);
        emailInput.style.borderColor = emailInput.value.length > 0 ? (valid ? 'var(--success)' : 'var(--danger)') : '';
      });
    }

    // Submit Handler
    const authForm = document.getElementById('auth-form');
    authForm.onsubmit = async (e) => {
      e.preventDefault();
      saveWizardData();

      const btn = document.getElementById('auth-submit-btn');
      btn.disabled = true;
      btn.textContent = isRegister ? 'Creando tu cuenta...' : 'Entrando...';

      try {
        if (isRegister) {
          const { signUp, createProfile } = await import('../lib/supabase.js');
          const { formatWhatsAppNumber } = await import('../lib/phone.js');

          const cleanWa = await formatWhatsAppNumber(wizardData.whatsapp);
          const { data, error } = await signUp(wizardData.email, wizardData.password, { full_name: wizardData.name });

          if (error) {
            showToast('❌ ' + error.message, 'error');
            btn.disabled = false;
            btn.textContent = 'Terminar registro ✅';
            return;
          }

          if (data?.user) {
            await createProfile({
              id: data.user.id,
              full_name: wizardData.name,
              category_id: wizardData.category,
              whatsapp: cleanWa,
              phone: '+' + cleanWa,
              description: '',
              is_active: true,
            });
          }

          showToast('✅ ¡Bienvenido! Tu cuenta ha sido creada.', 'success');
          setTimeout(() => { window.location.hash = '/dashboard'; }, 1500);
        } else {
          const email = document.getElementById('auth-email').value;
          const password = document.getElementById('auth-password').value;
          const { signIn } = await import('../lib/supabase.js');
          const { error } = await signIn(email, password);

          if (error) {
            showToast('❌ Usuario o contraseña incorrectos', 'error');
            btn.disabled = false;
            btn.textContent = 'Entrar ahora →';
            return;
          }

          showToast('✅ ¡Hola! Ingreso exitoso.', 'success');
          setTimeout(() => { window.location.hash = '/dashboard'; }, 1000);
        }
      } catch (err) {
        console.error('Auth error:', err);
        showToast('❌ Problema de conexión. Intentá de nuevo.', 'error');
        btn.disabled = false;
        btn.textContent = isRegister ? 'Terminar registro ✅' : 'Entrar ahora →';
      }
    };
  }

  renderContent();
}
