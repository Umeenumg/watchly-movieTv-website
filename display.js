const API_KEY = "233d663323afc329f230f615adeaeda0";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG = "https://image.tmdb.org/t/p/w500";

const params = new URLSearchParams(window.location.search);
const query = params.get("query");

// main containers
const resultsContainer = document.getElementById("searchResults");
const genresContainer = document.getElementById("genres-checkboxes");

// filters
const mediaFilter = document.getElementById("media-filter");
const yearFilter = document.getElementById("year-filter");
const ratingFilter = document.getElementById("rating-filter");
const sortFilter = document.getElementById("sort-filter");
const applyFiltersBtn = document.getElementById("apply-filters-btn");

// pagination
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const pageInfo = document.getElementById("page-info");

let allResults = [];
let currentPage = 1;
let totalPages = 1;

// ----------------------------
// SEARCH
// ----------------------------
async function searchMovies(searchQuery, page = 1) {
  try {
    currentMode = "search";
    const response = await fetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery)}&page=${page}`
    );

    const data = await response.json();

    allResults = (data.results || []).filter(
      (item) => item.media_type === "movie" || item.media_type === "tv" ||
        item.media_type === "person"
    );

    currentPage = data.page || 1;
    totalPages = data.total_pages || 1;

    displayResults(allResults);
    updatePagination();
  } catch (error) {
    console.error("Search error:", error);
    resultsContainer.innerHTML = `<p class="empty-results">Something went wrong.</p>`;
  }
}

// ----------------------------
// DISPLAY RESULTS
// ----------------------------
function displayResults(results) {
  if (!resultsContainer) return;

  resultsContainer.innerHTML = "";

  const filteredResults = results.filter((item) => {
    if (item.media_type === "movie" || item.media_type === "tv") {
      return item.poster_path;
    }

    if (item.media_type === "person") {
      return item.profile_path;
    }

    return false;
  });

  if (filteredResults.length === 0) {
    resultsContainer.innerHTML = `<p class="empty-results">No results found.</p>`;
    return;
  }

  filteredResults.forEach((item) => {
    const card = document.createElement("article");
    card.className = "search-card";

    if (item.media_type === "person") {
      const name = item.name || "Unknown actor";
      const profile = item.profile_path
        ? `${IMG}${item.profile_path}`
        : "https://via.placeholder.com/500x750?text=No+Image";

      const knownFor = (item.known_for || [])
        .map((work) => work.title || work.name)
        .filter(Boolean)
        .slice(0, 3)
        .join(", ");

      card.innerHTML = `
        <img 
          src="${profile}" 
          alt="${name}" 
          class="search-card-poster"
          onerror="this.src='https://via.placeholder.com/500x750?text=No+Image'"
        >

        <div class="search-card-info">
          <a 
            href="person.html?id=${item.id}" 
            class="search-card-title"
          >
            ${name}
          </a>

          <div class="search-card-meta">
            Actor / Cast
          </div>

          <p class="search-card-overview">
            ${knownFor ? `Known for: ${knownFor}` : "No known titles available."}
          </p>
        </div>
      `;

      card.addEventListener("click", (e) => {
        if (e.target.tagName.toLowerCase() !== "a") {
          window.location.href = `person.html?id=${item.id}`;
        }
      });
    } else {
      const title = item.title || item.name || "Unknown title";
      const type = item.media_type === "movie" ? "Movie" : "TV Series";
      const date = item.release_date || item.first_air_date || "";
      const year = date ? date.split("-")[0] : "N/A";
      const poster = item.poster_path
        ? `${IMG}${item.poster_path}`
        : "https://via.placeholder.com/500x750?text=No+Image";

      card.innerHTML = `
        <img 
          src="${poster}" 
          alt="${title}" 
          class="search-card-poster"
          onerror="this.src='https://via.placeholder.com/500x750?text=No+Image'"
        >

        <div class="search-card-info">
          <a 
            href="details.html?id=${item.id}&type=${item.media_type}" 
            class="search-card-title"
          >
            ${title}
          </a>

          <div class="search-card-meta">
            ${type} • ${year} • ⭐ ${item.vote_average ? item.vote_average.toFixed(1) : "N/A"}
          </div>

          <p class="search-card-overview">
            ${item.overview || "No overview available."}
          </p>
        </div>
      `;

      card.addEventListener("click", (e) => {
        if (e.target.tagName.toLowerCase() !== "a") {
          window.location.href = `details.html?id=${item.id}&type=${item.media_type}`;
        }
      });
    }

    resultsContainer.appendChild(card);
  });
}
// ----------------------------
// PAGINATION
// ----------------------------
function updatePagination() {
  if (!pageInfo || !prevBtn || !nextBtn) return;

  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

prevBtn.addEventListener("click", () => {
  if (currentPage <= 1) return;

  if (currentMode === "search") {
    searchMovies(query, currentPage - 1);
  } else {
    applyDiscoverFilters(currentPage - 1);
  }
});

nextBtn.addEventListener("click", () => {
  if (currentPage >= totalPages) return;

  if (currentMode === "search") {
    searchMovies(query, currentPage + 1);
  } else {
    applyDiscoverFilters(currentPage + 1);
  }
});


// ----------------------------
// GENRES
// ----------------------------
async function fetchGenres(type = "movie") {
  try {
    const res = await fetch(
      `${BASE_URL}/genre/${type}/list?api_key=${API_KEY}`
    );

    const data = await res.json();
    renderGenres(data.genres || []);
  } catch (error) {
    console.error("Genres error:", error);
  }
}

function renderGenres(genres) {
  if (!genresContainer) return;

  genresContainer.innerHTML = "";

  genres.forEach((genre) => {
    genresContainer.innerHTML += `
      <label class="genre-option">
        <input type="checkbox" value="${genre.id}">
        <span>${genre.name}</span>
      </label>
    `;
  });
}

function getSelectedGenres() {
  const checked = document.querySelectorAll(
    "#genres-checkboxes input:checked"
  );

  return Array.from(checked).map((el) => Number(el.value));
}

// ----------------------------
// FILTERS ON SEARCH RESULTS
// ----------------------------
async function applyFilters() {
  const media = document.getElementById("media-filter").value;
  const year = document.getElementById("year-filter").value.trim();
  const rating = document.getElementById("rating-filter").value;
  const sort = document.getElementById("sort-filter").value;
  const selectedGenres = getSelectedGenres();

  // if no search query → apply discover filters
  if (!query) {
    return applyDiscoverFilters(1);
  }

  //  if there is a search query → filter local
  let results = [...allResults];

  if (media) {
    results = results.filter(item => item.media_type === media);
  }

  if (year) {
    results = results.filter(item =>
      (item.release_date || item.first_air_date || "").startsWith(year)
    );
  }

  if (rating) {
    results = results.filter(item => (item.vote_average || 0) >= Number(rating));
  }

  if (selectedGenres.length) {
    results = results.filter(item => {
      const genreIds = item.genre_ids || [];
      return selectedGenres.every(id => genreIds.includes(id));
    });
  }

  if (sort === "vote_average.desc") {
    results.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  }

  if (sort === "primary_release_date.desc") {
    results.sort((a, b) =>
      new Date(b.release_date || b.first_air_date || 0) -
      new Date(a.release_date || a.first_air_date || 0)
    );
  }

  displayResults(results);
}

async function applyDiscoverFilters(page = 1) {
  try {
    currentMode = "discover";

    const media = document.getElementById("media-filter").value || "movie";
    const year = document.getElementById("year-filter").value.trim();
    const rating = document.getElementById("rating-filter").value;
    const sort = document.getElementById("sort-filter").value;
    const selectedGenres = getSelectedGenres();

    let url = `${BASE_URL}/discover/${media}?api_key=${API_KEY}&page=${page}`;

    if (selectedGenres.length) {
      url += `&with_genres=${selectedGenres.join(",")}`;
    }

    if (year) {
      if (media === "movie") {
        url += `&primary_release_year=${year}`;
      } else {
        url += `&first_air_date_year=${year}`;
      }
    }

    if (rating) {
      url += `&vote_average.gte=${rating}`;
    }

    if (sort) {
      url += `&sort_by=${sort}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    allResults = data.results || [];
    currentPage = data.page;
    totalPages = data.total_pages;

    displayResults(allResults);
    updatePagination();

  } catch (error) {
    console.error("Discover error:", error);
  }
}
// ----------------------------
// EVENTS
// ----------------------------
if (applyFiltersBtn) {
  applyFiltersBtn.addEventListener("click", applyFilters);
}

if (mediaFilter) {
  mediaFilter.addEventListener("change", (e) => {
    // Clear selected genres when media type changes
    fetchGenres(e.target.value || "movie");
  });
}

// ----------------------------
// INIT
// ----------------------------
fetchGenres("movie");

if (query) {
  searchMovies(query);
} else if (resultsContainer) {
  resultsContainer.innerHTML = `<p class="empty-results">Search for something first.</p>`;
}