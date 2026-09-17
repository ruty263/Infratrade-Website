#!/usr/bin/env python3
"""Generate crawlable product pages and an XML sitemap from stock JSON."""

import html
import json
import os
import re
import shutil
import unicodedata
from pathlib import Path
from urllib.parse import quote


ROOT = Path(__file__).resolve().parent
CURRENT_JSON = ROOT / "inventory_categories.json"
HISTORY_JSON = ROOT / "product_history.json"
PUBLIC_DIR = ROOT / "artifacts" / "infratrade" / "public"
PRODUCT_DIR = PUBLIC_DIR / "product"
SITE_URL = os.environ.get("SITE_URL", "https://www.infratrade.co.uk").rstrip("/")
WA_NUMBER = "447909329693"


def esc(value):
    return html.escape(str(value or ""), quote=True)


def slugify(title, item_id):
    normalized = unicodedata.normalize("NFKD", str(title)).encode("ascii", "ignore").decode()
    normalized = normalized.replace("&", " and ")
    base = re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")
    base = re.sub(r"-+", "-", base)[:100].strip("-") or "product"
    return f"{base}-{item_id}"


def product_path(item):
    return f"product/{item['slug']}/"


def product_url(item):
    return f"{SITE_URL}/{product_path(item)}"


def money(value):
    try:
        amount = float(value)
    except (TypeError, ValueError):
        return "Ask for price"
    return f"£{amount:,.2f}"


def whatsapp_url(item):
    message = (
        f"Hi Infratrade, I'm interested in {item['title']} listed at "
        f"{money(item.get('price'))} (ID: {item['item_id']}). "
        "Could you confirm availability and send any extra photos if available?"
    )
    return f"https://wa.me/{WA_NUMBER}?text={quote(message)}"


def condition_label(item):
    explicit = str(item.get("condition", "")).strip()
    if explicit:
        return explicit

    title = str(item.get("title", "")).lower()
    if re.search(r"\bbrand\s+new\b", title):
        return "Brand New"
    if re.search(r"\brefurbished?\b", title):
        return "Refurbished"
    if re.search(r"\b(?:for parts|spares or repair|not working)\b", title):
        return "For parts or not working"
    if re.search(r"\bnew\b", title):
        return "New"
    return "Used"


def condition_schema_url(label):
    normalized = label.lower()
    if normalized in {"new", "brand new"}:
        return "https://schema.org/NewCondition"
    if "refurb" in normalized:
        return "https://schema.org/RefurbishedCondition"
    if normalized == "used":
        return "https://schema.org/UsedCondition"
    if "parts" in normalized or "not working" in normalized:
        return "https://schema.org/DamagedCondition"
    return ""


def description(item):
    title = str(item.get("title", "")).strip()
    category = str(item.get("category", "")).strip()
    parts = [title, f"Condition: {condition_label(item)}."]
    if category:
        parts.append(f"Category: {category}.")
    return " ".join(parts)


def jsonld(item):
    active = item.get("status") == "active"
    condition_url = condition_schema_url(condition_label(item))
    data = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": item["title"],
        "description": description(item),
        "category": item.get("category"),
        "url": product_url(item),
    }
    if item.get("image"):
        data["image"] = [item["image"]]
    offer = {
        "@type": "Offer",
        "url": product_url(item),
        "priceCurrency": "GBP",
        "availability": (
            "https://schema.org/InStock"
            if active
            else "https://schema.org/OutOfStock"
        ),
    }
    if condition_url:
        offer["itemCondition"] = condition_url
    if active:
        try:
            offer["price"] = f"{float(item['price']):.2f}"
        except (TypeError, ValueError):
            pass
    data["offers"] = offer
    return json.dumps(data, ensure_ascii=False, separators=(",", ":"))


def page_html(item):
    active = item.get("status") == "active"
    title = esc(item["title"])
    canonical = esc(product_url(item))
    meta_description = esc(description(item))
    image = item.get("image", "")
    category = esc(item.get("category", ""))
    condition = esc(condition_label(item))
    status = "Available in current stock" if active else "No longer listed / unavailable"
    status_class = "product-status--active" if active else "product-status--unavailable"
    image_html = (
        f'''<a class="product-image-link" href="{esc(image)}" target="_blank" rel="noopener">
          <img class="product-detail-image" src="{esc(image)}" alt="{title}" width="900" height="675" loading="eager" />
        </a>'''
        if image
        else '<div class="product-image-empty">Product image unavailable</div>'
    )
    price_html = f'<div class="product-detail-price">{money(item.get("price"))}</div>' if active else ""
    action_html = (
        f'''<a class="btn-wa-large" href="{esc(whatsapp_url(item))}" target="_blank" rel="noopener">
          WhatsApp for Best Price &amp; Photos
        </a>'''
        if active
        else '<a class="btn-ghost" href="../../index.html#stock">Browse current stock</a>'
    )
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title} | Infratrade Limited</title>
  <meta name="description" content="{meta_description}" />
  <meta property="og:title" content="{title} | Infratrade Limited" />
  <meta property="og:description" content="{meta_description}" />
  <meta property="og:type" content="product" />
  <meta property="og:url" content="{canonical}" />
  {f'<meta property="og:image" content="{esc(image)}" />' if image else ""}
  <link rel="canonical" href="{canonical}" />
  <link rel="icon" type="image/jpeg" href="../../assets/favicon.jpg" />
  <link rel="apple-touch-icon" href="../../assets/favicon.jpg" />
  <link rel="stylesheet" href="../../style.css" />
  <script type="application/ld+json">{jsonld(item)}</script>
