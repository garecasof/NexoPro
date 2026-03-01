// NexoPro — Main Entry Point
import { addRoute, initRouter } from './lib/router.js';
import { initSupabase, getSupabase } from './lib/supabase.js';
import { renderNavbar, initNavbarScroll, initNavbarAccount } from './components/navbar.js';
import { renderBottomNav } from './components/footer.js';
import { renderHome } from './pages/home.js';
import { renderSearch } from './pages/search.js';
import { renderProfile } from './pages/profile.js';
import { renderFavorites } from './pages/favorites.js';
import { initFavoriteButtons } from './components/professional-card.js';
import { renderLogin } from './pages/login.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderEditProfile } from './pages/edit-profile.js';
import { renderEditServices } from './pages/edit-services.js';
import { renderEditReviews } from './pages/edit-reviews.js';
import { renderEditLocation } from './pages/edit-location.js';
import { renderStats } from './pages/stats.js';
import { renderSubcategories } from './pages/subcategories.js';

// Utility: Lazy Load Leaflet
export async function loadLeaflet() {
    if (window.L) return window.L;

    // Load CSS
    if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }

    // Load JS
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve(window.L);
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// ── Layout ──────────────────────────────────────
async function updateLayout(activeTab) {
    // Detectar si hay sesión activa para mostrar/ocultar "Mi Panel"
    let isLoggedIn = false;
    try {
        const sb = getSupabase();
        if (sb) {
            const { data: { session } } = await sb.auth.getSession();
            isLoggedIn = !!session;
        }
    } catch (e) { /* ignore */ }

    document.getElementById('navbar').innerHTML = renderNavbar();
    document.getElementById('bottom-nav').innerHTML = renderBottomNav(activeTab, isLoggedIn);
    initNavbarScroll();
    initNavbarAccount();
}

// ── Routes ──────────────────────────────────────
addRoute('/', (params) => {
    updateLayout('home');
    renderHome();
});

addRoute('/search', (params) => {
    updateLayout('search');
    renderSearch(params);
});

addRoute('/subcategories', (params) => {
    updateLayout('search');
    renderSubcategories(params);
});

addRoute('/profile', (params) => {
    updateLayout('');
    renderProfile(params);
});

addRoute('/login', (params) => {
    updateLayout('');
    renderLogin(params);
});

addRoute('/register', (params) => {
    updateLayout('');
    renderLogin({ mode: 'register', ...params });
});

addRoute('/dashboard', () => {
    updateLayout('dashboard');
    renderDashboard();
});

addRoute('/edit-profile', () => {
    updateLayout('dashboard');
    renderEditProfile();
});

addRoute('/edit-services', () => {
    updateLayout('dashboard');
    renderEditServices();
});

addRoute('/edit-reviews', () => {
    updateLayout('dashboard');
    renderEditReviews();
});

addRoute('/edit-location', () => {
    updateLayout('dashboard');
    renderEditLocation();
});

addRoute('/stats', () => {
    updateLayout('dashboard');
    renderStats();
});

addRoute('/favorites', () => {
    updateLayout('favorites');
    renderFavorites();
});

// ── Init ────────────────────────────────────────
async function init() {
    // Block the app until Supabase connection is established
    try {
        await initSupabase();
        console.log('🔗 Supabase initialization complete');
    } catch (err) {
        console.error('Failed to initialize Supabase:', err);
    }

    // ── PWA Install Logic ────────────────────────
    let deferredPrompt;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    const banner = document.getElementById('pwa-install-banner');
    const acceptBtn = document.getElementById('pwa-accept-btn');

    const showInstallBanner = () => {
        // Solo mostrar si no es una app instalada
        if (!isStandalone && banner) {
            setTimeout(() => {
                banner.classList.add('show');
            }, 500); // Pequeño retraso para carga inicial
        }
    };

    if (acceptBtn) {
        acceptBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                // Flujo nativo (Android/Chrome Edge)
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    banner.classList.remove('show');
                }
                deferredPrompt = null;
            } else if (isIOS) {
                // Fallback Manual para iPhones
                import('./lib/toast.js').then(({ showToast }) => {
                    showToast('📱 En iPhone: tocá COMPARTIR abajo y luego "Agregar a inicio"', 'success');
                    banner.classList.remove('show'); // Escondemos el banner
                });
            } else {
                // Fallback Alternativo Android: El navegador no disparó el prompt nativo
                import('./lib/toast.js').then(({ showToast }) => {
                    showToast('💡 Buscá "Instalar App" o "Agregar a inicio" en el menú de los 3 puntitos de tu navegador', 'success', 5000);
                    banner.classList.remove('show');
                });
            }
        });
    }

    // Chrome/Android dispara esto mágicamente cuando aprueba la "Instalabilidad"
    // Criterios: HTTPS, Web Manifest valido, Service Worker registrado, interaccion previa en el dominio.
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('✨ beforeinstallprompt event fired natively by Chrome!');
        e.preventDefault();
        deferredPrompt = e;
        // Solo cuando tenemos la promesa de instalacion guardada, mostramos el boton
        showInstallBanner();
    });

    // En iOS (Safari) no existe beforeinstallprompt, así que disparamos el banner manualmente
    if (isIOS && !isStandalone) {
        showInstallBanner();
    }

    // Fallback Universal: Si Chrome decide ocultar el evento nativo,
    // mostramos de todas formas el banner visual después de 2.5 segundos. 
    // Si tocan el botón, se usará el Toast guiado en su lugar.
    setTimeout(() => {
        if (!isStandalone && banner && !banner.classList.contains('show')) {
            console.log('Forcing Install Banner visual via Universal Fallback');
            showInstallBanner();
        }
    }, 2500);

    // Hide splash screen after a brief delay
    setTimeout(() => {
        const splash = document.getElementById('splash-screen');
        if (splash) {
            splash.classList.add('hide');
            setTimeout(() => splash.remove(), 600);
        }
    }, 1500);

    // Load Leaflet JS
    // El router se encarga de todo. Leaflet se carga bajo demanda en las páginas que lo usan.

    // Start router ONLY after Supabase is ready
    initFavoriteButtons();
    initRouter();
}

// Wait for DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Force Android Service Worker update checks when app comes to foreground
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && navigator.serviceWorker) {
        navigator.serviceWorker.ready.then(registration => {
            registration.update();
        });
    }
});

