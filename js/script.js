// MathJax config for SPA
window.MathJax = {
  tex: {inlineMath: [['$', '$'], ['\\(', '\\)']]}
};

document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('.nav-link');
  const mainContent = document.getElementById('main-content');

  // Load content into mainContent
  function loadPage(url) {
    fetch(url)
      .then(r => r.text())
      .then(html => {
        mainContent.innerHTML = html;

        // Bind abstract buttons again after replacing content
        attachAbstractToggles();

        // Re-render MathJax
        if (window.MathJax?.typesetPromise) {
          MathJax.typesetPromise([mainContent]);
        }
      })
      .catch(err => console.error("Load error:", err));
  }

  // Attach SPA navigation
  links.forEach(link => {
    link.addEventListener('click', e => {
      const url = link.getAttribute('href');

      if (url.endsWith(".pdf")) return; // allow PDF normally

      e.preventDefault();
      loadPage(url);
    });
  });

  // Toggle abstracts
  function attachAbstractToggles() {
    const btns = document.querySelectorAll('.toggle-button');
    btns.forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('onclick').match(/'(.*?)'/)?.[1];
        const p = document.getElementById(id);
        if (!p) return;

        p.style.display = p.style.display === "none" ? "block" : "none";

        // re-render math when shown
        if (p.style.display === 'block' && window.MathJax?.typesetPromise) {
          MathJax.typesetPromise([p]);
        }
      };
    });
  }

  // first run
  attachAbstractToggles();
});
