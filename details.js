const API_KEY =  "233d663323afc329f230f615adeaeda0";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/original";
const POSTER_URL = "https://image.tmdb.org/t/p/w500";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const type = params.get("type");

const heroSection = document.querySelector(".details-hero");
const posterEl = document.getElementById("details-poster");
const titleEl = document.getElementById("details-title");
const yearEl = document.getElementById("details-year");
const genresEl = document.getElementById("details-genres");
const overviewEl = document.getElementById("details-overview");
const infoGridEl = document.querySelector(".details-info-grid");
const trailerContainer = document.getElementById("trailer-container");
const reviewsListEl = document.getElementById("reviews-list");

async function fetchDetails() {
  try {
    if (!id || !type) {
      throw new Error("Missing id or type in URL");
    }

    const response = await fetch(
      `${BASE_URL}/${type}/${id}?api_key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    
    renderDetails(data, type);
    fetchTrailer(id, type);
    fetchReviews(id, type);
    fetchProviders(id, type);
    
   updateWatchlistButton(data, type);
   
    updateFavoriteButton(data.id);

    favoriteBtn.onclick = () => {
      toggleFavorite({
        id: data.id,
        title: data.title || data.name || "Unknown title",
        poster_path: data.poster_path || "",
        media_type: type,
        year: (data.release_date || data.first_air_date || "").slice(0, 4),
        rating: data.vote_average || 0
      });
    };

    watchlistBtn.addEventListener("click", () => {
      toggleWatchlist(data, type);
    });
  fetchCast(id, type);
  // important to save to history after rendering details, so we have the title and genres for better recommendations
  saveToHistory(data, type);
  fetchRecommended();
  
} catch (error) {
    console.error("Error fetching details:", error);
    showError();
  }
}

function renderDetails(data, mediaType) {
  const title = data.title || data.name || "Unknown title";
  const year = getYear(data.release_date || data.first_air_date);
  const overview = data.overview || "No overview available.";
  const posterPath = data.poster_path
    ? `${POSTER_URL}${data.poster_path}`
    : "https://via.placeholder.com/500x750?text=No+Image";
  const backdropPath = data.backdrop_path
    ? `${IMAGE_URL}${data.backdrop_path}`
    : "";

  const rating = data.vote_average ? data.vote_average.toFixed(1) : "N/A";
  const language = data.original_language || "N/A";
  const status = data.status || "N/A";
  const tagline = data.tagline || "No tagline available.";

  let extra = "N/A";
  let typeLabel = "Movie";

  if (mediaType === "tv") {
    typeLabel = "TV Series";
    const seasons = data.number_of_seasons ?? 0;
    const episodes = data.number_of_episodes ?? 0;
    extra = `${seasons} season(s), ${episodes} episodes`;
  } else {
    typeLabel = "Movie";
    const runtime = data.runtime ?? 0;
    extra = runtime ? `${runtime} min` : "N/A";
  }

  if (heroSection && backdropPath) {
    heroSection.style.backgroundImage = `url('${backdropPath}')`;
  }

  if (posterEl) {
    posterEl.src = posterPath;
    posterEl.alt = title;
  }

  if (titleEl) {
    titleEl.textContent = title;
  }

  if (yearEl) {
    yearEl.textContent = year;
  }

  if (overviewEl) {
    overviewEl.textContent = overview;
  }

  renderGenres(data.genres || []);
  renderInfoGrid({
    typeLabel,
    language,
    rating,
    status,
    extra,
    tagline,
  });
}

function renderGenres(genres) {
  if (!genresEl) return;

  if (!genres.length) {
    genresEl.innerHTML = `<span class="genre-badge">Unknown</span>`;
    return;
  }

  genresEl.innerHTML = genres
    .map((genre) => `<span class="genre-badge">${genre.name}</span>`)
    .join("");
}

function renderInfoGrid(info) {
  if (!infoGridEl) return;

  infoGridEl.innerHTML = `
    <p><strong>Type:</strong> ${info.typeLabel}</p>
    <p><strong>Language:</strong> ${info.language}</p>
    <p><strong>Rating:</strong> ${info.rating}</p>
    <p><strong>Status:</strong> ${info.status}</p>
    <p><strong>Extra:</strong> ${info.extra}</p>
    <p><strong>Tagline:</strong> ${info.tagline}</p>
  `;
}

function getYear(dateString) {
  if (!dateString) return "Unknown";
  return dateString.slice(0, 4);
}

function showError() {
  if (titleEl) titleEl.textContent = "Content not found";
  if (yearEl) yearEl.textContent = "";
  if (overviewEl) overviewEl.textContent = "Something went wrong while loading details.";
  if (genresEl) genresEl.innerHTML = "";
  if (infoGridEl) infoGridEl.innerHTML = "";
}

fetchDetails();
/*********************fetch trailer ***************/
async function fetchTrailer(id, type) {
  try {
    const response = await fetch(
      `${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Trailer fetch failed: ${response.status}`);
    }

    const data = await response.json();
    renderTrailer(data.results || []);
  } catch (error) {
    console.error("Trailer error:", error);

    if (trailerContainer) {
      trailerContainer.innerHTML = `
        <p class="trailer-placeholder">Could not load trailer.</p>
      `;
    }
  }
}

function renderTrailer(videos) {
  if (!trailerContainer) return;

  const trailer = videos.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  );

  if (!trailer) {
    trailerContainer.innerHTML = `
      <p class="trailer-placeholder">No trailer available.</p>
    `;
    return;
  }

  trailerContainer.innerHTML = `
    <iframe
      src="https://www.youtube.com/embed/${trailer.key}"
      title="Trailer"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen>
    </iframe>
  `;
}

/* *************************************** fetch similar movies and tv shows***************************/
const similarListEl = document.getElementById("similar-list");

async function fetchSimilar(id, type) {
  try {
    const response = await fetch(
      `${BASE_URL}/${type}/${id}/similar?api_key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Similar fetch failed: ${response.status}`);
    }

    const data = await response.json();
    renderSimilar(data.results || [], type);
  } catch (error) {
    console.error("Error fetching similar content:", error);
    if (similarListEl) {
      similarListEl.innerHTML = `<p>Could not load similar content.</p>`;
    }
  }
}

function renderSimilar(items, currentType) {
  if (!similarListEl) return;

  if (!items.length) {
    similarListEl.innerHTML = `<p>No similar titles found.</p>`;
    return;
  }

  similarListEl.innerHTML = items
    .slice(0, 8)
    .map((item) => {
      const title = item.title || item.name || "Unknown title";
      const year = getYear(item.release_date || item.first_air_date);
      const poster = item.poster_path
        ? `${POSTER_URL}${item.poster_path}`
        : "https://via.placeholder.com/500x750?text=No+Image";

      const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
      const stars = getStarRating(item.vote_average);

      return `
        <article class="similar-card" data-id="${item.id}" data-type="${currentType}">
          <img src="${poster}" alt="${title}">
          <div class="similar-card-overlay">
            <div class="similar-card-body">
              <h3>${title}</h3>
              <div class="similar-meta">
                <span class="similar-year">${year}</span>
                <span class="similar-rating">★ ${rating}</span>
              </div>
              <div class="similar-stars">${stars}</div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  addSimilarCardEvents();
}

function addSimilarCardEvents() {
  const cards = document.querySelectorAll(".similar-card");

  cards.forEach((card) => {
    card.addEventListener("click", () => {
      const itemId = card.dataset.id;
      const itemType = card.dataset.type;
      window.location.href = `details.html?id=${itemId}&type=${itemType}`;
    });
  });
}

function getStarRating(voteAverage) {
  if (!voteAverage && voteAverage !== 0) return "☆☆☆☆☆";

  const fiveScale = Math.round(voteAverage / 2);
  const fullStars = "★".repeat(fiveScale);
  const emptyStars = "☆".repeat(5 - fiveScale);

  return fullStars + emptyStars;
}
fetchSimilar(id, type);



const recommendedListEl = document.getElementById("recommended-list");


// ----------------------------
// 1) SAVE TO HISTORY
// ----------------------------
function saveToHistory(data, type) {
  const history = JSON.parse(localStorage.getItem("watchHistory")) || [];

  const item = {
    id: data.id,
    type: type,
    title: data.title || data.name,
    poster: data.poster_path,
    genres: data.genres.map(g => g.id)
  };

  const exists = history.find(m => m.id === item.id);

  if (!exists) {
    history.unshift(item);
  }

  // keep only last 20
  localStorage.setItem("watchHistory", JSON.stringify(history.slice(0, 20)));
}


// ----------------------------
// 2) FETCH RECOMMENDATIONS
// ----------------------------
async function fetchRecommended() {
  try {
    const history = JSON.parse(localStorage.getItem("watchHistory")) || [];

    if (history.length === 0) {
      recommendedListEl.innerHTML = `<p>No history yet.</p>`;
      return;
    }

    const last = history[0];

    const response = await fetch(
      `${BASE_URL}/${last.type}/${last.id}/recommendations?api_key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Recommendation error: ${response.status}`);
    }

    const data = await response.json();

    renderRecommended(data.results || []);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    recommendedListEl.innerHTML = `<p>Failed to load recommendations.</p>`;
  }
}


// ----------------------------
// 3) RENDER RECOMMENDED
// ----------------------------
function renderRecommended(items) {
  if (!recommendedListEl) return;

  if (!items.length) {
    recommendedListEl.innerHTML = `<p>No recommendations found.</p>`;
    return;
  }

  recommendedListEl.innerHTML = items
    .slice(0, 8)
    .map(item => {

      const title = item.title || item.name || "Unknown";
      const poster = item.poster_path
        ? POSTER_URL + item.poster_path
        : "https://via.placeholder.com/500x750?text=No+Image";

      const year = getYear(item.release_date || item.first_air_date);
      const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
      const stars = getStarRating(item.vote_average);

      return `
        <article class="similar-card"
                 data-id="${item.id}"
                 data-type="${item.media_type || 'movie'}">

          <img src="${poster}" alt="${title}">

          <div class="similar-card-overlay">
            <div class="similar-card-body">
              <h3>${title}</h3>

              <div class="similar-meta">
                <span>${year}</span>
                <span>★ ${rating}</span>
              </div>

              <div class="similar-stars">${stars}</div>
            </div>
          </div>

        </article>
      `;
    })
    .join("");

  addRecommendedEvents();
}


// 4) CLICK EVENTS
// ----------------------------
function addRecommendedEvents() {
  const cards = document.querySelectorAll(".similar-card");

  cards.forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      const type = card.dataset.type;

      window.location.href = `details.html?id=${id}&type=${type}`;
    });
  });
}


