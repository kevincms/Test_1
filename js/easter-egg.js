/* ============================================
   EASTER EGGS
   ============================================ */
function initEasterEggs() {
  // === Easter Egg 1: Konami Code (all pages) ===
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let konamiIndex = 0;

  document.addEventListener('keydown', (e) => {
    if (e.key === konamiCode[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === konamiCode.length) {
        konamiIndex = 0;
        triggerKonamiEffect();
      }
    } else {
      konamiIndex = 0;
    }
  });

  function triggerKonamiEffect() {
    // Confetti explosion
    const colors = ['#00E5FF', '#2979FF', '#FF1744', '#FFD600', '#00E676'];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-10px';
      confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      confetti.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.style.width = (Math.random() * 8 + 5) + 'px';
      confetti.style.height = (Math.random() * 8 + 5) + 'px';
      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 4000);
    }

    // Show secret message
    showEasterEggMessage('🎮 코나미 코드 발견! 당신은 진정한 게이머! 🎮');
  }

  // === Easter Egg 2: Hidden clickable element ===
  // Look for elements with class 'easter-egg-trigger'
  document.querySelectorAll('.easter-egg-trigger').forEach(el => {
    el.style.cursor = 'none';
    el.addEventListener('click', () => {
      el.classList.add('easter-egg-found');
      setTimeout(() => el.classList.remove('easter-egg-found'), 600);

      const messages = [
        '🎉 이스터에그를 찾으셨군요! 대단해요!',
        '🔍 숨겨진 비밀을 발견했습니다!',
        '⭐ 당신의 관찰력이 빛납니다!',
        '🎊 축하합니다! 히든 메시지를 찾으셨어요!',
      ];
      showEasterEggMessage(messages[Math.floor(Math.random() * messages.length)]);
    });
  });

  // === Easter Egg 3: Click logo 5 times ===
  let logoClicks = 0;
  setTimeout(() => {
    const logo = document.querySelector('.navbar a');
    if (logo) {
      logo.addEventListener('click', (e) => {
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/agy/')) {
          // Only on home page, prevent navigation
        }
        logoClicks++;
        if (logoClicks >= 5) {
          logoClicks = 0;
          e.preventDefault();
          triggerMatrixEffect();
        }
      });
    }
  }, 500);

  function triggerMatrixEffect() {
    showEasterEggMessage('🖥️ Matrix Mode Activated! 🖥️');
    document.body.style.transition = 'filter 0.5s';
    document.body.style.filter = 'hue-rotate(120deg)';
    setTimeout(() => {
      document.body.style.filter = 'none';
    }, 3000);
  }
}

function showEasterEggMessage(text) {
  const existing = document.getElementById('easter-egg-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'easter-egg-toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: var(--bg-card);
    border: 2px solid var(--accent-cyan);
    color: var(--text-primary);
    padding: 1rem 2rem;
    border-radius: 16px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9rem;
    z-index: 10003;
    box-shadow: 0 0 30px var(--glow-cyan-strong);
    opacity: 0;
    transition: opacity 0.4s, transform 0.4s;
    text-align: center;
  `;
  toast.textContent = text;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
