/**
 * Set Admin Custom Claim Script
 * This script sets the admin custom claim for a user in Firebase
 * 
 * Usage: node setAdminClaim.js
 */

// Install firebase-admin first: npm install firebase-admin
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin SDK
// You need to download your Firebase service account key from Firebase Console
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ Error: serviceAccountKey.json not found!');
  console.error('');
  console.error('Steps to create the file:');
  console.error('1. Go to https://console.firebase.google.com/project/bingo-27d37-5661f/settings/serviceaccounts/adminsdk');
  console.error('2. Click "Generate new private key"');
  console.error('3. Save the file as: serviceAccountKey.json in this directory');
  console.error('4. Run this script again');
  process.exit(1);
}

// Initialize Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath)
  });
  console.log('✅ Firebase Admin SDK initialized');
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin SDK:', error.message);
  process.exit(1);
}

const auth = admin.auth();

/**
 * Set admin custom claim for a user
 */
async function setAdminClaim(email) {
  try {
    console.log(`\n📧 Setting admin claim for: ${email}`);
    
    // Get user by email
    const user = await auth.getUserByEmail(email);
    console.log(`✅ Found user: ${user.uid}`);
    
    // Set custom claim
    await auth.setCustomUserClaims(user.uid, { role: 'SUPER_ADMIN' });
    console.log(`✅ Custom claim set successfully!`);
    console.log(`\n✨ User ${email} is now an admin!`);
    
    // Verify the claim was set
    const updatedUser = await auth.getUser(user.uid);
    console.log(`\n📋 Custom Claims:`, updatedUser.customClaims);
    
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ Error: User with email "${email}" not found`);
      console.error(`\nPlease create the user first in Firebase Console:`);
      console.error(`1. Go to https://console.firebase.google.com/project/bingo-27d37-5661f/authentication/users`);
      console.error(`2. Click "Create user"`);
      console.error(`3. Enter email: ${email}`);
      console.error(`4. Enter password: AdminPassword123!`);
      console.error(`5. Run this script again`);
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🔐 Crown Bingo - Admin Claim Setter');
  console.log('====================================\n');
  
  const email = 'admin@crownbingo.com';
  await setAdminClaim(email);
  
  // Close the app
  await admin.app().delete();
  console.log('\n✅ Done! You can now login to the admin panel.');
  process.exit(0);
}

// Run
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
