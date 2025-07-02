const wheelItems = document.querySelectorAll('.wheel-item');
const contents = document.querySelectorAll('.wheel-content');

wheelItems.forEach(item => {
  item.addEventListener('click', () => {
    const targetId = item.getAttribute('data-target');
    const targetContent = document.getElementById(targetId);

    const isAlreadyActive = item.classList.contains('active');

    // Reset all
    wheelItems.forEach(el => el.classList.remove('active'));
    contents.forEach(el => {
      el.classList.remove('visible');
    });

    // Si ya estaba activo, no activamos ninguno (efecto "cerrar")
    if (!isAlreadyActive) {
      item.classList.add('active');
      targetContent.classList.add('visible');
    }
  });
});

  const langButtons = document.querySelectorAll('.lang-btn');

  langButtons.forEach(button => {
    button.addEventListener('click', () => {
      const selectedLang = button.dataset.lang;

      // Aplica contenido multilingüe con formato HTML (respetando br y strong)
      document.querySelectorAll('[data-en][data-es]').forEach(el => {
        const translation = el.dataset[selectedLang];
        if (translation) {
          el.innerHTML = translation;
        }
      });

      // Estilo visual para botón activo
      langButtons.forEach(btn => btn.style.fontWeight = 'normal');
      button.style.fontWeight = 'bold';
    });
  });

  // (Opcional) Detecta idioma por navegador
  const userLang = navigator.language.startsWith('es') ? 'es' : 'en';
