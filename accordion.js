

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


// Spotlight scroll fade (apaga la luz al bajar)
(() => {
  const hero = document.querySelector('.page-illustration .hero');
  if (!hero) return;

  const rootStyle = document.documentElement.style;

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

  function update(){
    // Cuánto has scrolleado desde el top hasta ~60% del alto del hero
    const rect = hero.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;

    // Progreso: 0 en top, 1 cuando ya pasaste ~60% del hero
    // Usamos el top relativo del hero respecto a la ventana
    const start = 0;                   // cuando top del hero toca el top de la ventana
    const end   = vh * 0.6;            // hasta 60% de la altura de viewport
    const y = clamp((0 - rect.top - start) / (end - start), 0, 1);

    const opacity = 1 - y;             // 1 → 0 al bajar
    rootStyle.setProperty('--beam-opacity', opacity.toFixed(3));
  }

  // Dispara en scroll y en resize
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  // Primer cálculo
  update();
})();

// Spotlight fade-out al hacer scroll (para todas las .hero de la página)
(() => {
  const heroes = Array.from(document.querySelectorAll('.hero'));
  if (!heroes.length) return;

  const root = document.documentElement;

  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function update() {
    // Revisa cada hero y calcula opacidad según su posición en viewport
    let maxFade = 0; // si hay varios hero en pantalla, usa el mayor fade
    const vh = window.innerHeight || document.documentElement.clientHeight;

    heroes.forEach(hero => {
      const rect = hero.getBoundingClientRect();
      // progreso 0→1 desde que top del hero toca la parte alta hasta 60% de viewport
      const start = 0;
      const end = vh * 0.6;
      const prog = clamp((0 - rect.top - start) / (end - start), 0, 1);
      if (prog > maxFade) maxFade = prog;
    });

    const opacity = 1 - maxFade;
    root.style.setProperty('--spot-opacity', opacity.toFixed(3));
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();



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
    const parentProject = "demento";
    const generalSectionId = "demento";
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
    const project2037 = document.getElementById('demento');

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
      document.querySelector('#demento h2, #demento h3, #demento .section-title') ||
      document.querySelector('#demento');

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

// --- SUBSECCIONES: HAZBIN (prefijo: "hazbin" y "hazbin-role")
document.querySelectorAll('.menu-item.subsection').forEach(subBtn => {
  const sectionId = subBtn.getAttribute('data-section') || '';
  if (!sectionId.startsWith('hazbin')) return;

  subBtn.addEventListener('click', () => {
    const parentProject = 'hazbin';
    const projectBtn    = document.querySelector(`.menu-item.project[data-project="${parentProject}"]`);
    const submenu       = document.querySelector(`.submenu[data-project="${parentProject}"]`);
    const general       = document.getElementById(parentProject);
    const sectionToTgl  = document.getElementById(sectionId);
    const isActive      = subBtn.classList.contains('active-sub');

    // asegurar proyecto/submenú activos
    projectBtn?.classList.add('active-project');
    submenu?.classList.add('active');
    general?.classList.add('active');

    if (isActive) {
      subBtn.classList.remove('active-sub');
      sectionToTgl?.classList.remove('active');
      const anyLeft = document.querySelectorAll('.menu-item.subsection.active-sub[data-section^="hazbin"]').length;
      if (!anyLeft) {
        general?.classList.remove('has-subsection');
        (document.querySelector('#hazbin h2, #hazbin h3, #hazbin .section-title') || general)?.scrollIntoView({behavior:'smooth'});
      }
    } else {
      subBtn.classList.add('active-sub');
      sectionToTgl?.classList.add('active');
      general?.classList.add('has-subsection');
      sectionToTgl?.scrollIntoView({behavior:'smooth'});
    }
  });
});

// --- SUBSECCIONES: CUBS (acepta "cub", "cubs", "cubs-role")
document.querySelectorAll('.menu-item.subsection').forEach(subBtn => {
  const sectionId = subBtn.getAttribute('data-section') || '';
  if (!(sectionId.startsWith('cub') || sectionId.startsWith('cubs'))) return;

  subBtn.addEventListener('click', () => {
    const parentProject = 'cubs';
    const projectBtn    = document.querySelector(`.menu-item.project[data-project="${parentProject}"]`);
    const submenu       = document.querySelector(`.submenu[data-project="${parentProject}"]`);
    const general       = document.getElementById(parentProject);
    const sectionToTgl  = document.getElementById(sectionId);
    const isActive      = subBtn.classList.contains('active-sub');

    projectBtn?.classList.add('active-project');
    submenu?.classList.add('active');
    general?.classList.add('active');

    if (isActive) {
      subBtn.classList.remove('active-sub');
      sectionToTgl?.classList.remove('active');
      const anyLeft = document.querySelectorAll('.menu-item.subsection.active-sub[data-section^="cub"], .menu-item.subsection.active-sub[data-section^="cubs"]').length;
      if (!anyLeft) {
        general?.classList.remove('has-subsection');
        (document.querySelector('#cubs h2, #cubs h3, #cubs .section-title') || general)?.scrollIntoView({behavior:'smooth'});
      }
    } else {
      subBtn.classList.add('active-sub');
      sectionToTgl?.classList.add('active');
      general?.classList.add('has-subsection');
      sectionToTgl?.scrollIntoView({behavior:'smooth'});
    }
  });
});

// --- SUBSECCIONES: DEMENTO (acepta "demento", "demento-role")
document.querySelectorAll('.menu-item.subsection').forEach(subBtn => {
  const sectionId = subBtn.getAttribute('data-section') || '';
  if (!(sectionId.startsWith('demento') || sectionId.startsWith('demento'))) return;

  subBtn.addEventListener('click', () => {
    const parentProject = 'demento';
    const projectBtn    = document.querySelector(`.menu-item.project[data-project="${parentProject}"]`);
    const submenu       = document.querySelector(`.submenu[data-project="${parentProject}"]`);
    const general       = document.getElementById(parentProject);
    const sectionToTgl  = document.getElementById(sectionId);
    const isActive      = subBtn.classList.contains('active-sub');

    projectBtn?.classList.add('active-project');
    submenu?.classList.add('active');
    general?.classList.add('active');

    if (isActive) {
      subBtn.classList.remove('active-sub');
      sectionToTgl?.classList.remove('active');
      const anyLeft = document.querySelectorAll('.menu-item.subsection.active-sub[data-section^="cub"], .menu-item.subsection.active-sub[data-section^="demento"]').length;
      if (!anyLeft) {
        general?.classList.remove('has-subsection');
        (document.querySelector('#demento h2, #demento h3, #demento .section-title') || general)?.scrollIntoView({behavior:'smooth'});
      }
    } else {
      subBtn.classList.add('active-sub');
      sectionToTgl?.classList.add('active');
      general?.classList.add('has-subsection');
      sectionToTgl?.scrollIntoView({behavior:'smooth'});
    }
  });
});

// --- SUBSECCIONES: modelo (acepta "modelo", "modelo-dig", "modelo-imp")
document.querySelectorAll('.menu-item.subsection').forEach(subBtn => {
  const sectionId = subBtn.getAttribute('data-section') || '';
  if (!(sectionId.startsWith('modelo') || sectionId.startsWith('modelo'))) return;

  subBtn.addEventListener('click', () => {
    const parentProject = 'modelo';
    const projectBtn    = document.querySelector(`.menu-item.project[data-project="${parentProject}"]`);
    const submenu       = document.querySelector(`.submenu[data-project="${parentProject}"]`);
    const general       = document.getElementById(parentProject);
    const sectionToTgl  = document.getElementById(sectionId);
    const isActive      = subBtn.classList.contains('active-sub');

    projectBtn?.classList.add('active-project');
    submenu?.classList.add('active');
    general?.classList.add('active');

    if (isActive) {
      subBtn.classList.remove('active-sub');
      sectionToTgl?.classList.remove('active');
      const anyLeft = document.querySelectorAll('.menu-item.subsection.active-sub[data-section^="cub"], .menu-item.subsection.active-sub[data-section^="modelo"]').length;
      if (!anyLeft) {
        general?.classList.remove('has-subsection');
        (document.querySelector('#modelo h2, #modelo h3, #modelo .section-title') || general)?.scrollIntoView({behavior:'smooth'});
      }
    } else {
      subBtn.classList.add('active-sub');
      sectionToTgl?.classList.add('active');
      general?.classList.add('has-subsection');
      sectionToTgl?.scrollIntoView({behavior:'smooth'});
    }
  });
});

// --- SUBSECCIONES: mundo- (acepta "mundo-post", "mundo-mock")
document.querySelectorAll('.menu-item.subsection').forEach(subBtn => {
  const sectionId = subBtn.getAttribute('data-section') || '';
  if (!sectionId.startsWith('mundo-')) return;

  subBtn.addEventListener('click', () => {
    const parentProject = 'mundomaya';
    const projectBtn    = document.querySelector(`.menu-item.project[data-project="${parentProject}"]`);
    const submenu       = document.querySelector(`.submenu[data-project="${parentProject}"]`);
    const general       = document.getElementById(parentProject);
    const sectionToTgl  = document.getElementById(sectionId);
    const isActive      = subBtn.classList.contains('active-sub');

    projectBtn?.classList.add('active-project');
    submenu?.classList.add('active');
    general?.classList.add('active');

    if (isActive) {
      subBtn.classList.remove('active-sub');
      sectionToTgl?.classList.remove('active');
      
      const anyLeft = document.querySelectorAll('.menu-item.subsection.active-sub[data-section^="cub"], .menu-item.subsection.active-sub[data-section^="mundomaya"]').length;
      if (!anyLeft) {
        general?.classList.remove('has-subsection');
        (document.querySelector('#mundomaya h2, #mundomaya h3, #mundomaya .section-title') || general)?.scrollIntoView({behavior:'smooth'});
      }
    } else {
      subBtn.classList.add('active-sub');
      sectionToTgl?.classList.add('active');
      general?.classList.add('has-subsection');
      sectionToTgl?.scrollIntoView({behavior:'smooth'});
    }
  });
});

// === illustration.html: Responsive accordion for mobile + iPad ===
(function () {
  // Solo activar comportamiento bajo 1024px y en la página correcta
  const isIllustration = document.body.classList.contains('page-illustration');
  const isSmall = window.matchMedia('(max-width: 1024px)').matches;
  if (!isIllustration || !isSmall) return;

  // Mapeo de proyectos -> secciones que deben mostrarse juntas
  const PROJECT_SECTIONS = {
    // Cartas a Altair
    altair: ['#altair', '#altair-character', '#altair-illustration'],
    // 2037
    'project-2037': ['#project-2037', '#2037-character', '#2037-illustration']
  };

  const body = document.body;
  const projectButtons = Array.from(document.querySelectorAll('.index-menu .menu-item.project'));

  // Estado inicial: sin proyecto abierto, no hay scroll
  body.classList.add('no-scroll');
  body.classList.remove('scrollable');

  // Ayudantes
  function clearActiveAll() {
    document.querySelectorAll('.content-section.active').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.menu-item.project.active-project').forEach(btn => btn.classList.remove('active-project'));
  }

  function openProject(projectKey, btn) {
    clearActiveAll();
    const selectors = PROJECT_SECTIONS[projectKey] || [];
    selectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (el) el.classList.add('active');
    });
    btn.classList.add('active-project');

    // Habilitar scroll y hacer foco en la primera sección activa
    body.classList.remove('no-scroll');
    body.classList.add('scrollable');

    const first = document.querySelector(selectors[0]);
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function closeAll() {
    clearActiveAll();
    // Volver a “solo índice” y bloquear scroll
    window.scrollTo({ top: 0, behavior: 'smooth' });
    body.classList.add('no-scroll');
    body.classList.remove('scrollable');
  }

  // Clicks en botones de proyecto
  projectButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const projectKey = btn.getAttribute('data-project');
      const isActive = btn.classList.contains('active-project');

      if (isActive) {
        // Si ya estaba abierto, colapsamos
        closeAll();
      } else {
        // Abrimos el proyecto seleccionado
        openProject(projectKey, btn);
      }
    });
  });

  // Por si el usuario rota la pantalla y ya hay contenido abierto
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      const active = document.querySelector('.content-section.active');
      if (active) active.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 200);
  });
})();



