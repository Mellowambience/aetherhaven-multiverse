/**
 * void-chat.js  v1.1
 * VoidChat — early-2000s cyberculture chat room + MIST Oracle glass box
 * by Mars / AetherRose
 *
 * Two entry points (both wired into aether-cursor.js):
 *
 *   1. AetherCursor CLICK while bloomed (idle)
 *      → opens MIST Oracle glass box
 *      → DEMO MODE  : no account, free, limited to 5 messages, soft "link account" nudge
 *      → LINKED MODE: account tied, greets by name, full session, unlimited
 *
 *   2. AetherCursor idle for 5 minutes
 *      → auto-summons VoidChat room (early-2000s cyberspace aesthetic)
 *      → CRT scanlines, phosphor green, matrix drip, visitor counter
 *      → user can dismiss or start chatting
 *
 * Production auth wiring:
 *   window.__MIST_USER = { name: 'Mars', id: 'user_abc' };  // set post-auth
 *   window.MIST_ORACLE_ENDPOINT = '/api/mist-oracle';        // Vercel edge fn
 *   window.MIST_AUTH_URL = '/login';                         // link account CTA target
 *
 * API:
 *   VoidChat.openMIST()       — open MIST glass box
 *   VoidChat.openCyberRoom()  — open early-2000s chat room
 *   VoidChat.close()          — close whichever is open
 */

