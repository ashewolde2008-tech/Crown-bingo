# Firestore Rules Coverage Audit

Generated: 2026-06-05

## Calls by app

### crownbingo (player app)
- `signInWithEmailAndPassword` (auth, not Firestore)
- `getDocs(query(collection(db,'users'), where('uid','==',authUid)))` — login
- `getDocs(query(collection(db,'points'), where('uid','==',uid)))` — load points
- `getDoc(doc(db,'points',uid))` — point lookup
- `updateDoc(pointsDoc.ref, {points})` — debit/credit
- `addDoc(collection(pointsRef,'histories'), {...})` — bet history
- `getDocs(collection(db,'history'))` (HistoryTable) — full history (agent view)
- `getDocs(query(collection(db,'jackpotHistory'), where('userId','==',uid)))` — jackpot
- `doc(db,'currentJackpot')` — current jackpot value
- `signOut()` (auth, not Firestore)

### superagentcrownbingo (agent app)
- `signInWithEmailAndPassword`
- `getDocs(query(collection(db,'users'), where('uid','==',authUid)))` — login
- `getDocs(collection(db,'points'))` — agent dashboard
- `getDocs(query(collection(db,'points'), where('uid','==',uid)))`
- `getDoc(doc(db,'points',uid))` — point lookup
- `getDoc(doc(db,'points',adminId))` — admin balance
- `getDocs(collection(pointsSnapshot.docs[0].ref,'histories'))` — bet history subcollection
- `getDocs(collection(db,'history'))` — global history

### admin-panel (super admin)
- `getDocs(collection(db,'users'))`
- `getDocs(collection(db,'agents'))`
- `getDocs(collection(db,'settings'))`
- `getDocs(collection(db,'audit_logs'))`
- `getDocs(collection(db,'bets'))`
- `createUserWithEmailAndPassword` (auth)
- `setDoc(doc(db,'users',uid), data)`
- `setDoc(doc(db,'agents',uid), data)`
- `updateDoc(...)` on users/agents
- `deleteDoc(...)` on users/agents

## Collections referenced (must be in rules)

| Collection | Path | Used by |
|------------|------|---------|
| users | /users/{uid} | All 3 |
| agents | /agents/{uid} | admin-panel, superagent |
| points | /points/{uid} | crownbingo, superagent |
| points/{uid}/histories | subcollection | crownbingo, superagent |
| history | /history/{id} | crownbingo, superagent |
| jackpotHistory | /jackpotHistory/{id} | crownbingo |
| currentJackpot | /currentJackpot (doc) | crownbingo |
| settings | /settings/{id} | admin-panel |
| audit_logs | /audit_logs/{id} | admin-panel |
| bets | /bets/{id} | admin-panel (declared) |
| transactions | /transactions/{id} | (declared, app code uses it in api/) |
| games | /games/{id} | (declared, app code uses it in api/) |
