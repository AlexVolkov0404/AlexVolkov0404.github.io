// MathJax config (still needed here for SPA)
window.MathJax = {
  tex: { inlineMath: [['$', '$'], ['\\(', '\\)']] }
};

// Function to re-render MathJax after content loads
function renderMath() {
  if (window.MathJax?.typesetPromise) {
    MathJax.typesetPromise();
  }
}

// When page is ready
document.addEventListener('DOMContentLoaded', function () {
  const links = document.querySelectorAll('.nav-link');
  const mainContent = document.getElementById('main-content');

  links.forEach(link => {
    link.addEventListener('click', function (event) {
      // Allow CV PDF to open normally
      if (link.href.endsWith('cv.pdf')) return;

      event.preventDefault();

      fetch(link.href)
        .then(response => response.text())
        .then(html => {
          // Parse HTML file
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");

          // Insert ONLY body content, not full document
          mainContent.innerHTML = doc.body.innerHTML;

          // Re-enable abstract buttons (content was replaced!)
          rebindAbstractToggles();

          // Re-render MathJax
          renderMath();
        })
        .catch(error => console.error('Error fetching page:', error));
    });
  });

  // Bind toggles on first load
  rebindAbstractToggles();
});

// Handle abstract toggle buttons
function rebindAbstractToggles() {
  const buttons = document.querySelectorAll('.toggle-button');
  buttons.forEach(btn => {
    btn.onclick = function () {
      const id = this.getAttribute('onclick').match(/'(.*?)'/)?.[1] || 
                 this.dataset.target || null;
      if (!id) return;

      const paragraph = document.getElementById(id);
      if (!paragraph) return;

      paragraph.style.display = (paragraph.style.display === "none" ? "block" : "none");

      // re-render math when showing abstract
      renderMath();
    };
  });
}
