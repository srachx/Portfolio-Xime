// --- WHEEL INTERACCIÓN (móvil) ---
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

    wheelItems.forEach(el => el.classList.remove('active'));
    contents.forEach(el => el.classList.remove('visible'));

    placeholder.innerHTML = '';
    placeholder.classList.add('hidden');

    if (isMobile()) {
      if (!isActive) {
        item.classList.add('active');
        placeholder.innerHTML = targetContent.innerHTML;
        placeholder.classList.remove('hidden');
        item.insertAdjacentElement('afterend', placeholder);
      }
    } else {
      item.classList.add('active');
      targetContent.classList.add('visible');
    }
  });
});

// --- CAMBIO DE IDIOMA ---
document.querySelectorAll('.lang-btn').forEach(button => {
  button.addEventListener('click', () => {
    const selectedLang = button.dataset.lang;

    document.querySelectorAll('[data-en][data-es]').forEach(el => {
      const translation = el.dataset[selectedLang];
      if (translation) el.innerHTML = translation;
    });

    document.querySelectorAll('.lang-btn').forEach(btn => btn.style.fontWeight = 'normal');
    button.style.fontWeight = 'bold';
  });
});

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
    const isActive = projectBtn.classList.contains('active-project');

    const allProjects = document.querySelectorAll('.menu-item.project');
    const allSubmenus = document.querySelectorAll('.submenu');
    const allSubs = document.querySelectorAll('.menu-item.subsection');
    const allSections = document.querySelectorAll('.content-section');

    if (isActive) {
      // Desactiva todo
      allProjects.forEach(btn => btn.classList.remove('active-project'));
      allSubmenus.forEach(menu => menu.classList.remove('active'));
      allSubs.forEach(btn => btn.classList.remove('active-sub'));
      allSections.forEach(section => section.classList.remove('active'));

      // Oculta también la sección general (como #altair)
      if (generalSection) generalSection.classList.remove('active');

      scrollToHero();
    } else {
      // Limpia estados anteriores
      allProjects.forEach(btn => btn.classList.remove('active-project'));
      allSubmenus.forEach(menu => menu.classList.remove('active'));
      allSubs.forEach(btn => btn.classList.remove('active-sub'));
      allSections.forEach(section => section.classList.remove('active'));

      // Activa título y submenu
      projectBtn.classList.add('active-project');
      submenu.classList.add('active');

      // Muestra sección general (como altair)
      if (generalSection) {
        generalSection.classList.add('active');
        generalSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});

// --- SUBSECCIONES INTERACTIVAS ---
document.querySelectorAll('.menu-item.subsection').forEach(subBtn => {
  subBtn.addEventListener('click', () => {
    const sectionId = subBtn.getAttribute('data-section');
    const contentSection = document.getElementById(sectionId);
    const parentSubmenu = subBtn.closest('.submenu');
    const parentProject = parentSubmenu?.getAttribute('data-project');
    const generalSection = document.getElementById(parentProject);

    const allSubs = document.querySelectorAll('.menu-item.subsection');
    const allSections = document.querySelectorAll('.content-section');

    const isAlreadyActive = subBtn.classList.contains('active-sub');

    // Desactiva todos los subtítulos y secciones
    allSubs.forEach(btn => btn.classList.remove('active-sub'));
    allSections.forEach(section => section.classList.remove('active'));

    if (isAlreadyActive) {
      // Si estaba activo, ocultar también la sección general (como altair)
      if (generalSection) generalSection.classList.add('active');
      generalSection?.scrollIntoView({ behavior: 'smooth' });
    } else {
      subBtn.classList.add('active-sub');
      contentSection?.classList.add('active');
      contentSection?.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// --- SCROLL AL HERO ---
function scrollToHero() {
  const hero = document.querySelector('.hero');
  if (hero) hero.scrollIntoView({ behavior: 'smooth' });
}

