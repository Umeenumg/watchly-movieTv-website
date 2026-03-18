const container = document.getElementById("watchlist-container");
const countEl = document.getElementById("watchlist-count");
const clearBtn = document.getElementById("clear-watchlist");

const POSTER_URL = "https://image.tmdb.org/t/p/w500";

function getWatchlist() {
  return JSON.parse(localStorage.getItem("watchlist")) || [];
}

function saveWatchlist(list) {
  localStorage.setItem("watchlist", JSON.stringify(list));
}

function removeFromWatchlist(id) {
  const list = getWatchlist().filter(item => item.id !== id);
  saveWatchlist(list);
  loadWatchlist();
}

function clearWatchlist() {
  localStorage.removeItem("watchlist");
  loadWatchlist();
}

function updateCount(list) {
  countEl.textContent = `${list.length} item(s)`;
}

function loadWatchlist() {
  const list = getWatchlist();

  updateCount(list);

  if (!list.length) {
    container.innerHTML = `
      <div class="watchlist-empty">
        <h2>Your watchlist is empty 🎬</h2>
        <p>Start adding movies to see them here.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(item => {
    const poster = item.poster
      ? POSTER_URL + item.poster
      : "";

    return `
      <div class="watchlist-item">

        <img class="watchlist-poster" src="${poster}">

        <div class="watchlist-info">
          <h2>${item.title}</h2>
          <p class="watchlist-type">${item.type === "tv" ? "TV Series" : "Movie"}</p>

          <div class="watchlist-actions">
            <button class="watchlist-open-btn"
              onclick="openDetails(${item.id}, '${item.type}')">
              View
            </button>

            <button class="watchlist-remove-btn"
              onclick="removeFromWatchlist(${item.id})">
              Remove
            </button>
          </div>
        </div>

      </div>
    `;
  }).join("");
}

function openDetails(id, type) {
  window.location.href = `details.html?id=${id}&type=${type}`;
}

clearBtn.addEventListener("click", clearWatchlist);

loadWatchlist();