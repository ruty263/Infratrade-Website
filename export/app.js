/* ============================================================
   INFRATRADE LIMITED — app.js
   Loads real eBay inventory from inventory_categories.json.
   All 569 items, fully client-side, static-site ready.
   ============================================================ */

'use strict';

const WA_NUMBER = '447909329693';
const WA_BASE   = `https://wa.me/${WA_NUMBER}`;
const JSON_URL  = './inventory_categories.json';

// ── Category metadata ─────────────────────────────────────────────────────────
// Maps the exact category strings from generate_json.py → display data + images

const CAT_META = {
  'Pre-Owned Breakers & Demolition Tools': {
    icon: 'breaker',
    slug: 'breakers',
    short: 'Breakers',
    desc:  'Electric breakers, demolition hammers, chipping hammers and pneumatic tools. All site-tested.',
    imgs:  [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80&auto=format&fit=crop',
    ],
  },
  'Drills & Rotary Hammers': {
    icon: 'drill',
    slug: 'drills',
    short: 'Drills',
    desc:  'SDS drills, combi drills, impact drivers, rotary hammers and cordless drill kits from top brands.',
    imgs:  [
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80&auto=format&fit=crop',
    ],
  },
  'Workshop Vacuums & Dust Extraction': {
    icon: 'vacuum',
    slug: 'vacuums',
    short: 'Vacuums',
    desc:  'Wet & dry vacs, dust extractors, M-class and L-class units for site and workshop use.',
    imgs:  [
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&auto=format&fit=crop',
    ],
  },
  'Site Power, Generators & Transformers': {
    icon: 'generator',
    slug: 'sitepower',
    short: 'Site Power',
    desc:  '110v transformers, petrol & diesel generators, extension leads and cable reels for site use.',
    imgs:  [
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&auto=format&fit=crop',
    ],
  },
  'Site Heating, Cooling & Ventilation': {
    icon: 'heater',
    slug: 'heating',
    short: 'Site Heating',
    desc:  'Propane heaters, fan heaters, dehumidifiers and evaporative coolers for site environments.',
    imgs:  [
      'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80&auto=format&fit=crop',
    ],
  },
  'Saws, Cutting & Fastening Tools': {
    icon: 'saw',
    slug: 'saws',
    short: 'Saws & Cutting',
    desc:  'Circular saws, reciprocating saws, angle grinders, nail guns and fastening tools.',
    imgs:  [
      'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80&auto=format&fit=crop',
    ],
  },
  'Lifting, Access & Site Handling': {
    icon: 'chain',
    slug: 'lifting',
    short: 'Lifting & Access',
    desc:  'Chain hoists, ratchet straps, trolleys, ladders, step-ladders and safe site handling kit.',
    imgs:  [
      'https://images.unsplash.com/photo-1487452066049-4e36e3a56680?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80&auto=format&fit=crop',
    ],
  },
  'Pressure Washers & Water Pumps': {
    icon: 'washer',
    slug: 'washers',
    short: 'Pressure Washers',
    desc:  'Electric and petrol pressure washers, submersible pumps and drain pumps.',
    imgs:  [
      'https://images.unsplash.com/photo-1558618047-f4e733084c32?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80&auto=format&fit=crop',
    ],
  },
  'Outdoor & Garden Machinery': {
    icon: 'garden',
    slug: 'garden',
    short: 'Garden Machinery',
    desc:  'Lawn mowers, hedge trimmers, strimmers, chainsaws and rotavators.',
    imgs:  [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&auto=format&fit=crop',
    ],
  },
  'Workshop Tools, Lighting & Test Gear': {
    icon: 'tools',
    slug: 'workshop',
    short: 'Workshop Tools',
    desc:  'Work lights, test meters, compressors, welders, clamps, air tools and hand tools.',
    imgs:  [
      'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=800&q=80&auto=format&fit=crop',
    ],
  },
  'Vehicle, Van & Plant Spare Parts': {
    icon: 'parts',
    slug: 'spares',
    short: 'Spare Parts',
    desc:  'Filters, timing kits, wiper blades, mirrors, belts and van / vehicle spare parts.',
    imgs:  [
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
    ],
  },
  'Clearance & General Clearance Items': {
    icon: 'tag',
    slug: 'clearance',
    short: 'Clearance',
    desc:  'End-of-line, mixed lots and one-off clearance items at below-market prices. Stock changes daily.',
    imgs:  [
      'https://images.unsplash.com/photo-1520637836993-3e1e3fc82c98?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&auto=format&fit=crop',
    ],
  },
};

