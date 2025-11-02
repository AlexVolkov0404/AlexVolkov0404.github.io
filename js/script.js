document.addEventListener('DOMContentLoaded', function() {
  const links = document.querySelectorAll('.nav-link');
  const mainContent = document.getElementById('main-content');

  links.forEach(link => {
    link.addEventListener('click', function(event) {
      if (!link.href.endsWith('cv.pdf')) {
        event.preventDefault();

        fetch(link.href)
          .then(response => response.text())
          .then(html => {
            mainContent.innerHTML = html;

            // Re-render MathJax after content load
            if (window.MathJax) {
              MathJax.typesetPromise();
            }
          })
          .catch(error => console.error('Error fetching page:', error));
      }
    });
  });

  // ✅ Event delegation for Abstract toggles
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('toggle-button')) {
      const id = e.target.getAttribute('onclick').match(/'(.*?)'/)[1];
      const paragraph = document.getElementById(id);

      if (paragraph.style.display === "none" || paragraph.style.display === "") {
        paragraph.style.display = "block";
      } else {
        paragraph.style.display = "none";
      }
    }
  });
});
