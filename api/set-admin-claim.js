const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const email = process.argv[2];
if (!email) {
  console.error('Usage: node set-admin-claim.js <admin-email>');
  process.exit(1);
}

admin.auth().getUserByEmail(email)
  .then((user) => admin.auth().setCustomUserClaims(user.uid, { role: 'SUPER_ADMIN' }))
  .then(() => {
    console.log(`SUPER_ADMIN claim set for ${email}`);
    console.log('The user must sign out and sign back in for the claim to take effect.');
  })
  .catch((err) => {
    console.error('Error:', err.message);
    process.exit(1);
  });
