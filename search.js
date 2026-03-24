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
