// NexoPro — Navbar Component
import { getCurrentUser } from '../lib/supabase.js';

export function renderNavbar() {
  return `
    <div class="navbar" id="main-navbar">
      <a href="#/" class="navbar-brand">
        <svg width="28" height="28" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" fill="#007BFF"/>
          <path d="M20 28C20 24 24 20 32 20C40 20 44 24 44 28C44 34 38 36 32 36" stroke="white" stroke-width="3" stroke-linecap="round"/>
          <circle cx="32" cy="44" r="2.5" fill="#00C853"/>
        </svg>
        Nexo<span>Pro</span>
      </a>
      <div class="navbar-actions">
        <button class="navbar-btn" id="btn-install-nav" style="display: none; background: var(--success); color: white; border-radius: 20px; padding: 0 12px; font-size: 11px; font-weight: 600; height: 28px; border: none; align-items: center; gap: 4px;">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" style="margin-right: 2px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
           Instalar
        </button>
        <button class="navbar-btn" onclick="window.location.hash='/search'" aria-label="Buscar" id="btn-search-nav">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        </button>
        <button class="navbar-btn" id="btn-account-nav" aria-label="Mi cuenta">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>
        </button>
      </div>
    </div>
  `;
}

// Hallazgo #4: Detectar si el usuario está logueado y redirigir al dashboard o login
export async function initNavbarAccount() {
  const btn = document.getElementById('btn-account-nav');
  if (!btn) return;
  const user = await getCurrentUser();
  btn.onclick = () => {
    window.location.hash = user ? '/dashboard' : '/login';
  };

  // Check if we already have a deferred prompt to show the install button
  // Note: main.js handles the event, but if navbar re-renders we might need to show it again
  if (window.installPromptActive) {
    const installBtn = document.getElementById('btn-install-nav');
    if (installBtn) installBtn.style.display = 'flex';
  }
}

// Hallazgo #9: Evitar acumular listeners de scroll
let currentScrollHandler = null;

export function initNavbarScroll() {
  const navbar = document.getElementById('main-navbar');
  if (!navbar) return;

  // Remove previous listener if exists
  if (currentScrollHandler) {
    window.removeEventListener('scroll', currentScrollHandler);
  }

  currentScrollHandler = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 10);
  };

  window.addEventListener('scroll', currentScrollHandler);
}
