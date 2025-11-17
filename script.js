// script.js (final EatSafe)
// -------------------------
// Google Client ID (your provided ID)
const GOOGLE_CLIENT_ID = "712660101481-6f2f9m52g497kcgchn63gma96grbb48l.apps.googleusercontent.com";

/* ========== Firebase imports (CDN ES modules) ========== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* ========== Firebase config (your project) ========== */
const firebaseConfig = {
  apiKey: "AIzaSyA6v6Dd7gZPzkAnprdU5niN8gLebyXbTGI",
  authDomain: "eatsafe-7e2b0.firebaseapp.com",
  projectId: "eatsafe-7e2b0",
  storageBucket: "eatsafe-7e2b0.firebasestorage.app",
  messagingSenderId: "324252448761",
  appId: "1:324252448761:web:dc3d5a9d34bdfbc5572f28",
  measurementId: "G-JCHEDSMZJE"
};

// initialize firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ========== PRODUCTS (30 items) ========== */
const products = {
  "maggi": { danger:true, long:"Contains refined flour (maida), very high sodium, and MSG which may trigger headaches and increase blood pressure. The seasoning contains preservatives and flavor enhancers. Not healthy for daily consumption.", alt:["Oats","Poha","Veg noodles"] },
  "maaza": { danger:true, long:"High sugar drink with added flavours — no real fruit nutrition. Regular intake increases blood sugar and weight. Avoid daily consumption.", alt:["Fresh mango shake","Coconut water"] },
  "milk": { danger:false, long:"Rich in calcium, protein and vitamin B12. Supports bone and muscle health when consumed in moderation. A healthy everyday option for many people.", alt:["Soy milk","Almond milk"] },
  "milkshake packet": { danger:true, long:"Packaged milkshakes contain added sugar, stabilizers and artificial flavours. They reduce real nutritional value and are not recommended daily.", alt:["Homemade milkshake"] },
  "coca cola": { danger:true, long:"Very high sugar content, phosphoric acid (which can harm teeth and bones) and caffeine. Zero nutrition — harmful for regular use.", alt:["Lemon water","Fresh juice"] },
  "pepsi": { danger:true, long:"Sugary carbonated beverage with caffeine and acids; increases acidity and promotes weight gain. Not suitable for daily consumption.", alt:["Fresh juice","Coconut water"] },
  "frooti": { danger:true, long:"Packaged mango drink with added sugar and preservatives; lacks fibre and nutrients. Causes rapid sugar spikes when consumed frequently.", alt:["Fresh mango juice"] },
  "real juice": { danger:true, long:"Many packaged 'real' juices contain added sugar and preservatives and lose fibre. They are inferior to fresh juice for daily drinking.", alt:["Fresh fruit juice"] },
  "tropicana": { danger:true, long:"Market juices often have added sugars and little fibre, giving calories without satiety. Prefer fresh-squeezed options.", alt:["Fresh orange juice"] },
  "lays": { danger:true, long:"Thinly sliced and deep-fried; high salt, oil and artificial flavours. Regular eating raises cholesterol and blood pressure.", alt:["Baked chips","Roasted makhana"] },
  "kurkure": { danger:true, long:"Fried snack with refined starch, oil and flavour enhancers; may cause acidity and is poor nutritionally.", alt:["Popcorn","Roasted peanuts"] },
  "bingo mad angles": { danger:true, long:"Fried spicy snack with preservatives and high salt; unhealthy for repeated consumption.", alt:["Baked nachos"] },
  "oreo": { danger:true, long:"Chocolate sandwich biscuit with high sugar and processed fats. Frequent consumption increases diabetes and weight risk.", alt:["Digestive biscuits"] },
  "jim jam": { danger:true, long:"Cream-filled biscuits with sugar and artificial flavours; not healthy as a daily snack.", alt:["Whole wheat biscuits"] },
  "hide and seek": { danger:true, long:"Chocolate biscuits with sugar and fat — fine occasionally but not daily.", alt:["Multigrain biscuits"] },
  "parle g": { danger:false, long:"Simple glucose biscuit; moderate sugar but provides quick energy. Acceptable in moderation.", alt:["Digestive biscuits"] },
  "amul butter": { danger:false, long:"Dairy fat rich in vitamin A and fat-soluble nutrients. Healthy in small quantities; excess increases saturated fat intake.", alt:["Ghee in small amounts","Olive oil"] },
  "bread": { danger:false, long:"Whole wheat bread gives fibre and carbs; white bread is less healthy. Choosing whole grains is better for daily use.", alt:["Brown bread","Multigrain bread"] },
  "white bread": { danger:true, long:"Refined flour with low fibre and fast blood-sugar rise. Not a healthy daily choice compared to whole-grain options.", alt:["Brown bread","Whole wheat bread"] },
  "noodles": { danger:true, long:"Most instant noodles use maida and high sodium seasoning; regular intake increases blood pressure and reduces nutrition.", alt:["Rice noodles","Homemade veg noodles"] },
  "five star": { danger:true, long:"High-sugar candy bar with caramel; causes quick sugar spikes and provides little nutrition.", alt:["Dark chocolate (70%)"] },
  "dairy milk": { danger:true, long:"Milk chocolate with high sugar and fats; not good as a daily treat.", alt:["Dark chocolate"] },
  "kinder joy": { danger:true, long:"Sugar-laden chocolate snack; not suitable for regular consumption, especially for children.", alt:["Fruit yogurt"] },
  "red bull": { danger:true, long:"Energy drink with high caffeine and sugar; can increase heart rate and cause energy crashes, avoid daily.", alt:["Electrolyte drinks"] },
  "thumbs up": { danger:true, long:"Carbonated sugary drink with caffeine; increases calorie load and harms dental health.", alt:["Lemon soda (no sugar)","Fresh juice"] },
  "chapati": { danger:false, long:"Whole wheat roti — high in fibre and complex carbs. A healthy staple for daily meals when made with whole grains.", alt:["Multigrain roti"] },
  "rice": { danger:false, long:"Good source of energy; prefer brown rice for more fibre. Eat in moderate portions for weight control.", alt:["Brown rice"] },
  "poha": { danger:false, long:"Light and easy to digest breakfast with iron content; healthy when prepared with vegetables.", alt:["Upma","Daliya"] },
  "upma": { danger:false, long:"Semolina dish that is nutritious with added vegetables — a good balanced breakfast option.", alt:["Poha","Daliya"] },
  "idli": { danger:false, long:"Steamed rice-lentil cakes; low in fat and gut-friendly — very healthy for daily breakfast.", alt:["Dosa"] }
};

