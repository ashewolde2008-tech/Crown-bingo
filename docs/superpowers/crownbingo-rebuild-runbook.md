# Crown Bingo Player App — Rebuild Runbook

> **For agentic workers:** This runbook guides a full rebuild of the `crownbingo` player app from the existing readable source. The app is currently deployed as a pre-built static bundle (`crownbingo/static/js/main.3fbd7db3.js`); four source-level bugs are fixed in `crownbingo/static/js/` but cannot take effect until the bundle is regenerated.
>
> **Network required:** Steps that touch `npm install` and `wrangler`/`netlify` deploy commands require internet access. The `crownbingo/` directory currently has **no `package.json`** — this runbook documents the rebuild procedure and is the single source of truth for recreating it.

---

## 1. Overview

### What is being rebuilt

| Item | Value |
|------|-------|
| App | `crownbingo` (player-facing React app) |
| Live URL | `https://crown-bingo.pages.dev/` |
| Current bundle | `crownbingo/static/js/main.3fbd7db3.js` (2,918,239 bytes, 62,378 lines) |
| Current CSS bundle | `crownbingo/static/css/main.5f67ddc0.css` |
| Source location | `crownbingo/static/js/` (unusual — see §3.1) |
| Build tool | `react-scripts` 5.0.1 (CRA) |
| Firebase project | `bingo-27d37-5661f` |

### Why a rebuild is needed

The production bundle has **four latent bugs** that can ONLY be fixed by rebuilding from source. The fixes are already in `crownbingo/static/js/`, but they are not in the deployed bundle.

| # | Bug | Fixed in source at | Symptom in current bundle |
|---|-----|-------------------|---------------------------|
| 1 | **Auth listener race condition** | `crownbingo/static/js/App.js` (function `NavigationListener` / `xq` in bundle) | First Firestore request fires before `onAuthStateChanged` resolves, returning `permission-denied`; session-monitor errors with "Missing or insufficient permissions" |
| 2 | **Wrong `authDomain`** | `crownbingo/static/js/firebase.js` (line 8) | Bundle has `authDomain: "bingo-27d37.firebaseapp.com"` (no `-5661f` suffix), causing cross-project auth failure |
| 3 | **Missing `getFirestore(app)`** | `crownbingo/static/js/firebase.js` (line 19) | Bundle initializes Firebase but never calls `getFirestore(app)`, so the cashier dashboard fails with `Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore` |
| 4 | **Phone verification gate** | `crownbingo/static/js/pages/home.js` (lines ~1017-1031) | Bundle still has the `if (!userData.isVerified) { ... return; }` gate that blocks new-game flow until the user verifies their phone number |

All four are addressed in the source files and will take effect the next time `npm run build` is run.

---

## 2. Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18 LTS or 20 LTS | `node --version` |
| npm | 9+ (bundled with Node) | `npm --version` |
| Git | any recent | Already in use for the repo |
| Wrangler | 3+ (or Netlify CLI) | For deploying the rebuilt bundle |
| Internet | yes | Required for `npm install` and deploy |

Verify before starting:

```powershell
node --version
npm --version
git status   # should be on main with a clean tree (or only intended uncommitted changes)
```

---

## 3. Step-by-Step Rebuild

### 3.1 Understand the current layout

The `crownbingo/` directory has an **unusual layout**: the React source lives inside `static/js/`, and `static/` is treated as the **publish root** (not the build output). The current `index.html` references the bundle with a hardcoded hash.

