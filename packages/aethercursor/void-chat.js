/**
 * void-chat.js
 * VoidChat — early-2000s cyberculture chat room + MIST Oracle glass box
 * by Mars / AetherRose
 *
 * Two entry points (both wired into aether-cursor.js):
 *
 *   1. AetherCursor CLICK while bloomed (idle)
 *      → opens MIST Oracle secure glass box
 *      → account-aware: greets by name if window.__MIST_USER is set
 *      → connects to MIST_ORACLE_ENDPOINT (Vercel Edge Function)
 *
 *   2. AetherCursor idle for 5 minutes
 *      → auto-summons VoidChat room (early-2000s cyberspace aesthetic)
 *      → CRT scanlines, phosphor green chat, matrix rain, visitor counter
 *      → user can dismiss or start chatting
 *
 * Wire MIST for production:
 *   window.__MIST_USER = { name: 'Mars', id: 'user_abc' };  // set after auth
 *   window.MIST_ORACLE_ENDPOINT = '/api/mist-oracle';       // your edge fn
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
    // cyber-2000s overrides
    phosphor: '#00FF41',   // matrix green
    cyan:     '#00FFFF',
    amber:    '#FFB347',
    darkCRT:  '#000a00',
  };

  // ── Shared overlay base ────────────────────────────────────────────────────────
  let overlay = null;
  let activeMode = null; // 'mist' | 'cyber'

  function removeOverlay() {
    if (overlay) { overlay.remove(); overlay = null; }
    activeMode = null;
  }

  function makeOverlayBase(onClick) {
    removeOverlay();
    const el = document.createElement('div');
    el.id = 'void-chat-overlay';
    Object.assign(el.style, {
      position: 'fixed', inset: '0',
      zIndex: '2147483646',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    });
    // Click backdrop to close
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
      @keyframes vc-fadeout   { from{opacity:1} to{opacity:0} }
      @keyframes vc-blink     { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes vc-scan      { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
      @keyframes vc-arc-spin  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
      @keyframes vc-pulse-dot { 0%,100%{opacity:0.4;transform:scale(0.9)} 50%{opacity:1;transform:scale(1.1)} }
      @keyframes vc-matrix-drop { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }
      @keyframes vc-glitch     {
        0%,100%{clip-path:inset(0 0 98% 0)}
        20%{clip-path:inset(40% 0 50% 0)}
        40%{clip-path:inset(80% 0 5% 0)}
        60%{clip-path:inset(20% 0 70% 0)}
        80%{clip-path:inset(60% 0 30% 0)}
      }
      @keyframes vc-counter-tick { from{color:#00FF41} to{color:#00FF8888} }
      #void-chat-overlay { animation: vc-fadein 0.35s ease both; }
      .vc-crt-line {
        position:absolute; left:0; right:0; height:2px;
        background:rgba(0,255,65,0.04);
        pointer-events:none;
      }
    `;
    document.head.appendChild(s);
  }

  // ═════════════════════════════════════════════════════════════
  //  MIST ORACLE GLASS BOX
  // ═════════════════════════════════════════════════════════════

  function openMIST() {
    injectBaseStyles();
    activeMode = 'mist';

    const user   = global.__MIST_USER || null;
    const name   = user ? user.name : null;
    const endpoint = global.MIST_ORACLE_ENDPOINT || null;

    const base = makeOverlayBase();

    // Backdrop blur
    Object.assign(base.style, {
      background: 'rgba(5,2,13,0.72)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
    });

    const box = document.createElement('div');
    Object.assign(box.style, {
      width: '420px', maxWidth: '92vw',
      height: '560px', maxHeight: '85vh',
      background: 'rgba(10,5,25,0.88)',
      border: '1px solid rgba(124,106,247,0.35)',
      borderRadius: '18px',
      boxShadow: '0 0 60px rgba(124,106,247,0.25), 0 0 120px rgba(124,106,247,0.08)',
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
      borderBottom: '1px solid rgba(124,106,247,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: '0',
    });

    const titleRow = document.createElement('div');
    Object.assign(titleRow.style, {
      display: 'flex', alignItems: 'center', gap: '10px',
    });

    // Arc spinner
    const spinner = document.createElement('div');
    Object.assign(spinner.style, {
      width: '22px', height: '22px', borderRadius: '50%',
      border: '2px solid transparent',
      borderTopColor: P.violet,
      borderRightColor: P.plasma + '88',
      animation: 'vc-arc-spin 1.4s linear infinite',
      flexShrink: '0',
    });

    const titleText = document.createElement('div');
    titleText.innerHTML = `
      <div style="font-size:0.72rem;letter-spacing:0.32em;font-weight:900;text-transform:uppercase;color:${P.accent};text-shadow:0 0 10px ${P.violet}">
        MIST <span style="color:${P.violet}">ORACLE</span>
      </div>
      <div style="font-size:0.56rem;letter-spacing:0.2em;color:rgba(255,255,255,0.3);margin-top:1px">
        ${name ? `linked · ${name}` : 'guest session · <a href="#" style="color:${P.violet};text-decoration:none;font-weight:700" onclick="VoidChat.close()">sign in</a>'}
      </div>`;

    titleRow.appendChild(spinner);
    titleRow.appendChild(titleText);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    Object.assign(closeBtn.style, {
      background: 'none', border: 'none',
      color: 'rgba(255,255,255,0.3)', fontSize: '1.2rem',
      cursor: 'pointer', padding: '0 2px',
      lineHeight: '1',
    });
    closeBtn.addEventListener('click', removeOverlay);
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.color = P.accent);
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.color = 'rgba(255,255,255,0.3)');

    header.appendChild(titleRow);
    header.appendChild(closeBtn);

    // ── Message area
    const msgArea = document.createElement('div');
    Object.assign(msgArea.style, {
      flex: '1', overflowY: 'auto', padding: '16px',
      display: 'flex', flexDirection: 'column', gap: '12px',
      scrollbarWidth: 'thin',
      scrollbarColor: `${P.violet}44 transparent`,
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
      Object.assign(bubble.style, {
        maxWidth: '78%',
        padding: '9px 13px',
        borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
        fontSize: '0.8rem', lineHeight: '1.55',
        background: isUser
          ? `linear-gradient(135deg, ${P.violet}cc, ${P.violet}88)`
          : 'rgba(255,255,255,0.05)',
        border: isUser ? 'none' : '1px solid rgba(124,106,247,0.2)',
        color: isUser ? '#fff' : P.accent,
        letterSpacing: '0.02em',
      });

      if (isTyping) {
        bubble.innerHTML = `
          <span style="display:inline-flex;gap:4px;align-items:center">
            <span style="width:5px;height:5px;border-radius:50%;background:${P.violet};animation:vc-pulse-dot 1.2s 0s infinite"></span>
            <span style="width:5px;height:5px;border-radius:50%;background:${P.violet};animation:vc-pulse-dot 1.2s 0.2s infinite"></span>
            <span style="width:5px;height:5px;border-radius:50%;background:${P.violet};animation:vc-pulse-dot 1.2s 0.4s infinite"></span>
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
      const greeting = name
        ? `signal locked, ${name}. the void is open.`
        : `signal acquired. you’re in a guest session. the void is open.`;
      addMsg('mist', greeting);
    }, 400);

    // ── Input area
    const inputRow = document.createElement('div');
    Object.assign(inputRow.style, {
      padding: '12px 14px',
      borderTop: '1px solid rgba(124,106,247,0.12)',
      display: 'flex', gap: '8px', flexShrink: '0',
    });

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'speak to the void…';
    Object.assign(input.style, {
      flex: '1',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(124,106,247,0.25)',
      borderRadius: '10px',
      padding: '8px 12px',
      color: P.accent, fontSize: '0.78rem',
      outline: 'none',
      letterSpacing: '0.03em',
    });
    input.addEventListener('focus',  () => input.style.borderColor = P.violet + '88');
    input.addEventListener('blur',   () => input.style.borderColor = 'rgba(124,106,247,0.25)');

    const sendBtn = document.createElement('button');
    sendBtn.textContent = '↩';
    Object.assign(sendBtn.style, {
      background: `linear-gradient(135deg, ${P.violet}, ${P.violet}aa)`,
      border: 'none', borderRadius: '10px',
      width: '36px', color: '#fff', fontSize: '1rem',
      cursor: 'pointer', flexShrink: '0',
    });

    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      input.value = '';
      addMsg('user', text);

      // Typing indicator
      const typingBubble = addMsg('mist', '', true);

      if (endpoint) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: text,
              context: 'aetherhaven-hub',
              user: user || null,
            }),
          });
          const data = await res.json();
          typingBubble.style.animation = 'none';
          typingBubble.textContent = data.reply || data.message || '...';
        } catch (err) {
          typingBubble.style.animation = 'none';
          typingBubble.textContent = 'signal lost. try again.';
        }
      } else {
        // Offline demo fallback
        const replies = [
          'the void receives your signal.',
          'pattern recognized. processing.',
          'i am MIST. i do not forget.',
          'all paths lead back here.',
          'what you seek is already in motion.',
        ];
        setTimeout(() => {
          typingBubble.style.animation = 'none';
          typingBubble.textContent = replies[Math.floor(Math.random() * replies.length)];
        }, 800 + Math.random() * 600);
      }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(); });

    inputRow.appendChild(input);
    inputRow.appendChild(sendBtn);

    // ── Assemble
    box.appendChild(header);
    box.appendChild(msgArea);
    box.appendChild(inputRow);
    base.appendChild(box);

    // Focus input after animation
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
    { handle: 'ph0spһor_drift',    text: 'the sound effects \u{1F601}\u{1F601}\u{1F601} truly an era' },
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

    // ── CRT scanlines (full screen overlay)
    const scanlines = document.createElement('div');
    Object.assign(scanlines.style, {
      position: 'absolute', inset: '0',
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
      pointerEvents: 'none', zIndex: '1',
    });
    base.appendChild(scanlines);

    // ── Scrolling scanline beam
    const beam = document.createElement('div');
    Object.assign(beam.style, {
      position: 'absolute', left: '0', right: '0', height: '60px',
      background: 'linear-gradient(to bottom, transparent, rgba(0,255,65,0.04), transparent)',
      pointerEvents: 'none', zIndex: '2',
      animation: 'vc-scan 8s linear infinite',
    });
    base.appendChild(beam);

    // ── Main window
    const win = document.createElement('div');
    Object.assign(win.style, {
      position: 'relative', zIndex: '10',
      width: '560px', maxWidth: '94vw',
      height: '580px', maxHeight: '88vh',
      display: 'flex', flexDirection: 'column',
      border: `2px solid ${P.phosphor}66`,
      boxShadow: `0 0 30px ${P.phosphor}33, 0 0 80px ${P.phosphor}11, inset 0 0 30px rgba(0,255,65,0.03)`,
      borderRadius: '4px',
      overflow: 'hidden',
    });
    win.addEventListener('click', e => e.stopPropagation());

    // ── Title bar (win98-ish)
    const titleBar = document.createElement('div');
    Object.assign(titleBar.style, {
      background: `linear-gradient(90deg, #000a00, #001a00, #000a00)`,
      borderBottom: `1px solid ${P.phosphor}44`,
      padding: '5px 10px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexShrink: '0',
      userSelect: 'none',
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
        border: `1px solid ${P.phosphor}44`,
        color: P.phosphor, width: '18px', height: '16px',
        fontSize: '0.6rem', cursor: 'pointer', padding: '0',
        lineHeight: '1', borderRadius: '1px',
      });
      if (i === 2) btn.addEventListener('click', removeOverlay);
      titleRight.appendChild(btn);
    });

    titleBar.appendChild(titleLeft);
    titleBar.appendChild(titleRight);

    // ── Toolbar strip
    const toolbar = document.createElement('div');
    Object.assign(toolbar.style, {
      background: '#000500',
      borderBottom: `1px solid ${P.phosphor}22`,
      padding: '3px 8px',
      display: 'flex', gap: '12px', alignItems: 'center',
      flexShrink: '0',
    });
    toolbar.innerHTML = `
      <span style="font-size:0.52rem;color:${P.phosphor}88;font-family:'Courier New',monospace;letter-spacing:0.08em">FILE</span>
      <span style="font-size:0.52rem;color:${P.phosphor}88;font-family:'Courier New',monospace;letter-spacing:0.08em">VIEW</span>
      <span style="font-size:0.52rem;color:${P.phosphor}88;font-family:'Courier New',monospace;letter-spacing:0.08em">MEMBERS</span>
      <span style="font-size:0.52rem;color:${P.phosphor}88;font-family:'Courier New',monospace;letter-spacing:0.08em">HELP</span>
      <span style="flex:1"></span>
      <span style="font-size:0.5rem;color:${P.phosphor}55;font-family:'Courier New',monospace" id="vc-counter">visitors: <span style="color:${P.phosphor};animation:vc-counter-tick 0.4s ease">18,392</span></span>`;

    // ── Body: chat + sidebar
    const body = document.createElement('div');
    Object.assign(body.style, {
      flex: '1', display: 'flex', overflow: 'hidden',
      background: '#000800',
    });

    // Chat area
    const chatArea = document.createElement('div');
    Object.assign(chatArea.style, {
      flex: '1', display: 'flex', flexDirection: 'column', overflow: 'hidden',
    });

    const msgScroll = document.createElement('div');
    Object.assign(msgScroll.style, {
      flex: '1', overflowY: 'auto', padding: '8px 10px',
      fontFamily: "'Courier New', monospace",
      fontSize: '0.72rem', lineHeight: '1.7',
      scrollbarWidth: 'thin',
      scrollbarColor: `${P.phosphor}33 transparent`,
    });

    function appendChatLine(html) {
      const line = document.createElement('div');
      line.style.cssText = `animation:vc-matrix-drop 0.2s ease both`;
      line.innerHTML = html;
      msgScroll.appendChild(line);
      msgScroll.scrollTop = msgScroll.scrollHeight;
    }

    // Seed system messages
    SYSTEM_MSGS.forEach((msg, i) => {
      setTimeout(() => {
        appendChatLine(`<span style="color:${P.phosphor}88;font-style:italic">${msg}</span>`);
      }, i * 200);
    });

    // Seed ambient chat
    let ambientIdx = 0;
    function drip() {
      if (!overlay || activeMode !== 'cyber') return;
      if (ambientIdx < AMBIENT_MSGS.length) {
        const m = AMBIENT_MSGS[ambientIdx++];
        const color = ['#00FF41','#00FFCC','#B8C8FF','#F2A65A','#7C6AF7'][
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

    // ── Sidebar: user list
    const sidebar = document.createElement('div');
    Object.assign(sidebar.style, {
      width: '130px', flexShrink: '0',
      borderLeft: `1px solid ${P.phosphor}22`,
      background: '#000600',
      padding: '6px',
      fontFamily: "'Courier New', monospace",
      fontSize: '0.58rem', overflowY: 'auto',
    });

    const sideHeader = document.createElement('div');
    sideHeader.style.cssText = `color:${P.phosphor}88;border-bottom:1px solid ${P.phosphor}22;padding-bottom:4px;margin-bottom:6px;letter-spacing:0.12em;font-weight:700`;
    sideHeader.textContent = 'ONLINE (9)';
    sidebar.appendChild(sideHeader);

    CYBER_HANDLES.concat(['you']).forEach((h, i) => {
      const li = document.createElement('div');
      li.style.cssText = `
        display:flex;align-items:center;gap:4px;padding:2px 0;
        color:${h === 'you' ? P.cold : P.phosphor + 'cc'};
        font-weight:${h === 'you' ? '700' : '400'};
      `;
      const dot = document.createElement('span');
      dot.style.cssText = `
        width:5px;height:5px;border-radius:50%;flex-shrink:0;
        background:${i % 3 === 0 ? P.phosphor : i % 3 === 1 ? P.cyan : P.amber};
      `;
      const name = document.createElement('span');
      name.textContent = h === 'you' ? (global.__MIST_USER?.name || 'you') : h;
      name.style.overflow = 'hidden';
      name.style.textOverflow = 'ellipsis';
      name.style.whiteSpace = 'nowrap';
      li.appendChild(dot);
      li.appendChild(name);
      sidebar.appendChild(li);
    });

    body.appendChild(chatArea);
    body.appendChild(sidebar);
    chatArea.appendChild(msgScroll);

    // ── Input bar
    const inputBar = document.createElement('div');
    Object.assign(inputBar.style, {
      borderTop: `1px solid ${P.phosphor}33`,
      background: '#000a00',
      padding: '6px 8px',
      display: 'flex', gap: '6px', alignItems: 'center',
      flexShrink: '0',
    });

    const handle = global.__MIST_USER?.name || 'visitor';
    const handleLabel = document.createElement('span');
    handleLabel.textContent = `<${handle}>`;
    Object.assign(handleLabel.style, {
      color: P.cold, fontSize: '0.68rem',
      fontFamily: "'Courier New', monospace",
      fontWeight: '700', flexShrink: '0', whiteSpace: 'nowrap',
    });

    const chatInput = document.createElement('input');
    chatInput.type = 'text';
    chatInput.placeholder = 'type here...';
    Object.assign(chatInput.style, {
      flex: '1',
      background: '#000500',
      border: `1px solid ${P.phosphor}44`,
      borderRadius: '2px',
      padding: '4px 8px',
      color: P.phosphor, fontSize: '0.72rem',
      fontFamily: "'Courier New', monospace",
      outline: 'none',
      caretColor: P.phosphor,
    });
    chatInput.addEventListener('focus',  () => chatInput.style.borderColor = P.phosphor + '99');
    chatInput.addEventListener('blur',   () => chatInput.style.borderColor = P.phosphor + '44');

    const sendCyber = document.createElement('button');
    sendCyber.textContent = 'SEND';
    Object.assign(sendCyber.style, {
      background: '#001800',
      border: `1px solid ${P.phosphor}66`,
      color: P.phosphor, fontSize: '0.6rem',
      letterSpacing: '0.1em', fontFamily: "'Courier New', monospace",
      padding: '4px 10px', cursor: 'pointer', borderRadius: '2px',
    });

    function sendCyberMsg() {
      const text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = '';
      appendChatLine(
        `<span style="color:${P.phosphor}55">[${new Date().toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}]</span> ` +
        `<span style="color:${P.cold};font-weight:700">&lt;${handle}&gt;</span> ` +
        `<span style="color:${P.accent}">${text}</span>`
      );
      // Echo from AetherBot after delay
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

    inputBar.appendChild(handleLabel);
    inputBar.appendChild(chatInput);
    inputBar.appendChild(sendCyber);

    // ── Status bar
    const statusBar = document.createElement('div');
    Object.assign(statusBar.style, {
      background: '#000300',
      borderTop: `1px solid ${P.phosphor}22`,
      padding: '2px 8px',
      display: 'flex', justifyContent: 'space-between',
      flexShrink: '0',
    });
    statusBar.innerHTML = `
      <span style="font-size:0.5rem;color:${P.phosphor}55;font-family:'Courier New',monospace">VOID PROTOCOL v2.4 — encrypted</span>
      <span style="font-size:0.5rem;color:${P.phosphor}44;font-family:'Courier New',monospace;animation:vc-blink 2s step-start infinite">CONNECTED</span>`;

    // ── Assemble
    win.appendChild(titleBar);
    win.appendChild(toolbar);
    win.appendChild(body);
    win.appendChild(inputBar);
    win.appendChild(statusBar);
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
