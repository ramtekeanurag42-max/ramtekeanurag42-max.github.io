// script.js (module)
////////////////////////////////////////////////////////////////////////////////
// === CONFIG (REPLACE THESE) ===
// Replace GOOGLE_CLIENT_ID with your Google OAuth Client ID when ready.
// Replace firebaseConfig with your Firebase project's config object.
export const GOOGLE_CLIENT_ID = "1234567890-abcxyz123.apps.googleusercontent.com";


export const firebaseConfig = {
  apiKey: "AIzaSyA6v6Dd7gZPzkAnprdU5niN8gLebyXbTGI",
  authDomain: "eatsafe-7e2b0.firebaseapp.com",
  projectId: "eatsafe-7e2b0",
  storageBucket: "eatsafe-7e2b0.firebasestorage.app",
  messagingSenderId: "324252448761",
  appId: "1:324252448761:web:dc3d5a9d34bdfbc5572f28",
  measurementId: "G-JCHEDSMZJE"
};

// ==============================
////////////////////////////////////////////////////////////////////////////////

/* Firebase modular imports (CDN) */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

/* DOM */
const welcome = document.getElementById('welcome');
const appRoot = document.getElementById('app');
const gSignInDiv = document.getElementById('gSignInDiv');
const continueLocal = document.getElementById('continueLocal');
const userInfo = document.getElementById('userInfo');
const userPic = document.getElementById('userPic');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const signOutBtn = document.getElementById('signOutBtn');

const manualInput = document.getElementById('manualInput');
const suggestionsDiv = document.getElementById('suggestions');
const searchBtn = document.getElementById('searchBtn');
const resultDiv = document.getElementById('result');

const feedbackWrap = document.getElementById('feedbackWrap');
const feedbackText = document.getElementById('feedbackText');
const sendFeedbackBtn = document.getElementById('sendFeedbackBtn');
const feedbackMsg = document.getElementById('feedbackMsg');

const modal = document.getElementById('modal');
const modalText = document.getElementById('modalText');
const modalClose = document.querySelector('.close');

/* Sample products DB (same as earlier) */
const products = {
  "maggi": { danger:true, emoji:"⚠️", alt:["Homemade noodles","Oats","Poha","Vegetable stir-fry"], long:`Ingredients: MSG, Palm oil, Sodium, Maida.\nHealth Risks: Headaches, high cholesterol, heart issues, low nutrition.\nTips: Consume occasionally, cook with extra vegetables for nutrition.` },
  "coca-cola": { danger:true, emoji:"⚠️", alt:["Fresh juice","Coconut water","Water"], long:`Ingredients: Carbonated water, Sugar, Phosphoric acid, Caffeine.\nHealth Risks: Obesity, tooth decay, sleep issues.\nTips: Limit intake, prefer water or fresh juice.` },
  "lays": { danger:true, emoji:"⚠️", alt:["Roasted nuts","Baked snacks","Homemade chips"], long:`Ingredients: Potato, Oil, Salt, Preservatives.\nHealth Risks: Blood pressure, heart issues if overconsumed.` },
  "amul butter": { danger:false, emoji:"😐", alt:["Olive oil","Avocado spread"], long:`Ingredients: Milk fat, Salt.\nHealth Risks: Saturated fat in excess.` },
  "parle-g": { danger:false, emoji:"😃", alt:["Combine with milk","Oatmeal","Fruits"], long:`Simple biscuits; moderate consumption is fine.` }
};

/* ========== Firestore init (we create app if config real) ========== */
let db = null;
let firebaseApp = null;
function tryInitFirebase() {
  // If placeholder left, don't init
  if (!firebaseConfig || !firebaseConfig.apiKey || firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
    console.warn("Firebase not initialized — replace firebaseConfig in script.js with your real config.");
    return;
  }
  try {
    firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);
    console.log("Firebase initialized.");
  } catch (e) {
    console.error("Firebase init failed:", e);
  }
}
tryInitFirebase();

