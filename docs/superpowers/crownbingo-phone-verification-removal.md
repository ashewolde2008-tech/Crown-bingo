# Crown Bingo — Phone Verification Gate Removal

**Date:** 2026-06-05
**Scope:** `crownbingo/` (player-facing React app)
**Status:** Source patched; bundle rebuild required to deploy

## What changed and why

The Crown Bingo player app forced every user through a **Phone Verification** gate
after login. The dialog contained this Amharic text:

> የቢንጎ ሱቁን ባለቤት ስልክ ያስገቡ በስልክ የሚገባዉን OTP ቁጥር አስገብተዉ ያረጋግጡ
>
> (Translation: "Enter the bingo shop owner's phone number and enter the OTP code
> sent to the phone to confirm")

The gate was triggered by the `isVerified` field on the user document. If a user
did not have `isVerified: true` on their Firestore user doc, they could not start
a new game. The verification required an OTP from a third-party SMS provider
(`api.geezsms.com`).

**Per user request 2026-06-05**, the gate is removed. Phone is now **optional**.
The data model still includes `phone` and `isVerified` fields (other apps and
admin tooling may read them), but the player app no longer blocks users from
playing when those fields are missing or false.

## Files patched

| File | Lines | Change |
|------|-------|--------|
| `crownbingo/static/js/pages/home.js` | 1020–1031 | Commented out the `if (!userData.isVerified) { ... return; }` block inside `handleNewGame` |

### Exact diff (conceptual)

**Before** (`home.js`, in `handleNewGame`):
```js
const userDoc = userDocSnapshot.docs[0];
const userData = userDoc.data();

if (!userData.isVerified) {
    // Open the phone verification dialog
    setUserPhone(userData.phone || '');
    setPhoneVerificationDialogOpen(true);

    // User must verify their phone number
    setIsLoading(false);
    return;
}
if (uid) { ... }
```

**After**:
```js
const userDoc = userDocSnapshot.docs[0];
const userData = userDoc.data();

// Phone verification gate removed (per user request 2026-06-05) — see docs/superpowers/crownbingo-phone-verification-removal.md
// Phone is now optional. The /savePhone page and the PhoneVerificationDialog component
// are still available, but no longer enforced as a gate to start a new game.
// if (!userData.isVerified) {
//     // Open the phone verification dialog
//     setUserPhone(userData.phone || '');
//     setPhoneVerificationDialogOpen(true);

//     // User must verify their phone number
//     setIsLoading(false);
//     return;
// }
if (uid) { ... }
```

The rest of `handleNewGame` (the points check, the game creation logic) runs
unconditionally now. The `setIsLoading(false)` calls further down (lines that
were previously `1049`, `1098`, etc.) handle the loading state in the normal
flow paths.

## What was deliberately kept

These are not bugs; they are by design:

- **`crownbingo/static/js/pages/phone.js`** — the `PhoneVerificationDialog`
  component. Kept intact. It is still imported by `home.js` and still rendered
  (with `isOpen={isPhoneVerificationDialogOpen}`), but `isPhoneVerificationDialogOpen`
  is no longer set to `true` anywhere in the active code path, so the dialog
  will not appear. The component and its OTP-sending logic still work for any
  future code that wants to open the dialog explicitly.

- **`crownbingo/static/js/pages/phoneRegistering.js`** — the `SavePhoneNumber`
  page. Kept intact.

- **`/savePhone` route in `App.js`** (`App.js:105`) — still accessible. Any user
  who navigates directly to `https://crown-bingo.pages.dev/#/savePhone` can
  still add a phone number to their profile. The page is just not enforced
  as a blocker.

- **`phone` and `isVerified` fields on the user doc** — not deleted from the
  data model. Other apps (superagent, admin-panel) and the
  `PhoneVerificationDialog` component itself still read/write them.

- **`PhoneVerificationDialog` import and JSX render in `home.js`** — kept.
  Removing them would not change user-visible behavior (the dialog never opens)
  but would be a larger, riskier change.

## New behavior

| Scenario | Before | After |
|----------|--------|-------|
| User has `isVerified: true` | Game starts normally | Game starts normally (no change) |
| User has `isVerified: false/undefined` | Phone dialog blocks game | Game starts; dialog does not appear |
| User navigates to `/savePhone` directly | Phone registration page | Phone registration page (no change) |
| User calls `setPhoneVerificationDialogOpen(true)` manually | Dialog opens | Dialog opens (component still functional) |

## Test plan

Run after the next bundle rebuild + deploy:

1. **Login as `ashu@crownbingo.com`** (test user; Firestore `users` doc has
   `phone: "+251996688774"` and `isVerified: false/undefined`).
2. **Confirm the dashboard loads.** Specifically: the user should reach the
   `NewGame` screen without seeing the phone verification dialog.
3. **Start a new game.** Click "Start Game" on the New Game screen. The
   `handleNewGame` function should run to completion without opening the
   phone dialog.
4. **Verify direct URL still works.** Navigate to
   `https://crown-bingo.pages.dev/#/savePhone` while logged in. The phone
   registration page should still render and accept a phone number.
5. **Verify the dialog component is not broken** (optional). Manually inspect
   the `PhoneVerificationDialog` code path in dev tools: it should still be
   importable and callable.

## Blocker: bundle still enforces the gate

The production bundle is `crownbingo/static/js/main.3fbd7db3.js`. The compiled
gate logic lives at `main.3fbd7db3.js:50214`:

```js
if (!a.isVerified) return X(a.phone || ""), oe(!0), void p(!1);
```

This is the minified equivalent of the source we just commented out. Because
we modified **only the source** (`crownbingo/static/js/pages/home.js`), the
deployed bundle at `https://crown-bingo.pages.dev/` will continue to enforce
the gate until a rebuild is run.

### To deploy this patch

```powershell
cd admin-panel; npm install       # one-time, per AGENTS.md
cd crownbingo; npm run build      # full bundle rebuild
# Then redeploy. Either:
netlify deploy --prod --dir=crownbingo           # if using Netlify CLI
# or upload crownbingo/build/* via the Netlify dashboard
```

Until that rebuild + deploy, the source change has no effect on production
users. The patched source is committed to `main` and will ship in the next
bundle.

## Verification (this patch)

The following was checked before this commit:

- `grep -r isVerified crownbingo/static/js/pages/` returns only the commented-out
  reference in `home.js:1023` and the harmless `isVerified: true` write in
  `phone.js:117` (the dialog's success path, not a gate).
- The `/savePhone` route is still defined in `App.js:105`.
- The `PhoneVerificationDialog` import and JSX render in `home.js` are intact.
- `phone.js` and `phoneRegistering.js` are unchanged.
- The production bundle (`main.3fbd7db3.js`) was **not** modified.

## References

- User request: 2026-06-05, remove the phone verification gate from the
  player app.
- AGENTS.md (project context, deployment notes, rebuild blocker).
- The Amharic dialog text: `crownbingo/static/js/pages/phone.js:156`.
