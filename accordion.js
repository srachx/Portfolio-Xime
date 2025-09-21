
// --- WHEEL INTERACCIÓN (móvil y escritorio con toggle) ---
const wheelItems = document.querySelectorAll('.wheel-item');
const contents = document.querySelectorAll('.wheel-content');
const placeholder = document.querySelector('.mobile-content-placeholder');

function isMobile() {
  return window.innerWidth <= 700;
}

function deactivateAllWheel() {
  wheelItems.forEach(el => el.classList.remove('active'));
  contents.forEach(el => el.classList.remove('visible'));
  placeholder.innerHTML = '';
  placeholder.classList.add('hidden');
}

wheelItems.forEach(item => {
  item.addEventListener('click', () => {
    const targetId = item.getAttribute('data-target');
    const targetContent = document.getElementById(targetId);
    const isActive = item.classList.contains('active');

    if (isMobile()) {
      // En móvil: toggle el ítem y el contenido
      deactivateAllWheel();
      if (!isActive) {
        item.classList.add('active');
        placeholder.innerHTML = targetContent.innerHTML;
        placeholder.classList.remove('hidden');
        item.insertAdjacentElement('afterend', placeholder);
      }
    } else {
      // En escritorio: toggle visible
      if (isActive) {
        item.classList.remove('active');
        targetContent.classList.remove('visible');
      } else {
        deactivateAllWheel();
        item.classList.add('active');
        targetContent.classList.add('visible');
      }
    }
  });
});

// --- ACTIVAR POR DEFECTO 'ABOUT' ---
window.addEventListener('DOMContentLoaded', () => {
  const defaultItem = document.querySelector('.wheel-item[data-target="about-content"]');
  const defaultContent = document.getElementById('about-content');

  if (defaultItem && defaultContent) {
    defaultItem.classList.add('active');
    if (isMobile()) {
      placeholder.innerHTML = defaultContent.innerHTML;
      placeholder.classList.remove('hidden');
      defaultItem.insertAdjacentElement('afterend', placeholder);
    } else {
      defaultContent.classList.add('visible');
    }
  }
});


// --- CAMBIO DE IDIOMA con animación por letra (auto + recuerdo + ?lang=) ---
(function () {
  const $langBtns = document.querySelectorAll('.lang-btn');
  const $nodes = document.querySelectorAll('[data-en][data-es]');

  // Genera <span> con delay incremental (espacios preservados)
  function renderBouncy(el, text) {
    let delay = 0;
    const step = 0.12; // segundos entre letras
    let html = '';
    for (const ch of text) {
      if (ch === ' ') {
        html += ' ';
      } else {
        html += `<span style="animation-delay:${delay.toFixed(2)}s">${ch}</span>`;
        delay += step;
      }
    }
    el.innerHTML = html;
  }

  function setLanguage(lang) {
    lang = (lang === 'es' || lang === 'en') ? lang : 'en';

    // Aplica traducciones y (si procede) animación por letra
    $nodes.forEach(el => {
      const txt = el.dataset[lang] ?? '';
      if (el.classList.contains('bouncy-text')) {
        renderBouncy(el, txt);      // 🔹 anima letra por letra
      } else {
        el.innerHTML = txt;         // 🔹 texto normal
      }
    });

    // Toggle visual de botones (si existen)
    $langBtns.forEach(btn => {
      const active = btn.dataset.lang === lang;
      btn.classList.toggle('active', active);
      btn.style.fontWeight = active ? '700' : '400';
    });

    // <html lang="..."> y preferencia
    document.documentElement.setAttribute('lang', lang);
    try { localStorage.setItem('lang', lang); } catch (e) {}
  }

  // Idioma inicial: URL ?lang > localStorage > navegador
  const params = new URLSearchParams(location.search);
  const urlLang = params.get('lang');
  const stored = (() => { try { return localStorage.getItem('lang'); } catch(e){ return null; }})();
  const browser = (navigator.language || navigator.userLanguage || 'en').toLowerCase().startsWith('es') ? 'es' : 'en';
  const initial = (urlLang === 'es' || urlLang === 'en') ? urlLang : (stored === 'es' || stored === 'en') ? stored : browser;

  setLanguage(initial);

  // Click en ES/EN (opcional)
  $langBtns.forEach(btn => btn.addEventListener('click', () => setLanguage(btn.dataset.lang)));
})();


// === DETECTAR SECCIÓN CON FONDO CLARO PARA CAMBIAR NAVBAR ===
const navbar = document.querySelector('.navbar'); // o ajusta a tu clase de navbar
const lightSections = document.querySelectorAll('.light-background'); // agrega esta clase a secciones blancas

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navbar.classList.add('navbar-dark'); // cambia color del texto a oscuro
      } else {
        navbar.classList.remove('navbar-dark');
      }
    });
  },
  {
    threshold: 0.3
  }
);