// 5) STAR RATING
// ----------------------------
function getStarRating(vote) {
  if (!vote && vote !== 0) return "☆☆☆☆☆";

  const stars = Math.round(vote / 2);

  return "★".repeat(stars) + "☆".repeat(5 - stars);
}


const watchlistBtn = document.getElementById("watchlist-btn");

function getWatchlist() {
  return JSON.parse(localStorage.getItem("watchlist")) || [];
}

function saveWatchlist(list) {
  localStorage.setItem("watchlist", JSON.stringify(list));
}


// ----------------------------
// CHECK IF EXISTS
// ----------------------------
function isInWatchlist(id) {
  const list = getWatchlist();
  return list.some(item => item.id === id);
}


// ----------------------------
// UPDATE BUTTON TEXT
// ----------------------------
function updateWatchlistButton(data, type) {
  if (!watchlistBtn) return;

  if (isInWatchlist(data.id)) {
    watchlistBtn.textContent = "✓ In Watchlist";
    watchlistBtn.style.background = "#444";
  } else {
    watchlistBtn.textContent = "+ Add to Watchlist";
    watchlistBtn.style.background = "#e50914";
  }
}


// ----------------------------
// TOGGLE WATCHLIST
// ----------------------------
function toggleWatchlist(data, type) {
  let list = getWatchlist();

  if (isInWatchlist(data.id)) {
    list = list.filter(item => item.id !== data.id);
  } else {
    list.push({
      id: data.id,
      type: type,
      title: data.title || data.name,
      poster: data.poster_path
    });
  }

  saveWatchlist(list);
  updateWatchlistButton(data, type);
}
/* *************************************** fetch cast details***************************/
const castListEl = document.getElementById("cast-list");

