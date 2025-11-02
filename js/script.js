// script.js — оновлений, "robust" варіант

// Config MathJax (не перезаписує, якщо вже є)
window.MathJax = window.MathJax || {};
window.MathJax.tex = window.MathJax.tex || { inlineMath: [['$', '$'], ['\\(', '\\)']] };

// URL MathJax (змінити при потребі)
const MATHJAX_SRC = "https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js";

// Promise, який резолвиться коли MathJax готовий
let mathJaxReadyPromise = null;
function ensureMathJaxReady() {
  if (mathJaxReadyPromise) return mathJaxReadyPromise;

  mathJaxReadyPromise = new Promise((resolve, reject) => {
    // Якщо MathJax вже є і має typesetPromise — готово
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      console.log("[MJ] MathJax already present.");
      return resolve(window.MathJax);
    }

    // Якщо скрипт вже додано (але ще не ready) - перевіримо повітряно через інтервал
    const existingScript = Array.from(document.scripts).find(s => s.src && s.src.includes("mathjax"));
    if (existingScript) {
      console.log("[MJ] Found existing MathJax script tag; waiting for it to load...");
      existingScript.addEventListener('load', () => {
        console.log("[MJ] Existing script loaded.");
        waitForTypeset(resolve, reject);
      });
      existingScript.addEventListener('error', (e) => {
        console.error("[MJ] Existing MathJax script load error", e);
        reject(new Error("MathJax failed to load"));
      });
      return;
    }

    // Додаємо script в head
    const s = document.createElement('script');
    s.src = MATHJAX_SRC;
    s.async = true;
    s.onload = () => {
      console.log("[MJ] MathJax script loaded.");
      waitForTypeset(resolve, reject);
    };
    s.onerror = (e) => {
      console.error("[MJ] MathJax failed to load.", e);
      reject(new Error("MathJax load error"));
    };
    document.head.appendChild(s);
  });

  return mathJaxReadyPromise;
}

// чекатиме поки MathJax визначить typesetPromise (макс 5 с)
function waitForTypeset(resolve, reject) {
  const maxMs = 5000;
  const start = performance.now();
  (function poll() {
    if (window.MathJax && typeof window.MathJax.typesetPromise === 'function') {
      return resolve(window.MathJax);
    }
    if (performance.now() - start > maxMs) {
      console.warn("[MJ] typesetPromise not ready after timeout; attempting fallback.");
      // навіть без typesetPromise — в деяких збірках є MathJax.typeset
      if (window.MathJax && typeof window.MathJax.typeset === 'function') {
        return resolve(window.MathJax);
      }
      return reject(new Error("MathJax not ready"));
    }
    setTimeout(poll, 100);
  })();
}

// Виклик типсету на конкретному елементі
async function renderMathIn(element) {
  try {
    await ensureMathJaxReady();
    if (!element) {
      console.warn("[MJ] renderMathIn: element is falsy.");
      element = document.body;
    }
    if (typeof window.MathJax.typesetPromise === 'function') {
      // даємо вказівку рендерити тільки вставлений блок
      await window.MathJax.typesetPromise([element]);
      console.log("[MJ] typesetPromise completed for element", element);
    } else if (typeof window.MathJax.typeset === 'function') {
      window.MathJax.typeset([element]);
      console.log("[MJ] typeset fallback called for element", element);
    } else {
      console.warn("[MJ] No MathJax typeset function available.");
    }
  } catch (err) {
    console.error("[MJ] renderMathIn error:", err);
  }
}

// Безпечно вставляємо fetched HTML: беремо лише doc.body.innerHTML і видаляємо <script>
function safeInsertHTML(container, htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  // Видаляємо всі <script> з завантаженого документу (щоб не дублювати MathJax/інші скрипти)
  const scripts = doc.querySelectorAll('script');
  scripts.forEach(s => s.remove());

  // Також видаляємо повні <html>, <head>, <meta> з body (майже вже немає)
  // Вставляємо лише body.innerHTML
  container.innerHTML = doc.body ? doc.body.innerHTML : htmlString;
}

// Повторне прив'язування кнопок abstract
function rebindAbstractToggles() {
  const buttons = document.querySelectorAll('.toggle-button');
  buttons.forEach(btn => {
    // відв'язуємо старі
    btn.onclick = null;

    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      // Спробуємо взяти id з data-target або з onclick-рядка
      let target = btn.dataset.target || null;
      if (!target) {
        const onclickAttr = btn.getAttribute('onclick') || '';
        const m = onclickAttr.match(/'(.*?)'/);
        if (m) target = m[1];
      }
      if (!target) {
        // Якщо нема — шукати наступний <p class="abstract">
        const nextAbstract = btn.nextElementSibling;
        if (nextAbstract && nextAbstract.classList.contains('abstract')) {
          toggleParagraph(nextAbstract);
          return;
        }
        console.warn("[AB] toggle-button has no target.");
        return;
      }

      const p = document.getElementById(target);
      if (!p) {
        console.warn("[AB] target paragraph not found:", target);
        return;
      }
      toggleParagraph(p);
    });
  });
}

function toggleParagraph(p) {
  p.style.display = (p.style.display === "none" || getComputedStyle(p).display === "none") ? "block" : "none";
  // рендеримо формули всередині показаного абстракту
  if (p.style.display !== "none") {
    renderMathIn(p);
  }
}

// Main SPA behaviour
document.addEventListener('DOMContentLoaded', function () {
  console.log("[SPA] DOMContentLoaded — script.js running.");

  const mainContent = document.getElementById('main-content');
  if (!mainContent) {
    console.warn("[SPA] #main-content not found. Make sure your HTML has <div id='main-content'></div>");
  }

  // Делегуємо кліки по .nav-link (якщо таких немає — лог)
  const links = document.querySelectorAll('.nav-link');
  if (!links.length) console.warn("[SPA] No .nav-link elements found on the page.");

  links.forEach(link => {
    link.addEventListener('click', function (event) {
      // Дозволяємо PDF відкрити як зазвичай
      if (link.href && link.href.endsWith('cv.pdf')) return;

      event.preventDefault();
      const href = link.getAttribute('href') || link.href;
      if (!href) return console.warn("[SPA] link has no href");

      console.log("[SPA] fetching", href);
      fetch(href, { cache: "no-store" })
        .then(r => {
          if (!r.ok) throw new Error("HTTP " + r.status);
          return r.text();
        })
        .then(html => {
          if (!mainContent) {
            console.error("[SPA] mainContent missing; aborting insert.");
            return;
          }
          safeInsertHTML(mainContent, html);
          rebindAbstractToggles();

          // Рендерити формули у всьому mainContent (включно з inline)
          renderMathIn(mainContent);
        })
        .catch(err => {
          console.error("[SPA] fetch error:", err);
        });
    });
  });

  // Початкові прив'язки (якщо контент вже в mainContent)
  rebindAbstractToggles();
  // І відрендерити math у стартовому контенті, якщо є
  if (mainContent) renderMathIn(mainContent);
});
