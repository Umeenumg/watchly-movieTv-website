

const container  = document.getElementById("watchlist-container");
const countEl    = document.getElementById("watchlist-count");
const clearBtn   = document.getElementById("clear-watchlist");
const POSTER_URL = "https://image.tmdb.org/t/p/w500";
const FALLBACK   = "https://placehold.co/120x170/1a1820/666?text=?";

// ────────────────────────────────────────────────────────────
// STORAGE
// ────────────────────────────────────────────────────────────
function getWatchlist()      { return JSON.parse(localStorage.getItem("watchlist")) || []; }
function saveWatchlist(list) { localStorage.setItem("watchlist", JSON.stringify(list)); }

function removeFromWatchlist(id) {
  saveWatchlist(getWatchlist().filter(i => i.id !== id));
  loadWatchlist();
}

function clearWatchlist() {
  if (!getWatchlist().length) return;
  if (!confirm("Remove all items from your watchlist?")) return;
  localStorage.removeItem("watchlist");
  loadWatchlist();
}

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

// ────────────────────────────────────────────────────────────
// RENDER
// ────────────────────────────────────────────────────────────
function loadWatchlist() {
  const list = getWatchlist();

  if (countEl) countEl.textContent = `${list.length} item${list.length !== 1 ? "s" : ""}`;

  if (!list.length) {
    container.innerHTML = `
      <div class="watchlist-empty">
        <div style="font-size:3rem;margin-bottom:16px">🎬</div>
        <h2>Your watchlist is empty</h2>
        <p>Browse movies and series and hit <strong>Add to Watchlist</strong> to save them here.</p>
      </div>`;
    return;
  }

  container.innerHTML = list.map(item => {
    const poster    = item.poster ? `${POSTER_URL}${item.poster}` : FALLBACK;
    const title     = escapeHtml(item.title || "Unknown title");
    const typeLabel = item.type === "tv" ? "TV Series" : "Movie";

    return `
      <div class="watchlist-item">
        <img class="watchlist-poster" src="${poster}" alt="${title}" loading="lazy"
             onerror="this.src='${FALLBACK}'">
        <div class="watchlist-info">
          <h2>${title}</h2>
          <p class="watchlist-type">${typeLabel}</p>
          <div class="watchlist-actions">
            <button class="watchlist-open-btn"
                    onclick="openDetails(${item.id}, '${item.type}')">
              View Details
            </button>
            <button class="watchlist-remove-btn"
                    onclick="removeFromWatchlist(${item.id})">
              Remove
            </button>
          </div>
        </div>
      </div>`;
  }).join("");
}

function openDetails(id, type) {
  window.location.href = `details.html?id=${id}&type=${type}`;
}

// ────────────────────────────────────────────────────────────
// INIT
// ────────────────────────────────────────────────────────────
clearBtn?.addEventListener("click", clearWatchlist);
loadWatchlist();
