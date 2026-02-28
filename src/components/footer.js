// NexoPro — Bottom Navigation Component
export function renderBottomNav(activeTab = 'home', isLoggedIn = false) {
  const tabs = [
    { id: 'home', label: 'Inicio', hash: '/', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
    { id: 'search', label: 'Buscar', hash: '/search', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>' },
    { id: 'favorites', label: 'Favoritos', hash: '/favorites', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>' },
  ];

  // Solo mostrar "Mi Panel" si el usuario está logueado
  if (isLoggedIn) {
    tabs.push({ id: 'dashboard', label: 'Mi Panel', hash: '/dashboard', icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>' });
  }

  return `
    <div class="bottom-nav">
      ${tabs.map(tab => `
        <a href="#${tab.hash}" class="bottom-nav-item ${activeTab === tab.id ? 'active' : ''}" id="nav-${tab.id}">
          ${tab.icon}
          <span>${tab.label}</span>
        </a>
      `).join('')}
    </div>
  `;
}
