# Catholic Prayer App — Patch Notes

## Files changed
- `index.html` — title, meta tags, favicon reference
- `public/favicon.svg` — new gold cross icon (add this file)
- `server.ts` — all fixes below
- `package.json` — two new dependencies

---

## What was fixed

### 1. 🔴 CRITICAL — Gemini model names were wrong (AI was completely broken)
`gemini-3.5-flash` and `gemini-3.1-flash-lite` do not exist.
Every single AI call was silently failing and falling back to static content.

**Fixed to:**
- Primary: `gemini-2.0-flash`
- Fallback: `gemini-1.5-flash`

All 4 AI endpoints (`/api/reflections/today`, `/api/generate-devotional`,
`/api/generate-affirmation`, `/api/saints/explore`) now use correct model names.

---

### 2. 🔴 CRITICAL — PORT was hardcoded to 3000
Render.com injects the port via `process.env.PORT`. Hardcoding 3000 can cause
traffic routing failures on Render.

**Fixed:**
```ts
const PORT = parseInt(process.env.PORT || "3000", 10);
```

---

### 3. 🟠 SECURITY — No rate limiting on any POST endpoint
The community prayer wall and AI endpoints had no rate limiting.

**Fixed:** Added `express-rate-limit` middleware:
- Community wall POST: 10 requests per 15 minutes per IP
- Amen button: 30 per minute per IP
- All AI endpoints: 20 per minute per IP

---

### 4. 🟠 SECURITY — No input validation on community wall
No max length, no type checking on submitted prayer content.

**Fixed:**
- Content required, string type enforced
- Max 600 characters for prayer content
- Max 60 characters for author name
- Category validated against allowed enum values

---

### 5. 🟡 MISSING — CORS headers
No CORS middleware was configured. Added `cors` package.

---

### 6. 🟡 UI — Page title was "My Google AI Studio App"
Default AI Studio placeholder title was never changed.

**Fixed in index.html:**
- Title: `Catholic Prayer — Daily Devotions & Saints`
- Meta description for SEO
- Open Graph tags for sharing
- Favicon link

---

### 7. 🟡 UI — No favicon
Added `public/favicon.svg` — a gold Latin cross on a dark navy background.

---

### 8. ℹ️ INFO — Community prayer data is ephemeral on Render
`prayers_db.json` is written to the container filesystem which resets on redeploy.
No fix applied (requires a database migration), but a clear comment was added.

**Recommended next step:** Migrate to a free Render PostgreSQL or Supabase instance.

---

## How to apply

```bash
# 1. Copy files into your repo
cp index.html /path/to/Catholic-/
cp server.ts /path/to/Catholic-/
cp package.json /path/to/Catholic-/
mkdir -p /path/to/Catholic-/public
cp public/favicon.svg /path/to/Catholic-/public/

# 2. Install the two new packages
npm install

# 3. Test locally
npm run dev

# 4. Deploy to Render
git add -A && git commit -m "fix: model names, PORT, rate limiting, input validation, meta tags" && git push
```

Render will auto-redeploy from your GitHub push.
