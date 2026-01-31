



// function  to fetch (search ) movie details from API
 const getMovieDetails = async (query) => {
    const myAPIKey = "233d663323afc329f230f615adeaeda0";
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${myAPIKey}&query=${encodeURIComponent(query)}`;
    try{
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log(data);
    }
    catch (error)
    {
      console.error("There has been a problem with your fetch operation:", error);
    }
  }

// addevent listener to search press enter key
const searchInput = document.getElementById("searchInput"); 
  
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query !== '') {
      console.log(`Searching for: ${query}`);
      getMovieDetails(query);
    }

  }
})
