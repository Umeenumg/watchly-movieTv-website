
 const myAPIKey = "233d663323afc329f230f615adeaeda0";
function renderSkeleton(container, count = 6) {
  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const card = document.createElement("div");
    card.className = "card skeleton-card";

    card.innerHTML = `
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-title"></div>
      </div>
    `;

    container.appendChild(card);
  }
}

// function  to fetch (search ) movie/tv show  details from API
const searchInput = document.getElementById("searchInput");

if (searchInput) {
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const query = searchInput.value.trim();

      if (query !== "") {
        window.location.href = `display.html?query=${encodeURIComponent(query)}`;
      }
    }
  });
}
  

// trnding movies and tv shows carousel


const trendingTrack = document.getElementById("trendingTrack");
async function loadTrending() {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/trending/all/day?api_key=${myAPIKey}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    trendingTrack.innerHTML = "";

    data.results.forEach((item) => {
      if (!item.poster_path) return;

      const title = item.title || item.name;
      const mediaType = item.media_type;

      const card = document.createElement("div");
      card.classList.add("card");
      card.style.cursor = "pointer";

      card.innerHTML = `
        <div class="card-image">
          <img 
            src="https://image.tmdb.org/t/p/w500${item.poster_path}" 
            alt="${title}"
          >
        </div>
        <div class="card-content">
          <h3 class="card-title">${title}</h3>
        </div>
      `;

      card.addEventListener("click", () => {
        window.location.href = `details.html?id=${item.id}&type=${mediaType}`;
      });

      trendingTrack.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading trending:", error);
  }
}


loadTrending();


/* ***************************************popular movies and tv shows carousel***************************************************************/


const popularTrack = document.getElementById("popularTrack");

async function loadPopular() {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${myAPIKey}`
    );

    const data = await response.json();

    popularTrack.innerHTML = "";

    data.results.forEach((item) => {
      if (!item.poster_path) return;

      const title = item.title;
      const mediaType = "movie";

      const card = document.createElement("div");
      card.classList.add("card");
      card.style.cursor = "pointer";

      card.innerHTML = `
        <div class="card-image">
          <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${title}">
        </div>
        <div class="card-content">
          <h3 class="card-title">${title}</h3>
        </div>
      `;

      card.addEventListener("click", () => {
        window.location.href = `details.html?id=${item.id}&type=${mediaType}`;
      });

      popularTrack.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading popular:", error);
  }
}

loadPopular();



/* ***************************************coming soon movies and tv shows carousel***************************************************************/


const comingSoonTrack = document.getElementById("comingSoonTrack");

async function loadComingSoon() {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/upcoming?api_key=${myAPIKey}`
    );

    const data = await response.json();

    comingSoonTrack.innerHTML = "";

    data.results.forEach((item) => {
      if (!item.poster_path) return;

      const title = item.title;
      const mediaType = "movie";

      const card = document.createElement("div");
      card.classList.add("card");
      card.style.cursor = "pointer";

      card.innerHTML = `
        <div class="card-image">
          <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${title}">
        </div>
        <div class="card-content">
          <h3 class="card-title">${title}</h3>
        </div>
      `;

      card.addEventListener("click", () => {
        window.location.href = `details.html?id=${item.id}&type=${mediaType}`;
      });

      comingSoonTrack.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading coming soon:", error);
  }
}
loadComingSoon();
/*************************Recently viewed************************* */

const recentlyViewedList = document.getElementById("recently-viewed-list");
const POSTER_URL = "https://image.tmdb.org/t/p/w500";

function getRecentlyViewed() {
  return JSON.parse(localStorage.getItem("recentlyViewed")) || [];
}

function renderRecentlyViewed() {
  if (!recentlyViewedList) return;

  const items = getRecentlyViewed();
  const recentSection = document.querySelector(".recent-section");

  if (!items.length) {
    if (recentSection) {
      recentSection.style.display = "none";
    }
    return;
  }

  if (recentSection) {
    recentSection.style.display = "block";
  }

  recentlyViewedList.innerHTML = items
    .slice(0, 6)
    .map((item) => {
      const poster = item.poster_path
        ? `${POSTER_URL}${item.poster_path}`
        : "https://via.placeholder.com/500x750?text=No+Image";

      const typeLabel = item.media_type === "tv" ? "TV Series" : "Movie";
      const year = item.year || "N/A";
      const rating = item.rating ? item.rating.toFixed(1) : "N/A";

      return `
        <article class="recent-card" onclick="openRecentDetails(${item.id}, '${item.media_type}')">
          <img src="${poster}" alt="${item.title}">

          <div class="recent-card-overlay">
            <div class="recent-card-body">
              <h3>${item.title}</h3>
              <div class="recent-card-meta">
                ${typeLabel} • ${year} • ★ ${rating}
              </div>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

}

function openRecentDetails(id, type) {
  window.location.href = `details.html?id=${id}&type=${type}`;
}

renderRecentlyViewed();


