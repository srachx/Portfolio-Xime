(() => {
  // === Ruta del PDF ===
  const COMIC_PDF_URL = "images/altair-comic.pdf";

  // === Nodos
  const section  = document.getElementById("altair-illustration");
  const pagesEl  = document.getElementById("comic-pages");
  const btnIn    = document.getElementById("comic-zoom-in");
  const btnOut   = document.getElementById("comic-zoom-out");
  const btnFit   = document.getElementById("comic-fit");

  if (!section || !pagesEl) return;

  // === Estado
  let pdf = null;
  let scaleBase = 1;         // escala base (ajuste al ancho)
  let uiScale   = 1;         // multiplicador de zoom del usuario
  const MIN_UI  = 0.6, MAX_UI = 2;

  // ---- Inicializar una sola vez cuando se abra la sección
  let initialized = false;
  const initOnce = () => { if (!initialized) { initialized = true; initComic(); } };

  // Si tu framework añade .active al abrir, usa esto:
  if (section.classList.contains("active")) initOnce();
  document
    .querySelector('.menu-item.subsection[data-section="altair-illustration"]')
    ?.addEventListener("click", () => requestAnimationFrame(initOnce), { once: true });

  // Fallback: inicia cuando entre al viewport
  new IntersectionObserver(es => es.forEach(e => e.isIntersecting && initOnce()), { threshold: 0.2 })
    .observe(section);

  async function initComic(){
    if (!window.pdfjsLib) {
      pagesEl.innerHTML = `<p style="color:#b00">No cargó PDF.js</p>`;
      return;
    }

    // Cargar documento
    try {
      pdf = await pdfjsLib.getDocument({ url: COMIC_PDF_URL }).promise;
    } catch (e) {
      console.error("No pude abrir el PDF:", e);
      pagesEl.innerHTML = `<p style="color:#b00">No pude cargar el PDF. Revisa la ruta: ${COMIC_PDF_URL}</p>`;
      return;
    }

    // Crear placeholders por página
    for (let p = 1; p <= pdf.numPages; p++){
      const holder = document.createElement("div");
      holder.className = "comic-page loading";
      const canvas = document.createElement("canvas");
      canvas.dataset.pageNumber = p;
      holder.appendChild(canvas);
      pagesEl.appendChild(holder);
    }

    // Fit inicial (espera a que el contenedor tenga ancho real)
    fitWhenReady(true);
    setupLazyRender();
    setupControls();

    // Refit al redimensionar
    new ResizeObserver(() => fitToWidth(false)).observe(pagesEl);
    window.addEventListener("resize", () => fitToWidth(false));
  }

  function setupControls(){
    btnIn ?.addEventListener("click", () => { uiScale = Math.min(MAX_UI, uiScale * 1.15); rerenderVisible(); });
    btnOut?.addEventListener("click", () => { uiScale = Math.max(MIN_UI, uiScale / 1.15); rerenderVisible(); });
    btnFit?.addEventListener("click", () => { fitWhenReady(true); });
  }

  // Espera a que el contenedor tenga tamaño y calcula scaleBase
  function fitWhenReady(setAsBase){
    const tryFit = () => {
      const w = pagesEl.clientWidth || section.clientWidth;
      if (!w || w < 50) { requestAnimationFrame(tryFit); return; }
      fitToWidth(setAsBase);
    };
    requestAnimationFrame(tryFit);
  }

  // Calcula scaleBase para que la página 1 entre al ancho del contenedor
  function fitToWidth(setAsBase){
    const sampleCanvas = pagesEl.querySelector("canvas");
    if (!sampleCanvas || !pdf) return;

    const maxW = pagesEl.clientWidth || sampleCanvas.parentElement.clientWidth || section.clientWidth;
    if (!maxW || maxW < 50) return;

    pdf.getPage(1).then(page => {
      const vp1 = page.getViewport({ scale: 1 });
      const s = maxW / vp1.width;
      if (setAsBase) uiScale = 1; // restablece zoom de usuario
      scaleBase = s;
      rerenderVisible(true);
    });
  }

  // Lazy render de páginas visibles
  function setupLazyRender(){
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          renderPage(parseInt(e.target.querySelector('canvas')?.dataset.pageNumber || "0", 10));
        }
      });
    }, { root: null, rootMargin: "200px 0px", threshold: 0.01 });

    pagesEl.querySelectorAll(".comic-page").forEach(card => io.observe(card));
  }

  function currentScale(){ return scaleBase * uiScale; }

  async function renderPage(pageNumber){
    if (!pdf || !pageNumber) return;
    const canvas = pagesEl.querySelector(`canvas[data-page-number="${pageNumber}"]`);
    const card   = canvas?.parentElement;
    if (!canvas) return;

    const targetScale = currentScale();
    if (canvas.dataset.renderedScale && Math.abs(parseFloat(canvas.dataset.renderedScale) - targetScale) < 0.02) return;

    const page = await pdf.getPage(pageNumber);
    const vp   = page.getViewport({ scale: targetScale });
    const ctx  = canvas.getContext("2d", { alpha: false });

    canvas.width  = Math.floor(vp.width);
    canvas.height = Math.floor(vp.height);

    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    canvas.dataset.renderedScale = String(targetScale);
    card?.classList.remove("loading");
  }

  // Rerender solo lo visible para hacerlo ágil
  function rerenderVisible(forceAll = false){
    const rect = pagesEl.getBoundingClientRect();
    pagesEl.querySelectorAll("canvas").forEach(c => {
      const r = c.getBoundingClientRect();
      const visible = forceAll || (r.bottom > rect.top - 300 && r.top < rect.bottom + 300);
      if (visible) renderPage(parseInt(c.dataset.pageNumber || "0", 10));
    });
  }
})();