/* ===================== DOM elements ===================== */
const loginScreen = document.getElementById("loginScreen");
const closeLogin = document.getElementById("closeLogin");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const demoBtn = document.getElementById("demoBtn");

const manualInput = document.getElementById("manualInput");
const searchBtn = document.getElementById("searchBtn");
const suggestions = document.getElementById("suggestions");
const resultDiv = document.getElementById("result");

const modal = document.getElementById("modal");
const modalText = document.getElementById("modalText");
const closeModal = document.getElementById("closeModal");

const userBox = document.getElementById("userBox");
const userPic = document.getElementById("userPic");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const signOutBtn = document.getElementById("signOutBtn");

const feedbackWrap = document.getElementById("feedbackWrap");
const feedbackText = document.getElementById("feedbackText");
const sendFeedbackBtn = document.getElementById("sendFeedbackBtn");
const feedbackMsg = document.getElementById("feedbackMsg");

/* ===================== Utilities ===================== */
function parseJwt(token){
  try{
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g,'+').replace(/_/g,'/');
    const json = decodeURIComponent(atob(base64).split('').map(c=>'%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  }catch(e){ return null; }
}

function showUser(user){
  userBox.style.display = "flex";
  userPic.src = user.picture || "https://www.gravatar.com/avatar/?d=mp";
  userName.textContent = user.name || "";
  userEmail.textContent = user.email || "";
  feedbackWrap.style.display = "block";
  loginScreen.style.display = "none";
  // save local
  localStorage.setItem('eatsafe_user', JSON.stringify(user));
}

function hideUser(){
  userBox.style.display = "none";
  feedbackWrap.style.display = "none";
  loginScreen.style.display = "flex";
  localStorage.removeItem('eatsafe_user');
}

/* ========== Google Identity (initialize) ========== */
function setupGoogleIdentity(){
  // If google SDK available, initialize officially
  if(window.google && google.accounts && google.accounts.id){
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      ux_mode: "popup"
    });
    // create a container for official button and render it inside login box
    let container = document.getElementById("gSignInDiv");
    if(!container){
      container = document.createElement('div');
      container.id = "gSignInDiv";
      // place before demoBtn
      demoBtn.parentNode.insertBefore(container, demoBtn);
    }
    google.accounts.id.renderButton(container, { theme:"outline", size:"large", text:"signin_with" });
    // optional: auto prompt (commented)
    // google.accounts.id.prompt();
    // hide fallback custom button if existed
    if(googleLoginBtn) googleLoginBtn.style.display = "none";
  } else {
    // fallback: if SDK not yet loaded, show custom button that signs user in as mock
    if(googleLoginBtn) {
      googleLoginBtn.style.display = "inline-block";
      googleLoginBtn.onclick = () => {
        // Mock sign-in for testing when SDK blocked/unavailable
        const user = { name:"Test User", email:"testuser@example.com", picture:"https://www.gravatar.com/avatar/?d=mp" };
        showUser(user);
        alert("Signed in as Test User (SDK not available).");
      };
    }
  }
}

