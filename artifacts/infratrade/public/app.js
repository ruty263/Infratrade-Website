/* ============================================
   INFRATRADE LIMITED — app.js
   Fetches inventory_categories.json and renders
   the category grid, featured stock, and category pages.
   ============================================ */

const WA_NUMBER = '447909329693';
const WA_BASE   = `https://wa.me/${WA_NUMBER}`;
const JSON_URL  = './inventory_categories.json';

// ── Helpers ──────────────────────────────────────────────────────────────────

function waLink(text) {
  return `${WA_BASE}?text=${encodeURIComponent(text)}`;
}

function itemWaLink(item) {
  const msg = `Hi Infratrade, I'm interested in the ${item.title} listed at £${item.price} (Ref: ${item.id}). Is this still available?`;
  return waLink(msg);
}

function categoryWaLink(catName) {
  const msg = `Hi Infratrade, I'd like to enquire about today's fresh stock in your ${catName} category. What have you got available?`;
  return waLink(msg);
}

function conditionClass(cond) {
  const c = (cond || '').toLowerCase();
  if (c.includes('excellent')) return 'excellent';
  if (c.includes('signs')) return 'signs-of-use';
  return '';
}

function categoryIconSVG(icon) {
  const icons = {
    breaker: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    drill: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
    vacuum: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>`,
    generator: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M9 11h1"/><path d="M14 11h1"/></svg>`,
    chain: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    saw: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>`,
    parts: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
    tag: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>`,
  };
  return icons[icon] || icons.parts;
}

