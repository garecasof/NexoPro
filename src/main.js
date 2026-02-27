// NexoPro — Main Entry Point
import { addRoute, initRouter } from './lib/router.js';
import { initSupabase } from './lib/supabase.js';
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

// ── Layout ──────────────────────────────────────
function updateLayout(activeTab) {
    document.getElementById('navbar').innerHTML = renderNavbar();
    document.getElementById('bottom-nav').innerHTML = renderBottomNav(activeTab);
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

addRoute('/register', () => {
    updateLayout('');
    renderLogin({ mode: 'register' });
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

    window.addEventListener('beforeinstallprompt', (e) => {
        // Prevent Chrome 67 and earlier from automatically showing the prompt
        e.preventDefault();
        // Stash the event so it can be triggered later.
        deferredPrompt = e;
        // Update UI notify the user they can add to home screen
        window.installPromptActive = true;
        const installBtn = document.getElementById('btn-install-nav');
        if (installBtn) {
            installBtn.style.display = 'flex';
            installBtn.onclick = async () => {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`User response to the install prompt: ${outcome}`);
                if (outcome === 'accepted') {
                    installBtn.style.display = 'none';
                    window.installPromptActive = false;
                }
                deferredPrompt = null;
            };
        }
    });

    // Handle install button click for iOS (manual instructions)
    document.addEventListener('click', (e) => {
        if (e.target.closest('#btn-install-nav') && isIOS && !deferredPrompt) {
            import('./lib/toast.js').then(({ showToast }) => {
                showToast('📱 En iPhone: toca el icono de Compartir y luego "Agregar a inicio"', 'success');
            });
        }
    });

    // Special help for iOS users (console log for now)
    if (isIOS && !isStandalone) {
        const installBtn = document.getElementById('btn-install-nav');
        if (installBtn) installBtn.style.display = 'flex'; // Force show on iOS to show manual toast
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
    const leafletScript = document.createElement('script');
    leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    document.head.appendChild(leafletScript);

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