async function fetchCast(id, type) {
  try {
    const response = await fetch(
      `${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}`
    );

    const data = await response.json();

    renderCast(data.cast || []);
  } catch (error) {
    console.error("Cast error:", error);
  }
}
function renderCast(cast) {
  if (!castListEl) return;

  castListEl.innerHTML = cast.slice(0, 10).map(actor => {

    const image = actor.profile_path
      ? IMAGE_URL + actor.profile_path
      : "https://via.placeholder.com/300x450?text=No+Image";

    return `
      <div class="cast-card"
           onclick="openPerson(${actor.id})">

        <img src="${image}">

        <h3>${actor.name}</h3>
        <p>${actor.character}</p>

      </div>
    `;
  }).join("");
}

function openPerson(id) {
  window.location.href = `person.html?id=${id}`;
}
/*************favorites button ********************* */
const favoriteBtn = document.getElementById("favorite-btn");

function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites")) || [];
}

function saveFavorites(favorites) {
  localStorage.setItem("favorites", JSON.stringify(favorites));
}

function isFavorite(id) {
  const favorites = getFavorites();
  return favorites.some((item) => item.id === id);
}

function updateFavoriteButton(id) {
  if (!favoriteBtn) return;

  const icon = favoriteBtn.querySelector("i");
  const text = favoriteBtn.querySelector("span");

  if (isFavorite(id)) {
    favoriteBtn.classList.add("active");
    if (icon) {
      icon.className = "bi bi-heart-fill";
    }
    if (text) {
      text.textContent = "Favorited";
    }
  } else {
    favoriteBtn.classList.remove("active");
    if (icon) {
      icon.className = "bi bi-heart";
    }
    if (text) {
      text.textContent = "Add to Favorites";
    }
  }
}

