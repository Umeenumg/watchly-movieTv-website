

const API_KEY  = "233d663323afc329f230f615adeaeda0";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL  = "https://image.tmdb.org/t/p/original";
const POSTER_URL = "https://image.tmdb.org/t/p/w500";
const CAST_IMG   = "https://image.tmdb.org/t/p/w185";   // ← fixed: was using /original (too slow)
const FALLBACK_POSTER  = "https://placehold.co/500x750/1a1820/666?text=No+Image";
const FALLBACK_PROFILE = "https://placehold.co/300x450/1a1820/666?text=No+Photo";

// ── URL params ──────────────────────────────────────────────
const params = new URLSearchParams(window.location.search);
const id   = params.get("id");
const type = params.get("type");

// ── DOM refs ────────────────────────────────────────────────
const heroSection   = document.querySelector(".details-hero");
const posterEl      = document.getElementById("details-poster");
const titleEl       = document.getElementById("details-title");
const yearEl        = document.getElementById("details-year");
const genresEl      = document.getElementById("details-genres");
const overviewEl    = document.getElementById("details-overview");
const infoGridEl    = document.querySelector(".details-info-grid");
const reviewsListEl = document.getElementById("reviews-list");
const castListEl    = document.getElementById("cast-list");
const trailerContainer   = document.getElementById("trailer-container");
const similarListEl      = document.getElementById("similar-list");
const recommendedListEl  = document.getElementById("recommended-list");
const watchlistBtn  = document.getElementById("watchlist-btn");
const favoriteBtn   = document.getElementById("favorite-btn");

// ────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────

/** Safe HTML escape — handles null/undefined without crashing */
function escapeHtml(text) {
  if (text == null) return "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getYear(dateString) {
  if (!dateString) return "Unknown";
  return dateString.slice(0, 4);
}

/** Single, correct getStarRating (was defined twice before) */
function getStarRating(voteAverage) {
  if (!voteAverage && voteAverage !== 0) return "☆☆☆☆☆";
  const stars = Math.round(voteAverage / 2);
  return "★".repeat(stars) + "☆".repeat(5 - stars);
}

/** Fix TMDB Gravatar paths that start with /https:// */
function fixAvatarPath(avatarPath) {
  if (!avatarPath) return null;
  // TMDB sometimes stores full Gravatar URLs with a leading slash
  if (avatarPath.startsWith("/https://") || avatarPath.startsWith("/http://")) {
    return avatarPath.slice(1); // strip the leading slash
  }
  // Normal TMDB path
  if (avatarPath.startsWith("/")) {
    return `https://image.tmdb.org/t/p/w45${avatarPath}`;
  }
  return avatarPath;
}

