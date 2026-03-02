# FirstArc · Origin Scan State

> *not a loader. a signal hunt.*

Adapted from AetherReentry by **Mars / AetherRose**

## Files

| File | Purpose |
|------|---------|
| `scan-state.html` | FirstArc provenance scan loading state |

## Palette

```
cold-blue  #B8C8FF  — arc leading edge
violet     #7C6AF7  — primary arc body
plasma     #F2A65A  — arc trailing heat
confirm    #4ADE80  — signal confirmed (FirstArc-only)
bg         #05020d  — void background
```

## Phase Machine

```
⌖  ORIGIN SCAN      — Locating primary signal source
⟳  MULTI-ENGINE     — Cross-referencing reverse search engines
✦  SIGNAL CONFIRMED — Origin verified · provenance locked
```

## Engine Ticker (MULTI-ENGINE phase)

Cycles at 600ms: `GOOGLE LENS · YANDEX · TINEYE · WAYBACK`

## Architecture

- Pure static HTML/CSS/JS — zero dependencies, zero build step
- Three-body arc system: outer, inner counter-rotation, core reverse
- SIGNAL CONFIRMED: arc spins 3× faster (1.4s), confirm ring expands, full green shift
- `window.setPhase(0|1|2)` exposed for production wiring

## Wiring to FastAPI (Production)

Replace the `setInterval` demo cycle with your actual scan state:

```js
// From your FastAPI scan status handler
const res = await fetch('/api/scan/status');
const { phase } = await res.json(); // 0 | 1 | 2
window.setPhase(phase);
```

Or via WebSocket:

```js
const ws = new WebSocket('wss://your-api/scan/ws');
ws.onmessage = ({ data }) => {
  const { phase } = JSON.parse(data);
  window.setPhase(phase);
};
```

## Phase → API Status Mapping

| Phase | Value | Meaning |
|-------|-------|---------|
| `ORIGIN SCAN` | `0` | Scan initiated |
| `MULTI-ENGINE` | `1` | Engines querying |
| `SIGNAL CONFIRMED` | `2` | Result returned |
