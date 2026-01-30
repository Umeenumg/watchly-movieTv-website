document.addEventListener("DOMContentLoaded", () => {

  console.log("JS loaded");

  const searchInput = document.querySelector(".search-input");
  console.log(searchInput);

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      console.log("User dreb Enter");
    }
  });

});
