/* ============================================
   CUSTOM CURSOR
   ============================================ */
function initCursor() {
  // Skip on mobile
  if (window.innerWidth <= 768) return;

  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.id = 'cursor-dot';
  document.body.appendChild(dot);

  const ring = document.createElement('div');
  ring.className = 'cursor-ring';
  ring.id = 'cursor-ring';
  document.body.appendChild(ring);

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top = mouseY + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX + 'px';
    ring.style.top = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  function bindHoverEffects() {
    document.querySelectorAll('a, button, .game-card, .highlight-item, .hero-tag, .timeline-card, .toggle-btn, .minigame-container').forEach(el => {
      el.addEventListener('mouseenter', () => {
        dot.classList.add('hover');
        ring.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        dot.classList.remove('hover');
        ring.classList.remove('hover');
      });
    });
  }

  // Initial bind + observe DOM changes for dynamically added elements
  bindHoverEffects();
  const observer = new MutationObserver(() => bindHoverEffects());
  observer.observe(document.body, { childList: true, subtree: true });
}
