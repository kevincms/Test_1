/* ============================================
   NAVIGATION BAR (Shared Component)
   ============================================ */
function initNav(currentPage) {
  const pages = [
    { id: 'home', href: 'index.html', labelKo: 'Home', labelEn: 'Home' },
    { id: 'journey', href: 'journey.html', labelKo: 'Journey', labelEn: 'Journey' },
    { id: 'hobby', href: 'hobby.html', labelKo: 'Hobby', labelEn: 'Hobby' },
  ];

  const linksHtml = pages.map(p =>
    `<a href="${p.href}" class="nav-link font-medium text-sm ${p.id === currentPage ? 'active' : ''}" data-i18n="nav.${p.id}">${p.labelKo}</a>`
  ).join('');

  const nav = document.createElement('nav');
  nav.className = 'navbar flex justify-between items-center';
  nav.id = 'navbar';
  nav.innerHTML = `
    <a href="index.html" class="font-english font-bold text-lg text-accent tracking-wide">CMS</a>
    <div class="nav-desktop flex gap-8 items-center">${linksHtml}</div>
    <div class="flex items-center gap-3">
      <button class="toggle-btn" id="lang-toggle" aria-label="언어 전환">
        <span id="lang-label">한/EN</span>
      </button>
      <button class="toggle-btn" id="theme-toggle" aria-label="테마 전환">
        <span id="theme-icon">🌙</span>
      </button>
      <button class="hamburger hidden flex-col" id="nav-hamburger" aria-label="메뉴 열기" style="background:none;border:none;padding:5px;cursor:none;">
        <span></span><span></span><span></span>
      </button>
    </div>
    <div class="nav-mobile flex-col gap-4" id="nav-mobile">
      ${pages.map(p =>
        `<a href="${p.href}" class="nav-link font-medium ${p.id === currentPage ? 'active' : ''}" data-i18n="nav.${p.id}">${p.labelKo}</a>`
      ).join('')}
    </div>
  `;

  document.body.prepend(nav);

  // Theme toggle
  const themeToggle = document.getElementById('theme-toggle');
  themeToggle.addEventListener('click', () => {
    if (typeof toggleTheme === 'function') toggleTheme();
  });

  // Update theme icon on load
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const themeIcon = document.getElementById('theme-icon');
  if (themeIcon) themeIcon.textContent = currentTheme === 'dark' ? '🌙' : '☀️';

  // Language toggle
  const langToggle = document.getElementById('lang-toggle');
  langToggle.addEventListener('click', () => {
    if (typeof toggleLang === 'function') toggleLang();
  });

  // Hamburger menu
  const hamburger = document.getElementById('nav-hamburger');
  const mobileNav = document.getElementById('nav-mobile');
  hamburger.addEventListener('click', () => {
    mobileNav.classList.toggle('open');
  });
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileNav.classList.remove('open'));
  });

  // Scroll shrink effect
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
  });
}
