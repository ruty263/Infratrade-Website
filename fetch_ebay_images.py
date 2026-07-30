#!/usr/bin/env python3
"""
fetch_ebay_images.py
Fetches real listing images from the eBay Browse API and writes them
into inventory_categories.json as an "image" field.

Credentials are read from environment variables:
  EBAY_CLIENT_ID     — App ID (Client ID)
  EBAY_CLIENT_SECRET — Cert ID (Client Secret)
"""

import json, os, sys, time, base64
import urllib.request, urllib.error, urllib.parse

# ── Config ────────────────────────────────────────────────────────────────────
JSON_PATH   = "inventory_categories.json"
PUBLIC_COPY = "artifacts/infratrade/public/inventory_categories.json"
EXPORT_COPY = "export/inventory_categories.json"

TOKEN_URL   = "https://api.ebay.com/identity/v1/oauth2/token"
BROWSE_URL  = "https://api.ebay.com/buy/browse/v1/item/get_item_by_legacy_id"
SCOPE       = "https://api.ebay.com/oauth/api_scope"
MARKETPLACE = "EBAY_GB"

DELAY       = 0.25   # seconds between requests
TIMEOUT     = 12

# ── Credentials ───────────────────────────────────────────────────────────────
CLIENT_ID     = os.environ.get("EBAY_CLIENT_ID", "").strip()
CLIENT_SECRET = os.environ.get("EBAY_CLIENT_SECRET", "").strip()

if not CLIENT_ID or not CLIENT_SECRET:
    sys.exit("ERROR: EBAY_CLIENT_ID and EBAY_CLIENT_SECRET env vars must be set.")

# ── OAuth token ───────────────────────────────────────────────────────────────
def get_token() -> str:
    creds    = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    payload  = urllib.parse.urlencode({"grant_type": "client_credentials", "scope": SCOPE}).encode()
    req = urllib.request.Request(
        TOKEN_URL,
        data    = payload,
        headers = {
            "Authorization": f"Basic {creds}",
            "Content-Type":  "application/x-www-form-urlencoded",
        },
        method  = "POST",
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        data = json.loads(r.read())
    token = data.get("access_token")
    if not token:
        sys.exit(f"ERROR: Could not obtain token. Response: {data}")
    expires = data.get("expires_in", "?")
    print(f"✓ OAuth token obtained (expires in {expires}s)")
    return token

# ── Fetch single item image ───────────────────────────────────────────────────
def fetch_image(item_id: str, token: str) -> str | None:
    url = f"{BROWSE_URL}?legacy_item_id={item_id}"
    req = urllib.request.Request(
        url,
        headers = {
            "Authorization":            f"Bearer {token}",
            "X-EBAY-C-MARKETPLACE-ID":  MARKETPLACE,
            "Content-Type":             "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
            data = json.loads(r.read())
        return data.get("image", {}).get("imageUrl") or None
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        if e.code == 404:
            return None   # listing ended
        if e.code == 401:
            return "TOKEN_EXPIRED"
        print(f"  HTTP {e.code} for {item_id}: {body[:120]}")
        return None
    except Exception as exc:
        print(f"  Error for {item_id}: {exc}")
        return None

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    with open(JSON_PATH, encoding="utf-8") as f:
        items = json.load(f)

    total   = len(items)
    done    = sum(1 for i in items if i.get("image"))
    print(f"Loading {total} items — {done} already have images, {total - done} to fetch\n")

    token   = get_token()
    success = done
    missing = 0
    changed = False

    for idx, item in enumerate(items):
        if item.get("image"):
            continue   # already fetched

        item_id = str(item["item_id"])
        img     = fetch_image(item_id, token)

        if img == "TOKEN_EXPIRED":
            print("  Token expired — refreshing…")
            token = get_token()
            img   = fetch_image(item_id, token)

        if img:
            item["image"] = img
            success += 1
            changed  = True
        else:
            item["image"] = ""
            missing += 1
            changed  = True

        # Progress every 25 items
        fetched_so_far = success + missing - done
        if fetched_so_far % 25 == 0 or (idx + 1) == total:
            pct = round((idx + 1) / total * 100)
            print(f"  [{idx+1}/{total}] {pct}%  —  ✓ {success} images  ✗ {missing} missing",
                  flush=True)

        # Save checkpoint every 50 items so progress isn't lost
        if changed and fetched_so_far % 50 == 0:
            _save(items)
            changed = False

        time.sleep(DELAY)

    # Final save
    _save(items)
    print(f"\nDone. {success}/{total} images fetched, {missing} listings had no image.")

def _save(items):
    out = json.dumps(items, ensure_ascii=False, separators=(",", ":"))
    for path in (JSON_PATH, PUBLIC_COPY, EXPORT_COPY):
        if os.path.exists(os.path.dirname(path) or "."):
            with open(path, "w", encoding="utf-8") as f:
                f.write(out)
    print("  → Saved checkpoint", flush=True)

if __name__ == "__main__":
    main()