/** Toast notification */
function showToast(message, type = "success") {
  const existing = document.getElementById("watchly-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "watchly-toast";
  toast.className = `watchly-toast watchly-toast--${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // trigger animation
  requestAnimationFrame(() => toast.classList.add("watchly-toast--show"));

  setTimeout(() => {
    toast.classList.remove("watchly-toast--show");
    setTimeout(() => toast.remove(), 400);
  }, 2600);
}

// ────────────────────────────────────────────────────────────
// MAIN FETCH
// ────────────────────────────────────────────────────────────
async function fetchDetails() {
  try {
    if (!id || !type) throw new Error("Missing id or type in URL");

    const response = await fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

    const data = await response.json();

    renderDetails(data, type);
    fetchTrailer(id, type);
    fetchReviews(id, type);
    fetchProviders(id, type);
    fetchCast(id, type);
    fetchSimilar(id, type);

    updateWatchlistButton(data, type);
    updateFavoriteButton(data.id);

    // ── Button listeners (attached ONCE here, not duplicated) ──
    favoriteBtn?.addEventListener("click", () => {
      toggleFavorite({
        id: data.id,
        title: data.title || data.name || "Unknown",
        poster_path: data.poster_path || "",
        media_type: type,
        year: (data.release_date || data.first_air_date || "").slice(0, 4),
        rating: data.vote_average || 0
      });
    });

    watchlistBtn?.addEventListener("click", () => {
      toggleWatchlist(data, type);
    });

    saveToHistory(data, type);
    fetchRecommended();

    addToRecentlyViewed({
      id: data.id,
      title: data.title || data.name || "Unknown",
      poster_path: data.poster_path || "",
      media_type: type,
      year: (data.release_date || data.first_air_date || "").slice(0, 4),
      rating: data.vote_average || 0
    });

  } catch (error) {
    console.error("Error fetching details:", error);
    showError();
  }
}

// ────────────────────────────────────────────────────────────
// RENDER DETAILS
// ────────────────────────────────────────────────────────────
function renderDetails(data, mediaType) {
  const title       = data.title || data.name || "Unknown title";
  const year        = getYear(data.release_date || data.first_air_date);
  const overview    = data.overview || "No overview available.";
  const posterPath  = data.poster_path ? `${POSTER_URL}${data.poster_path}` : FALLBACK_POSTER;
  const backdropPath = data.backdrop_path ? `${IMAGE_URL}${data.backdrop_path}` : "";
  const rating      = data.vote_average ? data.vote_average.toFixed(1) : "N/A";
  const language    = data.original_language?.toUpperCase() || "N/A";
  const status      = data.status || "N/A";
  const tagline     = data.tagline || "";

  let extra = "N/A", typeLabel = "Movie";
  if (mediaType === "tv") {
    typeLabel = "TV Series";
    const seasons  = data.number_of_seasons  ?? 0;
    const episodes = data.number_of_episodes ?? 0;
    extra = `${seasons} season${seasons !== 1 ? "s" : ""}, ${episodes} episodes`;
  } else {
    const runtime = data.runtime ?? 0;
    extra = runtime ? `${Math.floor(runtime / 60)}h ${runtime % 60}m` : "N/A";
  }

  if (heroSection && backdropPath) {
    heroSection.style.backgroundImage = `url('${backdropPath}')`;
  }

  if (posterEl) {
    posterEl.src   = posterPath;
    posterEl.alt   = title;
    posterEl.loading = "lazy";
    posterEl.onerror = () => { posterEl.src = FALLBACK_POSTER; };
  }

  if (titleEl)    titleEl.textContent    = title;
  if (yearEl)     yearEl.textContent     = year;
  if (overviewEl) overviewEl.textContent = overview;

  renderGenres(data.genres || []);
  renderInfoGrid({ typeLabel, language, rating, status, extra, tagline });
}

function renderGenres(genres) {
  if (!genresEl) return;
  if (!genres.length) {
    genresEl.innerHTML = `<span class="genre-badge">Unknown</span>`;
    return;
  }
  genresEl.innerHTML = genres
    .map(g => `<span class="genre-badge">${escapeHtml(g.name)}</span>`)
    .join("");
}

function renderInfoGrid({ typeLabel, language, rating, status, extra, tagline }) {
  if (!infoGridEl) return;
  infoGridEl.innerHTML = `
    <p><strong>Type:</strong> ${typeLabel}</p>
    <p><strong>Language:</strong> ${language}</p>
    <p><strong>Rating:</strong> ⭐ ${rating}</p>
    <p><strong>Status:</strong> ${status}</p>
    <p><strong>${typeLabel === "TV Series" ? "Episodes" : "Runtime"}:</strong> ${extra}</p>
    ${tagline ? `<p><strong>Tagline:</strong> <em>"${escapeHtml(tagline)}"</em></p>` : ""}
  `;
}

function showError() {
  if (titleEl)    titleEl.textContent  = "Content not found";
  if (yearEl)     yearEl.textContent   = "";
  if (overviewEl) overviewEl.textContent = "Something went wrong while loading details.";
  if (genresEl)   genresEl.innerHTML   = "";
  if (infoGridEl) infoGridEl.innerHTML = "";
}

fetchDetails();

// ────────────────────────────────────────────────────────────
// TRAILER
// ────────────────────────────────────────────────────────────
async function fetchTrailer(id, type) {
  if (!trailerContainer) return;
  trailerContainer.innerHTML = `<p class="trailer-placeholder">Loading trailer…</p>`;

  try {
    const res  = await fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`);
    if (!res.ok) throw new Error(`Trailer fetch failed: ${res.status}`);
    const data = await res.json();
    renderTrailer(data.results || []);
  } catch {
    trailerContainer.innerHTML = `<p class="trailer-placeholder">No trailer available.</p>`;
  }
}

