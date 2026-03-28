

const API_KEY  = "233d663323afc329f230f615adeaeda0";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG      = "https://image.tmdb.org/t/p/w500";
const FALLBACK = "https://placehold.co/500x750/1a1820/666?text=No+Image";

const params = new URLSearchParams(window.location.search);
const query  = params.get("query");

// ── DOM refs ────────────────────────────────────────────────
const resultsContainer = document.getElementById("searchResults");
const genresContainer  = document.getElementById("genres-checkboxes");
const mediaFilter      = document.getElementById("media-filter");
const yearFilter       = document.getElementById("year-filter");
const ratingFilter     = document.getElementById("rating-filter");
const sortFilter       = document.getElementById("sort-filter");
const applyFiltersBtn  = document.getElementById("apply-filters-btn");
const prevBtn          = document.getElementById("prev-btn");
const nextBtn          = document.getElementById("next-btn");
const pageInfo         = document.getElementById("page-info");
const resultsTitle     = document.querySelector(".results-title");

// ── State — declared properly (was implicit global before) ──
let allResults  = [];
let currentPage = 1;
let totalPages  = 1;
let currentMode = "search"; // ← BUG FIX: was never declared, causing ReferenceError

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

function showLoadingSkeleton() {
  if (!resultsContainer) return;
  resultsContainer.innerHTML = Array.from({ length: 6 }, () => `
    <article class="search-card search-card--skeleton">
      <div class="skeleton-image" style="height:215px;border-radius:0"></div>
      <div class="search-card-info" style="gap:10px;display:flex;flex-direction:column;justify-content:center">
        <div class="skeleton-title" style="width:55%;height:18px"></div>
        <div class="skeleton-title" style="width:35%;height:12px;opacity:.6"></div>
        <div class="skeleton-title" style="width:90%;height:11px;opacity:.4"></div>
        <div class="skeleton-title" style="width:80%;height:11px;opacity:.4"></div>
      </div>
    </article>`).join("");
}

// ────────────────────────────────────────────────────────────
// SEARCH
// ────────────────────────────────────────────────────────────
async function searchMovies(searchQuery, page = 1) {
  showLoadingSkeleton();
  try {
    currentMode = "search";
    const res  = await fetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${page}`
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    allResults  = (data.results || []).filter(
      i => i.media_type === "movie" || i.media_type === "tv" || i.media_type === "person"
    );
    currentPage = data.page || 1;
    totalPages  = data.total_pages || 1;

    if (resultsTitle) {
      resultsTitle.textContent = `Results for "${searchQuery}"`;
    }

    displayResults(allResults);
    updatePagination();
  } catch (err) {
    console.error("Search error:", err);
    if (resultsContainer) resultsContainer.innerHTML = emptyState("❌", "Something went wrong. Please try again.");
  }
}

// ────────────────────────────────────────────────────────────
// DISPLAY RESULTS
// ────────────────────────────────────────────────────────────
function displayResults(results) {
  if (!resultsContainer) return;
  resultsContainer.innerHTML = "";

  const filtered = results.filter(item => {
    if (item.media_type === "movie" || item.media_type === "tv") return item.poster_path;
    if (item.media_type === "person") return item.profile_path;
    return false;
  });

  if (!filtered.length) {
    resultsContainer.innerHTML = emptyState("🔍", "No results found. Try a different search or adjust filters.");
    return;
  }

  const fragment = document.createDocumentFragment();

  filtered.forEach(item => {
    const card = document.createElement("article");
    card.className = "search-card";

    if (item.media_type === "person") {
      const name    = escapeHtml(item.name || "Unknown");
      const profile = item.profile_path ? `${IMG}${item.profile_path}` : FALLBACK;
      const knownFor = (item.known_for || [])
        .map(w => escapeHtml(w.title || w.name))
        .filter(Boolean).slice(0, 3).join(", ");

      card.innerHTML = `
        <img src="${profile}" alt="${name}" class="search-card-poster" loading="lazy"
             onerror="this.src='${FALLBACK}'">
        <div class="search-card-info">
          <a href="person.html?id=${item.id}" class="search-card-title">${name}</a>
          <div class="search-card-meta">🎭 Actor / Cast</div>
          <p class="search-card-overview">${knownFor ? `Known for: ${knownFor}` : "No known titles."}</p>
        </div>`;

      card.addEventListener("click", e => {
        if (e.target.tagName.toLowerCase() !== "a")
          window.location.href = `person.html?id=${item.id}`;
      });

    } else {
      const title  = escapeHtml(item.title || item.name || "Unknown");
      const type   = item.media_type === "movie" ? "Movie" : "TV Series";
      const year   = (item.release_date || item.first_air_date || "").split("-")[0] || "N/A";
      const poster = item.poster_path ? `${IMG}${item.poster_path}` : FALLBACK;
      const rating = item.vote_average ? item.vote_average.toFixed(1) : "N/A";
      const overview = escapeHtml(item.overview || "No overview available.");

      card.innerHTML = `
        <img src="${poster}" alt="${title}" class="search-card-poster" loading="lazy"
             onerror="this.src='${FALLBACK}'">
        <div class="search-card-info">
          <a href="details.html?id=${item.id}&type=${item.media_type}" class="search-card-title">${title}</a>
          <div class="search-card-meta">${type} · ${year} · ⭐ ${rating}</div>
          <p class="search-card-overview">${overview}</p>
        </div>`;

      card.addEventListener("click", e => {
        if (e.target.tagName.toLowerCase() !== "a")
          window.location.href = `details.html?id=${item.id}&type=${item.media_type}`;
      });
    }

    fragment.appendChild(card);
  });

  resultsContainer.appendChild(fragment);
}

function emptyState(icon, msg) {
  return `
    <div class="empty-state" style="padding:60px 20px">
      <span class="empty-state-icon">${icon}</span>
      <p class="empty-state-msg">${escapeHtml(msg)}</p>
    </div>`;
}

// ────────────────────────────────────────────────────────────
// PAGINATION
// ────────────────────────────────────────────────────────────
function updatePagination() {
  if (!pageInfo || !prevBtn || !nextBtn) return;
  pageInfo.textContent  = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

function scrollToResults() {
  resultsContainer?.scrollIntoView({ behavior: "smooth", block: "start" });
}

prevBtn?.addEventListener("click", () => {
  if (currentPage <= 1) return;
  const prev = currentPage - 1;
  currentMode === "search" ? searchMovies(query, prev) : applyDiscoverFilters(prev);
  scrollToResults();
});

nextBtn?.addEventListener("click", () => {
  if (currentPage >= totalPages) return;
  const next = currentPage + 1;
  currentMode === "search" ? searchMovies(query, next) : applyDiscoverFilters(next);
  scrollToResults();
});

// ────────────────────────────────────────────────────────────
// GENRES
// ────────────────────────────────────────────────────────────
async function fetchGenres(type = "movie") {
  try {
    const res  = await fetch(`${BASE_URL}/genre/${type}/list?api_key=${API_KEY}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    renderGenres(data.genres || []);
  } catch {
    console.warn("Could not load genres");
  }
}

