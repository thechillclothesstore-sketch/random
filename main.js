// DOM elements
const input = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const img = document.getElementById("previewImage");
const scoreText = document.getElementById("scoreText");
const statsText = document.getElementById("statsText");
const ratingFill = document.getElementById("ratingFill");
const gallery = document.getElementById("gallery");

// Fake gallery storage
let outfits = [];
let currentOutfit = null;

// Upload outfit
input.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const imageData = reader.result;
    const outfit = {
      id: outfits.length,
      image: imageData,
      rating: fakeRating(),
      votes: fakeVotes()
    };
    outfits.unshift(outfit); // newest first
    renderGallery();
    selectOutfit(outfit.id);
  };
  reader.readAsDataURL(file);
});

// Select outfit to “rate”
function selectOutfit(id){
  currentOutfit = outfits.find(o => o.id === id);
  if(!currentOutfit) return;
  img.src = currentOutfit.image;
  preview.style.display = "block";
  updateRatingUI(currentOutfit);
}

// Update rating bar and text
function updateRatingUI(outfit){
  ratingFill.style.width = `${(outfit.rating/5)*100}%`;
  scoreText.textContent = `AI Rating: ${outfit.rating.toFixed(1)} / 5`;
  scoreText.style.display = "block";
  statsText.textContent = `Based on ${outfit.votes} AI votes`;
}

// Fake AI vote generator
function fakeRating(){
  return (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0
}
function fakeVotes(){
  return Math.floor(Math.random()*200+50); // 50–250 votes
}

// Render gallery
function renderGallery(){
  gallery.innerHTML = "";
  outfits.forEach(o => {
    const card = document.createElement("div");
    card.className = "gallery-card";
    card.innerHTML = `
      <img src="${o.image}">
      <div class="gallery-info">
        <strong>${o.rating}</strong> / 5
        <div>${o.votes} votes</div>
      </div>
    `;
    card.onclick = () => selectOutfit(o.id);
    gallery.appendChild(card);
  });
}
