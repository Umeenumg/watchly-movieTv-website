function goToDetails(id, type) {
  window.location.href = `details.html?id=${id}&type=${type}`;
}
/*🧠 Step 3 — In details.html

You need to read that id from URL.

Add this in your details.js:*/

const params = new URLSearchParams(window.location.search);
const id = params.get("id");
const type = params.get("type");



fetch(`https://api.themoviedb.org/3/${type}/${id}?api_key=YOUR_KEY`)
  .then(res => res.json())
  .then(data => {
    console.log(data);
    // display details here
  });


  card.addEventListener("click", () => {
  window.location.href = `details.html?id=${item.id}&type=${item.media_type}`;
});

const response = await fetch(
  `https://api.themoviedb.org/3/${type}/${id}?api_key=YOUR_KEY`
);




function createCard(item) {
  const card = document.createElement("div");
  card.classList.add("card");

  const title = item.title || item.name;
  const mediaType = item.media_type || "movie"; // if from movie endpoint

  card.innerHTML = `
    <img src="https://image.tmdb.org/t/p/w500${item.poster_path}" />
    <h3>${title}</h3>
  `;

  card.addEventListener("click", () => {
    window.location.href = `details.html?id=${item.id}&type=${mediaType}`;
  });

  return card;
}





function addToWatchlist() {
  const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

  const newItem = { id, type };

  const exists = watchlist.some(item => item.id === id && item.type === type);

  if (!exists) {
    watchlist.push(newItem);
    localStorage.setItem("watchlist", JSON.stringify(watchlist));
    alert("Added to watchlist!");
  }
}
const watchlist = JSON.parse(localStorage.getItem("watchlist")) || [];

watchlist.forEach(async item => {
  const res = await fetch(
    `https://api.themoviedb.org/3/${item.type}/${item.id}?api_key=YOUR_API_KEY`
  );
  const data = await res.json();
  displayWatchlistItem(data);
});


async function fetchTrailer() {
  const res = await fetch(
    `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=YOUR_KEY`
  );
  const data = await res.json();

  const trailer = data.results.find(
    video => video.type === "Trailer" && video.site === "YouTube"
  );

  if (trailer) {
    createTrailerButton(trailer.key);
  }
}
