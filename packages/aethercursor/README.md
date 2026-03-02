# AetherCursor · Arc Cursor Module

> *ambient while you drift. arc system when you pause.*

by **Mars / AetherRose**

## Behavior

| State | Trigger | Visual |
|-------|---------|--------|
| **AMBIENT** | cursor moving | Tiny 18px cold-blue ghost dot + short trail. Near-invisible. |
| **BLOOM** | idle ≥180ms OR hovering interactive element | Full 64px 3-body arc system (cold-blue → violet → plasma-orange) |

Transition between states is smooth lerp (not snap).

## Files

| File | Purpose |
|------|---------|
| `aether-cursor.js` | Drop-in cursor module (zero deps) |
| `demo.html` | Live demo with hover targets and integration snippet |

## Palette

Canonical AetherRose:
```
cold-blue  #B8C8FF  — ambient state + arc leading edge
violet     #7C6AF7  — arc body
plasma     #F2A65A  — arc trailing heat
```

## Drop-in Usage

```html
<!-- Option A: auto-attach via attribute on <html> -->
<html data-aether-cursor>
  ...
  <script src="/shared/aether-cursor.js"></script>
</html>

<!-- Option B: manual attach with config -->
<script src="/shared/aether-cursor.js"></script>
<script>
  AetherCursor.attach({
    bloomDelay: 180,       // ms idle before bloom (default 180)
    size: 64,              // bloom diameter px (default 64)
    ambientSize: 18,       // ambient dot diameter px (default 18)
    hoverSelectors: 'a,button,[role="button"],[tabindex]',
  });
</script>
```

## API

```js
AetherCursor.attach(options)  // attach (idempotent)
AetherCursor.detach()         // remove, restore native cursor
AetherCursor.bloom()          // programmatic bloom (e.g. on route change)
AetherCursor.ambient()        // programmatic return to ambient
```

## Cross-site deployment

Copy `aether-cursor.js` to `/shared/aether-cursor.js` in each Aetherhaven package,
or serve from a CDN path and include via `<script src="...">` on any page.

Works on: Aetherhaven Hub, AetherRose portfolio, FirstArc, any static Aetherhaven page.