// Ordered list for nav / grid
const CAT_ORDER = [
  'Pre-Owned Breakers & Demolition Tools',
  'Drills & Rotary Hammers',
  'Workshop Vacuums & Dust Extraction',
  'Site Power, Generators & Transformers',
  'Site Heating, Cooling & Ventilation',
  'Saws, Cutting & Fastening Tools',
  'Lifting, Access & Site Handling',
  'Pressure Washers & Water Pumps',
  'Outdoor & Garden Machinery',
  'Workshop Tools, Lighting & Test Gear',
  'Vehicle, Van & Plant Spare Parts',
  'Clearance & General Clearance Items',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function waLink(text) {
  return `${WA_BASE}?text=${encodeURIComponent(text)}`;
}

function itemWaLink(item) {
  const price = item.price ? `£${parseFloat(item.price).toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'POA';
  const msg = `Hi Infratrade, could you text me 2 or 3 actual yard photos of the ${item.title} listed at ${price} (ID: ${item.item_id})? Is this still available for collection/delivery?`;
  return waLink(msg);
}

function categoryWaLink(catName) {
  const msg = `Hi Infratrade, I'd like to enquire about your stock in the "${catName}" category. What have you got available right now?`;
  return waLink(msg);
}

function catImg(category, item_id) {
  const meta = CAT_META[category];
  if (!meta) return CAT_META['Clearance & General Clearance Items'].imgs[0];
  const digit = parseInt((item_id || '0').toString().slice(-1)) || 0;
  return meta.imgs[digit % meta.imgs.length];
}

function catMeta(category) {
  return CAT_META[category] || { icon: 'tag', short: category, desc: '' };
}

function formatPrice(price) {
  if (!price && price !== 0) return 'POA';
  const p = parseFloat(price);
  return p ? `£${p.toLocaleString('en-GB', {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : 'POA';
}

function slugToCat(slug) {
  if (!slug) return null;
  // First try direct name match (URL-encoded full name)
  const decoded = decodeURIComponent(slug);
  if (CAT_META[decoded]) return decoded;
  // Fall back to slug match
  return CAT_ORDER.find(c => (CAT_META[c] || {}).slug === slug) || null;
}

// ── SVG icon set ──────────────────────────────────────────────────────────────

const ICONS = {
  breaker:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  drill:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/><path d="M2 22l4-4"/></svg>`,
  vacuum:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"/><path d="M12 3v6"/></svg>`,
  generator: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M9 11h1"/><path d="M14 11h1"/></svg>`,
  heater:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 22H5a3 3 0 0 1-3-3v-1a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a3 3 0 0 1-3 3h-3"/><path d="M10 22v-4"/><path d="M14 22v-4"/><path d="M5 14V6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v8"/><path d="M9 6h.01"/><path d="M15 6h.01"/></svg>`,
  saw:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><path d="m4.93 4.93 2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
  chain:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  washer:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 15h8M8 12h8M8 9h8"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
  garden:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M20 2H22v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/></svg>`,
  tools:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`,
  parts:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`,
  tag:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>`,
  search:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  whatsapp:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>`,
};

function icon(name, size) {
  const svg = ICONS[name] || ICONS.tag;
  return `<svg width="${size||20}" height="${size||20}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${svg.match(/<svg[^>]*>(.*)<\/svg>/s)?.[1] || ''}</svg>`;
}

// ── Data loading ──────────────────────────────────────────────────────────────

let ITEMS = null;

async function loadInventory() {
  if (ITEMS) return ITEMS;
  const res = await fetch(JSON_URL);
  if (!res.ok) throw new Error(`Failed to fetch inventory (${res.status})`);
  ITEMS = await res.json();
  return ITEMS;
}

// ── Spec badge extractor ──────────────────────────────────────────────────────

const KNOWN_BRANDS = [
  'Hilti','Makita','DeWalt','Bosch','Dewalt','Milwaukee','Hitachi','Metabo',
  'Festool','Kango','Ingersoll','Atlas Copco','Stephill','Honda','Kipor',
  'Husqvarna','Stihl','Paslode','Dewalt','Ryobi','AEG','Ridgid','Fein',
  'Flex','Panasonic','Snap-on','Gedore','Stanley','Bahco','Knipex',
  'Wacker','Bomag','Husqvarna','Karcher','Kärcher','Nilfisk','Numatic',
  'Henry','Dyson','Craftsman','TTI','Metohm','Metrohm','Megger','Fluke',
  'Draper','Silverline','Evolution','Roughneck','Faithfull',
];

const SPEC_PATTERNS = [
  { re: /\b110\s?[Vv]\b/,          label: '110V'       },
  { re: /\b240\s?[Vv]\b/,          label: '240V'       },
  { re: /\b18\s?[Vv]\b/,           label: '18V'        },
  { re: /\b36\s?[Vv]\b/,           label: '36V'        },
  { re: /\b54\s?[Vv]\b/,           label: '54V'        },
  { re: /\bSDS\b/i,                label: 'SDS'        },
  { re: /\bcordless\b/i,           label: 'Cordless'   },
  { re: /\bcorded\b/i,             label: 'Corded'     },
  { re: /\bpetrol\b/i,             label: 'Petrol'     },
  { re: /\bdiesel\b/i,             label: 'Diesel'     },
  { re: /\bpneumatic\b/i,          label: 'Pneumatic'  },
  { re: /\belectric\b/i,           label: 'Electric'   },
  { re: /\bdemolition\b/i,         label: 'Demolition' },
  { re: /\brotary\b/i,             label: 'Rotary'     },
  { re: /\bimpact\b/i,             label: 'Impact'     },
  { re: /\bwet\s?&?\s?dry\b/i,     label: 'Wet & Dry'  },
  { re: /\bM-class\b/i,            label: 'M-Class'    },
  { re: /\bL-class\b/i,            label: 'L-Class'    },
  { re: /kva\b/i,                  label: 'Generator'  },
  { re: /\bjoist\b|\bfloor\b/i,    label: 'Floor'      },
  { re: /\bangular\b|\bangle\b/i,  label: 'Angle'      },
  { re: /\bbattery\b/i,            label: 'Battery'    },
  { re: /\bkit\b/i,                label: 'Kit'        },
  { re: /\bnew\b/i,                label: 'New'        },
  { re: /\bused\b/i,               label: 'Used'       },
];

function extractBadges(title) {
  const badges = [];
  // Brand first (max 1)
  for (const brand of KNOWN_BRANDS) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      badges.push({ text: brand, type: 'brand' });
      break;
    }
  }
  // Spec tags (max 3 more)
  for (const { re, label } of SPEC_PATTERNS) {
    if (re.test(title) && badges.length < 4) {
      if (!badges.some(b => b.text === label)) {
        badges.push({ text: label, type: 'spec' });
      }
    }
  }
  return badges.slice(0, 4);
}

