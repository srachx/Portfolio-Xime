
// === Responsive helper: re-sync wheel/placeholder on breakpoint changes ===
(function() {
  const MOBILE_MAX = 700;
  let lastIsMobile = window.innerWidth <= MOBILE_MAX;

  function isMobileW() { return window.innerWidth <= MOBILE_MAX; }

  function resyncWheel() {
    try {
      const wheelItems = document.querySelectorAll('.wheel-item');
      const placeholder = document.querySelector('.mobile-content-placeholder');
      if (!wheelItems.length || !placeholder) return;

      // Clear active/visible states and placeholder content on switch
      wheelItems.forEach(el => el.classList.remove('active'));
      placeholder.innerHTML = '';
      placeholder.classList.add('hidden');
    } catch (e) {
      // noop
    }
  }

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    if (resizeTimer) cancelAnimationFrame(resizeTimer);
    resizeTimer = requestAnimationFrame(() => {
      const nowMobile = isMobileW();
      if (nowMobile !== lastIsMobile) {
        resyncWheel();
        lastIsMobile = nowMobile;
      }
    });
  }, { passive: true });
})();

