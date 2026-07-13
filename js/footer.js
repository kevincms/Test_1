/* ============================================
   FOOTER (Shared Component)
   ============================================ */
function initFooter() {
  const footer = document.createElement('footer');
  footer.className = 'text-center py-12 px-8 border-t border-theme';
  footer.id = 'footer';
  footer.innerHTML = `
    <p class="font-english text-lg text-theme mb-6" data-i18n="footer.message">Thank you for scrolling. Let's connect.</p>
    <div class="flex justify-center gap-4 mb-6">
      <a href="mailto:contact@example.com" class="footer-icon flex items-center justify-center w-11 h-11 rounded-xl text-xl" aria-label="Email" title="Email">📧</a>
      <a href="#" class="footer-icon flex items-center justify-center w-11 h-11 rounded-xl text-xl" aria-label="GitHub" title="GitHub">🐙</a>
      <a href="#" class="footer-icon flex items-center justify-center w-11 h-11 rounded-xl text-xl" aria-label="LinkedIn" title="LinkedIn">💼</a>
    </div>
    <p class="font-code text-xs text-sec" data-i18n="footer.copyright">© 2026 Cho Min Seok. Built with passion & clean code.</p>
  `;
  document.body.appendChild(footer);
}
