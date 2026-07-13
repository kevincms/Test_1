/**
 * initSnakeGame(containerId)
 * Canvas 기반 네온 스타일 스네이크 게임
 * - 키보드 방향키 + 모바일 터치 스와이프 지원
 * - 반응형 캔버스
 * - localStorage 최고 점수 저장
 */
function initSnakeGame(containerId) {
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`[SnakeGame] Container "#${containerId}" not found.`);
    return;
  }

  // ── Theme Colors ──────────────────────────────────────────
  const COLORS = {
    bg: '#111827',
    snake: '#00E5FF',
    snakeHead: '#00FFFF',
    food: '#FF1744',
    foodGlow: 'rgba(255, 23, 68, 0.6)',
    text: '#E0E7F1',
    textDim: 'rgba(224, 231, 241, 0.5)',
    border: 'rgba(0, 229, 255, 0.3)',
    glow: 'rgba(0, 229, 255, 0.15)',
    grid: 'rgba(0, 229, 255, 0.04)',
    overlay: 'rgba(17, 24, 39, 0.85)',
    scoreBar: 'rgba(0, 229, 255, 0.08)',
  };

  const FONT = "'JetBrains Mono', monospace";
  const GRID_COUNT = 20; // cells per row/column
  const TICK_MS = 110; // game speed (ms per tick)
  const LS_KEY = 'snakeGame_highScore';

  // ── State ─────────────────────────────────────────────────
  let canvas, ctx;
  let cellSize = 0;
  let snake = [];
  let food = { x: 0, y: 0 };
  let dir = { x: 1, y: 0 };
  let nextDir = { x: 1, y: 0 };
  let score = 0;
  let highScore = parseInt(localStorage.getItem(LS_KEY), 10) || 0;
  let state = 'idle'; // idle | playing | over
  let loopId = null;

  // ── Build DOM ─────────────────────────────────────────────
  function buildUI() {
    container.innerHTML = '';
    Object.assign(container.style, {
      position: 'relative',
      width: '100%',
      maxWidth: '560px',
      margin: '0 auto',
      fontFamily: FONT,
    });

    // Score bar
    const scoreBar = document.createElement('div');
    scoreBar.id = containerId + '-scorebar';
    Object.assign(scoreBar.style, {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 16px',
      marginBottom: '8px',
      background: COLORS.scoreBar,
      border: `1px solid ${COLORS.border}`,
      borderRadius: '8px',
      color: COLORS.text,
      fontSize: '14px',
      fontFamily: FONT,
      letterSpacing: '0.5px',
    });
    scoreBar.innerHTML = `
      <span id="${containerId}-score">SCORE: 0</span>
      <span id="${containerId}-high" style="color:${COLORS.textDim}">BEST: ${highScore}</span>
    `;
    container.appendChild(scoreBar);

    // Canvas wrapper (for glow border)
    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
      position: 'relative',
      width: '100%',
      borderRadius: '10px',
      overflow: 'hidden',
      boxShadow: `0 0 20px ${COLORS.glow}, 0 0 60px ${COLORS.glow}, inset 0 0 20px ${COLORS.glow}`,
      border: `1.5px solid ${COLORS.border}`,
    });

    canvas = document.createElement('canvas');
    canvas.id = containerId + '-canvas';
    Object.assign(canvas.style, {
      display: 'block',
      width: '100%',
      background: COLORS.bg,
      borderRadius: '10px',
    });
    wrapper.appendChild(canvas);
    container.appendChild(wrapper);

    ctx = canvas.getContext('2d');
  }

  // ── Resize ────────────────────────────────────────────────
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight || 320;
    // 상단 점수 표시줄(약 50px) 및 패딩을 고려하여 가용 높이 계산
    const availableHeight = h > 60 ? h - 60 : w;
    const size = Math.min(w, availableHeight, 560);
    
    cellSize = Math.max(Math.floor(size / GRID_COUNT), 10);
    const px = cellSize * GRID_COUNT;
    
    canvas.width = px;
    canvas.height = px;
    canvas.style.width = px + 'px';
    canvas.style.height = px + 'px';
    
    draw();
  }

  // ── Game Logic ────────────────────────────────────────────
  function resetGame() {
    const mid = Math.floor(GRID_COUNT / 2);
    snake = [
      { x: mid, y: mid },
      { x: mid - 1, y: mid },
      { x: mid - 2, y: mid },
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score = 0;
    updateScoreUI();
    placeFood();
  }

  function placeFood() {
    const free = [];
    for (let x = 0; x < GRID_COUNT; x++) {
      for (let y = 0; y < GRID_COUNT; y++) {
        if (!snake.some((s) => s.x === x && s.y === y)) {
          free.push({ x, y });
        }
      }
    }
    if (free.length === 0) {
      // Win condition (entire grid filled)
      gameOver();
      return;
    }
    food = free[Math.floor(Math.random() * free.length)];
  }

  function tick() {
    dir = { ...nextDir };

    const head = {
      x: snake[0].x + dir.x,
      y: snake[0].y + dir.y,
    };

    // Wall collision
    if (head.x < 0 || head.x >= GRID_COUNT || head.y < 0 || head.y >= GRID_COUNT) {
      gameOver();
      return;
    }

    // Self collision
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      gameOver();
      return;
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      score += 10;
      updateScoreUI();
      placeFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function gameOver() {
    state = 'over';
    clearInterval(loopId);
    loopId = null;

    if (score > highScore) {
      highScore = score;
      localStorage.setItem(LS_KEY, highScore);
    }
    updateScoreUI();
    draw();
  }

  function startGame() {
    resetGame();
    state = 'playing';
    if (loopId) clearInterval(loopId);
    loopId = setInterval(tick, TICK_MS);
    draw();
  }

  function updateScoreUI() {
    const scoreEl = document.getElementById(containerId + '-score');
    const highEl = document.getElementById(containerId + '-high');
    if (scoreEl) scoreEl.textContent = `SCORE: ${score}`;
    if (highEl) highEl.textContent = `BEST: ${highScore}`;
  }

  // ── Drawing ───────────────────────────────────────────────
  function draw() {
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, W, H);

    // Grid lines
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_COUNT; i++) {
      const p = i * cellSize;
      ctx.beginPath();
      ctx.moveTo(p, 0);
      ctx.lineTo(p, H);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, p);
      ctx.lineTo(W, p);
      ctx.stroke();
    }

    if (state === 'idle') {
      drawIdleScreen();
      return;
    }

    // Food glow
    ctx.save();
    ctx.shadowColor = COLORS.foodGlow;
    ctx.shadowBlur = 14;
    ctx.fillStyle = COLORS.food;
    roundRect(
      ctx,
      food.x * cellSize + 2,
      food.y * cellSize + 2,
      cellSize - 4,
      cellSize - 4,
      4
    );
    ctx.fill();
    ctx.restore();

    // Snake
    snake.forEach((seg, i) => {
      const isHead = i === 0;
      ctx.save();
      if (isHead) {
        ctx.shadowColor = COLORS.snake;
        ctx.shadowBlur = 12;
        ctx.fillStyle = COLORS.snakeHead;
      } else {
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        const alpha = 1 - (i / snake.length) * 0.55;
        ctx.fillStyle = hexAlpha(COLORS.snake, alpha);
      }
      const gap = isHead ? 1 : 2;
      roundRect(
        ctx,
        seg.x * cellSize + gap,
        seg.y * cellSize + gap,
        cellSize - gap * 2,
        cellSize - gap * 2,
        isHead ? 5 : 3
      );
      ctx.fill();
      ctx.restore();
    });

    if (state === 'over') {
      drawOverlay('GAME OVER', `Score: ${score}`, 'Press SPACE to Restart');
    }
  }

  function drawIdleScreen() {
    drawOverlay('SNAKE', 'Neon Edition', 'Press SPACE to Start');
  }

  function drawOverlay(title, sub, hint) {
    const W = canvas.width;
    const H = canvas.height;

    // Dim overlay
    ctx.fillStyle = COLORS.overlay;
    ctx.fillRect(0, 0, W, H);

    // Title
    ctx.fillStyle = COLORS.snake;
    ctx.font = `bold ${Math.round(W * 0.09)}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.save();
    ctx.shadowColor = COLORS.snake;
    ctx.shadowBlur = 20;
    ctx.fillText(title, W / 2, H / 2 - W * 0.08);
    ctx.restore();

    // Subtitle
    ctx.fillStyle = COLORS.text;
    ctx.font = `${Math.round(W * 0.045)}px ${FONT}`;
    ctx.fillText(sub, W / 2, H / 2);

    // Hint (blinking via sin)
    const alpha = 0.45 + 0.55 * Math.abs(Math.sin(Date.now() / 600));
    ctx.fillStyle = hexAlpha(COLORS.textDim, alpha);
    ctx.font = `${Math.round(W * 0.035)}px ${FONT}`;
    ctx.fillText(hint, W / 2, H / 2 + W * 0.1);

    // Keep redrawing for blink animation when not playing
    if (state !== 'playing') {
      requestAnimationFrame(draw);
    }
  }

  // ── Helpers ───────────────────────────────────────────────
  function roundRect(c, x, y, w, h, r) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }

  function hexAlpha(hex, a) {
    // Supports #RRGGBB or rgba() strings — returns rgba
    if (hex.startsWith('rgba')) return hex; // already rgba
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }

  // ── Input: Keyboard ───────────────────────────────────────
  function handleKey(e) {
    if (!container.closest('.active-game')) return;
    const key = e.key;

    if (key === ' ' || key === 'Spacebar') {
      e.preventDefault();
      if (state === 'idle' || state === 'over') {
        startGame();
      }
      return;
    }

    if (state !== 'playing') return;

    const map = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 },
      s: { x: 0, y: 1 },
      a: { x: -1, y: 0 },
      d: { x: 1, y: 0 },
    };

    const nd = map[key];
    if (nd) {
      e.preventDefault();
      // Prevent reversing into self
      if (nd.x !== -dir.x || nd.y !== -dir.y) {
        nextDir = nd;
      }
    }
  }

  // ── Input: Touch Swipe ────────────────────────────────────
  let touchStartX = 0;
  let touchStartY = 0;

  function handleTouchStart(e) {
    const t = e.touches[0];
    touchStartX = t.clientX;
    touchStartY = t.clientY;
  }

  function handleTouchEnd(e) {
    if (state === 'idle' || state === 'over') {
      startGame();
      return;
    }
    if (state !== 'playing') return;

    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) < 20) return; // too small

    let nd;
    if (absDx > absDy) {
      nd = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    } else {
      nd = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    }

    if (nd.x !== -dir.x || nd.y !== -dir.y) {
      nextDir = nd;
    }
  }

  // ── Initialise ────────────────────────────────────────────
  buildUI();
  resize();

  window.addEventListener('keydown', handleKey);
  canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
  canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
  window.addEventListener('resize', resize);

  // Initial idle draw
  draw();

  // Return a cleanup function
  return function destroy() {
    clearInterval(loopId);
    window.removeEventListener('keydown', handleKey);
    window.removeEventListener('resize', resize);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchend', handleTouchEnd);
    container.innerHTML = '';
  };
}
