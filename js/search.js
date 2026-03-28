
/*
const searchInput = document.querySelector(".search-input");


const suggestionsBox = document.getElementById("search-suggestions");
let debounceTimer;

searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    handleSuggestions(searchInput.value.trim());
  }, 400);
});

async function handleSuggestions(query) {
  if (!query) {
    suggestionsBox.classList.remove("active");
    suggestionsBox.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(
      `${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`
    );

    const data = await res.json();

    const results = data.results
      .filter(item => item.poster_path && (item.media_type === "movie" || item.media_type === "tv"))
      .slice(0, 5);

    renderSuggestions(results);

  } catch (err) {
    console.error("Suggestions error:", err);
  }
}
function renderSuggestions(results) {
  if (!results.length) {
    suggestionsBox.classList.remove("active");
    return;
  }

  suggestionsBox.innerHTML = results.map(item => {
    const title = item.title || item.name;

    return `
      <div class="suggestion-item"
           onclick="goToDetails(${item.id}, '${item.media_type}')">

        <img src="https://image.tmdb.org/t/p/w200${item.poster_path}">

        <span class="suggestion-title">${title}</span>
      </div>
    `;
  }).join("");

  suggestionsBox.classList.add("active");
}

function goToDetails(id, type) {
  window.location.href = `details.html?id=${id}&type=${type}`;
}

document.addEventListener("click", (e) => {
  if (!e.target.closest(".search-wrapper")) {
    suggestionsBox.classList.remove("active");
  }
});
if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

      const query = searchInput.value.trim();

      if (query !== "") {
        window.location.href = `display.html?query=${encodeURIComponent(query)}`;
      }

    }

  });
}


// ────────────────────────────────────────────────────────────
// SEARCH (Enter key → display.html)
// ────────────────────────────────────────────────────────────
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) window.location.href = `display.html?query=${encodeURIComponent(query)}`;
    }
  });
}
*/
const searchInput = document.getElementById("searchInput");
const suggestionsBox = document.getElementById("search-suggestions");


const SEARCH_API_KEY = "233d663323afc329f230f615adeaeda0";
const SEARCH_BASE_URL = "https://api.themoviedb.org/3";
const SEARCH_IMAGE_URL = "https://image.tmdb.org/t/p/w200";
const SEARCH_FALLBACK_IMAGE = "https://via.placeholder.com/200x300?text=No+Image";

let suggestionTimer;
let activeIndex = -1;

if (searchInput) {
  // suggestions on input
  searchInput.addEventListener("input", () => {
    clearTimeout(suggestionTimer);

    const query = searchInput.value.trim();

    suggestionTimer = setTimeout(() => {
      fetchSuggestions(query);
    }, 350);
  });

  // enter / arrows / escape
  searchInput.addEventListener("keydown", (e) => {
    const items = suggestionsBox
      ? suggestionsBox.querySelectorAll(".suggestion-item")
      : [];

    if (e.key === "ArrowDown" && items.length) {
      e.preventDefault();
      activeIndex = (activeIndex + 1) % items.length;
      updateActiveSuggestion(items);
      return;
    }

    if (e.key === "ArrowUp" && items.length) {
      e.preventDefault();
      activeIndex = (activeIndex - 1 + items.length) % items.length;
      updateActiveSuggestion(items);
      return;
    }

    if (e.key === "Enter") {
      e.preventDefault();

      if (items.length && activeIndex >= 0) {
        items[activeIndex].click();
        return;
      }

      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `display.html?query=${encodeURIComponent(query)}`;
      }
      return;
    }

    if (e.key === "Escape") {
      hideSuggestions();
    }
  });

  // click outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-wrapper")) {
      hideSuggestions();
    }
  });
}

async function fetchSuggestions(query) {
  if (!suggestionsBox) return;

  if (!query) {
    hideSuggestions();
    return;
  }

  try {
    const response = await fetch(
      `${SEARCH_BASE_URL}/search/multi?api_key=${SEARCH_API_KEY}&query=${encodeURIComponent(query)}`
    );

    if (!response.ok) {
      throw new Error(`Suggestions error: ${response.status}`);
    }

    const data = await response.json();

    const results = (data.results || [])
      .filter((item) => {
        if (item.media_type === "movie" || item.media_type === "tv") {
          return item.poster_path;
        }

        if (item.media_type === "person") {
          return item.profile_path;
        }

        return false;
      })
      .slice(0, 6);

    renderSuggestions(results);
  } catch (error) {
    console.error("Suggestions fetch error:", error);
    hideSuggestions();
  }
}

function renderSuggestions(results) {
  if (!suggestionsBox) return;

  activeIndex = -1;

  if (!results.length) {
    suggestionsBox.innerHTML = `<div class="suggestion-empty">No suggestions found.</div>`;
    suggestionsBox.classList.add("active");
    return;
  }

  suggestionsBox.innerHTML = results
    .map((item) => {
      if (item.media_type === "person") {
        const name = item.name || "Unknown actor";
        const image = item.profile_path
          ? `${SEARCH_IMAGE_URL}${item.profile_path}`
          : SEARCH_FALLBACK_IMAGE;

        const knownFor = (item.known_for || [])
          .map((work) => work.title || work.name)
          .filter(Boolean)
          .slice(0, 2)
          .join(", ");

        return `
          <div class="suggestion-item" data-id="${item.id}" data-type="person">
            <img src="${image}" alt="${escapeHtml(name)}" onerror="this.src='${SEARCH_FALLBACK_IMAGE}'">

            <div class="suggestion-info">
              <span class="suggestion-title">${escapeHtml(name)}</span>
              <span class="suggestion-meta">
                Actor / Cast${knownFor ? ` • ${escapeHtml(knownFor)}` : ""}
              </span>
            </div>
          </div>
        `;
      }

      const title = item.title || item.name || "Unknown title";
      const year = (item.release_date || item.first_air_date || "").slice(0, 4) || "N/A";
      const type = item.media_type === "tv" ? "TV Series" : "Movie";
      const image = item.poster_path
        ? `${SEARCH_IMAGE_URL}${item.poster_path}`
        : SEARCH_FALLBACK_IMAGE;

      return `
        <div class="suggestion-item" data-id="${item.id}" data-type="${item.media_type}">
          <img src="${image}" alt="${escapeHtml(title)}" onerror="this.src='${SEARCH_FALLBACK_IMAGE}'">

          <div class="suggestion-info">
            <span class="suggestion-title">${escapeHtml(title)}</span>
            <span class="suggestion-meta">${type} • ${year}</span>
          </div>
        </div>
      `;
    })
    .join("");

  const items = suggestionsBox.querySelectorAll(".suggestion-item");

  items.forEach((item) => {
    item.addEventListener("click", () => {
      const id = item.dataset.id;
      const type = item.dataset.type;

      if (type === "person") {
        window.location.href = `person.html?id=${id}`;
      } else {
        window.location.href = `details.html?id=${id}&type=${type}`;
      }
    });
  });

  suggestionsBox.classList.add("active");
}

function updateActiveSuggestion(items) {
  items.forEach((item) => item.classList.remove("active"));

  if (items[activeIndex]) {
    items[activeIndex].classList.add("active");
  }
}

function hideSuggestions() {
  if (!suggestionsBox) return;
  suggestionsBox.classList.remove("active");
  suggestionsBox.innerHTML = "";
  activeIndex = -1;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}