function placeholderSVG() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="m21 15-5-5L5 21"/><circle cx="9" cy="9" r="2"/></svg>`;
}

// ── Main data fetch ───────────────────────────────────────────────────────────

let INVENTORY = null;

async function loadInventory() {
  if (INVENTORY) return INVENTORY;
  const res = await fetch(JSON_URL);
  if (!res.ok) throw new Error(`Failed to load inventory: ${res.status}`);
  INVENTORY = await res.json();
  return INVENTORY;
}

// ── Category grid (index.html) ────────────────────────────────────────────────

function buildCategoryGrid(categories, items, container) {
  container.innerHTML = '';
  categories.forEach(cat => {
    const catItems = items.filter(i => i.category === cat.id);
    const count = catItems.length;
    const minPrice = count > 0 ? Math.min(...catItems.map(i => i.price)) : null;

    const card = document.createElement('a');
    card.className = 'cat-card';
    card.href = `category.html?cat=${encodeURIComponent(cat.id)}`;
    card.innerHTML = `
      <div class="cat-icon">${categoryIconSVG(cat.icon)}</div>
      <div>
        <div class="cat-name">${cat.name}</div>
        <div class="cat-count">${count} item${count !== 1 ? 's' : ''} in stock</div>
        ${minPrice ? `<div class="cat-price">From £${minPrice}</div>` : '<div class="cat-price" style="color:var(--muted)">Ask for pricing</div>'}
      </div>
    `;
    container.appendChild(card);
  });
}

// ── Featured stock (index.html) ───────────────────────────────────────────────

function buildFeaturedStock(items, container) {
  container.innerHTML = '';
  const featured = items.filter(i => i.featured).slice(0, 12);
  featured.forEach(item => renderStockCard(item, container));
}

// ── Stock card renderer ───────────────────────────────────────────────────────

function renderStockCard(item, container) {
  const card = document.createElement('div');
  card.className = 'stock-card';
  card.innerHTML = `
    <div class="stock-img">
      <div class="stock-img-inner">
        ${placeholderSVG()}
        <span>Photo on request</span>
      </div>
      <div class="stock-brand-badge">${item.brand}</div>
      <div class="stock-ref">${item.id}</div>
    </div>
    <div class="stock-body">
      <span class="stock-condition ${conditionClass(item.condition)}">${item.condition}</span>
      <div class="stock-title">${item.title}</div>
      <div class="stock-desc">${item.description}</div>
      <div class="stock-footer">
        <div>
          <div class="stock-price">£${item.price.toLocaleString()}</div>
          <div class="stock-price-sub">Cash / Bank Transfer</div>
        </div>
        <a class="btn-whatsapp-sm" href="${itemWaLink(item)}" target="_blank" rel="noopener">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
          Enquire
        </a>
      </div>
    </div>
  `;
  container.appendChild(card);
}

// ── Category page (category.html) ─────────────────────────────────────────────

async function initCategoryPage() {
  const params = new URLSearchParams(window.location.search);
  const catId = params.get('cat');

  const loading = document.getElementById('category-loading');
  const content = document.getElementById('category-content');
  const stockGrid = document.getElementById('stock-grid');
  const catTitle = document.getElementById('cat-page-title');
  const catDesc = document.getElementById('cat-page-desc');
  const catCount = document.getElementById('cat-page-count');
  const waInquiry = document.getElementById('wa-category-inquiry');
  const breadcrumbCat = document.getElementById('breadcrumb-cat');

  try {
    const { categories, items } = await loadInventory();
    const cat = categories.find(c => c.id === catId);

    if (!cat) {
      loading.innerHTML = `<div class="empty-state"><p>Category not found. <a href="index.html" style="color:var(--amber)">Back to all stock</a></p></div>`;
      return;
    }

    const catItems = items.filter(i => i.category === catId);

    // Update page title and meta
    document.title = `${cat.name} | Infratrade Limited — Pre-Owned Plant & Machinery`;

    // Update UI
    if (catTitle)      catTitle.textContent = cat.name;
    if (catDesc)       catDesc.textContent  = cat.description;
    if (catCount)      catCount.textContent = `${catItems.length} item${catItems.length !== 1 ? 's' : ''} in stock`;
    if (breadcrumbCat) breadcrumbCat.textContent = cat.name;

    if (waInquiry) {
      waInquiry.href = categoryWaLink(cat.name);
    }

    loading.style.display = 'none';
    content.style.display = '';

    if (catItems.length === 0) {
      stockGrid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <p style="font-size:1.05rem;font-weight:700;color:var(--light);margin-bottom:0.5rem">No stock listed right now</p>
          <p style="margin-bottom:1.25rem">We turn over fast — text the yard for today's availability.</p>
          <a class="btn-whatsapp-sm" href="${categoryWaLink(cat.name)}" target="_blank" rel="noopener">
            Ask About Today's Fresh Stock
          </a>
        </div>`;
    } else {
      catItems.forEach(item => renderStockCard(item, stockGrid));
    }

  } catch (err) {
    console.error(err);
    loading.innerHTML = `<div class="empty-state"><p style="color:var(--red)">Error loading stock. Please refresh and try again.</p></div>`;
  }
}

// ── Index page ────────────────────────────────────────────────────────────────

async function initIndexPage() {
  const catGrid    = document.getElementById('category-grid');
  const catLoading = document.getElementById('cat-loading');
  const featGrid   = document.getElementById('featured-grid');
  const featLoading = document.getElementById('feat-loading');

  try {
    const { categories, items } = await loadInventory();

    // Categories
    if (catGrid) {
      catLoading && (catLoading.style.display = 'none');
      buildCategoryGrid(categories, items, catGrid);
    }

    // Featured stock
    if (featGrid) {
      featLoading && (featLoading.style.display = 'none');
      buildFeaturedStock(items, featGrid);
    }
  } catch (err) {
    console.error(err);
    if (catLoading) catLoading.innerHTML = `<p style="color:var(--red);font-size:0.85rem">Error loading categories. Please refresh.</p>`;
    if (featLoading) featLoading.innerHTML = `<p style="color:var(--red);font-size:0.85rem">Error loading stock. Please refresh.</p>`;
  }
}

// ── Boot ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'index')    initIndexPage();
  if (page === 'category') initCategoryPage();
});
