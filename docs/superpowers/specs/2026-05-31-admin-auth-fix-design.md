# Admin Auth Fix — Project Consolidation & Claim Alignment

## Problem

1. **Auth claim mismatch**: Admin panel checks `token.claims.admin === true` but Firestore rules check `request.auth.token.role` for values `SUPER_ADMIN`/`SUPER_AGENT`/`USER`. These don't align.
2. **Firestore rules not deployed**: `firestore.rules` exists at root but hasn't been deployed. No access control is active.
3. **AdminLogin.js uses wrong claim key**: Blocks all admin logins.

## Key Discovery

There is only **one** Firebase project, not two. The project **Name** is `bingo-27d37` but the **Project ID** (used in URLs, SDKs, and Firebase Console) is `bingo-27d37-5661f`. Both crownbingo/superagent apps (API key `AIzaSyDM_bwlzo...`) and the admin panel (API key `AIzaSyDPkQnxt...`) are registered web apps within this same project — they access the same Firestore database. No config swap was needed; the only issue was claim/role alignment.

## Constraints

- Netlify free tier for hosting (all 3 apps)
- Firebase Spark plan (no Cloud Functions)
- Zero changes to `crownbingo/` or `superagentcrownbingo/` — existing layout and features untouched

## Changes

### `admin-panel/src/App.js`
- Line 67: `token.claims.admin === true` → `token.claims.role === 'SUPER_ADMIN'`

### `admin-panel/src/components/pages/AdminLogin.js`
- Line 33: `token.claims.admin === true` → `token.claims.role === 'SUPER_ADMIN'`

### `admin-panel/admin.html`
- Line 879: `token.claims.admin === true` → `token.claims.role === 'SUPER_ADMIN'`

### `admin-panel/src/firebase.js`
- Line 207 (`isUserAdmin`): `claims.admin === true` → `claims.role === 'SUPER_ADMIN'`
- Config values unchanged (keep original `bingo-27d37-5661f` project ID)

### `admin-panel/setAdminClaim.js`
- Line 53: `{ admin: true }` → `{ role: 'SUPER_ADMIN' }`
- Console URLs unchanged (keep `bingo-27d37-5661f` project ID — it's correct)

### `firestore.rules`
- No logic changes needed — rules already use `request.auth.token.role` matching `SUPER_ADMIN`/`SUPER_AGENT`/`USER`
- Must be deployed via Firebase Console → Firestore → Rules → Publish

## Files NOT modified
- `crownbingo/` — untouched
- `superagentcrownbingo/` — untouched

## Deploy sequence
1. Apply all code changes above
2. Deploy `firestore.rules` via Firebase Console: https://console.firebase.google.com/project/bingo-27d37-5661f/firestore/rules
3. Download service account key from `bingo-27d37-5661f` → `admin-panel/serviceAccountKey.json`
4. `cd admin-panel && node setAdminClaim.js` (sets `role: SUPER_ADMIN` for `admin@crownbingo.com`)
5. Rebuild admin panel: `cd admin-panel && npm run build`

## Verification
- Admin can log in at `/admin-login` with `admin@crownbingo.com`
- Dashboard shows user/agent/bet counts
- User Management and Agent Management show real data