function toggleFavorite(item) {
  let favorites = getFavorites();

  const exists = favorites.some((fav) => fav.id === item.id);

  if (exists) {
    favorites = favorites.filter((fav) => fav.id !== item.id);
  } else {
    favorites.unshift(item);
  }

  saveFavorites(favorites);
  updateFavoriteButton(item.id);
}
/**************fetch reviews***************/
async function fetchReviews(id, type) {
  try {
    const response = await fetch(
      `${BASE_URL}/${type}/${id}/reviews?api_key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Reviews fetch failed: ${response.status}`);
    }

    const data = await response.json();
    renderReviews(data.results || []);
  } catch (error) {
    console.error("Reviews error:", error);

    if (reviewsListEl) {
      reviewsListEl.innerHTML = `
        <p class="reviews-placeholder">Could not load reviews.</p>
      `;
    }
  }
}
function renderReviews(reviews) {
  if (!reviewsListEl) return;

  if (!reviews.length) {
    reviewsListEl.innerHTML = `
      <p class="reviews-placeholder">No reviews available.</p>
    `;
    return;
  }

  reviewsListEl.innerHTML = reviews
    .slice(0, 3) 
    .map((review) => {
      const author = review.author || "Anonymous";
      const username = review.author_details?.username || "";
      const rating = review.author_details?.rating;
      const avatarPath = review.author_details?.avatar_path;

      const content = review.content || "";

      
      const shortContent =
        content.length > 110 ? content.slice(0, 110) + "..." : content;

    
      let avatarHTML = "";

      if (avatarPath && avatarPath.startsWith("/")) {
        avatarHTML = `
          <img 
            src="https://image.tmdb.org/t/p/w45${avatarPath}" 
            class="review-avatar"
          >
        `;
      } else {
        avatarHTML = `
          <div class="review-avatar-fallback">
            ${author.charAt(0).toUpperCase()}
          </div>
        `;
      }

      return `
        <article class="review-mini-card">

          <div class="review-mini-header">

            <div class="review-user">
              ${avatarHTML}

              <div class="review-user-info">
                <p class="review-mini-author">${escapeHtml(author)}</p>
                <span class="review-mini-username">@${escapeHtml(username)}</span>
              </div>
            </div>

            <span class="review-mini-rating">
              ${rating ? `★ ${rating}/10` : ""}
            </span>

          </div>

          <p class="review-mini-text">
            ${escapeHtml(shortContent)}
          </p>

          ${
            review.url
              ? `<a class="review-mini-link" href="${review.url}" target="_blank">
                   Read full
                 </a>`
              : ""
          }

        </article>
      `;
    })
    .join("");
}
function toggleReview(index) {
  const contentEl = document.getElementById(`review-content-${index}`);
  const buttonEl = contentEl?.nextElementSibling;

  if (!contentEl || !buttonEl) return;

  const isExpanded = contentEl.dataset.expanded === "true";
  const fullText = contentEl.dataset.full;
  const shortText = contentEl.dataset.short;

  if (isExpanded) {
    contentEl.innerHTML = shortText;
    contentEl.dataset.expanded = "false";
    buttonEl.textContent = "Read more";
  } else {
    contentEl.innerHTML = fullText;
    contentEl.dataset.expanded = "true";
    buttonEl.textContent = "Show less";
  }
}
function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
/********fetch providers *************************** */
async function fetchProviders(id, type) {
  try {
    const response = await fetch(
      `${BASE_URL}/${type}/${id}/watch/providers?api_key=${API_KEY}`
    );

    const data = await response.json();

    renderProviders(data.results || {});
  } catch (error) {
    console.error("Providers error:", error);
  }
}
function renderProviders(data) {
  const container = document.getElementById("providers-container");
  if (!container) return;

  const country = "MA";

  let providers = data[country]?.flatrate;

  //  fallback
  if (!providers || providers.length === 0) {
    providers = data["US"]?.flatrate || [];
  }

  if (!providers.length) {
    container.innerHTML = `<p class="providers-placeholder">Not available.</p>`;
    return;
  }

  container.innerHTML = providers.map(p => `
    <div class="provider-card">
      <img src="https://image.tmdb.org/t/p/w45${p.logo_path}">
      <span>${p.provider_name}</span>
    </div>
  `).join("");
}