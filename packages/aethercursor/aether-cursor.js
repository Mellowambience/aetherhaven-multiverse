/**
 * aether-cursor.js
 * AetherCursor — ambient arc thinking module cursor
 * by Mars / AetherRose
 *
 * Two states:
 *   AMBIENT  — cursor is moving: tiny cold-blue dot + ghost trail, near-invisible
 *   HOVER    — cursor idle ≥180ms OR over interactive element: blooms into
 *              full 3-body arc system (cold-blue → violet → plasma-orange)
 *
 * Drop-in usage:
 *   <script src="aether-cursor.js"></script>
 *   AetherCursor.attach();  // call once after DOM ready
 *
 * Optional config:
 *   AetherCursor.attach({
 *     bloomDelay: 180,     // ms idle before bloom (default 180)
 *     size: 64,            // bloom diameter px (default 64)
 *     ambientSize: 18,     // ambient dot diameter px (default 18)
 *     hoverSelectors: 'a,button,[role="button"],[tabindex]',
 *   });
 *
 * To detach:
 *   AetherCursor.detach();
 */

(function (global) {
  'use strict';

  // ── Palette (canonical AetherRose) ────────────────────────────────────────
  const C = {
    violet:  '#7C6AF7',
    plasma:  '#F2A65A',
    accent:  '#E8E8F0',
    cold:    '#B8C8FF',
    violetRGB:  [124, 106, 247],
    plasmaRGB:  [242, 164,  90],
    coldRGB:    [184, 200, 255],
    accentRGB:  [232, 232, 240],
  };

  // ── State ─────────────────────────────────────────────────────────────────
  let canvas, ctx;
  let mx = -200, my = -200;       // mouse position
  let raf;
  let idleTimer = null;
  let bloomT = 0;                  // 0=ambient, 1=fully bloomed (lerped)
  let frame = 0;
  let detached = false;
  let cfg = {};
  let boundHandlers = {};

  const DEFAULTS = {
    bloomDelay: 180,
    size: 64,
    ambientSize: 18,
    hoverSelectors: 'a,button,input,select,textarea,[role="button"],[tabindex],[onclick]',
  };

  // ── Ghost trail ───────────────────────────────────────────────────────────
  const TRAIL_LEN = 7;
  const trail = Array.from({ length: TRAIL_LEN }, () => ({ x: -200, y: -200 }));
  let trailFrame = 0;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function lerp(a, b, t) { return a + (b - a) * t; }

  function hexToRGB(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return [r, g, b];
  }

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

  // ── Canvas setup ─────────────────────────────────────────────────────────
  function setupCanvas() {
    canvas = document.createElement('canvas');
    canvas.id = 'aether-cursor-canvas';
    Object.assign(canvas.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '2147483647',  // max z-index
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

  // ── Draw: AMBIENT state ───────────────────────────────────────────────────
  // tiny cold-blue dot + short ghost trail, near-transparent
  function drawAmbient(alpha) {
    const r = lerp(cfg.ambientSize / 2, cfg.size / 2, easeInOut(bloomT));
    const baseOpacity = lerp(0.35, 0, easeInOut(bloomT)) * alpha;
    if (baseOpacity < 0.005) return;

    // ghost trail (only visible in pure ambient state)
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

  // ── Draw: ARC SYSTEM (bloomed state) ─────────────────────────────────────
  // Three-body arc system — same arc DNA as AetherReentry
  function drawArcSystem(alpha) {
    if (alpha < 0.005) return;
    const R    = cfg.size / 2;       // outer arc radius
    const Ri   = R * 0.78;          // inner arc radius
    const Rc   = R * 0.60;          // core arc radius
    const cx   = mx;
    const cy   = my;

    // ── Arc drawing helper ────────────────────────────────────────────────
    // Draws a conic sweep from `startAngle` sweeping `sweepAngle` radians
    // with a color gradient from colorA → colorB → transparent fade at tail
    function drawArc(radius, startAngle, sweepAngle, colorA_rgb, colorB_rgb, lineWidth, opacity) {
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

        // leading edge is bright, tail fades
        const brightness = Math.pow(t0, 0.4);  // front-loaded
        const fadeAlpha  = Math.pow(t0, 1.6);  // tail fades
        const seg_rgb    = lerpColor(colorA_rgb, colorB_rgb, brightness);

        ctx.beginPath();
        ctx.strokeStyle = rgba(seg_rgb, fadeAlpha);
        ctx.arc(cx, cy, radius, a0, a1);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Rotation angles — each arc body has its own frame-driven offset
    const tOuter = (frame * 0.018) % (Math.PI * 2);     // 4.2s equiv, ease
    const tInner = -(frame * 0.013) % (Math.PI * 2);    // 5.5s counter
    const tCore  = -(frame * 0.024) % (Math.PI * 2);    // 2.8s reverse

    // Scale factor: 0 when ambient, 1 when fully bloomed
    const scale = easeInOut(bloomT);
    if (scale < 0.01) return;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.translate(-cx, -cy);

    // OUTER ARC — cold-blue → violet → plasma, 220° sweep, 3.5px
    drawArc(R,  tOuter, 3.14 * 1.22,  C.coldRGB, C.violetRGB, 3.5 * scale, 0.9);
    // leading plasma tip
    drawArc(R,  tOuter + 3.14 * 0.8, 3.14 * 0.4, C.violetRGB, C.plasmaRGB, 3.5 * scale, 0.7);

    // INNER ARC — plasma → violet counter, 160° sweep, 2px
    drawArc(Ri, tInner, 3.14 * 0.88, C.plasmaRGB, C.violetRGB, 2.0 * scale, 0.55);

    // CORE ARC — accent → violet, 140° sweep, 1.5px with blur illusion via double pass
    drawArc(Rc, tCore,  3.14 * 0.78, C.accentRGB, C.violetRGB, 2.5 * scale, 0.45);
    drawArc(Rc, tCore,  3.14 * 0.78, C.accentRGB, C.violetRGB, 4.0 * scale, 0.12);

    ctx.restore();

    // ── Void core (frosted center dot) ────────────────────────────────────
    const coreR = R * 0.22 * scale;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 2);
    grad.addColorStop(0,   rgba(C.accentRGB, 0.12 * scale * alpha));
    grad.addColorStop(0.5, rgba(C.violetRGB, 0.08 * scale * alpha));
    grad.addColorStop(1,   rgba(C.violetRGB, 0));
    ctx.beginPath();
    ctx.arc(cx, cy, coreR * 2, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // ── Aura bloom (violet radial behind arcs) ────────────────────────────
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

  // ── Main render loop ──────────────────────────────────────────────────────
  function render() {
    if (detached) return;
    raf = requestAnimationFrame(render);
    frame++;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Bloom lerp: smoothly transition ambient ↔ bloom
    const bloomTarget = (idleTimer === null) ? 1 : 0;  // null = idle=bloomed, set=moving
    // Wait — logic: idleTimer is SET while moving (countdown to bloom)
    // When timer fires, idleTimer=null → bloom
    // This is inverted. Correct:
    //   moving      → idleTimer = setTimeout(...) → bloomTarget=0
    //   idle/hover  → idleTimer cleared, bloomed=true → bloomTarget=1
    // We use a separate flag:
    const speed = 0.07;
    bloomT += (bloomTarget_flag - bloomT) * speed;
    bloomT = Math.max(0, Math.min(1, bloomT));

    drawAmbient(1);
    drawArcSystem(1);

    // update trail
    trailFrame++;
    if (trailFrame % 2 === 0) {
      trail.pop();
      trail.unshift({ x: mx, y: my });
    }
  }

  // ── bloomTarget_flag (separate from idleTimer null check) ─────────────────
  let bloomTarget_flag = 0;

  function setBloom(val) {
    bloomTarget_flag = val;
  }

  // ── Event handlers ────────────────────────────────────────────────────────
  function onMouseMove(e) {
    mx = e.clientX;
    my = e.clientY;

    // Moving → ambient
    setBloom(0);

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
    const el = e.relatedTarget || e.target;
    if (!el) return;
    // If leaving an interactive element back to a non-interactive one,
    // revert to ambient if still moving
    if (idleTimer !== null) {
      setBloom(0);
    }
  }

  // ── Public API ────────────────────────────────────────────────────────────
  const AetherCursor = {

    /**
     * Attach the cursor to the document.
     * @param {object} options  Optional config overrides.
     */
    attach(options) {
      if (canvas) return;  // already attached
      cfg = Object.assign({}, DEFAULTS, options || {});
      detached = false;

      // Hide native cursor
      document.documentElement.style.cursor = 'none';

      setupCanvas();

      boundHandlers.mousemove  = onMouseMove;
      boundHandlers.mouseover  = onMouseOver;
      boundHandlers.mouseout   = onMouseOut;
      boundHandlers.resize     = resize;

      document.addEventListener('mousemove',  boundHandlers.mousemove);
      document.addEventListener('mouseover',  boundHandlers.mouseover);
      document.addEventListener('mouseout',   boundHandlers.mouseout);
      window.addEventListener('resize',       boundHandlers.resize);

      render();
    },

    /**
     * Detach and restore native cursor.
     */
    detach() {
      detached = true;
      if (raf) cancelAnimationFrame(raf);
      if (canvas) canvas.remove();
      canvas = null; ctx = null;
      document.documentElement.style.cursor = '';
      document.removeEventListener('mousemove', boundHandlers.mousemove);
      document.removeEventListener('mouseover', boundHandlers.mouseover);
      document.removeEventListener('mouseout',  boundHandlers.mouseout);
      window.removeEventListener('resize',      boundHandlers.resize);
      if (idleTimer) clearTimeout(idleTimer);
      bloomT = 0; bloomTarget_flag = 0; frame = 0;
    },

    /** Programmatically trigger bloom (e.g., on route change) */
    bloom()  { setBloom(1); },
    /** Programmatically return to ambient */
    ambient(){ setBloom(0); },
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
