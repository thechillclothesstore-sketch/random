// Firebase Config (replace with yours)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
};
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
let userId = null;

// Anonymous login
auth.signInAnonymously().then(cred => { userId = cred.user.uid; });

// DOM Elements
const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const img = document.getElementById("previewImage");
const scoreText = document.getElementById("scoreText");
const statsText = document.getElementById("statsText");
const ratingFill = document.getElementById("ratingFill");
const gallery = document.getElementById("gallery");
let currentOutfitId = null;

// Upload Outfit
input.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    const imageData = reader.result;
    const docRef = await db.collection("outfits").add({
      image: imageData,
      ratings: {},
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    selectOutfit(docRef.id);
  };
  reader.readAsDataURL(file);
});

// Render Gallery
db.collection("outfits").orderBy("createdAt","desc").onSnapshot(snapshot => {
  gallery.innerHTML = "";
  snapshot.forEach(doc => {
    const data = doc.data();
    const avg = calculateAverage(data.ratings);
    const card = document.createElement("div");
    card.className = "gallery-card";
    card.innerHTML = `
      <img src="${data.image}">
      <div class="gallery-info">
        <strong>${avg}</strong> / 5
        <div>${Object.keys(data.ratings||{}).length} vote(s)</div>
      </div>
    `;
    card.onclick = () => selectOutfit(doc.id);
    gallery.appendChild(card);
  });
});

// Select outfit to rate
async function selectOutfit(id){
  currentOutfitId = id;
  const doc = await db.collection("outfits").doc(id).get();
  const data = doc.data();
  img.src = data.image;
  preview.style.display = "block";
  const avg = calculateAverage(data.ratings);
  ratingFill.style.width = data.ratings? `${(avg/5)*100}%`:"0%";
  scoreText.textContent = `Average Rating: ${avg} / 5`;
  scoreText.style.display = "block";
  statsText.textContent = `Based on ${Object.keys(data.ratings||{}).length} vote(s)`;
}

// Vote
async function voteOutfit(value){
  if(!currentOutfitId){ alert("Select or upload outfit first"); return; }
  const docRef = db.collection("outfits").doc(currentOutfitId);
  const doc = await docRef.get();
  const ratings = doc.data().ratings || {};
  ratings[userId] = value;
  await docRef.set({ratings},{merge:true});
  selectOutfit(currentOutfitId);
}

// Calculate average
function calculateAverage(ratings){
  const values = Object.values(ratings||{});
  if(!values.length) return "—";
  const avg = values.reduce((a,b)=>a+b,0)/values.length;
  return avg.toFixed(1);
}

