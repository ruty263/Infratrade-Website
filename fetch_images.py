#!/usr/bin/env python3
"""
fetch_images.py
Fetch the real og:image URL for each eBay listing and write it into
inventory_categories.json as an "image" field.
"""

import json, re, time, sys
import urllib.request
import urllib.error

JSON_PATH = "inventory_categories.json"
DELAY     = 0.6          # seconds between requests
TIMEOUT   = 10           # request timeout
MAX_RETRIES = 2

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-GB,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

OG_IMAGE_RE = re.compile(
    r'<meta\s+property=["\']og:image["\']\s+content=["\'](https?://[^"\']+)["\']',
    re.IGNORECASE,
)
# Also try alternate attribute order
OG_IMAGE_RE2 = re.compile(
    r'<meta\s+content=["\'](https?://[^"\']+)["\']\s+property=["\']og:image["\']',
    re.IGNORECASE,
)

def fetch_og_image(item_id: str) -> str | None:
    url = f"https://www.ebay.co.uk/itm/{item_id}"
    req = urllib.request.Request(url, headers=HEADERS)
    for attempt in range(MAX_RETRIES + 1):
        try:
            with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
                # Read up to 80 KB — og:image is always near the top
                html = resp.read(81920).decode("utf-8", errors="replace")
            m = OG_IMAGE_RE.search(html) or OG_IMAGE_RE2.search(html)
            return m.group(1) if m else None
        except urllib.error.HTTPError as e:
            if e.code in (403, 404, 410):
                return None          # listing gone or blocked
            if attempt < MAX_RETRIES:
                time.sleep(2)
        except Exception:
            if attempt < MAX_RETRIES:
                time.sleep(2)
    return None

def main():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        items = json.load(f)

    total   = len(items)
    success = 0
    failed  = 0

    print(f"Processing {total} items …\n")

    for i, item in enumerate(items):
        item_id = str(item.get("item_id", ""))
        # Skip if we already have a real image
        if item.get("image"):
            success += 1
            continue

        img_url = fetch_og_image(item_id)
        if img_url:
            item["image"] = img_url
            success += 1
        else:
            item["image"] = ""
            failed += 1

        # Progress every 10 items
        if (i + 1) % 10 == 0 or (i + 1) == total:
            pct = round((i + 1) / total * 100)
            print(f"  [{i+1}/{total}] {pct}% — got {success} images, {failed} missing",
                  flush=True)

        time.sleep(DELAY)

    # Save
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(items, f, ensure_ascii=False, separators=(",", ":"))

    print(f"\nDone. {success} images found, {failed} missing. Saved → {JSON_PATH}")

if __name__ == "__main__":
    main()
