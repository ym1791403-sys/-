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
let analytics = null;
let isFirebaseAvailable = false;

try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    isFirebaseAvailable = true;
    try {
      analytics = firebase.analytics();
    } catch (e) {}
  }
} catch (err) {
  console.error("Firebase init notice:", err);
}

// Attach to window for global access across components
window.firebaseConfig = firebaseConfig;
window.db = db;
window.analytics = analytics;
window.isFirebaseAvailable = isFirebaseAvailable;