(() => {
  // Solo en la página de Illustration
  if (!document.body.classList.contains('page-illustration')) return;

  const mql = window.matchMedia('(max-width: 768px)');
  let cleanupMobile = null; // para desenganchar en desktop

  // ---------- Localizadores ----------
  const hero  = document.querySelector('#illustration .hero') || document.querySelector('.hero');
  const chips = document.querySelector(
    'body.page-illustration .index-menu, ' +
    'body.page-illustration .menu-top, '  +
    'body.page-illustration .menu-group'
  );

  // Guarda posición original de los chips para restaurar
  const originalParent = chips?.parentNode || null;
  const originalNext   = chips?.nextSibling || null;

  // Crea/obtiene overlay dentro del hero
  function ensureFloater(){
    if (!hero) return null;
    let floater = hero.querySelector('#index-floater');
    if (!floater) {
      floater = document.createElement('div');
      floater.id = 'index-floater';
      // Posición por defecto (puedes cambiar estos valores desde CSS también)
      floater.style.setProperty('--ix', '50%'); // X
      floater.style.setProperty('--iy', '65%'); // Y
      hero.appendChild(floater);
    }
    let stack = floater.querySelector('.index-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'index-stack';
      floater.appendChild(stack);
    }
    return stack;  
  }

  function toMobile(){
  const stackParent = ensureFloater(); // devuelve el .index-stack dentro de #index-floater
  if (!stackParent) return;

  // Asegura la label "Contenido" arriba
  let lbl = document.querySelector('body.page-illustration .menu-label');
  if (!lbl) {
    lbl = document.createElement('div');
    lbl.className = 'menu-label';
    lbl.textContent = 'Contenido';
  }
  stackParent.appendChild(lbl);

  // Luego, los chips (Cartas a Altair / 2037)
  stackParent.appendChild(chips);

  // limpia estilos heredados
  chips.removeAttribute('style');
}


  function toDesktop(){
    // chips
    if (chipsNext) chipsParent.insertBefore(chips, chipsNext); else chipsParent.appendChild(chips);
    // label
    if (label && labelParent) {
      if (labelNext) labelParent.insertBefore(label, labelNext); else labelParent.appendChild(label);
    }
    // limpia overlay
    hero.querySelector('#index-floater')?.remove();
  }

  function enableMobile(){
    toMobile();
    // si tienes menú móvil, aquí puedes llamar a tu enableMobileMenu()
    document.body.classList.remove('no-scroll');
    return () => { toDesktop(); };
  }

  function moveChipsToHero(){
    if (!chips || !hero) return;
    const floater = ensureFloater();
    if (floater) floater.appendChild(chips);
    chips.removeAttribute('style'); // limpia estilos heredados
  }

  function restoreChips(){
    if (!chips || !originalParent) return;
    if (originalNext) originalParent.insertBefore(chips, originalNext);
    else originalParent.appendChild(chips);
    const floater = hero?.querySelector('#index-floater');
    if (floater && !floater.firstElementChild) floater.remove();
  }

  // ---------- Menú móvil (hamburguesa) ----------
  function enableMobileMenu(){
    const drawer  = document.getElementById('mobile-drawer');
    const openBtn = document.getElementById('mh-open');
    const closeBtn= document.getElementById('mh-close');
    if (!drawer || !openBtn) return () => {};

    const open  = () => {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden','false');
      openBtn.setAttribute('aria-expanded','true');
      document.body.classList.add('menu-open');
    };
    const close = () => {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden','true');
      openBtn.setAttribute('aria-expanded','false');
      document.body.classList.remove('menu-open');
    };

    const onBackdrop = e => { if (e.target === drawer) close(); };
    const onLink = e => {
      const key = e.currentTarget.dataset.target; // "altair" o "project-2037"
      document.querySelector(`.menu-item.project[data-project="${key}"]`)?.click();
      close();
      const sectionId = (key === 'altair') ? 'altair-illustration' : key;
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    };

    openBtn.addEventListener('click', open);
    closeBtn?.addEventListener('click', close);
    drawer.addEventListener('click', onBackdrop);
    drawer.querySelectorAll('.md-link').forEach(a => a.addEventListener('click', onLink));

    // cleanup
    return () => {
      openBtn.removeEventListener('click', open);
      closeBtn?.removeEventListener('click', close);
      drawer.removeEventListener('click', onBackdrop);
      drawer.querySelectorAll('.md-link').forEach(a => a.removeEventListener('click', onLink));
      document.body.classList.remove('menu-open');
    };
  }

  // ---------- Activación solo en móvil ----------
  function enableMobile(){
    const cleanups = [];
    // colocar chips sobre el hero
    moveChipsToHero();
    // menú móvil, si existe en el DOM
    cleanups.push(enableMobileMenu());
    // aseguramos scroll del body
    document.body.classList.remove('no-scroll');
    return () => { cleanups.forEach(fn => fn && fn()); restoreChips(); };
  }

  function sync(e){
    const mobile = (e?.matches ?? mql.matches);
    // limpia estado anterior
    cleanupMobile?.(); cleanupMobile = null;
    if (mobile) cleanupMobile = enableMobile();
  }

  // run
  sync();
  mql.addEventListener('change', sync);
})();