// Callback for Google credential
function handleCredentialResponse(resp){
  if(!resp || !resp.credential) { alert("Google sign-in failed."); return; }
  const payload = parseJwt(resp.credential);
  if(!payload) { alert("Failed to parse token."); return; }
  const user = { name: payload.name || "Google User", email: payload.email || "", picture: payload.picture || "" };
  showUser(user);
}

/* ========== initialize on load ========== */
window.addEventListener('load', () => {
  // if a user saved from earlier session, show
  const saved = localStorage.getItem('eatsafe_user');
  if(saved) showUser(JSON.parse(saved));

  // setup Google identity (may render official button)
  setTimeout(setupGoogleIdentity, 350);

  // ensure suggestions empty container exists
  if(!suggestions) {
    console.warn("No suggestions element found.");
  }
});

/* ===================== Login modal controls ===================== */
if(closeLogin) closeLogin.addEventListener('click', ()=> loginScreen.style.display = 'none');
if(demoBtn) demoBtn.addEventListener('click', ()=> loginScreen.style.display = 'none');

/* ========== Sign out ========= */
if(signOutBtn) signOutBtn.addEventListener('click', () => {
  hideUser();
});

/* ========== Search suggestions (typeahead) ========== */
manualInput.addEventListener('input', () => {
  const q = manualInput.value.toLowerCase().trim();
  suggestions.innerHTML = "";
  if(!q) return;
  // iterate product names and suggest names that start with q (so 'm' -> maggi, maaza, milk)
  Object.keys(products).forEach(name => {
    if(name.startsWith(q)) {
      const el = document.createElement('div');
      el.innerText = name;
      el.onclick = () => {
        manualInput.value = name;
        suggestions.innerHTML = "";
      };
      suggestions.appendChild(el);
    }
  });
});

/* ========== Search handler ========== */
searchBtn.addEventListener('click', () => {
  const q = manualInput.value.toLowerCase().trim();
  resultDiv.innerHTML = "";
  suggestions.innerHTML = "";
  if(!q){
    resultDiv.innerHTML = "<div class='card'>Please type a product name to search.</div>";
    return;
  }
  const p = products[q];
  if(!p){
    resultDiv.innerHTML = "<div class='card'>❌ Product not found in database.</div>";
    return;
  }
  const card = document.createElement('div');
  card.className = "card" + (p.danger ? " danger" : "");
  card.innerHTML = `<h3>${q.toUpperCase()}</h3>
    <p>${p.long}</p>
    <div style="margin-top:8px"><b>Alternatives:</b> ${p.alt.join(", ")}</div>
    <div style="margin-top:10px"><button class="readMore">Read More</button></div>`;
  resultDiv.appendChild(card);
  // read more opens modal
  card.querySelector('.readMore').addEventListener('click', () => {
    modalText.innerText = p.long + "\n\nAlternatives: " + (p.alt ? p.alt.join(", ") : "—");
    modal.style.display = 'flex';
  });
});

/* ========== Modal controls ========== */
if(closeModal) closeModal.addEventListener('click', ()=> modal.style.display = 'none');
window.addEventListener('click', (e)=> { if(e.target === modal) modal.style.display = 'none'; });

/* ========== Feedback saving (Firestore) ========== */
if(sendFeedbackBtn) sendFeedbackBtn.addEventListener('click', async () => {
  const txt = feedbackText.value.trim();
  if(!txt) { feedbackMsg.style.color = "#ffb300"; feedbackMsg.innerText = "Please write a message."; return; }
  // ensure user signed-in for saving to database (optional)
  const userraw = localStorage.getItem('eatsafe_user');
  if(!userraw){ feedbackMsg.style.color="#ff5252"; feedbackMsg.innerText = "Please sign in to send feedback."; return; }
  const user = JSON.parse(userraw);
  try{
    await addDoc(collection(db,'feedbacks'), {
      name: user.name || "",
      email: user.email || "",
      message: txt,
      date: new Date().toISOString()
    });
    feedbackText.value = "";
    feedbackMsg.style.color = "#00e676";
    feedbackMsg.innerText = "Thanks — feedback saved.";
  }catch(err){
    console.error(err);
    feedbackMsg.style.color = "#ff5252";
    feedbackMsg.innerText = "Failed to save feedback. Check console.";
  }
});
