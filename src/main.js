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

    // Función centralizada para disparar la instalación nativa
    const triggerInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                console.log('✅ PWA installed successfully!');
                // Esconder todo
                if (banner) banner.classList.remove('show');
                const navBtn = document.getElementById('btn-install-nav');
                if (navBtn) navBtn.style.display = 'none';
                window.installPromptActive = false;
            }
            deferredPrompt = null;
        } else if (isIOS) {
            import('./lib/toast.js').then(({ showToast }) => {
                showToast('📱 En iPhone: tocá COMPARTIR abajo y luego "Agregar a inicio"', 'success');
            });
        }
    };

    // Conectar botón del banner inferior
    if (acceptBtn) {
        acceptBtn.addEventListener('click', triggerInstall);
    }

    // Chrome/Android dispara esto cuando aprueba la "Instalabilidad"
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('✨ beforeinstallprompt event fired!');
        e.preventDefault();
        deferredPrompt = e;
        window.installPromptActive = true;

        // 1. Mostrar el botón verde del navbar (el que ya funcionaba)
        const installBtn = document.getElementById('btn-install-nav');
        if (installBtn) {
            installBtn.style.display = 'flex';
            installBtn.onclick = triggerInstall;
        }

        // 2. Mostrar el banner inferior también
        if (!isStandalone && banner) {
            setTimeout(() => banner.classList.add('show'), 1500);
        }
    });

    // En iOS (Safari) no existe beforeinstallprompt
    if (isIOS && !isStandalone) {
        window.installPromptActive = true;
        setTimeout(() => {
            const installBtn = document.getElementById('btn-install-nav');
            if (installBtn) {
                installBtn.style.display = 'flex';
                installBtn.onclick = triggerInstall;
            }
            if (banner) banner.classList.add('show');
        }, 1000);
    }


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

