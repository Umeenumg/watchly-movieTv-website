const searchInput = document.querySelector(".search-input");

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