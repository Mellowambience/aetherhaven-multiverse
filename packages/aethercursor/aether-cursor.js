/**
 * aether-cursor.js  v1.1
 * AetherCursor — ambient arc thinking module cursor
 * by Mars / AetherRose
 *
 * STATES:
 *   AMBIENT  — cursor moving: tiny 18px cold-blue dot + ghost trail
 *   BLOOM    — cursor idle ≥180ms OR over interactive element:
 *              full 64px 3-body arc system (cold-blue → violet → plasma)
 *
 * INTERACTIONS (requires void-chat.js loaded before this script):
 *   CLICK while BLOOMED     → opens MIST Oracle glass box
 *   IDLE for 5 minutes      → auto-summons VoidChat cyberspace room
 *
 * Drop-in usage:
 *   <script src="void-chat.js"></script>   <!--  load first -->
 *   <script src="aether-cursor.js"></script>
 *   AetherCursor.attach();
 *
 * Or auto-attach:
 *   <html data-aether-cursor>
 *
 * Optional config:
 *   AetherCursor.attach({
 *     bloomDelay:     180,   // ms idle before bloom (default 180)
 *     size:           64,    // bloom diameter px (default 64)
 *     ambientSize:    18,    // ambient dot diameter px (default 18)
 *     cyberRoomDelay: 300000,// ms before auto-summoning cyber room (default 5min)
 *     hoverSelectors: 'a,button,[role="button"],[tabindex]',
 *   });
 *
 * Production wiring for MIST:
 *   window.__MIST_USER = { name: 'Mars', id: 'user_abc' }; // set after auth
 *   window.MIST_ORACLE_ENDPOINT = '/api/mist-oracle';       // Vercel edge fn
 *
 * To detach:
 *   AetherCursor.detach();
 */

