const wheelItems = document.querySelectorAll('.wheel-item');
const contents = document.querySelectorAll('.wheel-content');
const placeholder = document.querySelector('.mobile-content-placeholder');

function isMobile() {
  return window.innerWidth <= 700;
}

wheelItems.forEach(item => {
  item.addEventListener('click', () => {
    const targetId = item.getAttribute('data-target');
    const targetContent = document.getElementById(targetId);
    const isActive = item.classList.contains('active');

    // Limpia selección previa
    wheelItems.forEach(el => el.classList.remove('active'));
    contents.forEach(el => el.classList.remove('visible'));

    // Oculta placeholder
    placeholder.innerHTML = '';
    placeholder.classList.add('hidden');

    if (isMobile()) {
      if (!isActive) {
        // Mostrar contenido solo si no estaba activo
        item.classList.add('active');
        placeholder.innerHTML = targetContent.innerHTML;
        placeholder.classList.remove('hidden');

        // Mueve placeholder justo debajo del botón
        item.insertAdjacentElement('afterend', placeholder);
      }
    } else {
      // Versión desktop: mostrar el contenido normal
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


  const images = document.querySelectorAll('.carousel-img');
let index = 0;

function showSlide(i) {
  const current = document.querySelector('.carousel-img.active');
  const next = images[i];

  if (current) {
    current.classList.remove('active');
    current.classList.add('exit-left');
    setTimeout(() => {
      current.classList.remove('exit-left');
    }, 800);
  }

  next.classList.add('active');
}

setInterval(() => {
  index = (index + 1) % images.length;
  showSlide(index);
}, 4000);