/* ========== Auth initialization ========== */
function renderMockSignIn(label = "Sign in with Google (mock)") {
  gSignInDiv.innerHTML = "";
  const btn = document.createElement('button');
  btn.textContent = label;
  btn.className = "btn";
  btn.onclick = () => {
    const user = { name: "Test User", email: "testuser@example.com", picture: "https://www.gravatar.com/avatar/?d=mp" };
    onSignedIn(user, false);
  };
  gSignInDiv.appendChild(btn);
  const hint = document.createElement('div');
  hint.style.marginTop = "8px";
  hint.style.opacity = "0.95";
  hint.style.fontSize = "13px";
  hint.textContent = "When ready: paste your Google Client ID into script.js and add your live domain to Google Cloud Console.";
  gSignInDiv.appendChild(hint);
}

/* Real Google Identity render */
function initGoogleIdentity() {
  if (typeof google === "undefined" || !google.accounts || !google.accounts.id) {
    renderMockSignIn("Sign in with Google (SDK unavailable)");
    return;
  }

  // If client id placeholder, show mock and instruction
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID_HERE") {
    renderMockSignIn("Sign in with Google (mock)");
    return;
  }

  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleCredentialResponse
  });
  window.google.accounts.id.renderButton(gSignInDiv, { theme: "outline", size: "large", text: "signin_with" });
  // Optional: prompt -> uncomment if you want automatic prompt
  // window.google.accounts.id.prompt();
}

/* Parse JWT payload helper */
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g,'+').replace(/_/g,'/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00'+c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) { return null; }
}

/* Google callback */
function handleCredentialResponse(response) {
  if (!response || !response.credential) { alert("Google sign-in returned no credential."); return; }
  const payload = parseJwt(response.credential);
  if (!payload) { alert("Failed to parse Google token payload."); return; }
  const user = { name: payload.name || "Google User", email: payload.email || "", picture: payload.picture || "" };
  onSignedIn(user, true);
}

/* When signed in (or demo) */
function onSignedIn(user, realGoogle=true) {
  // Hide welcome and show app
  welcome.classList.add('hidden');
  appRoot.classList.remove('hidden');

  // show user UI
  userInfo.style.display = "flex";
  userPic.src = user.picture || "https://www.gravatar.com/avatar/?d=mp";
  userName.textContent = user.name || "";
  userEmail.textContent = user.email || "";
  signOutBtn.style.display = "inline-block";
  feedbackWrap.classList.remove('hidden');

  // store in session; optional: localStorage if you want persistence
  sessionStorage.setItem('eatsafe_user', JSON.stringify(user));
}

/* Sign-out */
signOutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('eatsafe_user');
  userInfo.style.display = "none";
  signOutBtn.style.display = "none";
  feedbackWrap.classList.add('hidden');
  appRoot.classList.add('hidden');
  welcome.classList.remove('hidden');
  // Clear Google session (optional)
  if (google && google.accounts && google.accounts.id) {
    google.accounts.id.disableAutoSelect();
  }
});

/* Continue without sign-in (demo) */
continueLocal.addEventListener('click', () => {
  const user = { name: "Demo User", email: "demo@example.com", picture: "https://www.gravatar.com/avatar/?d=mp" };
  onSignedIn(user, false);
});

/* Init on load */
window.addEventListener('load', () => {
  initGoogleIdentity();

  // If user was already in session (page reload)
  const s = sessionStorage.getItem('eatsafe_user');
  if (s) {
    try { onSignedIn(JSON.parse(s), false); } catch(e){}
  }
});

/* ===== Suggestions & search ===== */
manualInput.addEventListener('input', () => {
  const q = manualInput.value.toLowerCase().trim();
  suggestionsDiv.innerHTML = "";
  if (!q) return;
  Object.keys(products).forEach(p => {
    if (p.includes(q)) {
      const el = document.createElement('div');
      el.innerText = p;
      el.onclick = () => { manualInput.value = p; suggestionsDiv.innerHTML = ""; };
      suggestionsDiv.appendChild(el);
    }
  });
});

