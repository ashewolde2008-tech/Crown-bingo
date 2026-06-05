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
- **crownbingo/**: Source on CRA layout (`src/`, `public/`). `package.json` has 19 deps. `npm install && npm run build` produces `build/`. Live bundle: `static/js/main.813322a7.js` (1.34 MB). All source fixes + UI changes (login dark bg, hamburger, auto-call toggle, rebrand) live.
- **superagentcrownbingo/**: Source on CRA layout. Live bundle: `static/js/main.b3c1ba9e.js` (1.24 MB) — rebuilt from src/. `static/` contains leftover source files (App.js, firebase.js, etc.) that are not loaded.
- **admin-panel/**: Source on CRA layout. Live bundle: `main.120ec695.js` (1.00 MB) — rebuilt from src/ with redundant crownbingo Firebase app init removed.

## Phase Completion Status
- **Phase 1** ✅ Security: .gitignore, trailing space filename fix
- **Phase 2** ✅ Firebase: rules + indexes consolidated
- **Phase 3** ✅ Source reconstruction: all missing components, CSS, locales, assets created
- **Phase 4** ✅ Feature completion: admin-panel source + standalone admin.html complete
- **Phase 5** ✅ Firestore rules: extended (points, history, jackpotHistory, currentJackpot, jackpots, histories, users/{userId}/histories), deployed via Firebase CLI
- **Phase 6** ✅ Source fixes: 4 fixes in crownbingo (App.js auth race, firebase.js getFirestore+authDomain, home.js phone gate removed) — all live
- **Phase 7** ✅ Crownbingo rebuild: src/ + public/ layout, `npm install` + `npm run build` + `wrangler pages deploy` — live bundle has all fixes
- **Phase 8** ✅ Crownbingo data model migration: UserContext, balance on users/{uid}, histories as subcollection, transaction history table — all live
- **Phase 9** ✅ Crownbingo UI polish: login dark bg, hamburger on top, hide during auto-call, CROWN BINGO rebrand — all live
- **Phase 10** ✅ Superagent rebuild: npm install + npm run build + wrangler pages deploy — live bundle matches src/
- **Phase 11** ✅ Admin panel rebuild + cleanup: removed redundant crownbingo Firebase app init — UserManagement.js / AgentManagement.js now use shared auth/db
- **Phase 12** 🔶 End-to-end retest: all 3 apps deployed, awaiting user manual test (checklist in `docs/superpowers/plans/2026-06-05-login-failure-fix.md` Phase 7)

## Key Source Fixes (crownbingo)
- `src/App.js`: `onAuthStateChanged` wraps user doc listener (was reading `localStorage.uid` before auth restored)
- `src/firebase.js`: `db = getFirestore(app)` exported; authDomain `bingo-27d37-5661f.firebaseapp.com`
- `src/pages/home.js`: `if (!userData.isVerified) return` gate removed from `handleNewGame`

## Next Commands
```powershell
# All 3 apps deployed. For retesting, user runs in browser:
#   https://crown-bingo.pages.dev/?cb=9
#   https://crown-bingo-super-agent.pages.dev/?cb=4
#   https://crown-bingo-admin.pages.dev/?cb=8

# Cloudflare credentials needed in shell (for any redeploy)
$env:CLOUDFLARE_API_TOKEN = "cfut_mcnHf9kn6YUXuETO5Z42cB3ZkO9ph7XI7mONn9NA42908cce"
$env:CLOUDFLARE_ACCOUNT_ID = "43c18a1cb7ff7a55f2e0859a3b65aa48"
```

## Live URLs
- Player app: https://crown-bingo.pages.dev/
- Super agent: https://crown-bingo-super-agent.pages.dev/
- Admin panel: https://crown-bingo-admin.pages.dev/
