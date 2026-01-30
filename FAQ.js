document.addEventListener("DOMContentLoaded", () => {
  const questions = document.querySelectorAll(".faq-question");

  questions.forEach((question) => {
    question.addEventListener("click", () => {
      const answer = question.nextElementSibling;

      // Close other answers (optional)
      document.querySelectorAll(".faq-answer").forEach((item) => {
        if (item !== answer) {
          item.style.maxHeight = null;
          item.classList.remove("open");
        }
      });

      // Toggle current answer
      if (answer.classList.contains("open")) {
        answer.style.maxHeight = null;
        answer.classList.remove("open");
      } else {
        answer.style.maxHeight = answer.scrollHeight + "px";
        answer.classList.add("open");
      }
    });
  });
});
// stars rating 


// Étoiles interactives
document.querySelectorAll('.rating.interactive .stars').forEach(starsContainer => {
  const stars = starsContainer.querySelectorAll('.star');
  const ratingValue = starsContainer.nextElementSibling;
  let currentRating = 0;
  
  stars.forEach(star => {
    star.addEventListener('click', function() {
      const value = parseInt(this.dataset.value);
      currentRating = value;
      updateStars(stars, value);
      updateRatingValue(ratingValue, value);
      
      // Ici vous pouvez envoyer la note au serveur
      console.log(`Note donnée: ${value}/5`);
    });
    
    star.addEventListener('mouseover', function() {
      const value = parseInt(this.dataset.value);
      highlightStars(stars, value);
    });
    
    star.addEventListener('mouseout', function() {
      updateStars(stars, currentRating);
    });
  });
  
  function updateStars(stars, rating) {
    stars.forEach(star => {
      const starValue = parseInt(star.dataset.value);
      if (starValue <= rating) {
        star.classList.add('active');
        star.textContent = '★';
      } else {
        star.classList.remove('active');
        star.textContent = '☆';
      }
    });
  }
  
  function highlightStars(stars, rating) {
    stars.forEach(star => {
      const starValue = parseInt(star.dataset.value);
      if (starValue <= rating) {
        star.style.color = 'gold';
      } else {
        star.style.color = '#555';
      }
    });
  }
  
  function updateRatingValue(element, rating) {
    if (rating > 0) {
      element.textContent = `${rating}/5`;
      element.style.color = 'gold';
    } else {
      element.textContent = 'Rate this';
      element.style.color = 'white';
    }
  }
});
