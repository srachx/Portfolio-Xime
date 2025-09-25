// comic.js
(() => {
  // ====== Detecta la carpeta "images/" a partir de tu viñeta que ya carga ======
  function assetsBaseFrom(selector) {
    const img = document.querySelector(selector);
    if (!img) return "images/"; // fallback
    const url = new URL(img.getAttribute("src"), window.location.href);
    return url.href.replace(/[^/]+$/, ""); // carpeta terminada en /
  }

  // ====== Nodos ======
  const section = document.getElementById("altair-illustration");
  const pagesEl = document.getElementById("comic-pages");
  const btnIn   = document.getElementById("comic-zoom-in");
  const btnOut  = document.getElementById("comic-zoom-out");
  const btnFit  = document.getElementById("comic-fit");
  if (!section || !pagesEl) return;

  // ====== Rutas ======
  // Rutas (usa siempre la carpeta /images relativa a la página actual)
  const ASSET_BASE     = new URL('./images/', location.href).href;
  const COMIC_PDF_URL  = new URL('CartasaAltair.pdf?v=2', ASSET_BASE).href; // respeta mayúsculas


  // ====== PDF.js worker ======
  // No incluyas el worker <script> aparte; lo cargamos con esta línea:
  if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js";
  }

  // ====== Estado ======
  let pdf = null;
  let scaleBase = 1;     // ajusta al ancho del contenedor
  let uiScale   = 1;     // zoom del usuario
  const MIN_UI  = 0.6, MAX_UI = 2;

  // ====== Init una sola vez al abrir la sección ======
  let initialized = false;
  const initOnce = () => { if (!initialized) { initialized = true; initComic(); } };

  if (section.classList.contains("active")) initOnce();
  document.querySelector('.menu-item.subsection[data-section="altair-illustration"]')
    ?.addEventListener("click", () => requestAnimationFrame(initOnce), { once: true });
  new IntersectionObserver(es => es.forEach(e => e.isIntersecting && initOnce()), { threshold: 0.2 })
    .observe(section);

  async function initComic() {
    if (!window.pdfjsLib) {
      showError("No cargó PDF.js.");
      return;
    }

    // Aviso si estás usando file:// (bloquea XHR/fetch en muchos navegadores)
    if (location.protocol === "file:") {
      console.warn("[comic] Estás en file:// — usa Live Server o http.server");
    }

    // Carga el PDF
    try {
      pdf = await pdfjsLib.getDocument({ url: COMIC_PDF_URL }).promise;
    } catch (e) {
    console.error("[comic] No pude abrir el PDF:", e);
    const msg = (location.protocol === "file:")
      ? `No pude cargar el PDF. Revisa la ruta: ${COMIC_PDF_URL}
        Sugerencia: abre con Live Server o http://localhost/ en vez de file://.`
      : ""; // en http/https NO mostramos texto rojo
    showFallbackObject(msg);
    return;
    }

    // Placeholders de páginas
    for (let p = 1; p <= pdf.numPages; p++) {
      const card = document.createElement("div");
      card.className = "comic-page loading";
      const canvas = document.createElement("canvas");
      canvas.dataset.pageNumber = p;
      card.appendChild(canvas);
      pagesEl.appendChild(card);
    }

    // Fit inicial cuando el contenedor tenga ancho real
    fitWhenReady(true);
    setupLazyRender();
    setupControls();

    // Refit al cambio de tamaño
    new ResizeObserver(() => fitToWidth(false)).observe(pagesEl);
    window.addEventListener("resize", () => fitToWidth(false));
  }

  function setupControls() {
    btnIn ?.addEventListener("click", () => { uiScale = Math.min(MAX_UI, uiScale * 1.15); rerenderVisible(); });
    btnOut?.addEventListener("click", () => { uiScale = Math.max(MIN_UI, uiScale / 1.15); rerenderVisible(); });
    btnFit?.addEventListener("click", () => { fitWhenReady(true); });
  }

  // Espera a que el contenedor tenga tamaño antes de calcular el fit
  function fitWhenReady(setAsBase) {
    const tryFit = () => {
      const w = pagesEl.clientWidth || section.clientWidth;
      if (!w || w < 50) { requestAnimationFrame(tryFit); return; }
      fitToWidth(setAsBase);
    };
    requestAnimationFrame(tryFit);
  }

  // Calcula la escala base para que la página 1 ajuste al ancho
  function fitToWidth(setAsBase) {
    const sampleCanvas = pagesEl.querySelector("canvas");
    if (!sampleCanvas || !pdf) return;

    const maxW = pagesEl.clientWidth || sampleCanvas.parentElement.clientWidth || section.clientWidth;
    if (!maxW || maxW < 50) return;

    pdf.getPage(1).then(page => {
      const vp1 = page.getViewport({ scale: 1 });
      const s = maxW / vp1.width;
      if (setAsBase) uiScale = 1;
      scaleBase = s;
      rerenderVisible(true);
    });
  }

  // Lazy render de páginas visibles
  function setupLazyRender() {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const canvas = e.target.querySelector("canvas");
          if (canvas) renderPage(parseInt(canvas.dataset.pageNumber || "0", 10));
        }
      });
    }, { root: null, rootMargin: "200px 0px", threshold: 0.01 });

    pagesEl.querySelectorAll(".comic-page").forEach(card => io.observe(card));
  }

  function currentScale() { return scaleBase * uiScale; }

  async function renderPage(pageNumber) {
    if (!pdf || !pageNumber) return;
    const canvas = pagesEl.querySelector(`canvas[data-page-number="${pageNumber}"]`);
    const card   = canvas?.parentElement;
    if (!canvas) return;

  // Escala objetivo (ancho del contenedor × zoom del usuario)
  const targetScale = currentScale();
  // Evita rerender casi idéntico
  if (canvas.dataset.renderedScale && Math.abs(parseFloat(canvas.dataset.renderedScale) - targetScale) < 0.02) return;

  const page = await pdf.getPage(pageNumber);

  // === Soporte HiDPI (retina) ===
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // tope 2x para no matar GPU/CPU
  const vpCss = page.getViewport({ scale: targetScale });        // tamaño en CSS
  const vpDev = page.getViewport({ scale: targetScale * dpr });  // tamaño real de bitmap

  // Asigna tamaño real del canvas y tamaño “CSS”
  canvas.width  = Math.floor(vpDev.width);
  canvas.height = Math.floor(vpDev.height);
  canvas.style.width  = Math.floor(vpCss.width) + "px";
  canvas.style.height = Math.floor(vpCss.height) + "px";

  const ctx = canvas.getContext("2d", { alpha: false });

  await page.render({ canvasContext: ctx, viewport: vpDev }).promise;
  canvas.dataset.renderedScale = String(targetScale);
  card?.classList.remove("loading");
  }

  // Rerender solo lo visible para performance
  function rerenderVisible(forceAll = false) {
    const rect = pagesEl.getBoundingClientRect();
    pagesEl.querySelectorAll("canvas").forEach(c => {
      const r = c.getBoundingClientRect();
      const visible = forceAll || (r.bottom > rect.top - 300 && r.top < rect.bottom + 300);
      if (visible) renderPage(parseInt(c.dataset.pageNumber || "0", 10));
    });
  }

  // --- Fallbacks UI ---
  function showError(msg) {
    pagesEl.innerHTML = `<p style="color:#b00">${msg}</p>`;
  }
  function showFallbackObject(msg) {
    pagesEl.innerHTML = `
      <p style="color:#b00;margin-bottom:8px">${msg}</p>
      <object data="${COMIC_PDF_URL}" type="application/pdf" width="100%" height="800">
        <p>No se pudo mostrar el PDF aquí. <a href="${COMIC_PDF_URL}" target="_blank" rel="noopener">Ábrelo en otra pestaña</a>.</p>
      </object>`;
  }
  
  console.log("[comic] PDF URL =>", COMIC_PDF_URL);

})();

