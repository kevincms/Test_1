/* ============================================
   GUESTBOOK (localStorage)
   ============================================ */
function initGuestbook(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <form id="guestbook-form" class="flex gap-3 mb-6 flex-col sm:flex-row">
      <input type="text" id="gb-name" class="guestbook-input rounded-lg px-4 py-3 flex-shrink-0 sm:w-36 font-body text-sm" placeholder="이름" maxlength="20" required>
      <input type="text" id="gb-message" class="guestbook-input rounded-lg px-4 py-3 flex-1 font-body text-sm" placeholder="메시지를 남겨주세요..." maxlength="200" required>
      <button type="submit" class="cta-btn rounded-lg px-6 py-3 font-semibold text-sm flex-shrink-0">남기기</button>
    </form>
    <div id="gb-entries" class="flex flex-col gap-3"></div>
    <p id="gb-empty" class="text-sec text-center text-sm py-8 font-code hidden">아직 방명록이 비어있습니다. 첫 번째 메시지를 남겨주세요! ✨</p>
  `;

  const form = document.getElementById('guestbook-form');
  const entriesEl = document.getElementById('gb-entries');
  const emptyEl = document.getElementById('gb-empty');

  function getEntries() {
    try {
      return JSON.parse(localStorage.getItem('guestbook') || '[]');
    } catch { return []; }
  }

  function saveEntries(entries) {
    localStorage.setItem('guestbook', JSON.stringify(entries));
  }

  function renderEntries() {
    const entries = getEntries();
    if (entries.length === 0) {
      entriesEl.innerHTML = '';
      emptyEl.classList.remove('hidden');
      return;
    }
    emptyEl.classList.add('hidden');
    entriesEl.innerHTML = entries.map((entry, i) => `
      <div class="guestbook-entry rounded-xl p-4 flex justify-between items-start gap-3">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-semibold text-sm text-accent">${escapeHtml(entry.name)}</span>
            <span class="text-xs text-sec font-code">${entry.date}</span>
          </div>
          <p class="text-sm text-theme leading-relaxed break-words">${escapeHtml(entry.message)}</p>
        </div>
        <button onclick="deleteGuestbookEntry(${i})" class="text-sec hover:text-accent text-xs flex-shrink-0 transition-colors" style="background:none;border:none;cursor:none;" title="삭제">✕</button>
      </div>
    `).join('');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('gb-name').value.trim();
    const message = document.getElementById('gb-message').value.trim();
    if (!name || !message) return;

    const entries = getEntries();
    const now = new Date();
    entries.unshift({
      name,
      message,
      date: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    });
    saveEntries(entries);
    form.reset();
    renderEntries();
  });

  // Global delete function
  window.deleteGuestbookEntry = function(index) {
    const entries = getEntries();
    entries.splice(index, 1);
    saveEntries(entries);
    renderEntries();
  };

  renderEntries();
}