// ── Stock card ────────────────────────────────────────────────────────────────

function cardWaMsg(item) {
  const price = formatPrice(item.price);
  return `Hi Infratrade, I'm interested in ${item.title} listed at ${price} (ID: ${item.item_id}). Could you confirm availability and send any extra photos if available?`;
}

function renderStockCard(item, container) {
  const price  = formatPrice(item.price);
  const waHref = waLink(cardWaMsg(item));
  const meta   = catMeta(item.category);
  const badges = extractBadges(item.title);

  const badgeHtml = badges.map(b =>
    `<span class="sc-badge sc-badge--${b.type}">${escHtml(b.text)}</span>`
  ).join('');

  const card = document.createElement('div');
  card.className = 'stock-card';
  card.innerHTML = `
    <div class="sc-body">
      <div class="sc-top-row">
        <div class="sc-cat-label">${escHtml(meta.short)}</div>
        <div class="sc-ref">ID: ${escHtml(item.item_id)}</div>
      </div>
      <div class="sc-title">${escHtml(item.title)}</div>
      ${badges.length ? `<div class="sc-badges">${badgeHtml}</div>` : ''}
      <div class="sc-photo-badge">📸 Text Yard for Live Photos &amp; Video</div>
      <div class="sc-footer">
        <div class="sc-price-wrap">
          <div class="sc-price">${price}</div>
          <div class="sc-price-sub">Cash / Bank Transfer</div>
        </div>
        <a class="btn-wa-card" href="${waHref}" target="_blank" rel="noopener">
          ${ICONS.whatsapp}
          <span>💬 WhatsApp for Best Price &amp; Photos</span>
        </a>
      </div>
    </div>
  `;
  container.appendChild(card);
}

function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── Category grid (index.html) ────────────────────────────────────────────────