function renderGenres(genres) {
  if (!genresContainer) return;
  // BUG FIX: was using innerHTML += in a loop — slow & causes re-parsing on every iteration
  genresContainer.innerHTML = genres.map(g => `
    <label class="genre-option">
      <input type="checkbox" value="${g.id}">
      <span>${escapeHtml(g.name)}</span>
    </label>`).join("");
}

function getSelectedGenres() {
  return Array.from(
    document.querySelectorAll("#genres-checkboxes input:checked"),
    el => Number(el.value)
  );
}

// ────────────────────────────────────────────────────────────
// FILTERS
// ────────────────────────────────────────────────────────────
async function applyFilters() {
  if (!query) return applyDiscoverFilters(1);

  const media  = mediaFilter?.value  || "";
  const year   = yearFilter?.value.trim() || "";
  const rating = ratingFilter?.value || "";
  const sort   = sortFilter?.value   || "";
  const selectedGenres = getSelectedGenres();

  let results = [...allResults];

  if (media)  results = results.filter(i => i.media_type === media);
  if (year)   results = results.filter(i => (i.release_date || i.first_air_date || "").startsWith(year));
  if (rating) results = results.filter(i => (i.vote_average || 0) >= Number(rating));

  if (selectedGenres.length) {
    results = results.filter(i =>
      selectedGenres.every(id => (i.genre_ids || []).includes(id))
    );
  }

  if (sort === "vote_average.desc") {
    results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  } else if (sort === "primary_release_date.desc") {
    results.sort((a, b) =>
      new Date(b.release_date || b.first_air_date || 0) -
      new Date(a.release_date || a.first_air_date || 0)
    );
  }

  displayResults(results);
}

async function applyDiscoverFilters(page = 1) {
  showLoadingSkeleton();
  try {
    currentMode = "discover";

    const media  = mediaFilter?.value  || "movie";
    const year   = yearFilter?.value.trim() || "";
    const rating = ratingFilter?.value || "";
    const sort   = sortFilter?.value   || "";
    const selectedGenres = getSelectedGenres();

    let url = `${BASE_URL}/discover/${media}?api_key=${API_KEY}&page=${page}`;

    if (selectedGenres.length) url += `&with_genres=${selectedGenres.join(",")}`;
    if (year)   url += media === "movie" ? `&primary_release_year=${year}` : `&first_air_date_year=${year}`;
    if (rating) url += `&vote_average.gte=${rating}`;
    if (sort)   url += `&sort_by=${sort}`;

    const res  = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    allResults  = data.results || [];
    currentPage = data.page    || 1;
    totalPages  = data.total_pages || 1;

    displayResults(allResults);
    updatePagination();
  } catch (err) {
    console.error("Discover error:", err);
    if (resultsContainer) resultsContainer.innerHTML = emptyState("❌", "Could not load results. Try again.");
  }
}

// ────────────────────────────────────────────────────────────
// EVENTS
// ────────────────────────────────────────────────────────────
applyFiltersBtn?.addEventListener("click", applyFilters);

mediaFilter?.addEventListener("change", e => {
  fetchGenres(e.target.value || "movie");
});

// ────────────────────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────────────────────
fetchGenres("movie");

if (query) {
  if (resultsTitle) resultsTitle.textContent = `Results for "${query}"`;
  searchMovies(query);
} else {
  if (resultsContainer)
    resultsContainer.innerHTML = emptyState("🎬", "Search for a movie, series, or actor above.");
}
