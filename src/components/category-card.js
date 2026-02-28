// NexoPro — Category Card Component (UX Simplificada)
export function renderCategoryCard(category) {
  return `
    <div class="category-card" onclick="window.location.hash='/subcategories?id=${category.id}'" id="cat-${category.id}"
      style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:14px 6px;border-radius:14px;
      background:rgba(255,255,255,0.7);cursor:pointer;transition:transform .15s ease, box-shadow .15s ease;
      min-height:85px;justify-content:center;"
      onmouseover="this.style.transform='scale(1.05)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'"
      onmouseout="this.style.transform='scale(1)';this.style.boxShadow='none'">
      <span style="font-size:2rem;line-height:1;">${category.icon}</span>
      <span style="font-size:.82rem;font-weight:600;color:var(--text);text-align:center;line-height:1.2;">${category.name}</span>
    </div>
  `;
}

export function renderCategoriesGrid(categories) {
  return `
    <div class="categories-grid" style="grid-template-columns:repeat(auto-fill, minmax(80px, 1fr));gap:10px;">
      ${categories.map(cat => renderCategoryCard(cat)).join('')}
    </div>
  `;
}