(function (global) {
  'use strict';

  // ── Palette (canonical AetherRose) ─────────────────────────────────────
  const C = {
    violet:     '#7C6AF7',
    plasma:     '#F2A65A',
    accent:     '#E8E8F0',
    cold:       '#B8C8FF',
    violetRGB:  [124, 106, 247],
    plasmaRGB:  [242, 164,  90],
    coldRGB:    [184, 200, 255],
    accentRGB:  [232, 232, 240],
  };

  // ── State ────────────────────────────────────────────────────────────────
  let canvas, ctx;
  let mx = -200, my = -200;
  let raf;
  let idleTimer   = null;  // null = idle (bloomed), set = moving (ambient)
  let cyberTimer  = null;  // 5-min auto-summon timer
  let bloomT      = 0;     // 0=ambient, 1=fully bloomed
  let bloomTarget_flag = 0;
  let frame       = 0;
  let detached    = false;
  let cfg         = {};
  let boundHandlers = {};

  const DEFAULTS = {
    bloomDelay:      180,
    size:            64,
    ambientSize:     18,
    cyberRoomDelay:  300000,  // 5 minutes
    hoverSelectors:  'a,button,input,select,textarea,[role="button"],[tabindex],[onclick]',
  };

  // ── Ghost trail ─────────────────────────────────────────────────────────
  const TRAIL_LEN = 7;
  const trail = Array.from({ length: TRAIL_LEN }, () => ({ x: -200, y: -200 }));
  let trailFrame = 0;

  // ── Helpers ─────────────────────────────────────────────────────────────
  function lerp(a, b, t) { return a + (b - a) * t; }

  function lerpColor(rgbA, rgbB, t) {
    return [
      Math.round(lerp(rgbA[0], rgbB[0], t)),
      Math.round(lerp(rgbA[1], rgbB[1], t)),
      Math.round(lerp(rgbA[2], rgbB[2], t)),
    ];
  }

  function rgba(rgb, a) {
    return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a.toFixed(3)})`;
  }

  function easeInOut(t) {
    return t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
  }

  // ── Canvas setup ──────────────────────────────────────────────────────
  function setupCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'aether-cursor-canvas';
    Object.assign(canvas.style, {
      position: 'fixed', top: '0', left: '0',
      width: '100vw', height: '100vh',
      pointerEvents: 'none',
      zIndex: '2147483647',
    });
    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');
    resize();
  }

  function resize() {
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // ── Draw: AMBIENT state ─────────────────────────────────────────────────
  function drawAmbient(alpha) {
    const r = lerp(cfg.ambientSize / 2, cfg.size / 2, easeInOut(bloomT));
    const baseOpacity = lerp(0.35, 0, easeInOut(bloomT)) * alpha;
    if (baseOpacity < 0.005) return;

    // ghost trail
    const trailOpacity = (1 - easeInOut(bloomT)) * 0.18 * alpha;
    if (trailOpacity > 0.005) {
      for (let i = 0; i < TRAIL_LEN; i++) {
        const t = trail[i];
        const frac = (TRAIL_LEN - i) / TRAIL_LEN;
        const tr = r * frac * 0.6;
        ctx.beginPath();
        ctx.arc(t.x, t.y, Math.max(tr, 0.5), 0, Math.PI * 2);
        ctx.fillStyle = rgba(C.coldRGB, trailOpacity * frac * 0.6);
        ctx.fill();
      }
    }

    // core dot
    const grad = ctx.createRadialGradient(mx, my, 0, mx, my, r);
    grad.addColorStop(0,   rgba(C.accentRGB, baseOpacity));
    grad.addColorStop(0.4, rgba(C.coldRGB,   baseOpacity * 0.8));
    grad.addColorStop(1,   rgba(C.coldRGB,   0));
    ctx.beginPath();
    ctx.arc(mx, my, r, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // thin ring
    ctx.beginPath();
    ctx.arc(mx, my, r * 0.9, 0, Math.PI * 2);
    ctx.strokeStyle = rgba(C.coldRGB, baseOpacity * 0.4);
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // ── Draw: ARC SYSTEM (bloomed state) ─────────────────────────────────
  function drawArcSystem(alpha) {
    if (alpha < 0.005) return;
    const R  = cfg.size / 2;
    const Ri = R * 0.78;
    const Rc = R * 0.60;
    const cx = mx, cy = my;

    function drawArc(radius, startAngle, sweepAngle, colorA, colorB, lineWidth, opacity) {
      const steps = 60;
      ctx.save();
      ctx.globalAlpha = opacity * alpha;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      for (let i = 0; i < steps; i++) {
        const t0 = i / steps;
        const t1 = (i + 1) / steps;
        const a0 = startAngle + t0 * sweepAngle;
        const a1 = startAngle + t1 * sweepAngle;
        const brightness = Math.pow(t0, 0.4);
        const fadeAlpha  = Math.pow(t0, 1.6);
        const seg_rgb    = lerpColor(colorA, colorB, brightness);
        ctx.beginPath();
        ctx.strokeStyle = rgba(seg_rgb, fadeAlpha);
        ctx.arc(cx, cy, radius, a0, a1);
        ctx.stroke();
      }
      ctx.restore();
    }

    const tOuter = (frame * 0.018) % (Math.PI * 2);
    const tInner = -(frame * 0.013) % (Math.PI * 2);
    const tCore  = -(frame * 0.024) % (Math.PI * 2);

    const scale = easeInOut(bloomT);
    if (scale < 0.01) return;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);

    drawArc(R,  tOuter, 3.14 * 1.22, C.coldRGB,   C.violetRGB, 3.5 * scale, 0.9);
    drawArc(R,  tOuter + 3.14 * 0.8, 3.14 * 0.4, C.violetRGB, C.plasmaRGB, 3.5 * scale, 0.7);
    drawArc(Ri, tInner, 3.14 * 0.88, C.plasmaRGB, C.violetRGB, 2.0 * scale, 0.55);
    drawArc(Rc, tCore,  3.14 * 0.78, C.accentRGB, C.violetRGB, 2.5 * scale, 0.45);
    drawArc(Rc, tCore,  3.14 * 0.78, C.accentRGB, C.violetRGB, 4.0 * scale, 0.12);

    ctx.restore();

    // void core
    const coreR = R * 0.22 * scale;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2);
    grad.addColorStop(0,   rgba(C.accentRGB, 0.12 * scale * alpha));
    grad.addColorStop(0.5, rgba(C.violetRGB, 0.08 * scale * alpha));
    grad.addColorStop(1,   rgba(C.violetRGB, 0));
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 2, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // aura
    const auraR  = R * (1.3 + 0.08 * Math.sin(frame * 0.04)) * scale;
    const auraOp = 0.07 * scale * alpha;
    const aura   = ctx.createRadialGradient(cx, cy, 0, cx, cy, auraR);
    aura.addColorStop(0,   rgba(C.violetRGB, auraOp));
    aura.addColorStop(0.6, rgba(C.violetRGB, auraOp * 0.3));
    aura.addColorStop(1,   rgba(C.violetRGB, 0));
    ctx.beginPath();
    ctx.arc(cx, cy, auraR, 0, Math.PI * 2);
    ctx.fillStyle = aura;
    ctx.fill();
  }

  // ── Main render loop ────────────────────────────────────────────────────
  function render() {
    if (detached) return;
    raf = requestAnimationFrame(render);
    frame++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const speed = 0.07;
    bloomT += (bloomTarget_flag - bloomT) * speed;
    bloomT = Math.max(0, Math.min(1, bloomT));

    drawAmbient(1);
    drawArcSystem(1);

    trailFrame++;
    if (trailFrame % 2 === 0) {
      trail.pop();
      trail.unshift({ x: mx, y: my });
    }
  }

  // ── Bloom flag helpers ──────────────────────────────────────────────────
  function setBloom(val)  { bloomTarget_flag = val; }

  // ── 5-min idle cyberroom timer ──────────────────────────────────────────
  function resetCyberTimer() {
    if (cyberTimer) clearTimeout(cyberTimer);
    cyberTimer = setTimeout(() => {
      cyberTimer = null;
      // Only auto-summon if no overlay is already open
      if (global.VoidChat && !document.getElementById('void-chat-overlay')) {
        global.VoidChat.openCyberRoom();
      }
    }, cfg.cyberRoomDelay);
  }

  // ── Event handlers ──────────────────────────────────────────────────────
  function onMouseMove(e) {
    mx = e.clientX;
    my = e.clientY;

    setBloom(0);  // moving = ambient
    resetCyberTimer();

    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      idleTimer = null;
      setBloom(1);
    }, cfg.bloomDelay);
  }

  function onMouseOver(e) {
    const el = e.target;
    if (!el) return;
    if (el.matches && el.matches(cfg.hoverSelectors)) {
      setBloom(1);
    }
  }

  function onMouseOut(e) {
    if (idleTimer !== null) setBloom(0);
  }

  /**
   * onClick: if cursor is currently bloomed (idle), open MIST Oracle glass box.
   * If cursor is ambient (moving) or overlay already open, do nothing.
   */
  function onClick(e) {
    // Only fire if we're in bloom state and VoidChat is loaded
    if (bloomTarget_flag < 0.5) return;           // ambient = ignore
    if (document.getElementById('void-chat-overlay')) return;  // already open
    if (!global.VoidChat) return;                 // void-chat.js not loaded

    // Don’t intercept clicks on real interactive elements
    const el = e.target;
    if (el && el.matches && el.matches('a,button,input,select,textarea,[role="button"]')) return;

    e.stopPropagation();
    global.VoidChat.openMIST();
  }

  // ── Public API ───────────────────────────────────────────────────────────
  const AetherCursor = {

    attach(options) {
      if (canvas) return;
      cfg = Object.assign({}, DEFAULTS, options || {});
      detached = false;

      document.documentElement.style.cursor = 'none';
      setupCanvas();

      boundHandlers.mousemove  = onMouseMove;
      boundHandlers.mouseover  = onMouseOver;
      boundHandlers.mouseout   = onMouseOut;
      boundHandlers.click      = onClick;
      boundHandlers.resize     = resize;

      document.addEventListener('mousemove',  boundHandlers.mousemove);
      document.addEventListener('mouseover',  boundHandlers.mouseover);
      document.addEventListener('mouseout',   boundHandlers.mouseout);
      document.addEventListener('click',      boundHandlers.click, true);
      window.addEventListener('resize',       boundHandlers.resize);

      // Start the 5-min cyber room timer immediately
      resetCyberTimer();

      render();
    },

    detach() {
      detached = true;
      if (raf)       cancelAnimationFrame(raf);
      if (canvas)    canvas.remove();
      canvas = null; ctx = null;
      document.documentElement.style.cursor = '';
      document.removeEventListener('mousemove', boundHandlers.mousemove);
      document.removeEventListener('mouseover', boundHandlers.mouseover);
      document.removeEventListener('mouseout',  boundHandlers.mouseout);
      document.removeEventListener('click',     boundHandlers.click, true);
      window.removeEventListener('resize',      boundHandlers.resize);
      if (idleTimer)  clearTimeout(idleTimer);
      if (cyberTimer) clearTimeout(cyberTimer);
      bloomT = 0; bloomTarget_flag = 0; frame = 0;
    },

    /** Programmatically trigger bloom */
    bloom()   { setBloom(1); },
    /** Programmatically return to ambient */
    ambient() { setBloom(0); },

    /** Expose for testing: manually open MIST or cyber room */
    openMIST()     { if (global.VoidChat) global.VoidChat.openMIST(); },
    openCyberRoom(){ if (global.VoidChat) global.VoidChat.openCyberRoom(); },
  };

  // Auto-attach on DOMContentLoaded if data-aether-cursor attr present
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (document.querySelector('[data-aether-cursor]') ||
          document.documentElement.dataset.aetherCursor !== undefined) {
        AetherCursor.attach();
      }
    });
  }

  global.AetherCursor = AetherCursor;

})(typeof window !== 'undefined' ? window : globalThis);
