// NexoPro — Subcategories Page (Especialidades)
import { fetchSubcategories, fetchCategories } from '../lib/supabase.js';

export async function renderSubcategories(params = {}) {
    const content = document.getElementById('page-content');
    const parentId = params.id;

    // Loading state
    content.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:50vh;">
      <div style="font-size:1.5rem;animation:pulse 1.5s infinite;color:var(--primary);">Cargando especialidades...</div>
    </div>
  `;

    // Fetch parent category info
    const allCats = await fetchCategories();
    const parent = allCats.find(c => c.id === parentId);
    const parentName = parent ? parent.name : 'Especialidades';
    const parentIcon = parent ? parent.icon : '📋';

    // Fetch subcategories
    const subcategories = await fetchSubcategories(parentId);

    if (subcategories.length === 0) {
        // No subcategories: redirect directly to search
        window.location.hash = `/search?category=${parentId}`;
        return;
    }

    content.innerHTML = `
    <div style="max-width:640px;margin:0 auto;padding:16px;">
      <!-- Header -->
      <div style="display:flex;align-items:center;margin-bottom:24px;gap:12px;">
        <button onclick="window.location.hash='/'" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text);padding:4px;">←</button>
        <h1 style="margin:0;font-size:1.5rem;">${parentIcon} ${parentName}</h1>
      </div>

      <p style="color:var(--gray-500);margin-bottom:20px;font-size:0.95rem;">
        Elegí una especialidad para ver los profesionales disponibles:
      </p>

      <!-- Subcategories Grid -->
      <div class="categories-grid" style="grid-template-columns: repeat(2, 1fr);">
        ${subcategories.map(sub => `
          <div class="category-card" onclick="window.location.hash='/search?category=${sub.id}'" id="subcat-${sub.id}" style="padding:20px 12px;">
            <div class="category-icon"><span style="font-size:2rem;">${sub.icon}</span></div>
            <span class="category-name" style="font-size:0.95rem;font-weight:600;">${sub.name}</span>
          </div>
        `).join('')}
      </div>

      <!-- See all professionals for this parent category -->
      <div style="margin-top:24px;text-align:center;">
        <button onclick="window.location.hash='/search?parent_category=${parentId}'" class="btn btn-primary btn-block" style="max-width:400px;margin:0 auto;">
          Ver todos los ${parentName}
        </button>
      </div>
    </div>
  `;
}
