
const favoritesContainer = document.getElementById("favorites-container");
const favoritesCount     = document.getElementById("favorites-count");
const POSTER_URL = "https://image.tmdb.org/t/p/w500";
const FALLBACK   = "https://placehold.co/500x750/1a1820/666?text=No+Image";

// ────────────────────────────────────────────────────────────
// STORAGE
// ────────────────────────────────────────────────────────────
function getFavorites()      { return JSON.parse(localStorage.getItem("favorites")) || []; }
function saveFavorites(favs) { localStorage.setItem("favorites", JSON.stringify(favs)); }

function removeFavorite(id) {
  saveFavorites(getFavorites().filter(i => i.id !== id));
  renderFavorites();
}

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────
function escapeHtml(text) {
  if (text == null) return "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function openFavoriteDetails(id, type) {
  window.location.href = `details.html?id=${id}&type=${type}`;
}

// ────────────────────────────────────────────────────────────
// RENDER
// ────────────────────────────────────────────────────────────
function renderFavorites() {
  const favorites = getFavorites();

  if (favoritesCount) {
    favoritesCount.textContent = `${favorites.length} item${favorites.length !== 1 ? "s" : ""}`;
  }

  if (!favorites.length) {
    favoritesContainer.innerHTML = `
      <div class="empty-state" style="padding:60px 0;grid-column:1/-1">
        <span class="empty-state-icon">❤️</span>
        <p class="empty-state-msg">No favorites yet.<br>Hit the heart button on any title to save it here.</p>
      </div>`;
    return;
  }

  favoritesContainer.innerHTML = favorites.map(item => {
    const poster    = item.poster_path ? `${POSTER_URL}${item.poster_path}` : FALLBACK;
    const title     = escapeHtml(item.title || "Unknown title");
    const year      = escapeHtml(item.year  || "N/A");
    const rating    = item.rating ? Number(item.rating).toFixed(1) : "N/A";
    const typeLabel = item.media_type === "tv" ? "TV Series" : "Movie";

    return `
      <article class="favorite-card"
               onclick="openFavoriteDetails(${item.id}, '${item.media_type}')">
        <img src="${poster}" alt="${title}" loading="lazy"
             onerror="this.src='${FALLBACK}'">
        <div class="favorite-card-overlay">
          <div class="favorite-card-body">
            <h3>${title}</h3>
            <div class="favorite-card-meta">${typeLabel} · ${year} · ★ ${rating}</div>
            <button class="favorite-remove-btn"
                    onclick="event.stopPropagation(); removeFavorite(${item.id})">
              Remove
            </button>
          </div>
        </div>
      </article>`;
  }).join("");
}

// ────────────────────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────────────────────
renderFavorites();
