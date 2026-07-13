/**
 * Chrome Dino Runner Game Clone — Neon Style
 * Pure JavaScript, Canvas-based
 *
 * Usage:
 *   initDinoGame('my-container-id');
 *
 * The function creates a responsive canvas inside the given container
 * and runs a full dino-runner game with obstacles, scoring, and high-score persistence.
 */

function initDinoGame(containerId) {
  // ── Theme colours ──────────────────────────────────────────────
  const COLORS = {
    bg:        '#111827',
    dino:      '#00E5FF',
    obstacle:  '#2979FF',
    ground:    'rgba(0, 229, 255, 0.3)',
    text:      '#E0E7F1',
    glow:      '#00E5FF',
    dimText:   'rgba(224, 231, 241, 0.5)',
    overlay:   'rgba(17, 24, 39, 0.75)',
  };

  const FONT = "'JetBrains Mono', monospace";

  // ── Container setup ────────────────────────────────────────────
  const container = document.getElementById(containerId);
  if (!container) {
    console.error(`[DinoGame] Container #${containerId} not found.`);
    return;
  }

  // Wrapper div for positioning
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:relative;width:100%;overflow:hidden;border-radius:12px;' +
    `border:1px solid rgba(0,229,255,0.25);box-shadow:0 0 18px rgba(0,229,255,0.15),inset 0 0 18px rgba(0,229,255,0.05);`;
  container.appendChild(wrapper);

  // Canvas
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;background:' + COLORS.bg + ';';
  wrapper.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  // ── Constants ──────────────────────────────────────────────────
  const DESIGN_W = 800;
  const DESIGN_H = 260;
  const GROUND_Y_RATIO = 0.82;          // ground line position (fraction of height)
  const GRAVITY = 0.55;
  const JUMP_FORCE = -11;
  const INITIAL_SPEED = 5;
  const MAX_SPEED = 14;
  const SPEED_INCREMENT = 0.0008;        // per frame
  const MIN_OBSTACLE_GAP = 55;          // frames between obstacles
  const LS_KEY = 'dino_game_high_score';

  // ── State ──────────────────────────────────────────────────────
  let scale = 1;
  let groundY = DESIGN_H * GROUND_Y_RATIO;
  let gameState = 'idle';  // idle | running | over
  let score = 0;
  let highScore = parseInt(localStorage.getItem(LS_KEY), 10) || 0;
  let speed = INITIAL_SPEED;
  let frameCount = 0;
  let lastObstacleFrame = 0;
  let animFrameId = null;

  // Dino
  const dino = {
    w: 34, h: 38,
    x: 52,
    y: 0,
    vy: 0,
    grounded: true,
    // running animation
    legFrame: 0,
    legTimer: 0,
  };

  // Obstacles array
  let obstacles = [];

  // Ground dash markers for scrolling effect
  let groundOffset = 0;

  // Particles (on death)
  let particles = [];

  // ── Sizing ─────────────────────────────────────────────────────
  function resize() {
    const rect = container.getBoundingClientRect();
    const w = rect.width || DESIGN_W;
    scale = w / DESIGN_W;
    canvas.width = DESIGN_W;
    canvas.height = DESIGN_H;
    canvas.style.height = (DESIGN_H * scale) + 'px';
    groundY = DESIGN_H * GROUND_Y_RATIO;
    dino.y = groundY - dino.h;
  }
  resize();
  window.addEventListener('resize', resize);

  // ── Helpers ────────────────────────────────────────────────────
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x &&
           a.y < b.y + b.h && a.y + a.h > b.y;
  }

  // ── Drawing helpers ────────────────────────────────────────────

  function drawPixelRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  /** Draw the dino as a pixelated geometric figure */
  function drawDino() {
    const bx = Math.round(dino.x);
    const by = Math.round(dino.y);
    const c = COLORS.dino;
    const p = 4; // pixel size

    // Glow
    ctx.shadowColor = COLORS.glow;
    ctx.shadowBlur = 10;

    // Head
    drawPixelRect(bx + p * 4, by, p * 5, p * 3, c);
    // Eye (dark pixel)
    drawPixelRect(bx + p * 7, by + p * 0.5, p, p, COLORS.bg);

    // Neck
    drawPixelRect(bx + p * 3, by + p * 3, p * 3, p, c);

    // Body
    drawPixelRect(bx + p * 1, by + p * 4, p * 5, p * 4, c);

    // Tail
    drawPixelRect(bx, by + p * 4, p, p * 2, c);

    // Arm
    drawPixelRect(bx + p * 5, by + p * 5, p * 2, p, c);

    // Legs (animated)
    if (dino.grounded && gameState === 'running') {
      if (dino.legFrame === 0) {
        drawPixelRect(bx + p * 1.5, by + p * 8, p, p * 2, c);
        drawPixelRect(bx + p * 4, by + p * 8, p, p * 1, c);
      } else {
        drawPixelRect(bx + p * 1.5, by + p * 8, p, p * 1, c);
        drawPixelRect(bx + p * 4, by + p * 8, p, p * 2, c);
      }
    } else {
      // standing / airborne
      drawPixelRect(bx + p * 1.5, by + p * 8, p, p * 1.5, c);
      drawPixelRect(bx + p * 4, by + p * 8, p, p * 1.5, c);
    }

    ctx.shadowBlur = 0;
  }

  /** Draw a cactus-like obstacle */
  function drawObstacle(ob) {
    const c = COLORS.obstacle;
    const p = 4;
    const bx = Math.round(ob.x);
    const by = Math.round(ob.y);

    ctx.shadowColor = COLORS.obstacle;
    ctx.shadowBlur = 8;

    if (ob.type === 0) {
      // Small single cactus
      drawPixelRect(bx + p, by, p * 2, ob.h, c);
      drawPixelRect(bx, by + p * 2, p, p * 3, c);
      drawPixelRect(bx + p * 3, by + p * 3, p, p * 2, c);
    } else if (ob.type === 1) {
      // Tall single cactus
      drawPixelRect(bx + p, by, p * 2, ob.h, c);
      drawPixelRect(bx, by + p * 1, p, p * 4, c);
      drawPixelRect(bx + p * 3, by + p * 2, p, p * 3, c);
    } else {
      // Double cactus cluster
      drawPixelRect(bx + p * 0.5, by + p, p * 2, ob.h - p, c);
      drawPixelRect(bx + p * 3.5, by, p * 2, ob.h, c);
      drawPixelRect(bx, by + p * 2, p, p * 2, c);
      drawPixelRect(bx + p * 5.5, by + p * 2, p, p * 3, c);
    }

    ctx.shadowBlur = 0;
  }

  // ── Particle system (death effect) ─────────────────────────────
  function spawnParticles(cx, cy) {
    for (let i = 0; i < 16; i++) {
      particles.push({
        x: cx, y: cy,
        vx: rand(-3, 3),
        vy: rand(-5, 1),
        life: rand(18, 35) | 0,
        size: rand(2, 5),
      });
    }
  }

  function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    ctx.shadowColor = COLORS.glow;
    ctx.shadowBlur = 6;
    particles.forEach(p => {
      const alpha = Math.max(p.life / 35, 0);
      ctx.fillStyle = `rgba(0,229,255,${alpha.toFixed(2)})`;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.shadowBlur = 0;
  }

  // ── Obstacle spawning ─────────────────────────────────────────
  function spawnObstacle() {
    const type = (Math.random() * 3) | 0; // 0, 1, 2
    let w, h;
    if (type === 0) { w = 20; h = 30; }
    else if (type === 1) { w = 20; h = 42; }
    else { w = 32; h = 36; }

    obstacles.push({
      x: DESIGN_W + 10,
      y: groundY - h,
      w, h, type,
    });
    lastObstacleFrame = frameCount;
  }

  // ── Game actions ───────────────────────────────────────────────
  function startGame() {
    score = 0;
    speed = INITIAL_SPEED;
    frameCount = 0;
    lastObstacleFrame = -MIN_OBSTACLE_GAP;
    obstacles = [];
    particles = [];
    dino.y = groundY - dino.h;
    dino.vy = 0;
    dino.grounded = true;
    gameState = 'running';
  }

  function gameOver() {
    gameState = 'over';
    if (score > highScore) {
      highScore = score;
      localStorage.setItem(LS_KEY, highScore);
    }
    spawnParticles(dino.x + dino.w / 2, dino.y + dino.h / 2);
  }

  function jump() {
    if (gameState === 'idle') { startGame(); }
    if (gameState === 'over') {
      // small delay so the player doesn't accidentally restart
      return;
    }
    if (dino.grounded) {
      dino.vy = JUMP_FORCE;
      dino.grounded = false;
    }
  }

  function restartAfterOver() {
    if (gameState === 'over' && particles.length === 0) {
      startGame();
    }
  }

  // ── Input ──────────────────────────────────────────────────────
  function onKeyDown(e) {
    if (!container.closest('.active-game')) return;
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      if (gameState === 'over') { restartAfterOver(); return; }
      jump();
    }
  }

  function onTouch(e) {
    e.preventDefault();
    if (gameState === 'over') { restartAfterOver(); return; }
    jump();
  }

  document.addEventListener('keydown', onKeyDown);
  canvas.addEventListener('touchstart', onTouch, { passive: false });
  canvas.addEventListener('mousedown', (e) => {
    if (gameState === 'over') { restartAfterOver(); return; }
    jump();
  });

  // ── Update ─────────────────────────────────────────────────────
  function update() {
    if (gameState !== 'running') {
      updateParticles();
      return;
    }

    frameCount++;

    // Speed up
    if (speed < MAX_SPEED) speed += SPEED_INCREMENT;

    // Dino physics
    if (!dino.grounded) {
      dino.vy += GRAVITY;
      dino.y += dino.vy;
      if (dino.y >= groundY - dino.h) {
        dino.y = groundY - dino.h;
        dino.vy = 0;
        dino.grounded = true;
      }
    }

    // Leg animation
    dino.legTimer++;
    if (dino.legTimer > 6) {
      dino.legTimer = 0;
      dino.legFrame = dino.legFrame === 0 ? 1 : 0;
    }

    // Ground scroll
    groundOffset = (groundOffset + speed) % 24;

    // Obstacles
    const gap = Math.max(MIN_OBSTACLE_GAP, 90 - speed * 3);
    if (frameCount - lastObstacleFrame > gap + rand(0, 30)) {
      spawnObstacle();
    }

    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= speed;
      if (obstacles[i].x + obstacles[i].w < -10) {
        obstacles.splice(i, 1);
      }
    }

    // Collision (with small padding for fairness)
    const PAD = 6;
    const dinoBox = { x: dino.x + PAD, y: dino.y + PAD, w: dino.w - PAD * 2, h: dino.h - PAD };
    for (const ob of obstacles) {
      const obBox = { x: ob.x + 4, y: ob.y + 2, w: ob.w - 8, h: ob.h - 2 };
      if (rectsOverlap(dinoBox, obBox)) {
        gameOver();
        return;
      }
    }

    // Score
    score = Math.floor(frameCount / 6);

    updateParticles();
  }

  // ── Draw ───────────────────────────────────────────────────────
  function draw() {
    // Clear
    ctx.fillStyle = COLORS.bg;
    ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);

    // Ground line
    ctx.strokeStyle = COLORS.ground;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(DESIGN_W, groundY);
    ctx.stroke();

    // Ground dash marks (scrolling)
    ctx.lineWidth = 1;
    for (let x = -groundOffset; x < DESIGN_W; x += 24) {
      const len = (x % 48 === 0) ? 8 : 4;
      ctx.beginPath();
      ctx.moveTo(x, groundY + 6);
      ctx.lineTo(x + len, groundY + 6);
      ctx.stroke();
    }

    // Obstacles
    obstacles.forEach(drawObstacle);

    // Dino
    drawDino();

    // Particles
    drawParticles();

    // ── HUD ──
    ctx.font = `14px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.fillStyle = COLORS.text;
    const scoreStr = String(score).padStart(5, '0');
    ctx.fillText(scoreStr, DESIGN_W - 16, 28);

    if (highScore > 0) {
      ctx.fillStyle = COLORS.dimText;
      ctx.font = `11px ${FONT}`;
      ctx.fillText('HI ' + String(highScore).padStart(5, '0'), DESIGN_W - 16, 46);
    }

    // ── Overlay messages ──
    if (gameState === 'idle') {
      // Darken
      ctx.fillStyle = COLORS.overlay;
      ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);

      ctx.textAlign = 'center';
      ctx.shadowColor = COLORS.glow;
      ctx.shadowBlur = 14;
      ctx.fillStyle = COLORS.dino;
      ctx.font = `bold 20px ${FONT}`;
      ctx.fillText('DINO RUNNER', DESIGN_W / 2, DESIGN_H / 2 - 22);

      ctx.shadowBlur = 0;
      ctx.fillStyle = COLORS.text;
      ctx.font = `13px ${FONT}`;
      ctx.fillText('Press SPACE to Start', DESIGN_W / 2, DESIGN_H / 2 + 10);

      ctx.fillStyle = COLORS.dimText;
      ctx.font = `11px ${FONT}`;
      ctx.fillText('or tap / click', DESIGN_W / 2, DESIGN_H / 2 + 30);
    }

    if (gameState === 'over') {
      ctx.fillStyle = COLORS.overlay;
      ctx.fillRect(0, 0, DESIGN_W, DESIGN_H);

      ctx.textAlign = 'center';
      ctx.shadowColor = '#FF1744';
      ctx.shadowBlur = 14;
      ctx.fillStyle = '#FF1744';
      ctx.font = `bold 22px ${FONT}`;
      ctx.fillText('GAME OVER', DESIGN_W / 2, DESIGN_H / 2 - 20);

      ctx.shadowBlur = 0;
      ctx.fillStyle = COLORS.text;
      ctx.font = `15px ${FONT}`;
      ctx.fillText('Score: ' + scoreStr, DESIGN_W / 2, DESIGN_H / 2 + 10);

      if (score >= highScore && highScore > 0) {
        ctx.fillStyle = COLORS.dino;
        ctx.font = `12px ${FONT}`;
        ctx.fillText('★ NEW HIGH SCORE ★', DESIGN_W / 2, DESIGN_H / 2 + 32);
      }

      ctx.fillStyle = COLORS.dimText;
      ctx.font = `11px ${FONT}`;
      ctx.fillText('Press SPACE to Restart', DESIGN_W / 2, DESIGN_H / 2 + 52);
    }

    ctx.shadowBlur = 0;
    ctx.textAlign = 'left';
  }

  // ── Game loop ──────────────────────────────────────────────────
  function loop() {
    update();
    draw();
    animFrameId = requestAnimationFrame(loop);
  }

  // Kick off
  resize();
  dino.y = groundY - dino.h;
  loop();
}
