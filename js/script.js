document.addEventListener('DOMContentLoaded', function() {
  const links = document.querySelectorAll('.nav-link');
  const mainContent = document.getElementById('main-content');

  links.forEach(link => {
    link.addEventListener('click', function(event) {
      console.log(link)

      if (!link.href.endsWith('cv.pdf')) {
        event.preventDefault();

        fetch(link.href)
          .then(response => response.text())
          .then(html => {
            mainContent.innerHTML = html;

            // ✅ ensure abstract buttons in loaded page work
            attachAbstractButtons();

            // ✅ render MathJax in whole loaded content
            if (window.MathJax?.typesetPromise) {
              MathJax.typesetPromise([mainContent]);
            }
          })
          .catch(error => console.error('Error fetching page:', error));
      }
    });
  });

  // initial bind
  attachAbstractButtons();
});

// ✅ re-bind buttons after loading content
function attachAbstractButtons() {
  const buttons = document.querySelectorAll('.toggle-button');

  buttons.forEach(btn => {
    btn.addEventListener('click', function() {
      const id = btn.getAttribute("onclick")?.match(/'(.*?)'/)?.[1] 
                 || btn.dataset.target;

      if (!id) return;

      const p = document.getElementById(id);
      if (!p) return;

      // toggle
      if (p.style.display === "none" || p.style.display === "") {
        p.style.display = "block";

        // ✅ Render MathJax ONLY when opening abstract
        if (window.MathJax?.typesetPromise) {
          MathJax.typesetPromise([p]);
        }
      } else {
        p.style.display = "none";
      }
    });
  });
}

// ✅ Legacy call — still used by your HTML, leave it
function showAbstract(id) {
  const p = document.getElementById(id);

  if (!p) return;

  if (p.style.display === "none" || p.style.display === "") {
    p.style.display = "block";
    if (window.MathJax?.typesetPromise) {
      MathJax.typesetPromise([p]);
    }
  } else {
    p.style.display = "none";
  }
}
