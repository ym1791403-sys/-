// Firebase Configuration & Service Initialization
// Chic Shop Galena's

const firebaseConfig = {
  apiKey: "AIzaSyDlVC_LiwIgiDs5a7VYDSs-tJ5mo9-yfhQ",
  authDomain: "galgol.firebaseapp.com",
  projectId: "galgol",
  storageBucket: "galgol.firebasestorage.app",
  messagingSenderId: "844399737643",
  appId: "1:844399737643:web:a10d8e3df77e001264636e",
  measurementId: "G-5WEMXQWMG2"
};

let db = null;
let auth = null;
let analytics = null;
let isFirebaseAvailable = false;

try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    try {
      auth = firebase.auth();
    } catch (e) {}
    isFirebaseAvailable = true;
    try {
      analytics = firebase.analytics();
    } catch (e) {}
  }
} catch (err) {
  console.error("Firebase init notice:", err);
}

// Admin login uses a single fixed email (not a secret — the password is
// the secret). The login form asks for the password only; the owner
// creates the matching Auth user in the Firebase console.
const ADMIN_EMAIL = "admin@chicshopgalena.com";

// Attach to window for global access across components
window.firebaseConfig = firebaseConfig;
window.ADMIN_EMAIL = ADMIN_EMAIL;
window.db = db;
window.auth = auth;
window.analytics = analytics;
window.isFirebaseAvailable = isFirebaseAvailable;