function renderTrailer(videos) {
  if (!trailerContainer) return;

  const trailer =
    videos.find(v => v.site === "YouTube" && v.type === "Trailer") ||
    videos.find(v => v.site === "YouTube" && v.type === "Teaser")  ||
    videos.find(v => v.site === "YouTube");

  if (!trailer) {
    trailerContainer.innerHTML = `<p class="trailer-placeholder">No trailer available.</p>`;
    return;
  }

  trailerContainer.innerHTML = `
    <div class="trailer-wrapper">
      <iframe
        src="https://www.youtube.com/embed/${trailer.key}?rel=0"
        title="Trailer"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen>
      </iframe>
    </div>
  `;
}

// ────────────────────────────────────────────────────────────
// SIMILAR
// ────────────────────────────────────────────────────────────
async function fetchSimilar(id, type) {
  try {
    const res  = await fetch(`${BASE_URL}/${type}/${id}/similar?api_key=${API_KEY}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderSimilar(data.results || [], type);
  } catch {
    if (similarListEl) similarListEl.innerHTML = `<p class="reviews-placeholder">Could not load similar titles.</p>`;
  }
}

function renderSimilar(items, currentType) {
  if (!similarListEl) return;

  const filtered = items.filter(i => i.poster_path).slice(0, 8);

  if (!filtered.length) {
    similarListEl.innerHTML = `<p class="reviews-placeholder">No similar titles found.</p>`;
    return;
  }

  similarListEl.innerHTML = filtered.map(item => {
    const title  = escapeHtml(item.title || item.name || "Unknown");
    const year   = getYear(item.release_date || item.first_air_date);
    const poster = `${POSTER_URL}${item.poster_path}`;
    const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
    const stars  = getStarRating(item.vote_average);

    return `
      <article class="similar-card" data-id="${item.id}" data-type="${currentType}">
        <img src="${poster}" alt="${title}" loading="lazy"
             onerror="this.src='${FALLBACK_POSTER}'">
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
      </article>`;
  }).join("");

  // Scoped to #similar-list only — avoids double-fire with recommended cards
  similarListEl.querySelectorAll(".similar-card").forEach(card => {
    card.addEventListener("click", () => {
      window.location.href = `details.html?id=${card.dataset.id}&type=${card.dataset.type}`;
    });
  });
}

// ────────────────────────────────────────────────────────────
// RECOMMENDED
// ────────────────────────────────────────────────────────────
function saveToHistory(data, type) {
  const history = JSON.parse(localStorage.getItem("watchHistory")) || [];
  const item = {
    id:     data.id,
    type,
    title:  data.title || data.name,
    poster: data.poster_path,
    genres: (data.genres || []).map(g => g.id)
  };
  const filtered = history.filter(m => m.id !== item.id);
  filtered.unshift(item);
  localStorage.setItem("watchHistory", JSON.stringify(filtered.slice(0, 20)));
}

async function fetchRecommended() {
  try {
    const history = JSON.parse(localStorage.getItem("watchHistory")) || [];
    if (!history.length) {
      if (recommendedListEl) recommendedListEl.innerHTML = `<p class="reviews-placeholder">Watch more titles to get recommendations.</p>`;
      return;
    }
    const last = history[0];
    const res  = await fetch(`${BASE_URL}/${last.type}/${last.id}/recommendations?api_key=${API_KEY}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderRecommended(data.results || []);
  } catch {
    if (recommendedListEl) recommendedListEl.innerHTML = `<p class="reviews-placeholder">Could not load recommendations.</p>`;
  }
}

function renderRecommended(items) {
  if (!recommendedListEl) return;

  const filtered = items.filter(i => i.poster_path).slice(0, 8);

  if (!filtered.length) {
    recommendedListEl.innerHTML = `<p class="reviews-placeholder">No recommendations found.</p>`;
    return;
  }

  recommendedListEl.innerHTML = filtered.map(item => {
    const title  = escapeHtml(item.title || item.name || "Unknown");
    const poster = `${POSTER_URL}${item.poster_path}`;
    const year   = getYear(item.release_date || item.first_air_date);
    const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
    const stars  = getStarRating(item.vote_average);
    const mtype  = item.media_type || "movie";

    return `
      <article class="similar-card" data-id="${item.id}" data-type="${mtype}">
        <img src="${poster}" alt="${title}" loading="lazy"
             onerror="this.src='${FALLBACK_POSTER}'">
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
      </article>`;
  }).join("");

  // Scoped to #recommended-list only
  recommendedListEl.querySelectorAll(".similar-card").forEach(card => {
    card.addEventListener("click", () => {
      window.location.href = `details.html?id=${card.dataset.id}&type=${card.dataset.type}`;
    });
  });
}

// ────────────────────────────────────────────────────────────
// CAST
// ────────────────────────────────────────────────────────────
async function fetchCast(id, type) {
  try {
    const res  = await fetch(`${BASE_URL}/${type}/${id}/credits?api_key=${API_KEY}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderCast(data.cast || []);
  } catch {
    if (castListEl) castListEl.innerHTML = `<p class="reviews-placeholder">Could not load cast.</p>`;
  }
}

function renderCast(cast) {
  if (!castListEl) return;

  const top = cast.filter(a => a.profile_path || a.name).slice(0, 12);

  if (!top.length) {
    castListEl.innerHTML = `<p class="reviews-placeholder">No cast information available.</p>`;
    return;
  }

  castListEl.innerHTML = top.map(actor => {
    // Use w185 (was IMAGE_URL/original — huge & slow)
    const image = actor.profile_path
      ? `${CAST_IMG}${actor.profile_path}`
      : FALLBACK_PROFILE;

    return `
      <div class="cast-card" onclick="openPerson(${actor.id})">
        <img src="${image}" alt="${escapeHtml(actor.name)}" loading="lazy"
             onerror="this.src='${FALLBACK_PROFILE}'">
        <h3>${escapeHtml(actor.name)}</h3>
        <p>${escapeHtml(actor.character || "")}</p>
      </div>`;
  }).join("");
}

function openPerson(personId) {
  window.location.href = `person.html?id=${personId}`;
}

// ────────────────────────────────────────────────────────────
// REVIEWS  (Bug fix: broken Gravatar avatar paths)
// ────────────────────────────────────────────────────────────
async function fetchReviews(id, type) {
  try {
    const res  = await fetch(`${BASE_URL}/${type}/${id}/reviews?api_key=${API_KEY}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderReviews(data.results || []);
  } catch {
    if (reviewsListEl) reviewsListEl.innerHTML = emptyState("reviews", "Could not load reviews.");
  }
}

function renderReviews(reviews) {
  if (!reviewsListEl) return;

  if (!reviews.length) {
    reviewsListEl.innerHTML = emptyState("reviews", "No reviews yet for this title.");
    return;
  }

  reviewsListEl.innerHTML = reviews.slice(0, 4).map(review => {
    const author      = review.author || "Anonymous";
    const username    = review.author_details?.username || "";
    const rating      = review.author_details?.rating;
    const avatarPath  = review.author_details?.avatar_path;
    const content     = review.content || "";
    const shortContent = content.length > 160 ? content.slice(0, 160) + "…" : content;

    // ── BUG FIX: TMDB stores Gravatar URLs as "/https://..." ──
    const avatarSrc = fixAvatarPath(avatarPath);

    const avatarHTML = avatarSrc
      ? `<img src="${avatarSrc}" class="review-avatar" alt="${escapeHtml(author)}"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"
         ><div class="review-avatar-fallback" style="display:none">${escapeHtml(author.charAt(0).toUpperCase())}</div>`
      : `<div class="review-avatar-fallback">${escapeHtml(author.charAt(0).toUpperCase())}</div>`;

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
          <span class="review-mini-rating">${rating ? `★ ${rating}/10` : ""}</span>
        </div>
        <p class="review-mini-text">${escapeHtml(shortContent)}</p>
        ${review.url
          ? `<a class="review-mini-link" href="${review.url}" target="_blank" rel="noopener">Read full review →</a>`
          : ""}
      </article>`;
  }).join("");
}

// ────────────────────────────────────────────────────────────
// PROVIDERS  (Bug fix + new: rent/buy tabs)
// ────────────────────────────────────────────────────────────
async function fetchProviders(id, type) {
  try {
    const res  = await fetch(`${BASE_URL}/${type}/${id}/watch/providers?api_key=${API_KEY}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderProviders(data.results || {});
  } catch {
    const container = document.getElementById("providers-container");
    if (container) container.innerHTML = emptyState("providers", "Could not load providers.");
  }
}

function renderProviders(data) {
  const container      = document.getElementById("providers-container");
  const watchNowWrapper = document.getElementById("watch-now-wrapper");
  if (!container) return;

  // Try user country first (MA), fall back to US
  const countryData = data["MA"] || data["US"] || null;

  if (!countryData) {
    container.innerHTML = emptyState("providers", "Not available in your region.");
    if (watchNowWrapper) watchNowWrapper.innerHTML = "";
    return;
  }

  const flatrate = countryData.flatrate || [];
  const rent     = countryData.rent     || [];
  const buy      = countryData.buy      || [];
  const link     = countryData.link     || "";

  // Nothing at all
  if (!flatrate.length && !rent.length && !buy.length) {
    container.innerHTML = emptyState("providers", "Not available in your region.");
    if (watchNowWrapper) watchNowWrapper.innerHTML = "";
    return;
  }

  function providerCards(list) {
    return list.map(p => `
      <a class="provider-card" href="${link}" target="_blank" rel="noopener noreferrer"
         title="${escapeHtml(p.provider_name)}">
        <img src="https://image.tmdb.org/t/p/w45${p.logo_path}"
             alt="${escapeHtml(p.provider_name)}"
             onerror="this.parentElement.style.display='none'">
        <span>${escapeHtml(p.provider_name)}</span>
      </a>`).join("");
  }

  // Build tabs — only show tabs that have content
  const tabs = [];
  if (flatrate.length) tabs.push({ key: "stream",  label: "Stream",   items: flatrate });
  if (rent.length)     tabs.push({ key: "rent",    label: "Rent",     items: rent });
  if (buy.length)      tabs.push({ key: "buy",     label: "Buy",      items: buy });

  if (tabs.length === 1) {
    // No need for tabs if only one category
    container.innerHTML = `<div class="providers-grid">${providerCards(tabs[0].items)}</div>`;
  } else {
    container.innerHTML = `
      <div class="providers-tabs">
        ${tabs.map((t, i) => `
          <button class="provider-tab${i === 0 ? " active" : ""}"
                  onclick="switchProviderTab('${t.key}', this)">
            ${t.label}
          </button>`).join("")}
      </div>
      ${tabs.map((t, i) => `
        <div class="providers-panel" id="prov-${t.key}"
             style="${i !== 0 ? "display:none" : ""}">
          <div class="providers-grid">${providerCards(t.items)}</div>
        </div>`).join("")}
    `;
  }

  if (watchNowWrapper) {
    watchNowWrapper.innerHTML = link
      ? `<a class="watch-now-btn" href="${link}" target="_blank" rel="noopener noreferrer">▶ Where to Watch</a>`
      : "";
  }
}

function switchProviderTab(key, btn) {
  // Update active tab button
  btn.closest(".providers-container, .providers-box")
    ?.querySelectorAll(".provider-tab")
    .forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  // Show correct panel
  document.querySelectorAll(".providers-panel").forEach(p => {
    p.style.display = p.id === `prov-${key}` ? "" : "none";
  });
}

// ────────────────────────────────────────────────────────────
// EMPTY STATE  (replaces broken/missing content with nice UI)
// ────────────────────────────────────────────────────────────
function emptyState(icon, message) {
  const icons = {
    reviews:   "💬",
    providers: "📺",
    cast:      "🎭",
    default:   "🎬"
  };
  const emoji = icons[icon] || icons.default;
  return `
    <div class="empty-state">
      <span class="empty-state-icon">${emoji}</span>
      <p class="empty-state-msg">${escapeHtml(message)}</p>
    </div>`;
}

// ────────────────────────────────────────────────────────────
// WATCHLIST
// ────────────────────────────────────────────────────────────
function getWatchlist()        { return JSON.parse(localStorage.getItem("watchlist")) || []; }
function saveWatchlist(list)   { localStorage.setItem("watchlist", JSON.stringify(list)); }
function isInWatchlist(itemId) { return getWatchlist().some(i => i.id === itemId); }

function updateWatchlistButton(data) {
  if (!watchlistBtn) return;
  const inList = isInWatchlist(data.id);
  watchlistBtn.innerHTML = inList
    ? `<i class="bi bi-bookmark-check-fill"></i> In Watchlist`
    : `<i class="bi bi-bookmark-fill"></i> Add to Watchlist`;
  watchlistBtn.classList.toggle("in-list", inList);
}

function toggleWatchlist(data, type) {
  let list = getWatchlist();
  if (isInWatchlist(data.id)) {
    list = list.filter(i => i.id !== data.id);
    showToast("Removed from Watchlist");
  } else {
    list.push({ id: data.id, type, title: data.title || data.name, poster: data.poster_path });
    showToast("Added to Watchlist ✓");
  }
  saveWatchlist(list);
  updateWatchlistButton(data);
}

// ────────────────────────────────────────────────────────────
// FAVORITES
// ────────────────────────────────────────────────────────────
function getFavorites()        { return JSON.parse(localStorage.getItem("favorites")) || []; }
function saveFavorites(favs)   { localStorage.setItem("favorites", JSON.stringify(favs)); }
function isFavorite(itemId)    { return getFavorites().some(i => i.id === itemId); }

function updateFavoriteButton(itemId) {
  if (!favoriteBtn) return;
  const fav  = isFavorite(itemId);
  const icon = favoriteBtn.querySelector("i");
  const text = favoriteBtn.querySelector("span");
  favoriteBtn.classList.toggle("active", fav);
  if (icon) icon.className = fav ? "bi bi-heart-fill" : "bi bi-heart";
  if (text) text.textContent = fav ? "Favorited" : "Add to Favorites";
}

function toggleFavorite(item) {
  let favs = getFavorites();
  const exists = favs.some(f => f.id === item.id);
  if (exists) {
    favs = favs.filter(f => f.id !== item.id);
    showToast("Removed from Favorites");
  } else {
    favs.unshift(item);
    showToast("Added to Favorites ❤️");
  }
  saveFavorites(favs);
  updateFavoriteButton(item.id);
}

// ────────────────────────────────────────────────────────────
// RECENTLY VIEWED
// ────────────────────────────────────────────────────────────
function getRecentlyViewed()      { return JSON.parse(localStorage.getItem("recentlyViewed")) || []; }
function saveRecentlyViewed(items){ localStorage.setItem("recentlyViewed", JSON.stringify(items)); }

function addToRecentlyViewed(item) {
  let items = getRecentlyViewed().filter(
    e => !(e.id === item.id && e.media_type === item.media_type)
  );
  items.unshift(item);
  saveRecentlyViewed(items.slice(0, 10));
}
