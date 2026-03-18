

const API_KEY = "233d663323afc329f230f615adeaeda0";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/original";
const POSTER_URL = "https://image.tmdb.org/t/p/w500";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const imgEl = document.getElementById("person-img");
const nameEl = document.getElementById("person-name");
const birthdayEl = document.getElementById("person-birthday");
const bioEl = document.getElementById("person-bio");
const knownEl = document.getElementById("known-list");

async function fetchPerson() {
  try {
    const res = await fetch(`${BASE_URL}/person/${id}?api_key=${API_KEY}`);
    const data = await res.json();

    renderPerson(data);

    fetchKnown(id);

  } catch (err) {
    console.error(err);
  }
}

function renderPerson(data) {
  imgEl.src = data.profile_path
    ? IMAGE_URL + data.profile_path
    : "";

  nameEl.textContent = data.name;
  birthdayEl.textContent = data.birthday || "Unknown";

  bioEl.textContent = data.biography
    ? data.biography.slice(0, 400) + "..."
    : "No biography available.";
}


// ----------------------------
// KNOWN FOR
// ----------------------------
async function fetchKnown(id) {
  const res = await fetch(`${BASE_URL}/person/${id}/movie_credits?api_key=${API_KEY}`);
  const data = await res.json();

  renderKnown(data.cast);
}

function renderKnown(movies) {
  knownEl.innerHTML = movies
    .slice(0, 10)
    .map(m => {

      const poster = m.poster_path
        ? POSTER_URL + m.poster_path
        : "";

      return `
        <div class="similar-card"
             onclick="location.href='details.html?id=${m.id}&type=movie'">

          <img src="${poster}">

          <div class="similar-card-overlay">
            <div class="similar-card-body">
              <h3>${m.title}</h3>
            </div>
          </div>

        </div>
      `;
    })
    .join("");
}

fetchPerson();