```
crownbingo/
├── index.html                       # references /static/js/main.3fbd7db3.js (hardcoded hash)
├── manifest.json                    # CRA manifest
├── netlify.toml                     # publish = "."
├── server.js                        # Node static dev server
├── _redirects                       # SPA routing
├── favicon.ico, logo292.png
├── static/
│   ├── js/
│   │   ├── index.js                 # ← React entry point
│   │   ├── App.js                   # ← main component
│   │   ├── firebase.js              # ← Firebase init (FIXED)
│   │   ├── reportWebVitals.js
│   │   ├── LanguageContext.js
│   │   ├── main.3fbd7db3.js         # ← current production bundle (BUGGY)
│   │   ├── 174.21ca8665.chunk.js    # ← code-split chunk
│   │   ├── constant/                # ← data constants
│   │   ├── pages/                   # ← route components
│   │   ├── components/              # ← shared components
│   │   ├── locales/                 # ← i18n JSON
│   │   └── assets/                  # ← sound/image assets
│   ├── css/
│   │   ├── main.5f67ddc0.css        # ← built CSS bundle
│   │   ├── index.css
│   │   └── pages/
│   └── media/                       # ← sound files
└── (no package.json)                # ← needs to be created
```

For the rebuild you have **two layout options**. **Option A is recommended** (simpler, no config gymnastics).

---

### 3.2 Option A (recommended): Reorganize source into `src/` and use the build output as the publish root

This is the standard CRA layout. After the rebuild, the `crownbingo/build/` directory will be self-contained and can be served as the publish root directly.

#### Step 1: Create `crownbingo/package.json`

If you haven't already, create `crownbingo/package.json` with the following contents:

```json
{
  "name": "crownbingo",
  "version": "1.0.0",
  "private": true,
  "description": "Crown Bingo player app (React, Firebase). Pre-built source under static/js/ until rebuilt.",
  "homepage": ".",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "dependencies": {
    "@emotion/react": "^11.10.0",
    "@emotion/styled": "^11.10.0",
    "@mui/icons-material": "^5.11.0",
    "@mui/material": "^5.11.0",
    "@mui/system": "^5.11.0",
    "@mui/x-date-pickers": "^6.0.0",
    "axios": "^1.3.0",
    "dayjs": "^1.11.0",
    "firebase": "^10.0.0",
    "howler": "^2.2.4",
    "react": "^18.2.0",
    "react-confetti": "^6.1.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-scripts": "5.0.1",
    "react-slick": "^0.29.0",
    "react-swipeable-views": "^0.14.0",
    "react-toastify": "^9.1.1",
    "slick-carousel": "^1.8.1",
    "web-vitals": "^2.1.0"
  },
  "browserslist": {
    "production": [">0.2%", "not dead", "not op_mini all"],
    "development": ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"]
  },
  "eslintConfig": {
    "extends": ["react-app"]
  }
}
```

#### Step 2: Back up the current production bundle

```powershell
Copy-Item -LiteralPath "crownbingo\static\js\main.3fbd7db3.js" `
          -Destination "crownbingo\static\js\main.3fbd7db3.js.bak" -Force
