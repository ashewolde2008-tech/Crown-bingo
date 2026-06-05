# Crown Bingo — Project Context

## Applications
- **crownbingo/**: Player bingo game (REBUILT FROM SOURCE, Firebase `bingo-27d37-5661f`)
- **superagentcrownbingo/**: Super agent admin (pre-built React, Firebase `bingo-27d37-5661f`)
- **admin-panel/**: Super admin dashboard (React source, Firebase `bingo-27d37-5661f`)

## Key Config
- Unified project: `bingo-27d37-5661f` (project number `330815222659`, apiKey `AIzaSyDPkQnxtMFKApBG5mle9yRsfgxlm5yS3do`)
- All three apps (crownbingo, superagentcrownbingo, admin-panel) use the same Firebase project
- The legacy project `bingo-27d37` (project number `509582453061`, apiKey `AIzaSyDM_bwlzo...Or2o`) is NOT used by any deployed app; only referenced in old bundles as a vestigial key
- Roles: `SUPER_ADMIN`, `SUPER_AGENT`, `USER` (stored in `users.role` field + Firebase custom claims)
- Deployment: **Cloudflare Pages** (3 projects), no Firebase Hosting, no Cloud Functions (Spark plan)
- Netlify account is empty — `netlify deploy` is NOT usable; use `wrangler pages deploy`

## Workspace State
- **crownbingo/**: Source reorganized to standard CRA layout (`src/`, `public/`). `package.json` has 19 deps. `npm install && npm run build` produces `build/`. Deployed bundle: `static/js/main.43f851fc.js` (1.37 MB). All 4 source-level fixes (auth race, getFirestore, no phone gate, correct authDomain) are in the live bundle.
- **superagentcrownbingo/**: Pre-built React in repo. Live bundle: `static/js/main.d2281d5f.js` (2.73 MB). Not yet rebuilt from source.
- **admin-panel/**: React 18 source, `react-scripts` in deps, `npm install && npm run build` works.

## Phase Completion Status
- **Phase 1** ✅ Security: .gitignore, trailing space filename fix
- **Phase 2** ✅ Firebase: rules + indexes consolidated
- **Phase 3** ✅ Source reconstruction: all missing components, CSS, locales, assets created
- **Phase 4** ✅ Feature completion: admin-panel source + standalone admin.html complete
- **Phase 5** ✅ Firestore rules: extended (points, history, jackpotHistory, currentJackpot, jackpots, histories), deployed via Firebase CLI
- **Phase 6** ✅ Source fixes: 4 fixes in crownbingo (App.js auth race, firebase.js getFirestore+authDomain, home.js phone gate removed) — all live
- **Phase 7** ✅ Crownbingo rebuild: src/ + public/ layout, `npm install` + `npm run build` + `wrangler pages deploy crownbingo/build` — live bundle has all fixes
- **Phase 8** 🔶 Superagent rebuild: source available in `superagentcrownbingo/src/`, not yet rebuilt
- **Phase 9** 🔶 End-to-end retest: user to verify crownbingo at `https://crown-bingo.pages.dev/?cb=2`

## Key Source Fixes (crownbingo)
- `src/App.js`: `onAuthStateChanged` wraps user doc listener (was reading `localStorage.uid` before auth restored)
- `src/firebase.js`: `db = getFirestore(app)` exported; authDomain `bingo-27d37-5661f.firebaseapp.com`
- `src/pages/home.js`: `if (!userData.isVerified) return` gate removed from `handleNewGame`

## Next Commands
```powershell
# Rebuild superagent (mirror crownbingo pattern)
cd superagentcrownbingo; npm install --legacy-peer-deps
cd superagentcrownbingo; npm run build
wrangler pages deploy superagentcrownbingo/build --project-name=crown-bingo-super-agent

# Rebuild admin-panel
cd admin-panel; npm install --legacy-peer-deps
cd admin-panel; npm run build
wrangler pages deploy admin-panel/build --project-name=crown-bingo-admin

# Cloudflare credentials needed in shell
$env:CLOUDFLARE_API_TOKEN = "cfut_mcnHf9kn6YUXuETO5Z42cB3ZkO9ph7XI7mONn9NA42908cce"
$env:CLOUDFLARE_ACCOUNT_ID = "43c18a1cb7ff7a55f2e0859a3b65aa48"
```

## Live URLs
- Player app: https://crown-bingo.pages.dev/
- Super agent: https://crown-bingo-super-agent.pages.dev/
- Admin panel: https://crown-bingo-admin.pages.dev/ (needs rebuild + deploy)
