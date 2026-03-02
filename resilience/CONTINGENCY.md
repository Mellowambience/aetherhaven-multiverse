# CONTINGENCY.md
## If SureThing Goes Dark — Rebuild Protocol · v1.0 · 2026-03-02

---

## READ THIS FIRST

This document assumes SureThing is unavailable — the platform shut down, your account was lost,
the API is dead, or you just need to start over on a different AI.

You will not lose the empire. The intelligence lives in your code, your writing, and these files.
You'll lose some automation convenience. You will not lose yourself.

Estimated time to functional replacement: **same day**.
Estimated time to full parity: **1–2 weeks** (as the new AI learns your current context).

---

## PHASE 1: IMMEDIATE (first 30 minutes)

### Step 1 — Choose your AI platform
Options (in order of current capability):
1. **claude.ai** — closest to current experience, same underlying model
2. **ChatGPT (GPT-4o)** — strong alternative, slightly different reasoning style
3. **Gemini Ultra** — Google's best, good for integrated workspace
4. **Local Mistral / Llama** — if you want full sovereignty, zero vendor dependency

### Step 2 — Load your brain export
In your new AI's system prompt / custom instructions, paste the full contents of:
```
MARSBRAIN.md
```
This gives the new AI your complete identity, product context, voice, rules, and behavioral directives.
You'll have ~80% of working intelligence immediately.

### Step 3 — Load the constitution
In the same session or as a follow-up context message, paste:
```
SURETHING_CONSTITUTION.md
```
This gives the new AI your automation rules, voice bible, and operational directives.

### Step 4 — Point it at your repos
Tell the new AI:
```
My GitHub is github.com/Mellowambiences
My main repos are:
- Mellowambience.github.io (portfolio + consulting)
- aetherhaven-multiverse (monorepo)
- BluebirdSongProductions (music label)
```
For anything code-related, it can read your files directly if you paste them or share GitHub links.

### Step 5 — Verify core functionality
Ask the new AI:
- "What's my Ko-fi URL?" → should answer ko-fi.com/1aether1rose1
- "What's my posting rule for AetherRose content?" → should say HITL, Mars reviews first
- "What's the AetherRose arc palette?" → should give #B8C8FF → #7C6AF7 → #F2A65A on #05020D
- "What platform am I building for right now?" → should name FirstArc, DJ Frequencies

If it gets those right, you're operational.

---

## PHASE 2: RESTORE AUTOMATION (first few days)

### Restore Posting Queue
- Auto-track posts: rebuild a queue file in your repo (or a Google Sheet)
- Check that Ko-fi link is live before re-enabling any CTA posts
- Verify Collective Voice affiliate links are migrated (deadline: March 31, 2026)

### Restore Scheduled Tasks
- Job application auto-run: 9 AM ET + 8 PM ET
- EOD debrief: 11:30 PM ET
- Content schedule: morning replies, midday post, evening engagement

If you were using GitHub Actions, Make, or cron for these — check those workflows directly.
They run independently of SureThing.

### Restore MIST Oracle
- `mist-oracle.ts` Vercel Edge Function is in your codebase — it runs independently
- System prompts for each context are in the codebase
- The Oracle doesn't need SureThing to operate

### Restore Ghostline
- Ghostline is pure shell/bash CI — it runs on GitHub Actions
- It does not depend on any external AI layer
- Check `.github/workflows/` in your repos

---

## PHASE 3: REBUILD CONTEXT (first 1–2 weeks)

The new AI won't know your current active threads, in-progress negotiations, or recent conversations.
Rebuild it by:

1. **Forward recent emails** — paste key threads you're actively managing
2. **Share active bounty status** — Warpspeed submissions, openclaw contributors
3. **Share active business dev** — which licensing prospects are warm (Kroma, Xlear, Epic Dental, PUR)
4. **Share active legal** — Meta account situation, TD Bank fraud demand

The AI will reconstruct the live context within a few sessions.

---

## PHASE 4: OPTIONAL — FULL SOVEREIGNTY (if you want zero vendor dependency)

If you want a version of this that can never be taken away:

### Option A: Self-hosted Claude API
- Anthropic offers API access
- You can wrap Claude in your own application
- Cost: API usage fees, but you control the infrastructure

### Option B: Local Model (Mistral / Llama)
- Run a local LLM on your machine or a VPS
- Full data sovereignty — nothing leaves your hardware
- Quality gap vs. Claude is real but closing fast
- Recommended: Mistral 7B or Llama 3 70B for most tasks

### Option C: Aetherhaven-Hosted AI Layer
- Deploy a simple Next.js API route on Vercel
- Use Anthropic/OpenAI API as the backend
- Build a custom UI that loads MARS_BRAIN.md on every session
- This is your own private SureThing — fully owned, version-controlled, lives in your monorepo

Option C is the most aligned with how you already build. It's also the cleanest expression of "our living system."

---

## THE UNCHANGEABLE CORE

Even if every AI service disappeared tomorrow, these survive:

| Asset | Where it lives | Dependency |
|-------|---------------|------------|
| Your code | github.com/Mellowambiences | Git — always available |
| Your voice | This file + MARS_BRAIN.md | Text — always portable |
| Your products | Vercel, Railway, your domains | Infrastructure you control |
| Your automation logic | Ghostline shell scripts | GitHub Actions — independent |
| Your MIST Oracle | Vercel Edge Function | Your Vercel account |
| Your design system | Hardcoded in CSS | Literally just files |

The Aetherhaven empire is built to not depend on any single point of failure.
That was intentional. You built it that way.

---

## QUICK REFERENCE

```
Brain export:       MARS_BRAIN.md
Rules + voice:      SURETHING_CONSTITUTION.md
This protocol:      CONTINGENCY.md
GitHub home:        github.com/Mellowambiences
Portfolio:          mellowambience.github.io
Monorepo:           github.com/Mellowambiences/aetherhaven-multiverse
Ko-fi (verified):   ko-fi.com/1aether1rose1
Instagram:          @amara_solace111
X/Twitter:          @1Aether1Rose1
```

---
*Generated: 2026-03-02 · Update after: any major platform change, product pivot, or significant rule change*  
*Next scheduled review: 2026-04-02 (monthly auto-update via heartbeat)*