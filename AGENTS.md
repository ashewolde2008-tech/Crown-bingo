# Crown Bingo — Project Context

## Applications
- **crownbingo/**: Player bingo game (pre-built React, Firebase `bingo-27d37`)
- **superagentcrownbingo/**: Super agent admin (pre-built React, Firebase `bingo-27d37`)
- **admin-panel/**: Super admin dashboard (React source, Firebase `bingo-27d37-5661f`)

## Key Config
- Unified project: `bingo-27d37-5661f` (apiKey: `AIzaSyDPkQnxtMFKApBG5mle9yRsfgxlm5yS3do`)
- All three apps (crownbingo, superagentcrownbingo, admin-panel) use the same Firebase project
- The player project `bingo-27d37` (project number `509582453061`) uses apiKey `AIzaSyDM_bwlzo...` but is NOT accessible via Firebase Console; NOT used by any deployed app
- Roles: `SUPER_ADMIN`, `SUPER_AGENT`, `USER` (stored in `users.role` field + Firebase custom claims)
- Deployment: Netlify (3 sites), no Firebase Hosting, no Cloud Functions (Spark plan)

## Workspace State
- Crownbingo and superagentcrownbingo: pre-built, served via Python HTTP server or Netlify
- admin-panel: React 18 source, needs `react-scripts` added to dependencies (add to package.json, then `npm install`)

## Phase Completion Status
- **Phase 1** ✅ Security: .gitignore, trailing space filename fix
- **Phase 2** ✅ Netlify/Firebase: netlify.toml, Firebase config consolidation
- **Phase 3** ✅ Source reconstruction: all missing components, CSS, locales, assets created
- **Phase 4** ✅ Feature completion: admin-panel source + standalone admin.html complete; react-scripts added to deps
- **Phase 5** 🔶 Firebase rules: firestore.rules + firestore.indexes.json created (deploy via Firebase Console)
- **Phase 6** ✅ Netlify deployment: netlify.toml + _redirects for all 3 apps; deploy-all.bat created; admin-panel netlify.toml updated for React build
- **Phase 7** 🔶 Testing: verify.bat created (checks all critical files); full build test blocked on network (needs `npm install`)

## Next Commands When Network Available
```powershell
cd admin-panel; npm install
cd admin-panel; npm run build  # for React build
# For Netlify deploy:
# netlify deploy --prod --dir=crownbingo
# netlify deploy --prod --dir=superagentcrownbingo
# netlify deploy --prod --dir=admin-panel/build
```