searchBtn.addEventListener('click', () => {
  const q = manualInput.value.trim().toLowerCase();
  resultDiv.innerHTML = "";
  suggestionsDiv.innerHTML = "";
  if (!q) {
    resultDiv.innerHTML = "<div class='card-result'>Please type a product name!</div>";
    return;
  }
  if (products[q]) {
    const product = products[q];
    const card = document.createElement('div');
    card.className = "card-result" + (product.danger ? " danger" : "");
    card.innerHTML = `<h3>${product.emoji || ''} ${q.toUpperCase()}</h3>
                      <p>${(product.long || "").substring(0,250)}${(product.long && product.long.length>250) ? "..." : ""}</p>
                      <div class="alternatives">Better alternatives: ${product.alt ? product.alt.join(", ") : "—"}</div>
                      <div style="margin-top:10px"><button class="readMore btn ghost small">Read More</button> <button class="shareBtn btn small">Share</button></div>`;
    resultDiv.appendChild(card);

    card.querySelector('.readMore').addEventListener('click', () => {
      modalText.innerText = product.long || "No details.";
      modal.classList.remove('hidden');
    });
    card.querySelector('.shareBtn').addEventListener('click', () => {
      const text = `${q.toUpperCase()}\n${product.long || ""}\nAlternatives: ${product.alt ? product.alt.join(", ") : ""}`;
      navigator.clipboard.writeText(text).then(()=> alert("Product info copied to clipboard!")).catch(()=> alert("Copy failed — maybe blocked by browser."));
    });
  } else {
    const card = document.createElement('div');
    card.className = "card-result";
    card.innerHTML = "❌ Product not found in database.";
    resultDiv.appendChild(card);
  }
});

/* Modal controls */
modalClose.addEventListener('click', () => modal.classList.add('hidden'));
window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

/* ===== Feedback saving ===== */
sendFeedbackBtn.addEventListener('click', async () => {
  const text = (feedbackText.value || "").trim();
  const userRaw = sessionStorage.getItem('eatsafe_user');
  if (!userRaw) {
    feedbackMsg.style.color = "#ff5252"; feedbackMsg.innerText = "Please sign in to send feedback.";
    return;
  }
  if (!text) {
    feedbackMsg.style.color = "#ffb300"; feedbackMsg.innerText = "Please write a message.";
    return;
  }
  const user = JSON.parse(userRaw);

  // If Firestore is configured, save there
  if (db) {
    try {
      await addDoc(collection(db, "feedbacks"), {
        name: user.name,
        email: user.email || "",
        message: text,
        createdAt: serverTimestamp()
      });
      feedbackMsg.style.color = "#00e676";
      feedbackMsg.innerText = "Thanks! Feedback saved to Firestore.";
      feedbackText.value = "";
      return;
    } catch (e) {
      console.error("Firestore save failed:", e);
      feedbackMsg.style.color = "#ff5252";
      feedbackMsg.innerText = "Failed to save to Firestore. See console.";
      return;
    }
  }

  // Fallback: save in sessionStorage if no Firestore
  const arr = JSON.parse(sessionStorage.getItem('eatsafe_feedbacks') || '[]');
  const entry = { name: user.name, email: user.email || "", message: text, date: new Date().toISOString() };
  arr.push(entry);
  sessionStorage.setItem('eatsafe_feedbacks', JSON.stringify(arr));
  feedbackMsg.style.color = "#00e676";
  feedbackMsg.innerText = "Thanks! Feedback saved locally (demo mode).";
  feedbackText.value = "";
});

/* small helper to view saved demo feedbacks (run in console) */
window.viewFeedbacks = () => console.log("Demo feedbacks:", JSON.parse(sessionStorage.getItem('eatsafe_feedbacks') || '[]'));