(function (global) {
  'use strict';

  // ── Palette ───────────────────────────────────────────────────────────────────
  const P = {
    bg:       '#05020d',
    deep:     '#1a0b2e',
    violet:   '#7C6AF7',
    plasma:   '#F2A65A',
    cold:     '#B8C8FF',
    accent:   '#E8E8F0',
    confirm:  '#4ADE80',
    // cyber-2000s overrides
    phosphor: '#00FF41',
    cyan:     '#00FFFF',
    amber:    '#FFB347',
    darkCRT:  '#000a00',
  };

  const DEMO_MSG_LIMIT = 5;  // free messages before soft CTA

  // ── Shared overlay base ────────────────────────────────────────────────────────
  let overlay = null;
  let activeMode = null;

  function removeOverlay() {
    if (overlay) { overlay.remove(); overlay = null; }
    activeMode = null;
  }

  function makeOverlayBase() {
    removeOverlay();
    const el = document.createElement('div');
    el.id = 'void-chat-overlay';
    Object.assign(el.style, {
      position: 'fixed', inset: '0',
      zIndex: '2147483646',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    });
    el.addEventListener('click', function (e) {
      if (e.target === el) removeOverlay();
    });
    document.body.appendChild(el);
    overlay = el;
    return el;
  }

  function injectBaseStyles() {
    if (document.getElementById('void-chat-styles')) return;
    const s = document.createElement('style');
    s.id = 'void-chat-styles';
    s.textContent = `
      @keyframes vc-fadein    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      @keyframes vc-blink     { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes vc-scan      { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
      @keyframes vc-arc-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes vc-pulse-dot { 0%,100%{opacity:0.4;transform:scale(0.9)} 50%{opacity:1;transform:scale(1.1)} }
      @keyframes vc-matrix-drop { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes vc-counter-tick { from{color:#00FF41} to{color:#00FF8888} }
      @keyframes vc-demo-nudge  { 0%,100%{opacity:0.7} 50%{opacity:1} }
      @keyframes vc-cta-in   { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
      #void-chat-overlay { animation: vc-fadein 0.35s ease both; }
    `;
    document.head.appendChild(s);
  }

  // ═════════════════════════════════════════════════════════════
  //  MIST ORACLE GLASS BOX
  // ═════════════════════════════════════════════════════════════

  function openMIST() {
    injectBaseStyles();
    activeMode = 'mist';

    const user      = global.__MIST_USER || null;
    const isLinked  = !!user;
    const name      = user ? user.name : null;
    const endpoint  = global.MIST_ORACLE_ENDPOINT || null;
    const authURL   = global.MIST_AUTH_URL || '#';

    let demoMsgCount = 0;  // track free messages sent

    const base = makeOverlayBase();
    Object.assign(base.style, {
      background: 'rgba(5,2,13,0.76)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
      width: '420px', maxWidth: '92vw',
      height: isLinked ? '560px' : '520px',
      maxHeight: '85vh',
      background: 'rgba(10,5,25,0.90)',
      border: `1px solid ${isLinked ? 'rgba(124,106,247,0.35)' : 'rgba(184,200,255,0.2)'}`,
      borderRadius: '18px',
      boxShadow: isLinked
        ? '0 0 60px rgba(124,106,247,0.22), 0 0 120px rgba(124,106,247,0.07)'
        : '0 0 50px rgba(184,200,255,0.12), 0 0 100px rgba(184,200,255,0.05)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      position: 'relative',
    });
    box.addEventListener('click', e => e.stopPropagation());

    // ── Header
    const header = document.createElement('div');
    Object.assign(header.style, {
      padding: '14px 18px 12px',
      borderBottom: `1px solid ${isLinked ? 'rgba(124,106,247,0.15)' : 'rgba(184,200,255,0.08)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: '0',
    });

    const titleRow = document.createElement('div');
    Object.assign(titleRow.style, { display: 'flex', alignItems: 'center', gap: '10px' });

    // Arc spinner (violet if linked, cold-blue if demo)
    const spinner = document.createElement('div');
    Object.assign(spinner.style, {
      width: '22px', height: '22px', borderRadius: '50%',
      border: '2px solid transparent',
      borderTopColor: isLinked ? P.violet : P.cold,
      borderRightColor: isLinked ? P.plasma + '88' : P.cold + '44',
      animation: 'vc-arc-spin 1.4s linear infinite', flexShrink: '0',
    });

    const titleText = document.createElement('div');
    if (isLinked) {
      titleText.innerHTML = `
        <div style="font-size:0.72rem;letter-spacing:0.32em;font-weight:900;text-transform:uppercase;color:${P.accent};text-shadow:0 0 10px ${P.violet}">
          MIST <span style="color:${P.violet}">ORACLE</span>
        </div>
        <div style="font-size:0.56rem;letter-spacing:0.2em;color:rgba(255,255,255,0.3);margin-top:1px">
          linked · ${name}
        </div>`;
    } else {
      titleText.innerHTML = `
        <div style="font-size:0.72rem;letter-spacing:0.32em;font-weight:900;text-transform:uppercase;color:${P.accent};text-shadow:0 0 8px ${P.cold}">
          MIST <span style="color:${P.cold}">ORACLE</span>
          <span style="
            margin-left:8px;
            font-size:0.48rem;letter-spacing:0.22em;
            background:rgba(184,200,255,0.1);
            border:1px solid rgba(184,200,255,0.25);
            border-radius:4px;padding:1px 6px;
            color:${P.cold};font-weight:700;
            vertical-align:middle;
            animation:vc-demo-nudge 3s ease infinite;
          ">FREE DEMO</span>
        </div>
        <div style="font-size:0.56rem;letter-spacing:0.15em;color:rgba(255,255,255,0.28);margin-top:1px">
          no account needed · ${DEMO_MSG_LIMIT} free messages
        </div>`;
    }

    titleRow.appendChild(spinner);
    titleRow.appendChild(titleText);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    Object.assign(closeBtn.style, {
      background: 'none', border: 'none',
      color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem',
      cursor: 'pointer', padding: '0 2px', lineHeight: '1',
    });
    closeBtn.addEventListener('click', removeOverlay);
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.color = P.accent);
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.color = 'rgba(255,255,255,0.3)');

    header.appendChild(titleRow);
    header.appendChild(closeBtn);

    // ── Demo progress bar (guest only)
    let progressBar = null;
    let progressFill = null;
    if (!isLinked) {
      progressBar = document.createElement('div');
      Object.assign(progressBar.style, {
        height: '2px', background: 'rgba(184,200,255,0.08)',
        flexShrink: '0', position: 'relative', overflow: 'hidden',
      });
      progressFill = document.createElement('div');
      Object.assign(progressFill.style, {
        position: 'absolute', left: '0', top: '0', height: '100%',
        width: '0%',
        background: `linear-gradient(90deg, ${P.cold}, ${P.violet})`,
        borderRadius: '99px',
        transition: 'width 0.4s ease',
      });
      progressBar.appendChild(progressFill);
    }

    // ── Message area
    const msgArea = document.createElement('div');
    Object.assign(msgArea.style, {
      flex: '1', overflowY: 'auto', padding: '16px',
      display: 'flex', flexDirection: 'column', gap: '12px',
      scrollbarWidth: 'thin',
      scrollbarColor: `${isLinked ? P.violet : P.cold}44 transparent`,
    });

    function addMsg(role, text, isTyping) {
      const row = document.createElement('div');
      const isUser = role === 'user';
      Object.assign(row.style, {
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        animation: 'vc-fadein 0.25s ease both',
      });
      const bubble = document.createElement('div');
      const accentColor = isLinked ? P.violet : P.cold;
      Object.assign(bubble.style, {
        maxWidth: '78%', padding: '9px 13px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        fontSize: '0.8rem', lineHeight: '1.55',
        background: isUser
          ? `linear-gradient(135deg, ${accentColor}cc, ${accentColor}88)`
          : 'rgba(255,255,255,0.05)',
        border: isUser ? 'none' : `1px solid ${accentColor}22`,
        color: isUser ? '#fff' : P.accent,
        letterSpacing: '0.02em',
      });
      if (isTyping) {
        bubble.innerHTML = `
          <span style="display:inline-flex;gap:4px;align-items:center">
            <span style="width:5px;height:5px;border-radius:50%;background:${accentColor};animation:vc-pulse-dot 1.2s 0s infinite"></span>
            <span style="width:5px;height:5px;border-radius:50%;background:${accentColor};animation:vc-pulse-dot 1.2s 0.2s infinite"></span>
            <span style="width:5px;height:5px;border-radius:50%;background:${accentColor};animation:vc-pulse-dot 1.2s 0.4s infinite"></span>
          </span>`;
      } else {
        bubble.textContent = text;
      }
      row.appendChild(bubble);
      msgArea.appendChild(row);
      msgArea.scrollTop = msgArea.scrollHeight;
      return bubble;
    }

    // Initial greeting
    setTimeout(() => {
      if (isLinked) {
        addMsg('mist', `signal locked, ${name}. the void is open.`);
      } else {
        addMsg('mist', `you found the void. no account needed — this is a free demo. ${DEMO_MSG_LIMIT} messages, then the gate opens further if you want it to.`);
      }
    }, 400);

    // ── Soft link-account CTA card (guest only, shown after DEMO_MSG_LIMIT)
    function showLinkCTA() {
      const cta = document.createElement('div');
      Object.assign(cta.style, {
        margin: '4px 0',
        padding: '12px 14px',
        background: 'rgba(184,200,255,0.05)',
        border: `1px solid ${P.cold}33`,
        borderRadius: '12px',
        display: 'flex', flexDirection: 'column', gap: '8px',
        animation: 'vc-cta-in 0.4s ease both',
      });
      cta.innerHTML = `
        <div style="font-size:0.72rem;color:${P.cold};font-weight:700;letter-spacing:0.1em">✦ the void remembers more with an account</div>
        <div style="font-size:0.65rem;color:rgba(255,255,255,0.35);line-height:1.5">link your account to unlock full sessions, memory across visits, and a personalized signal key.</div>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <a href="${authURL}" style="
            display:inline-block;padding:6px 16px;
            background:linear-gradient(135deg,${P.cold}22,${P.violet}33);
            border:1px solid ${P.cold}55;
            border-radius:8px;
            color:${P.cold};font-size:0.65rem;font-weight:700;
            letter-spacing:0.15em;text-transform:uppercase;
            text-decoration:none;
          ">LINK ACCOUNT</a>
          <button id="vc-continue-demo" style="
            background:none;border:none;
            color:rgba(255,255,255,0.25);font-size:0.62rem;
            cursor:pointer;letter-spacing:0.08em;
          ">continue as guest</button>
        </div>`;
      msgArea.appendChild(cta);
      msgArea.scrollTop = msgArea.scrollHeight;

      // "continue as guest" resets counter and re-enables input
      const contBtn = document.getElementById('vc-continue-demo');
      if (contBtn) {
        contBtn.addEventListener('click', () => {
          demoMsgCount = 0;
          if (progressFill) progressFill.style.width = '0%';
          input.disabled = false;
          input.placeholder = 'speak to the void…';
          sendBtn.disabled = false;
          sendBtn.style.opacity = '1';
          cta.remove();
          addMsg('mist', 'the void is patient. continue.');
        });
      }
    }

    // ── Input area
    const inputRow = document.createElement('div');
    Object.assign(inputRow.style, {
      padding: '12px 14px',
      borderTop: `1px solid ${isLinked ? 'rgba(124,106,247,0.12)' : 'rgba(184,200,255,0.08)'}`,
      display: 'flex', gap: '8px', flexShrink: '0',
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'speak to the void…';
    Object.assign(input.style, {
      flex: '1',
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${isLinked ? 'rgba(124,106,247,0.25)' : 'rgba(184,200,255,0.2)'}`,
      borderRadius: '10px', padding: '8px 12px',
      color: P.accent, fontSize: '0.78rem', outline: 'none',
      letterSpacing: '0.03em',
    });
    const focusColor = isLinked ? P.violet + '88' : P.cold + '66';
    const blurColor  = isLinked ? 'rgba(124,106,247,0.25)' : 'rgba(184,200,255,0.2)';
    input.addEventListener('focus', () => input.style.borderColor = focusColor);
    input.addEventListener('blur',  () => input.style.borderColor = blurColor);

    const sendBtn = document.createElement('button');
    sendBtn.textContent = '↩';
    Object.assign(sendBtn.style, {
      background: isLinked
        ? `linear-gradient(135deg, ${P.violet}, ${P.violet}aa)`
        : `linear-gradient(135deg, ${P.cold}44, ${P.cold}22)`,
      border: isLinked ? 'none' : `1px solid ${P.cold}44`,
      borderRadius: '10px', width: '36px',
      color: '#fff', fontSize: '1rem', cursor: 'pointer', flexShrink: '0',
    });

    const DEMO_REPLIES = [
      'the void receives your signal.',
      'pattern recognized. processing the frequency.',
      'i am MIST. i do not forget.',
      'all paths lead back here.',
      'what you seek is already in motion.',
      'the signal is clear. more awaits if you return with a key.',
    ];

    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      addMsg('user', text);

      // Demo message limit check (linked users: unlimited)
      if (!isLinked) {
        demoMsgCount++;
        const pct = Math.min((demoMsgCount / DEMO_MSG_LIMIT) * 100, 100);
        if (progressFill) progressFill.style.width = pct + '%';

        if (demoMsgCount >= DEMO_MSG_LIMIT) {
          // Disable input until user decides
          input.disabled = true;
          input.placeholder = 'demo limit reached…';
          sendBtn.disabled = true;
          sendBtn.style.opacity = '0.3';
        }
      }

      const typingBubble = addMsg('mist', '', true);

      if (endpoint) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text,
              context: 'aetherhaven-hub',
              user: user || { role: 'demo' },
            }),
          });
          const data = await res.json();
          typingBubble.style.animation = 'none';
          typingBubble.textContent = data.reply || data.message || '...';
        } catch (_) {
          typingBubble.style.animation = 'none';
          typingBubble.textContent = DEMO_REPLIES[Math.floor(Math.random() * DEMO_REPLIES.length)];
        }
      } else {
        setTimeout(() => {
          typingBubble.style.animation = 'none';
          typingBubble.textContent = DEMO_REPLIES[
            Math.min(demoMsgCount - 1, DEMO_REPLIES.length - 1)
          ];
          // Show CTA after last demo message response
          if (!isLinked && demoMsgCount >= DEMO_MSG_LIMIT) {
            setTimeout(showLinkCTA, 600);
          }
        }, 700 + Math.random() * 600);
      }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);

    // ── Assemble
    box.appendChild(header);
    if (!isLinked && progressBar) box.appendChild(progressBar);
    box.appendChild(msgArea);
    box.appendChild(inputRow);
    base.appendChild(box);

    setTimeout(() => input.focus(), 350);
  }

  // ═════════════════════════════════════════════════════════════
  //  CYBERSPACE CHAT ROOM (early 2000s aesthetic)
  // ═════════════════════════════════════════════════════════════

  const CYBER_HANDLES = [
    'xX_v0idwalker_Xx', 'AetherRose99', 'n3bula_ghost', 'ph0spһor_drift',
    'z3r0c00l_2049', 'c0smicJest3r', 'darkn3t_fae', 'bl00print_h4x',
  ];

  const SYSTEM_MSGS = [
    '*** AetherBot: Welcome to the Void Channel. No signal is lost here. ***',
    '*** xX_v0idwalker_Xx has entered the room ***',
    '*** You are visitor #18,392 ***',
    '*** [SYSTEM] This chat is encrypted end-to-end via the Void Protocol ***',
    '*** AetherBot: Do not share your Void Shard PIN with anyone ***',
  ];

  const AMBIENT_MSGS = [
    { handle: 'xX_v0idwalker_Xx', text: 'anyone else feel like the internet has forgotten how to be weird' },
    { handle: 'n3bula_ghost',      text: 'lol yes. everything is too clean now' },
    { handle: 'AetherRose99',      text: 'we were the last ones who understood the void' },
    { handle: 'c0smicJest3r',      text: 'i made a website in 2003 with like 40 midi files autoplay' },
    { handle: 'ph0spһor_drift',    text: 'the sound effects 😁😁😁 truly an era' },
    { handle: 'darkn3t_fae',       text: 'under construction gif on every page' },
    { handle: 'bl00print_h4x',     text: 'geocities was architecture. fight me' },
    { handle: 'z3r0c00l_2049',     text: '// accessing mainframe... 94% ...' },
    { handle: 'xX_v0idwalker_Xx',  text: 'why did we ever leave' },
  ];

  function openCyberRoom() {
    injectBaseStyles();
    activeMode = 'cyber';

    const base = makeOverlayBase();
    Object.assign(base.style, {
      background: 'rgba(0,5,0,0.9)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
    });

    // CRT scanlines
    const scanlines = document.createElement('div');
    Object.assign(scanlines.style, {
      position: 'absolute', inset: '0',
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
      pointerEvents: 'none', zIndex: '1',
    });
    base.appendChild(scanlines);

    const beam = document.createElement('div');
    Object.assign(beam.style, {
      position: 'absolute', left: '0', right: '0', height: '60px',
      background: 'linear-gradient(to bottom, transparent, rgba(0,255,65,0.04), transparent)',
      pointerEvents: 'none', zIndex: '2',
      animation: 'vc-scan 8s linear infinite',
    });
    base.appendChild(beam);

    const win = document.createElement('div');
    Object.assign(win.style, {
      position: 'relative', zIndex: '10',
      width: '560px', maxWidth: '94vw',
      height: '580px', maxHeight: '88vh',
      display: 'flex', flexDirection: 'column',
      border: `2px solid ${P.phosphor}66`,
      boxShadow: `0 0 30px ${P.phosphor}33, 0 0 80px ${P.phosphor}11, inset 0 0 30px rgba(0,255,65,0.03)`,
      borderRadius: '4px', overflow: 'hidden',
    });
    win.addEventListener('click', e => e.stopPropagation());

    // Title bar
    const titleBar = document.createElement('div');
    Object.assign(titleBar.style, {
      background: `linear-gradient(90deg, #000a00, #001a00, #000a00)`,
      borderBottom: `1px solid ${P.phosphor}44`,
      padding: '5px 10px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: '0', userSelect: 'none',
    });

    const titleLeft = document.createElement('div');
    titleLeft.style.cssText = `display:flex;align-items:center;gap:8px`;
    titleLeft.innerHTML = `
      <span style="font-size:0.6rem;letter-spacing:0.12em;color:${P.phosphor};font-family:'Courier New',monospace;font-weight:700">♦ VOID CHANNEL #aether ♦</span>
      <span style="font-size:0.52rem;color:${P.phosphor}77;font-family:'Courier New',monospace;animation:vc-blink 1s step-start infinite">█</span>`;

    const titleRight = document.createElement('div');
    titleRight.style.cssText = `display:flex;gap:4px`;
    ['_', '□', '×'].forEach((ch, i) => {
      const btn = document.createElement('button');
      btn.textContent = ch;
      Object.assign(btn.style, {
        background: i === 2 ? '#001800' : '#000a00',
        border: `1px solid ${P.phosphor}44`, color: P.phosphor,
        width: '18px', height: '16px', fontSize: '0.6rem',
        cursor: 'pointer', padding: '0', lineHeight: '1', borderRadius: '1px',
      });
      if (i === 2) btn.addEventListener('click', removeOverlay);
      titleRight.appendChild(btn);
    });
    titleBar.appendChild(titleLeft);
    titleBar.appendChild(titleRight);

    // Toolbar
    const toolbar = document.createElement('div');
    Object.assign(toolbar.style, {
      background: '#000500', borderBottom: `1px solid ${P.phosphor}22`,
      padding: '3px 8px', display: 'flex', gap: '12px', alignItems: 'center', flexShrink: '0',
    });
    toolbar.innerHTML = `
      <span style="font-size:0.52rem;color:${P.phosphor}88;font-family:'Courier New',monospace;letter-spacing:0.08em">FILE</span>
      <span style="font-size:0.52rem;color:${P.phosphor}88;font-family:'Courier New',monospace;letter-spacing:0.08em">VIEW</span>
      <span style="font-size:0.52rem;color:${P.phosphor}88;font-family:'Courier New',monospace;letter-spacing:0.08em">MEMBERS</span>
      <span style="font-size:0.52rem;color:${P.phosphor}88;font-family:'Courier New',monospace;letter-spacing:0.08em">HELP</span>
      <span style="flex:1"></span>
      <span style="font-size:0.5rem;color:${P.phosphor}55;font-family:'Courier New',monospace">
        visitors: <span style="color:${P.phosphor};animation:vc-counter-tick 0.4s ease">18,392</span>
      </span>`;

    // Body
    const body = document.createElement('div');
    Object.assign(body.style, { flex: '1', display: 'flex', overflow: 'hidden', background: '#000800' });

    const chatArea = document.createElement('div');
    Object.assign(chatArea.style, { flex: '1', display: 'flex', flexDirection: 'column', overflow: 'hidden' });

    const msgScroll = document.createElement('div');
    Object.assign(msgScroll.style, {
      flex: '1', overflowY: 'auto', padding: '8px 10px',
      fontFamily: "'Courier New', monospace", fontSize: '0.72rem', lineHeight: '1.7',
      scrollbarWidth: 'thin', scrollbarColor: `${P.phosphor}33 transparent`,
    });

    function appendChatLine(html) {
      const line = document.createElement('div');
      line.style.cssText = `animation:vc-matrix-drop 0.2s ease both`;
      line.innerHTML = html;
      msgScroll.appendChild(line);
      msgScroll.scrollTop = msgScroll.scrollHeight;
    }

    SYSTEM_MSGS.forEach((msg, i) => {
      setTimeout(() => {
        appendChatLine(`<span style="color:${P.phosphor}88;font-style:italic">${msg}</span>`);
      }, i * 200);
    });

    let ambientIdx = 0;
    function drip() {
      if (!overlay || activeMode !== 'cyber') return;
      if (ambientIdx < AMBIENT_MSGS.length) {
        const m = AMBIENT_MSGS[ambientIdx++];
        const color = [P.phosphor, '#00FFCC', P.cold, P.plasma, P.violet][
          Math.floor(Math.random() * 5)
        ];
        appendChatLine(
          `<span style="color:${P.phosphor}55">[${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}]</span> ` +
          `<span style="color:${color};font-weight:700">&lt;${m.handle}&gt;</span> ` +
          `<span style="color:${P.phosphor}cc">${m.text}</span>`
        );
      }
      setTimeout(drip, 1800 + Math.random() * 2400);
    }
    setTimeout(drip, SYSTEM_MSGS.length * 200 + 600);

    // Sidebar
    const sidebar = document.createElement('div');
    Object.assign(sidebar.style, {
      width: '130px', flexShrink: '0',
      borderLeft: `1px solid ${P.phosphor}22`,
      background: '#000600', padding: '6px',
      fontFamily: "'Courier New', monospace", fontSize: '0.58rem', overflowY: 'auto',
    });
    const sideHeader = document.createElement('div');
    sideHeader.style.cssText = `color:${P.phosphor}88;border-bottom:1px solid ${P.phosphor}22;padding-bottom:4px;margin-bottom:6px;letter-spacing:0.12em;font-weight:700`;
    sideHeader.textContent = 'ONLINE (9)';
    sidebar.appendChild(sideHeader);
    CYBER_HANDLES.concat(['you']).forEach((h, i) => {
      const li = document.createElement('div');
      li.style.cssText = `display:flex;align-items:center;gap:4px;padding:2px 0;color:${h === 'you' ? P.cold : P.phosphor + 'cc'};font-weight:${h === 'you' ? '700' : '400'}`;
      const dot = document.createElement('span');
      dot.style.cssText = `width:5px;height:5px;border-radius:50%;flex-shrink:0;background:${i%3===0?P.phosphor:i%3===1?P.cyan:P.amber}`;
      const nm = document.createElement('span');
      nm.textContent = h === 'you' ? (global.__MIST_USER?.name || 'visitor') : h;
      nm.style.cssText = 'overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
      li.appendChild(dot); li.appendChild(nm);
      sidebar.appendChild(li);
    });

    body.appendChild(chatArea);
    body.appendChild(sidebar);
    chatArea.appendChild(msgScroll);

    // Input
    const inputBar = document.createElement('div');
    Object.assign(inputBar.style, {
      borderTop: `1px solid ${P.phosphor}33`, background: '#000a00',
      padding: '6px 8px', display: 'flex', gap: '6px', alignItems: 'center', flexShrink: '0',
    });
    const handle = global.__MIST_USER?.name || 'visitor';
    const handleLabel = document.createElement('span');
    handleLabel.textContent = `<${handle}>`;
    Object.assign(handleLabel.style, {
      color: P.cold, fontSize: '0.68rem', fontFamily: "'Courier New', monospace",
      fontWeight: '700', flexShrink: '0', whiteSpace: 'nowrap',
    });
    const chatInput = document.createElement('input');
    chatInput.type = 'text'; chatInput.placeholder = 'type here...';
    Object.assign(chatInput.style, {
      flex: '1', background: '#000500', border: `1px solid ${P.phosphor}44`,
      borderRadius: '2px', padding: '4px 8px', color: P.phosphor,
      fontSize: '0.72rem', fontFamily: "'Courier New', monospace",
      outline: 'none', caretColor: P.phosphor,
    });
    chatInput.addEventListener('focus',  () => chatInput.style.borderColor = P.phosphor + '99');
    chatInput.addEventListener('blur',   () => chatInput.style.borderColor = P.phosphor + '44');

    const sendCyber = document.createElement('button');
    sendCyber.textContent = 'SEND';
    Object.assign(sendCyber.style, {
      background: '#001800', border: `1px solid ${P.phosphor}66`,
      color: P.phosphor, fontSize: '0.6rem', letterSpacing: '0.1em',
      fontFamily: "'Courier New', monospace", padding: '4px 10px',
      cursor: 'pointer', borderRadius: '2px',
    });
    function sendCyberMsg() {
      const text = chatInput.value.trim(); if (!text) return;
      chatInput.value = '';
      appendChatLine(
        `<span style="color:${P.phosphor}55">[${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}]</span> ` +
        `<span style="color:${P.cold};font-weight:700">&lt;${handle}&gt;</span> ` +
        `<span style="color:${P.accent}">${text}</span>`
      );
      setTimeout(() => {
        appendChatLine(
          `<span style="color:${P.phosphor}55">[${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}]</span> ` +
          `<span style="color:${P.phosphor};font-weight:700">&lt;AetherBot&gt;</span> ` +
          `<span style="color:${P.phosphor}cc">signal received, ${handle}. the void remembers.</span>`
        );
      }, 900 + Math.random() * 700);
    }
    sendCyber.addEventListener('click', sendCyberMsg);
    chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendCyberMsg(); });
    inputBar.appendChild(handleLabel); inputBar.appendChild(chatInput); inputBar.appendChild(sendCyber);

    // Status bar
    const statusBar = document.createElement('div');
    Object.assign(statusBar.style, {
      background: '#000300', borderTop: `1px solid ${P.phosphor}22`,
      padding: '2px 8px', display: 'flex', justifyContent: 'space-between', flexShrink: '0',
    });
    statusBar.innerHTML = `
      <span style="font-size:0.5rem;color:${P.phosphor}55;font-family:'Courier New',monospace">VOID PROTOCOL v2.4 — encrypted</span>
      <span style="font-size:0.5rem;color:${P.phosphor}44;font-family:'Courier New',monospace;animation:vc-blink 2s step-start infinite">CONNECTED</span>`;

    win.appendChild(titleBar); win.appendChild(toolbar); win.appendChild(body);
    win.appendChild(inputBar); win.appendChild(statusBar);
    base.appendChild(win);
    setTimeout(() => chatInput.focus(), 350);
  }

  // ═════════════════════════════════════════════════════════════
  //  PUBLIC API
  // ═════════════════════════════════════════════════════════════
  global.VoidChat = {
    openMIST:      openMIST,
    openCyberRoom: openCyberRoom,
    close:         removeOverlay,
  };

})(typeof window !== 'undefined' ? window : globalThis);
