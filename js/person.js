
const API_KEY  = "233d663323afc329f230f615adeaeda0";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL  = "https://image.tmdb.org/t/p/w400";
const POSTER_URL = "https://image.tmdb.org/t/p/w300";
const FALLBACK_PROFILE = "https://placehold.co/400x600/1a1820/666?text=No+Photo";
const FALLBACK_POSTER  = "https://placehold.co/300x450/1a1820/666?text=No+Image";

const params = new URLSearchParams(window.location.search);
const personId = params.get("id");

const imgEl      = document.getElementById("person-img");
const nameEl     = document.getElementById("person-name");
const birthdayEl = document.getElementById("person-birthday");
const bioEl      = document.getElementById("person-bio");
const knownEl    = document.getElementById("known-list");

// ────────────────────────────────────────────────────────────
// MAIN FETCH
// ────────────────────────────────────────────────────────────
async function fetchPerson() {
  if (!personId) {
    showPersonError("No person ID provided.");
    return;
  }

  try {
    const res  = await fetch(`${BASE_URL}/person/${personId}?api_key=${API_KEY}`);
    if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
    const data = await res.json();

    renderPerson(data);
    fetchKnown(personId);
  } catch (err) {
    console.error(err);
    showPersonError("Could not load person details.");
  }
}

// ────────────────────────────────────────────────────────────
// RENDER PERSON
// ────────────────────────────────────────────────────────────
function renderPerson(data) {
  // Profile image — fixed: added onerror fallback
  if (imgEl) {
    imgEl.src     = data.profile_path ? `${IMAGE_URL}${data.profile_path}` : FALLBACK_PROFILE;
    imgEl.alt     = data.name || "Person";
    imgEl.loading = "lazy";
    imgEl.onerror = () => { imgEl.src = FALLBACK_PROFILE; };
  }

  // Name
  if (nameEl) nameEl.textContent = data.name || "Unknown";

  // Birthday + birthplace
  if (birthdayEl) {
    let info = "";
    if (data.birthday) {
      const age = data.deathday
        ? null
        : new Date().getFullYear() - new Date(data.birthday).getFullYear();
      info += `🎂 ${data.birthday}${age ? ` (${age} years old)` : ""}`;
    }
    if (data.place_of_birth) info += ` · 📍 ${data.place_of_birth}`;
    if (data.deathday)       info += ` · Died: ${data.deathday}`;
    birthdayEl.textContent = info || "Unknown";
  }

  // Biography — fixed: was hard-capped at 400 chars with no expand option
  if (bioEl) {
    const bio = data.biography?.trim();
    if (!bio) {
      bioEl.textContent = "No biography available.";
    } else if (bio.length <= 500) {
      bioEl.textContent = bio;
    } else {
      const short = bio.slice(0, 500);
      bioEl.innerHTML = `
        <span class="bio-short">${escapeHtml(short)}…</span>
        <span class="bio-full" style="display:none">${escapeHtml(bio)}</span>
        <button class="bio-toggle-btn" onclick="toggleBio(this)">Read more</button>
      `;
    }
  }
}

function toggleBio(btn) {
  const short = btn.parentElement.querySelector(".bio-short");
  const full  = btn.parentElement.querySelector(".bio-full");
  const expanded = full.style.display !== "none";
  short.style.display = expanded ? ""     : "none";
  full.style.display  = expanded ? "none" : "";
  btn.textContent     = expanded ? "Read more" : "Show less";
}

function escapeHtml(text) {
  if (text == null) return "";
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ────────────────────────────────────────────────────────────
// KNOWN FOR  (Bug fix: now fetches BOTH movie + TV credits)
// ────────────────────────────────────────────────────────────
async function fetchKnown(id) {
  if (!knownEl) return;
  knownEl.innerHTML = `<p class="reviews-placeholder">Loading credits…</p>`;

  try {
    // Fetch both movie and TV credits in parallel
    const [movieRes, tvRes] = await Promise.all([
      fetch(`${BASE_URL}/person/${id}/movie_credits?api_key=${API_KEY}`),
      fetch(`${BASE_URL}/person/${id}/tv_credits?api_key=${API_KEY}`)
    ]);

    const movieData = movieRes.ok ? await movieRes.json() : { cast: [] };
    const tvData    = tvRes.ok    ? await tvRes.json()    : { cast: [] };

    // Combine, tag, sort by popularity, deduplicate by id
    const movies = (movieData.cast || []).map(m => ({ ...m, media_type: "movie" }));
    const tv     = (tvData.cast    || []).map(t => ({ ...t, title: t.name, media_type: "tv" }));

    const seen = new Set();
    const combined = [...movies, ...tv]
      .filter(item => item.poster_path && !seen.has(item.id) && seen.add(item.id))
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 12);

    renderKnown(combined);
  } catch (err) {
    console.error(err);
    knownEl.innerHTML = `<p class="reviews-placeholder">Could not load credits.</p>`;
  }
}

function renderKnown(items) {
  if (!knownEl) return;

  if (!items.length) {
    knownEl.innerHTML = `
      <div class="empty-state">
        <span class="empty-state-icon">🎬</span>
        <p class="empty-state-msg">No known titles found.</p>
      </div>`;
    return;
  }

  knownEl.innerHTML = items.map(item => {
    const title  = escapeHtml(item.title || item.name || "Unknown");
    const poster = `${POSTER_URL}${item.poster_path}`;
    const type   = item.media_type === "tv" ? "TV Series" : "Movie";
    const year   = (item.release_date || item.first_air_date || "").slice(0, 4);

    return `
      <article class="similar-card"
               onclick="location.href='details.html?id=${item.id}&type=${item.media_type}'">
        <img src="${poster}" alt="${title}" loading="lazy"
             onerror="this.src='${FALLBACK_POSTER}'">
        <div class="similar-card-overlay">
          <div class="similar-card-body">
            <h3>${title}</h3>
            <div class="similar-meta">
              <span class="similar-year">${year}</span>
              <span class="similar-rating">${type}</span>
            </div>
          </div>
        </div>
      </article>`;
  }).join("");
}

function showPersonError(message) {
  if (nameEl)     nameEl.textContent     = "Person not found";
  if (birthdayEl) birthdayEl.textContent = "";
  if (bioEl)      bioEl.textContent      = message;
}

fetchPerson();