function buildCategoryGrid(items, container) {
  // Count items and find min price per category
  const stats = {};
  items.forEach(item => {
    if (!stats[item.category]) stats[item.category] = { count: 0, minPrice: Infinity };
    stats[item.category].count++;
    if (item.price && item.price < stats[item.category].minPrice) {
      stats[item.category].minPrice = item.price;
    }
  });

  container.innerHTML = '';
  CAT_ORDER.forEach(catName => {
    const s    = stats[catName] || { count: 0, minPrice: Infinity };
    const meta = CAT_META[catName];
    if (!meta) return;

    const priceStr = s.minPrice < Infinity
      ? `From ${formatPrice(s.minPrice)}`
      : 'Ask for pricing';

    const a = document.createElement('a');
    a.className = 'cat-card';
    a.href = `category.html?cat=${encodeURIComponent(catName)}`;
    a.innerHTML = `
      <div class="cat-icon-wrap">${ICONS[meta.icon] || ICONS.tag}</div>
      <div class="cat-info">
        <div class="cat-name">${escHtml(meta.short)}</div>
        <div class="cat-count">${s.count} item${s.count !== 1 ? 's' : ''} in stock</div>
        <div class="cat-price">${priceStr}</div>
      </div>
    `;
    container.appendChild(a);
  });
}

// ── Search (index.html) ───────────────────────────────────────────────────────

let searchDebounce = null;

