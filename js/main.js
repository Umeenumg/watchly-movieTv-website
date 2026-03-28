
const myAPIKey = "233d663323afc329f230f615adeaeda0";
const FALLBACK_POSTER = "https://placehold.co/500x750/1a1820/666?text=No+Image";

// ────────────────────────────────────────────────────────────
// SKELETON LOADER 
// ────────────────────────────────────────────────────────────
function renderSkeleton(container, count = 8) {
  if (!container) return;
  container.innerHTML = Array.from({ length: count }, () => `
    <div class="card skeleton-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
      </div>
    </div>`).join("");
}
// ────────────────────────────────────────────────────────────
// CARD BUILDER  (shared by all three carousels)
// ────────────────────────────────────────────────────────────
function buildCard(item, mediaType) {
  const title   = item.title || item.name || "Unknown";
  const poster  = item.poster_path
    ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
    : FALLBACK_POSTER;
  const rating  = item.vote_average ? item.vote_average.toFixed(1) : null;

  const card = document.createElement("div");
  card.className   = "card";
  card.style.cursor = "pointer";

  card.innerHTML = `
    <div class="card-image">
      <img src="${poster}" alt="${escapeHtml(title)}" loading="lazy"
           onerror="this.src='${FALLBACK_POSTER}'">
      ${rating ? `<span class="card-score">⭐ ${rating}</span>` : ""}
    </div>
    <div class="card-content">
      <h3 class="card-title">${escapeHtml(title)}</h3>
    </div>`;

  card.addEventListener("click", () => {
    window.location.href = `details.html?id=${item.id}&type=${mediaType}`;
  });

  return card;
}

function escapeHtml(text) {
  if (text == null) return "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

// ────────────────────────────────────────────────────────────
// TRENDING
// ────────────────────────────────────────────────────────────
const trendingTrack = document.getElementById("trendingTrack");

async function loadTrending() {
  renderSkeleton(trendingTrack);          // ← now actually used
  try {
    const res  = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${myAPIKey}`);
    if (!res.ok) throw new Error();
    const data = await res.json();

    trendingTrack.innerHTML = "";
    data.results
      .filter(i => i.poster_path && (i.media_type === "movie" || i.media_type === "tv"))
      .forEach(item => trendingTrack.appendChild(buildCard(item, item.media_type)));
  } catch {
    trendingTrack.innerHTML = `<p style="color:#888;padding:20px">Could not load trending titles.</p>`;
  }
}

loadTrending();

// ────────────────────────────────────────────────────────────
// POPULAR MOVIES
// ────────────────────────────────────────────────────────────
const popularTrack = document.getElementById("popularTrack");

async function loadPopular() {
  renderSkeleton(popularTrack);
  try {
    const res  = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${myAPIKey}`);
    if (!res.ok) throw new Error();
    const data = await res.json();

    popularTrack.innerHTML = "";
    data.results
      .filter(i => i.poster_path)
      .forEach(item => popularTrack.appendChild(buildCard(item, "movie")));
  } catch {
    popularTrack.innerHTML = `<p style="color:#888;padding:20px">Could not load popular movies.</p>`;
  }
}

loadPopular();

// ────────────────────────────────────────────────────────────
// COMING SOON
// ────────────────────────────────────────────────────────────
const comingSoonTrack = document.getElementById("comingSoonTrack");

async function loadComingSoon() {
  renderSkeleton(comingSoonTrack);
  try {
    const res  = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${myAPIKey}`);
    if (!res.ok) throw new Error();
    const data = await res.json();

    comingSoonTrack.innerHTML = "";
    data.results
      .filter(i => i.poster_path)
      .forEach(item => comingSoonTrack.appendChild(buildCard(item, "movie")));
  } catch {
    comingSoonTrack.innerHTML = `<p style="color:#888;padding:20px">Could not load upcoming movies.</p>`;
  }
}

loadComingSoon();

// ────────────────────────────────────────────────────────────
// RECENTLY VIEWED
// ────────────────────────────────────────────────────────────
const recentlyViewedList = document.getElementById("recently-viewed-list");
const POSTER_URL = "https://image.tmdb.org/t/p/w500";

function getRecentlyViewed() {
  return JSON.parse(localStorage.getItem("recentlyViewed")) || [];
}

function renderRecentlyViewed() {
  const recentSection = document.querySelector(".recent-section");
  if (!recentlyViewedList) return;

  const items = getRecentlyViewed();

  if (!items.length) {
    if (recentSection) recentSection.style.display = "none";
    return;
  }

  if (recentSection) recentSection.style.display = "";

  recentlyViewedList.innerHTML = items.slice(0, 6).map(item => {
    const poster = item.poster_path
      ? `${POSTER_URL}${item.poster_path}`
      : FALLBACK_POSTER;
    const typeLabel = item.media_type === "tv" ? "TV Series" : "Movie";
    const year      = item.year || "N/A";
    const rating    = item.rating ? item.rating.toFixed(1) : "N/A";

    return `
      <article class="recent-card"
               onclick="window.location.href='details.html?id=${item.id}&type=${item.media_type}'">
        <img src="${poster}" alt="${escapeHtml(item.title)}" loading="lazy"
             onerror="this.src='${FALLBACK_POSTER}'">
        <div class="recent-card-overlay">
          <div class="recent-card-body">
            <h3>${escapeHtml(item.title)}</h3>
            <div class="recent-card-meta">${typeLabel} · ${year} · ★ ${rating}</div>
          </div>
        </div>
      </article>`;
  }).join("");
}

renderRecentlyViewed();