lightSections.forEach(section => observer.observe(section));

const userLang = navigator.language.startsWith('es') ? 'es' : 'en';

// --- SLIDESHOW ---
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

// --- SCROLL A CONTENIDO ---
function scrollToContent() {
  const content = document.getElementById('main-content');
  if (content) {
    content.scrollIntoView({ behavior: 'smooth' });
  }
}

function scrollToHero() {
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.scrollIntoView({ behavior: 'smooth' });
  }
}

// --- MENÚ LATERAL INTERACTIVO ---
document.querySelectorAll('.menu-item.project').forEach(projectBtn => {
  projectBtn.addEventListener('click', () => {
    const project = projectBtn.getAttribute('data-project');
    const submenu = document.querySelector(`.submenu[data-project="${project}"]`);
    const generalSection = document.getElementById(project);
    const allProjects = document.querySelectorAll('.menu-item.project');
    const allSubmenus = document.querySelectorAll('.submenu');
    const allSubs = document.querySelectorAll('.menu-item.subsection');
    const allSections = document.querySelectorAll('.content-section');

    const isActive = projectBtn.classList.contains('active-project');

    if (isActive) {
      // Desactiva todo
      allProjects.forEach(btn => btn.classList.remove('active-project'));
      allSubmenus.forEach(menu => menu.classList.remove('active'));
      allSubs.forEach(btn => btn.classList.remove('active-sub'));
      allSections.forEach(section => section.classList.remove('active'));

      scrollToHero();
    } else {
      // Desactiva todo antes de activar el nuevo
      allProjects.forEach(btn => btn.classList.remove('active-project'));
      allSubmenus.forEach(menu => menu.classList.remove('active'));
      allSubs.forEach(btn => btn.classList.remove('active-sub'));
      allSections.forEach(section => section.classList.remove('active'));

      // Activa el botón y menú
      projectBtn.classList.add('active-project');
      submenu.classList.add('active');

      if (generalSection) {
        generalSection.classList.add('active');
        generalSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// --- SUBSECCIONES INTERACTIVAS PARA CARTAS A ALTAIR (con subtítulo toggle sin ocultar título) ---
document.querySelectorAll('.menu-item.subsection').forEach(subBtn => {
  const sectionId = subBtn.getAttribute('data-section');
  if (!sectionId.startsWith('altair')) return;

  subBtn.addEventListener('click', () => {
    const parentProject = "altair";
    const projectBtn = document.querySelector(`.menu-item.project[data-project="${parentProject}"]`);
    const submenu = document.querySelector(`.submenu[data-project="${parentProject}"]`);
    const generalSection = document.getElementById(parentProject);
    const sectionToToggle = document.getElementById(sectionId);
    const isActive = subBtn.classList.contains("active-sub");

    // Asegurar que el proyecto esté activo (nunca se oculta desde subtítulos)
    projectBtn?.classList.add("active-project");
    submenu?.classList.add("active");
    generalSection?.classList.add("active");

    if (isActive) {
  subBtn.classList.remove("active-sub");
  sectionToToggle?.classList.remove("active");

  // Detecta si no quedan más subtítulos activos del mismo proyecto
  const parentPrefix = sectionId.split('-')[0]; // 'altair'
  const generalSection = document.getElementById(parentPrefix);
  const stillActiveSubs = document.querySelectorAll(`.menu-item.subsection.active-sub[data-section^="${parentPrefix}"]`);

  if (stillActiveSubs.length === 0 && generalSection) {
    generalSection.scrollIntoView({ behavior: 'smooth' });
  }

} else {
      // Activar ese subtítulo y su sección, sin afectar los demás
      subBtn.classList.add("active-sub");
      sectionToToggle?.classList.add("active");
      sectionToToggle?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});


// --- SUBSECCIONES INTERACTIVAS PARA 2037 (con subtítulo toggle sin ocultar título) ---
document.querySelectorAll('.menu-item.subsection').forEach(subBtn => {
  const sectionId = subBtn.getAttribute('data-section');
  if (!sectionId.startsWith('2037')) return;

  subBtn.addEventListener('click', () => {
    const parentProject = "project-2037";
    const generalSectionId = "project-2037";
    const projectBtn = document.querySelector(`.menu-item.project[data-project="${parentProject}"]`);
    const submenu = document.querySelector(`.submenu[data-project="${parentProject}"]`);
    const generalSection = document.getElementById(generalSectionId);
    const sectionToToggle = document.getElementById(sectionId);
    const isActive = subBtn.classList.contains("active-sub");

    // Asegurar que el proyecto esté activo
    projectBtn?.classList.add("active-project");
    submenu?.classList.add("active");
    generalSection?.classList.add("active");

    // Referencia al fondo de 2037
    const project2037 = document.getElementById('project-2037');

   if (isActive) {
    // Desactiva solo ese subtítulo y su sección
    subBtn.classList.remove("active-sub");
    sectionToToggle?.classList.remove("active");

    // Si ya no hay subtítulos activos, quitar clase que oculta fondo
    const stillActive = document.querySelectorAll('.menu-item.subsection.active-sub[data-section^="2037"]').length;

    if (stillActive === 0) {
      project2037?.classList.remove('has-subsection');

      

      // Hacer scroll hacia el primer subtítulo activo o al título principal
      const scrollTarget =
      document.querySelector('#project-2037 h2, #project-2037 h3, #project-2037 .section-title') ||
      document.querySelector('#project-2037');

    if (scrollTarget) {
      console.log("Scrolling to:", scrollTarget);
      scrollTarget.scrollIntoView({ behavior: 'smooth' });
    } else {
      console.warn("No scroll target found for 2037.");
    }


    }} else {
      // Activar subtítulo
      subBtn.classList.add("active-sub");
      sectionToToggle?.classList.add("active");
      sectionToToggle?.scrollIntoView({ behavior: 'smooth' });

      // Ocultar fondo
      project2037?.classList.add('has-subsection');
    }
  });
});


// --- FUNCIÓN SCROLL HERO ---
function scrollToHero() {
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.scrollIntoView({ behavior: 'smooth' });
  }
}

// --- Carrusel de Itara 3D automático con rotación
let itaraImages = document.querySelectorAll('.itara-carousel .itara-img');
let itaraCurrentIndex = 0;

function updateItaraCarousel() {
  itaraImages.forEach((img, index) => {
    img.classList.remove('active', 'left', 'right');

    if (index === itaraCurrentIndex) {
      img.classList.add('active');
    } else if (index === (itaraCurrentIndex + 1) % itaraImages.length) {
      img.classList.add('right');
    } else if (index === (itaraCurrentIndex - 1 + itaraImages.length) % itaraImages.length) {
      img.classList.add('left');
    }
  });

  itaraCurrentIndex = (itaraCurrentIndex + 1) % itaraImages.length;
}

// Solo iniciar si hay imágenes
if (itaraImages.length > 0) {
  updateItaraCarousel(); // Estado inicial
  setInterval(updateItaraCarousel, 3000); // Cambio cada 3 segundos
}

// --- Carrusel de personajes (2037 - Morgan) automático con efecto de posición ---
let char2037Images = document.querySelectorAll('.char2037-carousel .char2037-img');
let char2037CurrentIndex = 0;

function updateChar2037Carousel() {
  char2037Images.forEach((img, index) => {
    img.classList.remove('active', 'left', 'right');

    if (index === char2037CurrentIndex) {
      img.classList.add('active');
    } else if (index === (char2037CurrentIndex + 1) % char2037Images.length) {
      img.classList.add('right');
    } else if (index === (char2037CurrentIndex - 1 + char2037Images.length) % char2037Images.length) {
      img.classList.add('left');
    }
  });

  char2037CurrentIndex = (char2037CurrentIndex + 1) % char2037Images.length;
}

if (char2037Images.length > 0) {
  updateChar2037Carousel(); // Estado inicial
  setInterval(updateChar2037Carousel, 3000); // Cambio automático cada 3 segundos
}

// ===== Others: modal bilingüe =====
(function () {
  const g = document.getElementById('othersGallery');
  const m = document.getElementById('othersModal');
  if (!g || !m) return;

  const img   = m.querySelector('.om-image');
  const title = m.querySelector('.om-title');
  const desc  = m.querySelector('.om-desc');

  function currentLang() {
    const htmlLang = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    return htmlLang.startsWith('es') ? 'es' : 'en';
  }

  function openModal(card) {
    const lang = currentLang();
    const t = card.dataset[`title${lang === 'es' ? 'Es' : 'En'}`] || '';
    const d = card.dataset[`desc${lang === 'es' ? 'Es' : 'En'}`] || '';
    const full = card.dataset.img || card.querySelector('img')?.src;

    title.textContent = t;
    desc.textContent  = d;
    img.src = full;
    img.alt = t || 'Artwork';

    m.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden'; // bloquea scroll del fondo
  }

  function closeModal() {
    m.setAttribute('aria-hidden', 'true');
    img.src = '';
    document.documentElement.style.overflow = '';
  }

  g.addEventListener('click', (e) => {
    const card = e.target.closest('.others-card');
    if (card) openModal(card);
  });

  m.addEventListener('click', (e) => {
    if (e.target.matches('[data-close], .om-backdrop')) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && m.getAttribute('aria-hidden') === 'false') closeModal();
  });
})();