function initSearch(items) {
  const input   = document.getElementById('search-input');
  const results = document.getElementById('search-results');
  const count   = document.getElementById('search-count');
  const clear   = document.getElementById('search-clear');

  if (!input || !results) return;

  function runSearch(q) {
    const query = q.trim().toLowerCase();
    results.innerHTML = '';

    if (!query) {
      results.style.display = 'none';
      count.textContent = '';
      clear.style.display = 'none';
      return;
    }

    clear.style.display = 'flex';

    const matches = items.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query) ||
      item.ebay_category.toLowerCase().includes(query) ||
      item.item_id.includes(query)
    );

    count.textContent = matches.length > 0
      ? `${matches.length} result${matches.length !== 1 ? 's' : ''} for "${q.trim()}"`
      : `No results for "${q.trim()}"`;

    results.style.display = 'block';

    if (matches.length === 0) {
      results.innerHTML = `
        <div class="search-empty">
          <p>Nothing matched — try a brand name like <strong>Hilti</strong>, a type like <strong>breaker</strong>, or <strong>110v</strong>.</p>
          <a class="btn-wa-inline" href="${waLink(`Hi Infratrade, I'm looking for "${q.trim()}" — do you have anything like that in stock?`)}" target="_blank" rel="noopener">
            ${ICONS.whatsapp} Ask Yard Directly
          </a>
        </div>`;
      return;
    }

    // Cap display at 60 for perf; offer "show all" link
    const shown = matches.slice(0, 60);
    shown.forEach(item => renderStockCard(item, results));

    if (matches.length > 60) {
      const more = document.createElement('p');
      more.className = 'search-more';
      more.textContent = `Showing 60 of ${matches.length}. Refine your search to narrow results.`;
      results.appendChild(more);
    }
  }

  input.addEventListener('input', e => {
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => runSearch(e.target.value), 220);
  });

  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      input.value = '';
      runSearch('');
    }
  });

  clear.addEventListener('click', () => {
    input.value = '';
    runSearch('');
    input.focus();
  });

  // If URL has ?q= pre-fill search
  const urlQ = new URLSearchParams(window.location.search).get('q');
  if (urlQ) {
    input.value = urlQ;
    runSearch(urlQ);
  }
}

// ── Homepage featured card (different WA pre-fill) ────────────────────────────

function renderHomepageCard(item, container) {
  const price  = formatPrice(item.price);
  const waHref = waLink(cardWaMsg(item));
  const meta   = catMeta(item.category);
  const badges = extractBadges(item.title);

  const badgeHtml = badges.map(b =>
    `<span class="sc-badge sc-badge--${b.type}">${escHtml(b.text)}</span>`
  ).join('');

  const card = document.createElement('div');
  card.className = 'stock-card';
  card.innerHTML = `
    <div class="sc-body">
      <div class="sc-top-row">
        <div class="sc-cat-label">${escHtml(meta.short)}</div>
        <div class="sc-ref">ID: ${escHtml(item.item_id)}</div>
      </div>
      <div class="sc-title">${escHtml(item.title)}</div>
      ${badges.length ? `<div class="sc-badges">${badgeHtml}</div>` : ''}
      <div class="sc-photo-badge">📸 Text Yard for Live Photos &amp; Video</div>
      <div class="sc-footer">
        <div class="sc-price-wrap">
          <div class="sc-price">${price}</div>
          <div class="sc-price-sub">Cash / Bank Transfer</div>
        </div>
        <a class="btn-wa-card" href="${waHref}" target="_blank" rel="noopener">
          ${ICONS.whatsapp}
          <span>💬 WhatsApp for Best Price &amp; Photos</span>
        </a>
      </div>
    </div>
  `;
  container.appendChild(card);
}

// ── Featured stock (index.html) ───────────────────────────────────────────────

function buildFeatured(items, container) {
  // Skip clearance & vehicle parts, pick 4 at random on every load
  const tradeItems = items.filter(i =>
    !i.category.includes('Clearance') && !i.category.includes('Vehicle')
  );
  // Fisher-Yates shuffle, take first 4
  const pool = [...tradeItems];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  pool.slice(0, 4).forEach(item => renderHomepageCard(item, container));
}

// ── Category page (category.html) ────────────────────────────────────────────

async function initCategoryPage() {
  const params  = new URLSearchParams(window.location.search);
  const catParam = params.get('cat');
  const catName  = catParam ? decodeURIComponent(catParam) : null;

  const loading  = document.getElementById('category-loading');
  const content  = document.getElementById('category-content');
  const grid     = document.getElementById('stock-grid');
  const title    = document.getElementById('cat-page-title');
  const desc     = document.getElementById('cat-page-desc');
  const countEl  = document.getElementById('cat-page-count');
  const waInq    = document.getElementById('wa-category-inquiry');
  const bcCat    = document.getElementById('breadcrumb-cat');
  const sortSel  = document.getElementById('sort-select');

  let catItems = [];

  try {
    const items = await loadInventory();

    // Find category — support full name or slug
    let resolvedCat = catName;
    if (!CAT_META[resolvedCat]) {
      // Try slug match
      resolvedCat = CAT_ORDER.find(c => CAT_META[c].slug === catName) || null;
    }

    if (!resolvedCat) {
      loading.innerHTML = `<div class="empty-state"><p>Category not found. <a href="index.html">Back to all stock &rarr;</a></p></div>`;
      return;
    }

    const meta  = CAT_META[resolvedCat];
    catItems = items.filter(i => i.category === resolvedCat);

    document.title = `${meta.short} | Infratrade Limited — Pre-Owned Plant & Machinery`;
    if (title)   title.textContent   = resolvedCat;
    if (desc)    desc.textContent    = meta.desc;
    if (countEl) countEl.textContent = `${catItems.length} item${catItems.length !== 1 ? 's' : ''} in stock`;
    if (bcCat)   bcCat.textContent   = meta.short;
    if (waInq)   waInq.href          = categoryWaLink(resolvedCat);

    loading.style.display = 'none';
    if (content) content.style.display = '';

    function renderItems(list) {
      grid.innerHTML = '';
      if (list.length === 0) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1">
            <p>No items in this category right now — stock changes fast.</p>
            <a class="btn-wa-inline" href="${categoryWaLink(resolvedCat)}" target="_blank" rel="noopener">
              ${ICONS.whatsapp} Ask Yard for Today's Stock
            </a>
          </div>`;
      } else {
        list.forEach(item => renderStockCard(item, grid));
      }
    }

    renderItems(catItems);

    if (sortSel) {
      sortSel.addEventListener('change', () => {
        let sorted = [...catItems];
        if (sortSel.value === 'price-asc')  sorted.sort((a,b) => a.price - b.price);
        if (sortSel.value === 'price-desc') sorted.sort((a,b) => b.price - a.price);
        if (sortSel.value === 'title')      sorted.sort((a,b) => a.title.localeCompare(b.title));
        renderItems(sorted);
      });
    }

  } catch (err) {
    console.error(err);
    loading.innerHTML = `<div class="empty-state"><p style="color:#e53e3e">Error loading stock. Please refresh.</p></div>`;
  }
}

// ── Index page ────────────────────────────────────────────────────────────────

async function initIndexPage() {
  const catGrid    = document.getElementById('category-grid');
  const catLoading = document.getElementById('cat-loading');
  const featGrid   = document.getElementById('featured-grid');
  const featLoad   = document.getElementById('feat-loading');

  try {
    const items = await loadInventory();

    if (catGrid) {
      if (catLoading) catLoading.style.display = 'none';
      buildCategoryGrid(items, catGrid);
    }

    if (featGrid) {
      if (featLoad) featLoad.style.display = 'none';
      buildFeatured(items, featGrid);
    }

    initSearch(items);

  } catch (err) {
    console.error(err);
    if (catLoading) catLoading.innerHTML = `<p style="color:#e53e3e;font-size:0.85rem">Error loading categories. Refresh to try again.</p>`;
    if (featLoad)   featLoad.innerHTML   = `<p style="color:#e53e3e;font-size:0.85rem">Error loading stock. Refresh to try again.</p>`;
  }
}

// ── Boot ──────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'index')    initIndexPage();
  if (page === 'category') initCategoryPage();
});
