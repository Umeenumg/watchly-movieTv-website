const favoritesContainer = document.getElementById("favorites-container");
const favoritesCount = document.getElementById("favorites-count");
const POSTER_URL = "https://image.tmdb.org/t/p/w500";

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function removeFavorite(id) {
  const favorites = getFavorites().filter((item) => item.id !== id);
  saveFavorites(favorites);
  renderFavorites();
}

function openFavoriteDetails(id, type) {
  window.location.href = `details.html?id=${id}&type=${type}`;
}

function renderFavorites() {
  const favorites = getFavorites();

  if (favoritesCount) {
    favoritesCount.textContent = `${favorites.length} item(s)`;
  }

  if (!favorites.length) {
    favoritesContainer.innerHTML = `
      <p class="favorites-empty">No favorites yet.</p>
    `;
    return;
  }

  favoritesContainer.innerHTML = favorites
    .map((item) => {
      const poster = item.poster_path
        ? `${POSTER_URL}${item.poster_path}`
        : "https://via.placeholder.com/500x750?text=No+Image";

      const title = item.title || "Unknown title";
      const year = item.year || "N/A";
      const rating = item.rating ? item.rating.toFixed(1) : "N/A";
      const typeLabel = item.media_type === "tv" ? "TV Series" : "Movie";

      return `
        <article class="favorite-card" onclick="openFavoriteDetails(${item.id}, '${item.media_type}')">
          <img src="${poster}" alt="${title}">

          <div class="favorite-card-overlay">
            <div class="favorite-card-body">
              <h3>${title}</h3>
              <div class="favorite-card-meta">
                ${typeLabel} • ${year} • ★ ${rating}
              </div>

              <button class="favorite-remove-btn" onclick="event.stopPropagation(); removeFavorite(${item.id})">
                Remove
              </button>
            </div>
          </div>
        </article>
      `;
    })
    .join("");
}

renderFavorites();