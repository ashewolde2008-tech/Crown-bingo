const admin = require('firebase-admin');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(r => rl.question(q, r));

async function main() {
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!keyPath) {
    console.log('ERROR: Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON file path');
    console.log('  Example: $env:GOOGLE_APPLICATION_CREDENTIALS="C:\\path\\to\\serviceAccountKey.json"');
    console.log('  Then:    node scripts/create-admin.js');
    process.exit(1);
  }

  const email = await ask('Admin email: ');
  const password = await ask('Admin password (min 6 chars): ');
  const displayName = await ask('Display name (optional): ') || email.split('@')[0];

  rl.close();

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'bingo-27d37'
  });

  const userRecord = await admin.auth().createUser({ email, password, displayName });
  console.log(`✓ Auth user created: ${userRecord.uid}`);

  await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'SUPER_ADMIN' });
  console.log('✓ Custom claim set: role = SUPER_ADMIN');

  await admin.firestore().collection('users').doc(userRecord.uid).set({
    uid: userRecord.uid,
    email,
    username: displayName,
    role: 'SUPER_ADMIN',
    isActive: true,
    isDisabled: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  console.log('✓ Firestore user document created');

  console.log('\nDone! You can now log in to the admin panel.');
  process.exit(0);
}

main().catch(err => {
  console.error('ERROR:', err.message);
  process.exit(1);
});