```

#### Step 3: Move source files into a `src/` layout

CRA's `react-scripts` looks for `src/index.js` by default. The current source is in `static/js/`, so we need to move it.

```powershell
# Create src/ and move the React source there
New-Item -ItemType Directory -Path "crownbingo\src" -Force | Out-Null
Move-Item -LiteralPath "crownbingo\static\js\index.js"          -Destination "crownbingo\src\index.js"
Move-Item -LiteralPath "crownbingo\static\js\App.js"            -Destination "crownbingo\src\App.js"
Move-Item -LiteralPath "crownbingo\static\js\firebase.js"       -Destination "crownbingo\src\firebase.js"
Move-Item -LiteralPath "crownbingo\static\js\reportWebVitals.js" -Destination "crownbingo\src\reportWebVitals.js"
Move-Item -LiteralPath "crownbingo\static\js\LanguageContext.js" -Destination "crownbingo\src\LanguageContext.js"
Move-Item -LiteralPath "crownbingo\static\js\constant"          -Destination "crownbingo\src\constant"
Move-Item -LiteralPath "crownbingo\static\js\pages"             -Destination "crownbingo\src\pages"
Move-Item -LiteralPath "crownbingo\static\js\components"        -Destination "crownbingo\src\components"
Move-Item -LiteralPath "crownbingo\static\js\locales"           -Destination "crownbingo\src\locales"
Move-Item -LiteralPath "crownbingo\static\js\assets"            -Destination "crownbingo\src\assets"
```

**CSS import path note:** `crownbingo/src/index.js` currently does `import './index.css';`. After the move, this resolves to `crownbingo/src/index.css` — but the actual CSS is at `crownbingo/static/css/index.css`. Move the CSS files too:

```powershell
Move-Item -LiteralPath "crownbingo\static\css\index.css" -Destination "crownbingo\src\index.css"
Move-Item -LiteralPath "crownbingo\static\css\pages"     -Destination "crownbingo\src\pages" -Force
```

> The CSS files in `src/pages/` (`money.css`, `style.css`, etc.) are imported by their co-located `pages/*.js` files (e.g. `home.js` does `import './money.css';`). After the move, those imports still resolve correctly because the files are co-located.
>
> If a CSS import uses a non-relative path like `../css/...`, update the import to point to the new `src/` location.

**Asset import path note:** `home.js` does `import gifImage from './Wallet.gif'` and many `import b1Sound from '../assets/bingosound/b1.mp3'`. The `.gif` and `.mp3` files are in `static/js/pages/` and `static/js/assets/bingosound/`. After the move, the imports should resolve correctly because the files are co-located in `src/pages/` and `src/assets/`.

#### Step 4: Install dependencies

```powershell
cd crownbingo
npm install
```

Expected: completes with `added N packages` and no `ERR!` lines. If you see peer-dependency warnings for `@mui/x-date-pickers` they are expected and can be ignored.

#### Step 5: Verify the source compiles in dev mode

```powershell
npm start
```

This opens `http://localhost:3000`. Confirm:
- Login page renders
- No console errors at load
- `process.env.REACT_APP_FIREBASE_API_KEY` resolves (or the hardcoded fallback in `firebase.js` works)

If `npm start` errors out with "Cannot find module 'X'", add the missing package to `dependencies` and re-run.

Press `Ctrl+C` to stop the dev server.

#### Step 6: Build for production

```powershell
$env:CI = "false"   # avoid ESLint-as-errors blocking the build
npm run build
```

Expected output (truncated):

```
Creating an optimized production build...
Compiled successfully.

File sizes after gzip:
  N.NN KB  build/static/js/main.XXXX.js
  ...
The project was built assuming it is hosted at /.
```

#### Step 7: Find the new bundle

```powershell
Get-ChildItem -LiteralPath "crownbingo\build\static\js" -Filter "main.*.js" | Select-Object Name, Length
```

Note the new bundle hash (e.g. `main.abc123de.js`). It will differ from `main.3fbd7db3.js`.

#### Step 8: Copy the build output into the publish root

The `crownbingo/netlify.toml` says `publish = "."` (the `crownbingo/` directory itself). After the rebuild, the `crownbingo/build/` directory is self-contained, so the simplest approach is to deploy `crownbingo/build/` directly.

**If you want the publish root to remain `crownbingo/`** (matching the current Netlify setup), copy the build artifacts back to the `static/` and root locations:

```powershell
# Copy new bundle + CSS into static/
$newBundle = Get-ChildItem -LiteralPath "crownbingo\build\static\js" -Filter "main.*.js" | Select-Object -First 1
$newCss    = Get-ChildItem -LiteralPath "crownbingo\build\static\css" -Filter "main.*.css" | Select-Object -First 1

Copy-Item -LiteralPath $newBundle.FullName -Destination "crownbingo\static\js\$($newBundle.Name)" -Force
Copy-Item -LiteralPath $newCss.FullName    -Destination "crownbingo\static\css\$($newCss.Name)"   -Force

# Replace root index.html with the generated one
Copy-Item -LiteralPath "crownbingo\build\index.html" -Destination "crownbingo\index.html" -Force
```

After this, `crownbingo/index.html` references the **new** hash and `crownbingo/static/js/main.<newHash>.js` exists.

#### Step 9: Verify the rebuilt bundle has the fixes

Quick sanity checks against the new bundle:

```powershell
$bundle = Get-ChildItem -LiteralPath "crownbingo\build\static\js" -Filter "main.*.js" | Select-Object -First 1
$content = Get-Content -LiteralPath $bundle.FullName -Raw

# (1) authDomain should be bingo-27d37-5661f
$authOk = $content -match 'bingo-27d37-5661f\.firebaseapp\.com'

# (2) should reference getFirestore
$dbOk = $content -match 'getFirestore'

# (3) phone gate should NOT exist (the source has the lines commented out)
$phoneGate = ([regex]::Matches($content, '!userData\.isVerified')).Count

Write-Output "authDomain OK: $authOk"
Write-Output "getFirestore present: $dbOk"
Write-Output "phone gate count (should be 0 or low): $phoneGate"
```

Expected:
- `authDomain OK: True`
- `getFirestore present: True`
- `phone gate count: 0` (the source has the gate commented out, so it should not appear in the bundle — or appear only in a comment string)

#### Step 10: Delete the old bundle and CSS (optional cleanup)

```powershell
Remove-Item -LiteralPath "crownbingo\static\js\main.3fbd7db3.js"    -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "crownbingo\static\js\main.3fbd7db3.js.bak" -Force -ErrorAction SilentlyContinue
Remove-Item -LiteralPath "crownbingo\static\css\main.5f67ddc0.css" -Force -ErrorAction SilentlyContinue
```

> **Keep the `.bak` file until you have verified the new bundle works in production.** A safer pattern is to keep the backup around for the verification phase, then delete it after the new deploy is confirmed.

#### Step 11: Commit the rebuild

```powershell
cd ..
git add crownbingo/package.json
git add crownbingo/index.html
git add crownbingo/static/js/main.*.js
git add crownbingo/static/css/main.*.css
git status
```

Then:

```powershell
git commit -m "rebuild: crownbingo bundle with race-condition/authDomain/cashier/phone fixes

- Adds crownbingo/package.json with the deps needed to rebuild
- Rebuilt bundle addresses 4 source bugs that were never deployed:
  1. Auth listener race condition (App.js NavigationListener)
  2. Wrong authDomain (firebase.js: was bingo-27d37, now bingo-27d37-5661f)
  3. Missing getFirestore(app) (firebase.js)
  4. Phone verification gate removed (home.js) per user request 2026-06-05

New bundle hash replaces main.3fbd7db3.js."
```

#### Step 12: Deploy

**Option A — Cloudflare Pages (live URL is `crown-bingo.pages.dev`):**

```powershell
$env:CLOUDFLARE_API_TOKEN = "<token>"
$env:CLOUDFLARE_ACCOUNT_ID = "43c18a1cb7ff7a55f2e0859a3b65aa48"

# If publish root is crownbingo/ (current setup):
wrangler pages deploy crownbingo --project-name=crown-bingo --commit-dirty=true

# If publish root is now crownbingo/build/ (after reorganizing):
wrangler pages deploy crownbingo/build --project-name=crown-bingo --commit-dirty=true
```

**Option B — Netlify (the site is linked to `siteId 17749eab-218d-4ce8-92ba-04aad958880c`):**

```powershell
cd crownbingo
netlify deploy --prod --dir=.
# or, if publish root is now build/:
netlify deploy --prod --dir=build
```

**Option C — Git push (if Netlify/Cloudflare Git integration is configured):**

```powershell
git push origin main
```

Wait for the deploy to complete (~1-2 min for Cloudflare Pages).

---

### 3.3 Option B (alternative): Keep source in `static/js/` and configure `react-scripts` to use it

This option avoids moving files. CRA's `react-scripts` reads from `src/` by default, but the entry point can be overridden via the `HOME_PAGE` env var or by symlinking. This is more brittle than Option A and is **not recommended**.

If you must use this option, the simplest path is to symlink:

```powershell
# From crownbingo/
New-Item -ItemType Junction -Path "src" -Target "static\js" | Out-Null
```

Then `npm run build` will read from `static/js/`, but the build output will still be written to `build/`. The `static/js/index.js` entry will be picked up as `src/index.js`.

**Caveats:**
- Symlinks on Windows can be flaky with `react-scripts` (Babel/ESLint path resolution).
- The `static/js/main.3fbd7db3.js` (current bundle) and the `static/js/174.21ca8665.chunk.js` will be picked up by CRA as source files. You will need to exclude them with a `.babelrc` / `babel.config.js` and a Jest config, or move them to `static/js/build/` first.

**Recommendation:** Use Option A.

---

## 4. Verification Checklist

After the deploy completes:

- [ ] **Hard-refresh** `https://crown-bingo.pages.dev/?cb=<random>` (cache-bust to bypass Cloudflare cache)
- [ ] Open **DevTools → Network tab**, filter JS
- [ ] Confirm the new `main.<newhash>.js` is being requested (not `main.3fbd7db3.js`)
- [ ] Open **DevTools → Console**
- [ ] **Sign in** with a test user
- [ ] Confirm: **no `Missing or insufficient permissions` error** in Console
- [ ] Confirm: **no `Expected first argument to collection()` error** in Console
- [ ] After sign-in, **wallet/balance** displays correctly (should show 100 for a freshly-created test user)
- [ ] **Jackpot ticker** shows the current value (not `0` or `--`)
- [ ] **No phone verification gate**: clicking "New Game" should let you start a game immediately
- [ ] The `/savePhone` page is **still reachable** via direct URL navigation (the gate was removed, not the page)

If the new bundle is **not** being served, hard-refresh with `Ctrl+Shift+R`. Cloudflare's cache can lag by 30-60 seconds.

If any of the four bugs is still present, check:
1. The bundle was actually deployed (not cached old version) — verify the URL in DevTools
2. The new bundle has the fixes — re-run the sanity check in §3.2 Step 9
3. The `index.html` references the new hash — `git show HEAD:crownbingo/index.html`

---

## 5. Rollback Plan

If the rebuild breaks something, restore the pre-rebuild state:

```powershell
# Restore the backup bundle (if you kept main.3fbd7db3.js.bak)
Copy-Item -LiteralPath "crownbingo\static\js\main.3fbd7db3.js.bak" `
          -Destination "crownbingo\static\js\main.3fbd7db3.js" -Force

# Restore the previous index.html from git
git checkout HEAD~1 -- crownbingo/index.html

# Restore the previous CSS bundle (if it was deleted)
git checkout HEAD~1 -- crownbingo/static/css/main.5f67ddc0.css

# Commit the rollback
git commit -am "revert: restore previous crownbingo bundle"
git push origin main
```

Then redeploy via the same mechanism used for the original deploy.

**The source fixes are still in `crownbingo/src/` (or `crownbingo/static/js/` if you went with Option B) and can be re-built later once the issue is diagnosed.**

---

## 6. Known Issues / Next Steps

### Layout oddity
The `crownbingo/` directory's source-in-static/ layout is unusual. The recommended approach is **Option A** (move to `src/`, deploy from `build/`). If the team prefers to keep the current publish root (`crownbingo/`), the build artifacts must be copied back to `crownbingo/static/` after `npm run build`. Document whichever approach is chosen in `AGENTS.md` for the next maintainer.

### Bundle size
The current bundle is **~2.9 MB minified**. The `home.js` page alone is ~75 KB of source, mostly because of the 235-card bingo constant. Consider:
- **Code-splitting** with `React.lazy` and `Suspense` for the `bingo1`, `bingo2`, `casino`, and `gameHistory` routes (they are not loaded on the login/home flow).
- **Tree-shaking** of MUI imports: the source uses deep imports (`import AppBar from '@mui/material/AppBar'`) which is good. Verify the build output drops unused MUI components.
- **Replacing `react-swipeable-views`** with the swr-based `swiper` library (smaller, more actively maintained) — non-trivial because `banner.js` uses it.
- **Switching from CRA to Vite** — Vite's esbuild-based bundler produces smaller output and rebuilds in <1 s. Migration is straightforward: replace `react-scripts` with `vite`, move `index.html` to the project root, change the script tags to `<script type="module" src="/src/index.js">`. The `crownbingo/` directory has no SPA server config beyond `_redirects`, so the migration is contained.

### Long-term: code-split the heavy pages
The `Home` page imports 75 MP3 files (~30 KB each, ~2.2 MB total uncompressed) via static `import` statements. These get bundled into the main JS chunk. **Recommendation:** serve the sounds from `static/media/` (where they already are post-build) and load them via `new Audio(src)` at runtime, not via `import`.

### Firebase Analytics
The current `firebase.js` calls `getAnalytics(app)` unconditionally. If the page is loaded in an environment where Analytics is blocked (e.g. some browser extensions, dev tools), this may log warnings. Consider wrapping in `try/catch`:

```js
let analytics = null;
try { analytics = getAnalytics(app); } catch (e) { /* analytics unavailable */ }
```

### Testing
There is currently **no test suite** for the player app. Consider adding:
- **Jest + React Testing Library** for component tests (already configured by `react-scripts test`)
- **Cypress or Playwright** for end-to-end smoke tests covering the four fix points:
  1. Auth listener race (sign in, verify no `permission-denied`)
  2. `authDomain` is correct (sign in works against the right project)
  3. `getFirestore(app)` is called (cashier dashboard loads)
  4. Phone gate is bypassed (new game starts without phone verification)

---

## Appendix A: Dependency enumeration

The source uses these top-level npm packages (full enumeration of all `import ... from "..."` statements that don't start with `.`):

| Package | Version | Used in | Purpose |
|---------|---------|---------|---------|
| `react` | ^18.2.0 | all `.js` | UI library |
| `react-dom` | ^18.2.0 | `index.js` | DOM renderer |
| `react-router-dom` | ^6.8.0 | `App.js`, `home.js`, etc. | Hash router (note: the app uses `HashRouter`, not `BrowserRouter`) |
| `react-scripts` | 5.0.1 | (build only) | CRA build tool |
| `firebase` | ^10.0.0 | `firebase.js`, `App.js`, `pages/*` | Auth, Firestore, Analytics |
| `firebase/analytics` | (subpath of `firebase`) | `firebase.js` | Analytics |
| `firebase/auth` | (subpath of `firebase`) | `App.js`, `pages/login.js`, etc. | Auth SDK |
| `firebase/firestore` | (subpath of `firebase`) | `App.js`, `Dashboard.js`, `Transaction.js`, etc. | Firestore SDK |
| `firebase/app` | (subpath of `firebase`) | `firebase.js` | App init |
| `@mui/material` | ^5.11.0 | most pages | MUI components (deep imports) |
| `@mui/material/styles` | (subpath of `@mui/material`) | `home.js`, `Dashboard.js` | `styled` |
| `@mui/material/AppBar`, `Box`, `Button`, ... | (subpaths of `@mui/material`) | `home.js`, `Dashboard.js`, `bingo2.js` | Individual MUI components |
| `@mui/icons-material` | ^5.11.0 | `home.js`, `drawer.js` | Icons (deep imports) |
| `@mui/system` | ^5.11.0 | `banner.js` | `styled` from system |
| `@mui/x-date-pickers` | ^6.0.0 | `Dashboard.js`, `Transaction.js` | Date pickers (with `AdapterDayjs`) |
| `@emotion/react` | ^11.10.0 | (peer of MUI) | MUI peer dependency |
| `@emotion/styled` | ^11.10.0 | (peer of MUI) | MUI peer dependency |
| `axios` | ^1.3.0 | `home.js`, `phone.js` | HTTP client |
| `dayjs` | ^1.11.0 | `Dashboard.js`, `Transaction.js` | Date library (peer of MUI x-date-pickers) |
| `react-toastify` | ^9.1.1 | `App.js`, `login.js`, `phone.js`, etc. | Toast notifications |
| `react-confetti` | ^6.1.0 | `jackpot.js`, `bingo1.js`, `Dialog.js` | Confetti animation |
| `react-slick` | ^0.29.0 | `bingo2.js` | Carousel/slider |
| `slick-carousel` | ^1.8.1 | (peer of `react-slick`) | CSS for the slider |
| `react-swipeable-views` | ^0.14.0 | `banner.js` | Touch swipe views |
| `howler` | ^2.2.4 | `home.js`, `PlayAudio.js` | Audio playback |
| `web-vitals` | ^2.1.0 | `reportWebVitals.js` (dynamic import) | Web Vitals reporting |

**Summary:** 1 react dep, 2 firebase subpackages, 5 @mui packages, 3 emotion packages, 6 utility packages.

**No build tool other than `react-scripts` is needed.** No `vite`, `webpack`, `babel`, or `tsconfig` configuration exists. The build is plain CRA.

## Appendix B: Build tool rationale

The build tool is **CRA (`react-scripts`)**. Confirmed by:
- `crownbingo/index.html` is a stock CRA template (mentions "create-react-app" in the meta description)
- `crownbingo/manifest.json` is the CRA default
- The bundle hash pattern (`main.<hash>.js`) matches CRA output
- The sibling projects (`superagentcrownbingo/`, `admin-panel/`) both use `react-scripts 5.0.1` — the new `crownbingo/package.json` follows the same convention for consistency

**Recommendation:** Keep `react-scripts` for this rebuild. Migration to Vite is recommended as a follow-up (see §6) but is out of scope for the bug-fix rebuild.

## Appendix C: Source-level fix locations (for the code reviewer)

| Bug | File | Lines (approx) | What was changed |
|-----|------|---------------|------------------|
| 1. Auth listener race | `crownbingo/static/js/App.js` (or `crownbingo/src/App.js` after Option A) | function `NavigationListener` (lines 20-66) | Wraps the `onSnapshot` setup in `onAuthStateChanged` so the auth state is restored before the listener fires. Uses `auth.currentUser.uid` instead of `localStorage.getItem("uid")`. |
| 2. Wrong `authDomain` | `crownbingo/static/js/firebase.js` (or `crownbingo/src/firebase.js`) | line 8 | `authDomain: "bingo-27d37.firebaseapp.com"` → `"bingo-27d37-5661f.firebaseapp.com"` |
| 3. Missing `getFirestore(app)` | `crownbingo/static/js/firebase.js` | line 19 | Added `const db = getFirestore(app);` after `const app = initializeApp(...)`. |
| 4. Phone verification gate | `crownbingo/static/js/pages/home.js` | lines ~1017-1031 | The `if (!userData.isVerified) { ... return; }` block is commented out. The `/savePhone` page and `PhoneVerificationDialog` component are still in the codebase and reachable. |

---

## Appendix D: Files modified by this runbook

This runbook creates:
- `docs/superpowers/crownbingo-rebuild-runbook.md` (this file)
- `crownbingo/package.json` (the manifest needed for `npm install`)

The runbook **modifies nothing else**. The actual rebuild (Step 11) is a commit that the human operator creates after running `npm run build`.

If you want to record the rebuild as part of the same change set, the commit should include:
- `crownbingo/package.json` (new)
- `crownbingo/index.html` (updated to reference new bundle hash)
- `crownbingo/static/js/main.<newhash>.js` (new bundle)
- `crownbingo/static/css/main.<newhash>.css` (new CSS bundle)
- (Optional, with Option A only) `crownbingo/src/` (the moved source — the entire directory)

`node_modules/` and `build/` are typically git-ignored; the operator should not commit them.

---

## End of runbook.
