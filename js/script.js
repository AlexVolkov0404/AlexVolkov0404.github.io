document.addEventListener('DOMContentLoaded', function () {
  const links = document.querySelectorAll('.nav-link');
  const mainContent = document.getElementById('main-content');

  // Load pages with fetch (SPA effect)
  links.forEach(link => {
    link.addEventListener('click', function (event) {
      if (!link.href.endsWith('cv.pdf')) {
        event.preventDefault();

        fetch(link.href)
          .then(response => response.text())
          .then(html => {
            mainContent.innerHTML = html;

            // Re-render MathJax
            if (window.MathJax) {
              MathJax.typesetPromise();
            }
          });
      }
    });
  });

  // ✅ Toggle abstracts via event delegation
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('toggle-button')) {
      const id = e.target.dataset.target;
      const paragraph = document.getElementById(id);

      if (paragraph) {
        paragraph.style.display = (paragraph.style.display === 'block') ? 'none' : 'block';
      }
    }
  });
});
