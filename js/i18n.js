/* ============================================
   INTERNATIONALIZATION (i18n)
   ============================================ */
const translations = {
  ko: {
    // Nav
    'nav.home': 'Home',
    'nav.journey': 'Journey',
    'nav.hobby': 'Hobby',
    // Hero
    'hero.badge': 'SSAFY 수강 중',
    'hero.name': '조민석',
    'hero.headline': '반도체 위에 코드를 새기다',
    'hero.sub': '안녕하세요, 조민석입니다.<br>반도체 기업의 IT 직무를 꿈꾸는 개발자입니다.',
    'hero.cta': 'About Me ↓',
    // About
    'about.label': '// About Me',
    'about.title': 'Who I Am',
    'about.p1': '저는 <strong>"왜?"</strong>라는 질문에서 시작하는 개발자입니다.',
    'about.p2': '대학에서 기초를 다지고, KDT 프로그램에서 실무를 익히고, 지금은 SSAFY에서 더 단단한 개발자로 성장하고 있습니다.',
    'about.p3': '<strong>반도체는 모든 기술의 시작점입니다.</strong><br>그 시작점 위에서 동작하는 소프트웨어를 만드는 것 —<br>그것이 제가 가장 하고 싶은 일입니다.',
    'about.p4': '코드 한 줄이 칩 위에서 어떻게 동작하는지 이해하는 개발자,<br>문제의 근본 원인을 파고드는 개발자가 되겠습니다.',
    'about.goal': '반도체 IT 직무',
    'about.learning': 'SSAFY 과정 중',
    'about.strength': '끈기 있는 문제 해결',
    // Journey
    'journey.label': '// My Journey',
    'journey.title': 'My Journey',
    'journey.subtitle': '매 단계마다 더 깊이, 더 넓게 — 멈추지 않는 성장 기록',
    // Hobby
    'hobby.label': '// After Hours',
    'hobby.title': 'Level Up',
    'hobby.subtitle': '코드를 내려놓으면, 다른 세계에서 레벨업합니다.',
    'hobby.footer': '게임에서 배운 것: <span class="text-accent">실패는 데이터이고, 재시도는 최적화입니다.</span>',
    'minigame.label': '// Mini Games',
    'minigame.title': 'Arcade Zone',
    'minigame.subtitle': '잠깐 쉬어가세요! 간단한 미니게임을 즐겨보세요.',
    'guestbook.label': '// Guestbook',
    'guestbook.title': '방명록',
    'guestbook.subtitle': '방문 기념으로 한마디 남겨주세요!',
    // Footer
    'footer.message': 'Thank you for scrolling. Let\'s connect.',
    'footer.copyright': '© 2026 Cho Min Seok. Built with passion & clean code.',
  },
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.journey': 'Journey',
    'nav.hobby': 'Hobby',
    // Hero
    'hero.badge': 'Currently at SSAFY',
    'hero.name': 'Cho Min Seok',
    'hero.headline': 'Engraving Code on Silicon',
    'hero.sub': 'Hello, I\'m Min Seok Cho.<br>A developer aspiring to IT roles in semiconductor companies.',
    'hero.cta': 'About Me ↓',
    // About
    'about.label': '// About Me',
    'about.title': 'Who I Am',
    'about.p1': 'I\'m a developer who starts with the question <strong>"Why?"</strong>',
    'about.p2': 'I built my foundation in university, gained practical skills through a KDT program, and am now growing into a stronger developer at SSAFY.',
    'about.p3': '<strong>Semiconductors are where all technology begins.</strong><br>Building software that runs on that starting point —<br>that\'s what I want to do most.',
    'about.p4': 'I aim to be a developer who understands how each line of code<br>runs on a chip, and who digs into the root cause of every problem.',
    'about.goal': 'Semiconductor IT',
    'about.learning': 'SSAFY Program',
    'about.strength': 'Persistent Problem Solver',
    // Journey
    'journey.label': '// My Journey',
    'journey.title': 'My Journey',
    'journey.subtitle': 'Deeper and wider at every step — a record of relentless growth',
    // Hobby
    'hobby.label': '// After Hours',
    'hobby.title': 'Level Up',
    'hobby.subtitle': 'When I put the code down, I level up in another world.',
    'hobby.footer': 'What I learned from games: <span class="text-accent">Failure is data, and retry is optimization.</span>',
    'minigame.label': '// Mini Games',
    'minigame.title': 'Arcade Zone',
    'minigame.subtitle': 'Take a break! Enjoy some mini games.',
    'guestbook.label': '// Guestbook',
    'guestbook.title': 'Guestbook',
    'guestbook.subtitle': 'Leave a message to commemorate your visit!',
    // Footer
    'footer.message': 'Thank you for scrolling. Let\'s connect.',
    'footer.copyright': '© 2026 Cho Min Seok. Built with passion & clean code.',
  }
};

let currentLang = 'ko';

function initI18n() {
  currentLang = localStorage.getItem('lang') || 'ko';
  applyTranslations();
  updateLangLabel();
}

function toggleLang() {
  currentLang = currentLang === 'ko' ? 'en' : 'ko';
  localStorage.setItem('lang', currentLang);
  applyTranslations();
  updateLangLabel();
}

function applyTranslations() {
  const dict = translations[currentLang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });
}

function updateLangLabel() {
  const label = document.getElementById('lang-label');
  if (label) label.textContent = currentLang === 'ko' ? '한/EN' : 'EN/한';
}
