
/*
const resultsContainer = document.getElementById("searchResults");

const params = new URLSearchParams(window.location.search);
const query = params.get("query");

console.log(query);



// Function to fetch search results from TMDb API
async function searchMovies(query) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data.results);

    displayResults(data.results);
  } catch (error) {
    console.error("Search error:", error);
  }
}

// display search results on the page

function displayResults(results) {
  resultsContainer.innerHTML = "";

  const filteredResults = results.filter(
    (item) => item.media_type === "movie" || item.media_type === "tv"
  );

  if (filteredResults.length === 0) {
    resultsContainer.innerHTML = "<p>No results found.</p>";
    return;
  }

  filteredResults.forEach((item) => {
    if (!item.poster_path) return;

    const title = item.title || item.name;
    const mediaType = item.media_type;
    const date = item.release_date || item.first_air_date || "";
    const year = date ? date.split("-")[0] : "N/A";

    const card = document.createElement("div");
    card.classList.add("searchContainer");

    card.innerHTML = `
      <div class="posterSearch-img">
        <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" class="posterSearchImg" alt="${title}">
      </div>

      <div class="posterSearch-info">
        <a href="details.html?id=${item.id}&type=${mediaType}" class="posterSearch-title">
          ${title}
        </a>
        <span class="posterSearch-date">${year}</span>
        <p class="posterSearch-overview">
          ${item.overview || "No overview available."}
        </p>
      </div>
    `;

    resultsContainer.appendChild(card);
  });
}


if (query) {
  searchMovies(query);
}
  */
 const API_KEY = "233d663323afc329f230f615adeaeda0";
const IMG = "https://image.tmdb.org/t/p/w500";
const resultsContainer = document.getElementById("searchResults");

const params = new URLSearchParams(window.location.search);
const query = params.get("query");

async function searchMovies(query) {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    displayResults(data.results);
  } catch (error) {
    console.error("Search error:", error);
  }
}

function displayResults(results) {
  if (!resultsContainer) return;

  resultsContainer.innerHTML = "";

  const filteredResults = results.filter(
    (item) => (item.media_type === "movie" || item.media_type === "tv") && item.poster_path
  );

  if (filteredResults.length === 0) {
    resultsContainer.innerHTML = `<p class="empty-results">No results found.</p>`;
    return;
  }

  filteredResults.forEach((item) => {
    const title = item.title || item.name;
    const type = item.media_type === "movie" ? "Movie" : "TV Series";
    const date = item.release_date || item.first_air_date || "";
    const year = date ? date.split("-")[0] : "N/A";

    const card = document.createElement("article");
    card.className = "search-card";

    card.innerHTML = `
      <img 
        src="${IMG}${item.poster_path}" 
        alt="${title}" 
        class="search-card-poster"
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

    resultsContainer.appendChild(card);
  });
}

if (query) {
  searchMovies(query);
}
