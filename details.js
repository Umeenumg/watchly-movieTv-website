const API_KEY =  "233d663323afc329f230f615adeaeda0";
const IMG = "https://image.tmdb.org/t/p/w500";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const type = params.get("type");

async function loadDetails() {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}?api_key=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    displayDetails(data);
  } catch (error) {
    console.error("Details error:", error);
  }
}

function displayDetails(data) {
  const title = data.title || data.name || "Untitled";
  const year = (data.release_date || data.first_air_date || "").split("-")[0] || "N/A";

  document.getElementById("detailsPoster").src = data.poster_path
    ? `${IMG}${data.poster_path}`
    : "";

  document.getElementById("detailsTitle").textContent = title;
  document.getElementById("detailsYear").textContent = year;
  document.getElementById("detailsType").textContent = type === "movie" ? "Movie" : "TV Series";
  document.getElementById("detailsLanguage").textContent = data.original_language || "N/A";
  document.getElementById("detailsRating").textContent = data.vote_average
    ? data.vote_average.toFixed(1)
    : "N/A";
  document.getElementById("detailsStatus").textContent = data.status || "N/A";
  document.getElementById("detailsTagline").textContent = data.tagline || "";
  document.getElementById("detailsOverview").textContent = data.overview || "No overview available.";

  const extra =
    type === "movie"
      ? `${data.runtime || "N/A"} min`
      : `${data.number_of_seasons || 0} season(s), ${data.number_of_episodes || 0} episodes`;

  document.getElementById("detailsExtra").textContent = extra;

  const genresContainer = document.getElementById("detailsGenres");
  genresContainer.innerHTML = "";
  if (data.backdrop_path) {
  document.querySelector(".details-hero").style.backgroundImage =
    `linear-gradient(to top, rgba(6,3,4,0.9), rgba(6,3,4,0.4)),
     url(https://image.tmdb.org/t/p/original${data.backdrop_path})`;
}

  if (data.genres && data.genres.length > 0) {
    data.genres.forEach((genre) => {
      const span = document.createElement("span");
      span.className = "badge bg-secondary";
      span.textContent = genre.name;
      genresContainer.appendChild(span);
    });
  }
}

if (id && type) {
  loadDetails();
}