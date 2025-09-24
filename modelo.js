
// modelo.js
(() => {
  // ====== Config ======
  // 🔧 Cambia esto en modelo.js
const ASSET_BASE = "images/";
const EXTERNAL_SVG_URL = ASSET_BASE + "mapa-externo.svg";
const INTERNAL_MAP_BY_ID = {
  "1": ASSET_BASE + "mapa-int-1piso.svg",
  "2": ASSET_BASE + "mapa-int-2piso.svg",
  "3": ASSET_BASE + "mapa-int-3piso.svg",
  "101": ASSET_BASE + "mapa-int-1piso.svg",
  "102": ASSET_BASE + "mapa-int-2piso.svg",
  "103": ASSET_BASE + "mapa-int-3piso.svg",
};

  let MIN_SCALE = 1;          // se recalcula con "Ajustar"
  const MAX_SCALE = 5;

  // ====== Nodos ======
  const section   = document.getElementById("modelo-dig");
  const svg       = document.getElementById("mapa-svg");
  const content   = document.getElementById("mapa-content");
  const btnIn     = document.getElementById("zoom-in");
  const btnOut    = document.getElementById("zoom-out");
  const btnFit    = document.getElementById("fit");
  const btnReset  = document.getElementById("reset");
  const modal     = document.getElementById("mapa-modal");
  const modalImg  = document.getElementById("modal-img");
  const modalId   = document.getElementById("modal-id");
  const modalClose= document.getElementById("modal-close");

  if (!section || !svg || !content) return;

  let initialized = false;
  function initOnce() {
    if (initialized) return;
    initialized = true;
    initMap();
  }

  // ① Inicializa si la sección ya está activa al cargar
  if (section.classList.contains("active")) initOnce();

  // ② Inicializa al abrir “Digital” desde el menú lateral
  const digitalBtn = document.querySelector('.menu-item.subsection[data-section="modelo-dig"]');
  if (digitalBtn) {
    digitalBtn.addEventListener("click", () => {
      // dale un frame para que la sección aplique .active
      requestAnimationFrame(initOnce);
    }, { once: true });
  }

  // ③ Extra: observamos cuándo la sección entra en viewport (fallback)
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) initOnce(); });
  }, { threshold: 0.2 });
  io.observe(section);

  // ====== Lógica del mapa ======
  let scale = 1, translate = { x: 0, y: 0 }, isPanning = false;
  let panStart = { x: 0, y: 0 }, lastTranslate = { x: 0, y: 0 };
  const pointers = new Map();
  let pinchPrevDist = null;

  function applyTransform() {
    content.setAttribute("transform", `translate(${translate.x}, ${translate.y}) scale(${scale})`);
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  let fittedOnce = false;

  function fitToContainer(setAsMin = false) {
    const bbox = content.getBBox?.();
    if (!bbox) return;
    const padding = 24;
    const rect = svg.getBoundingClientRect();
    const cw = rect.width - padding * 2;
    const ch = rect.height - padding * 2;
    const s = Math.min(cw / bbox.width, ch / bbox.height);
    const tx = padding + (cw - bbox.width * s) / 2 - bbox.x * s;
    const ty = padding + (ch - bbox.height * s) / 2 - bbox.y * s;

    scale = clamp(s, MIN_SCALE, MAX_SCALE);
    translate = { x: tx, y: ty };
    lastTranslate = { ...translate };
    if (setAsMin) MIN_SCALE = scale; // ← este “fit” será tu zoom-out mínimo
    applyTransform();
  }

  function initMap() {
    // Carga del SVG externo inline (reemplaza TODO tu fetch por esto)
      fetch(EXTERNAL_SVG_URL)
        .then(r => {
          if (!r.ok) throw new Error("No se encontró " + EXTERNAL_SVG_URL);
          return r.text();
        })
        .then(text => {
          const doc  = new DOMParser().parseFromString(text, "image/svg+xml");
          const root = doc.querySelector("svg");
          content.innerHTML = "";

          if (root) {
            // 1) Pasa el viewBox del SVG original a TU <svg id="mapa-svg">
            const vb = root.getAttribute("viewBox");
            if (vb) svg.setAttribute("viewBox", vb);

            // 2) Mueve <style> al <svg> contenedor (no dejarlos dentro del <g>)
            const styles = root.querySelectorAll("style");
            styles.forEach(s => svg.appendChild(document.importNode(s, true)));

            // 3) Copia el resto de nodos hijos (salta los <style> que ya movimos)
            Array.from(root.childNodes).forEach(node => {
              if (node.nodeName.toLowerCase() === "style") return;
              content.appendChild(document.importNode(node, true));
            });
          } else {
            // fallback si viniera sin <svg> raíz
            content.innerHTML = text;
          }

          // Ajusta cuando ya está en DOM
          fitWhenReady(true);

        })
        .catch(err => {
          console.error("[map] error cargando:", err);
          alert("No se pudo cargar 'images/mapa-externo.svg'. Revisa ruta/archivo.");
        });

    // Wheel zoom
    svg.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      const delta = -Math.sign(e.deltaY) * 0.1;
      const newScale = clamp(scale * (1 + delta), MIN_SCALE, MAX_SCALE);
      const k = newScale / scale;
      translate = { x: mx - k * (mx - translate.x), y: my - k * (my - translate.y) };
      scale = newScale; lastTranslate = { ...translate }; applyTransform();
    }, { passive: false });

    // Pan + pinch
    svg.addEventListener("pointerdown", (e) => {
      svg.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 1) { isPanning = true; panStart = { x: e.clientX, y: e.clientY }; }
    });
    svg.addEventListener("pointermove", (e) => {
      if (!pointers.has(e.pointerId)) return;
      const prev = pointers.get(e.pointerId), curr = { x: e.clientX, y: e.clientY };
      pointers.set(e.pointerId, curr);
      if (pointers.size === 1 && isPanning) {
        translate = { x: lastTranslate.x + (curr.x - panStart.x), y: lastTranslate.y + (curr.y - panStart.y) };
        applyTransform();
      }
      if (pointers.size === 2) {
        const [a, b] = Array.from(pointers.values());
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const rect = svg.getBoundingClientRect();
        const cx = (a.x + b.x) / 2 - rect.left, cy = (a.y + b.y) / 2 - rect.top;
        if (pinchPrevDist != null && dist > 0) {
          const k = dist / pinchPrevDist;
          const newScale = clamp(scale * k, MIN_SCALE, MAX_SCALE);
          const ratio = newScale / scale;
          translate = { x: cx - ratio * (cx - translate.x), y: cy - ratio * (cy - translate.y) };
          scale = newScale; lastTranslate = { ...translate }; applyTransform();
        }
        pinchPrevDist = dist;
      } else { pinchPrevDist = null; }
    });
    function endPan(e){ try { svg.releasePointerCapture(e.pointerId); } catch {} pointers.delete(e.pointerId);
      if (pointers.size === 0) { isPanning = false; lastTranslate = { ...translate }; } }
    svg.addEventListener("pointerup", endPan);
    svg.addEventListener("pointercancel", endPan);

    // Controles
    function zoomBy(factor){
      const rect = svg.getBoundingClientRect();
      const cx = rect.width / 2, cy = rect.height / 2;
      const newScale = clamp(scale * factor, MIN_SCALE, MAX_SCALE);
      const k = newScale / scale;
      translate = { x: cx - k * (cx - translate.x), y: cy - k * (cy - translate.y) };
      scale = newScale; lastTranslate = { ...translate }; applyTransform();
    }
    btnIn?.addEventListener("click", () => zoomBy(1.15));
    btnOut?.addEventListener("click", () => zoomBy(1/1.15));
    btnFit?.addEventListener("click", () => fitToContainer(true));
    btnReset?.addEventListener("click", () => fitToContainer(true));

    // Hotspots -> modal
    svg.addEventListener("click", (e) => {
      const node = e.target.closest("[data-id]");
      if (!node) return;
      const id = node.getAttribute("data-id");
      const src = INTERNAL_MAP_BY_ID[id];
      if (!src) { alert(`No hay plano interno para el id: ${id}`); return; }
      modalImg.src = src; modalId.textContent = id; modal.setAttribute("aria-hidden", "false");
    });
    modalClose?.addEventListener("click", () => { modal.setAttribute("aria-hidden", "true"); modalImg.src = ""; });
    modal?.addEventListener("click", (e) => { if (e.target === modal) { modal.setAttribute("aria-hidden", "true"); modalImg.src = ""; } });

    window.addEventListener("resize", () => requestAnimationFrame(fitToContainer));
  }
})();

let fittedOnce = false;

function fitWhenReady(setAsMin = false) {
  const tryFit = () => {
    const rect = svg.getBoundingClientRect();
    // espera a que el SVG tenga tamaño real y haya contenido
    if (rect.width < 20 || rect.height < 20 || !content.hasChildNodes()) {
      requestAnimationFrame(tryFit);
      return;
    }
    fitToContainer(setAsMin);
    fittedOnce = true;
  };
  requestAnimationFrame(tryFit);
}

new ResizeObserver(() => {
  if (!content.hasChildNodes()) return;
  // La primera vez fija el mínimo; después solo centra
  fitToContainer(!fittedOnce);
  fittedOnce = true;
}).observe(svg);

const resetBtn = document.getElementById("reset");
const clone = resetBtn.cloneNode(true);
resetBtn.parentNode.replaceChild(clone, resetBtn);
clone.addEventListener("click", () => fitWhenReady(true));