</head>
<body data-page="product">
  <header class="site-header">
    <div class="header-inner">
      <a class="logo" href="../../index.html">
        <img src="../../assets/logo.jpeg" alt="Infratrade Limited" class="logo-img" />
        <span class="logo-sub">Trade Tools &amp; Plant — Warrington, NW England</span>
      </a>
      <nav class="header-nav">
        <a href="../../index.html#search-section">Search</a>
        <a href="../../index.html#categories">Categories</a>
        <a href="../../index.html#stock">Stock</a>
        <a href="../../index.html#how-it-works">How It Works</a>
      </nav>
      <a class="btn-whatsapp-header" href="https://wa.me/{WA_NUMBER}" target="_blank" rel="noopener">WhatsApp Us</a>
    </div>
  </header>

  <main class="product-page">
    <div class="product-page-inner">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <a href="../../index.html">Home</a>
        <span aria-hidden="true">›</span>
        <a href="../../category.html?cat={quote(item.get('category', ''))}">{category}</a>
        <span aria-hidden="true">›</span>
        <span>{title}</span>
      </nav>
      <article class="product-detail">
        <div class="product-detail-media">{image_html}</div>
        <div class="product-detail-content">
          <div class="section-label">{category}</div>
          <h1>{title}</h1>
          <div class="product-status {status_class}">{status}</div>
          {price_html}
          <p class="product-detail-description">{esc(description(item))}</p>
          <dl class="product-specs">
            <div><dt>Condition</dt><dd>{condition}</dd></div>
            <div><dt>Website category</dt><dd>{category}</dd></div>
            <div><dt>Listing reference</dt><dd>{esc(item["item_id"])}</dd></div>
          </dl>
          <div class="product-detail-actions">{action_html}</div>
        </div>
      </article>
    </div>
  </main>

  <footer class="site-footer">
    <div class="footer-inner">
      <span>© Infratrade Limited</span>
      <a href="../../index.html">Back to all stock</a>
    </div>
  </footer>
</body>
</html>
'''


def load_history():
    if not HISTORY_JSON.exists():
        return {}
    try:
        data = json.loads(HISTORY_JSON.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except json.JSONDecodeError:
        return {}


def main():
    current = json.loads(CURRENT_JSON.read_text(encoding="utf-8"))
    old = load_history()
    merged = {}

    for raw in current:
        item_id = str(raw["item_id"])
        previous = old.get(item_id, {})
        item = {**previous, **raw}
        item["item_id"] = item_id
        item["slug"] = previous.get("slug") or slugify(item["title"], item_id)
        item["status"] = "active"
        if not item.get("image") and previous.get("image"):
            item["image"] = previous["image"]
        merged[item_id] = item

    for item_id, previous in old.items():
        if item_id not in merged:
            previous = dict(previous)
            previous["status"] = "unavailable"
            merged[item_id] = previous

    HISTORY_JSON.write_text(
        json.dumps(merged, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    if PRODUCT_DIR.exists():
        for child in PRODUCT_DIR.iterdir():
            if child.is_dir():
                shutil.rmtree(child)
    PRODUCT_DIR.mkdir(parents=True, exist_ok=True)

    active_items = []
    for item in merged.values():
        page_dir = PRODUCT_DIR / item["slug"]
        page_dir.mkdir(parents=True, exist_ok=True)
        (page_dir / "index.html").write_text(page_html(item), encoding="utf-8")
        if item.get("status") == "active":
            active_items.append(item)

    urls = [
        f"  <url><loc>{SITE_URL}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>",
        f"  <url><loc>{SITE_URL}/category.html</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>",
    ]
    urls.extend(
        f"  <url><loc>{esc(product_url(item))}</loc><changefreq>weekly</changefreq><priority>0.7</priority></url>"
        for item in active_items
    )
    sitemap = (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )
    (PUBLIC_DIR / "sitemap.xml").write_text(sitemap, encoding="utf-8")
    (PUBLIC_DIR / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\nSitemap: {SITE_URL}/sitemap.xml\n",
        encoding="utf-8",
    )
    print(
        f"Generated {len(merged)} product pages "
        f"({len(active_items)} active, {len(merged) - len(active_items)} unavailable) "
        f"and sitemap with {len(active_items) + 2} URLs."
    )


if __name__ == "__main__":
    main()