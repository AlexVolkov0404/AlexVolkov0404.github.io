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

            // ДОДАНО: перерендер latex
            if (window.MathJax) {
              MathJax.typesetPromise();
            }
          })
          .catch(error => console.error('Error fetching page:', error));
      }
    });
  });
});
