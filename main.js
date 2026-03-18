
 const myAPIKey = "233d663323afc329f230f615adeaeda0";


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
    console.log(data.results);

    trendingTrack.innerHTML = "";

    data.results.forEach((item) => {
      if (!item.poster_path) return;

      const title = item.title || item.name;
      const mediaType = item.media_type;

      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <div class="card-image">
          <img 
            src="https://image.tmdb.org/t/p/w500${item.poster_path}" 
            alt="${title}"
          >
        </div>
        <div class="card-content">
          <a href="details.html?id=${item.id}&type=${mediaType}" class="card-title">
            ${title}
          </a>
        </div>
      `;

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

      card.innerHTML = `
        <div class="card-image">
          <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${title}">
        </div>
        <div class="card-content">
          <a href="details.html?id=${item.id}&type=${mediaType}" class="card-title">
            ${title}
          </a>
        </div>
      `;

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

      card.innerHTML = `
        <div class="card-image">
          <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" alt="${title}">
        </div>
        <div class="card-content">
          <a href="details.html?id=${item.id}&type=${mediaType}" class="card-title">
            ${title}
          </a>
        </div>
      `;

      comingSoonTrack.appendChild(card);
    });
  } catch (error) {
    console.error("Error loading coming soon:", error);
  }
}

loadComingSoon();

