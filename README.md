# Endless Torghast — Custom Class

A custom [TSWOW](https://github.com/tswow/tswow) class built around an **endless,
single-player Torghast** experience: a roguelike dungeon with no floor cap, where
a Path-of-Exile-style passive tree and an in-run shop drive infinite character
progression.

> **Status:** early scaffolding. This repo currently contains the design spec,
> the project structure, and **Phase 1 skeletons** (interfaces + stubs). No
> game logic is wired to a live server yet. See [`PROGRESS.md`](PROGRESS.md).

---

## Project goal

Deliver one custom class designed specifically for Endless Torghast, where power
comes from three sources that synergize:

1. **Gear** — drops scale by a percentage every floor (mathematically infinite).
2. **A 300-node passive tree** — 1 point per floor (floors 1–300), three thematic
   directions with hybrid connectors and permanent keystones.
3. **A shop** — spend **Anima** (earned from kills/bosses) on new abilities,
   masteries, utility, and global modifiers.

Full design: [`docs/DESIGN_SPEC.md`](docs/DESIGN_SPEC.md).

---

## Key systems

| System | What it does | Where |
|--------|--------------|-------|
| **Passive tree** | 300 nodes across Armor&Power / Magic&ES / Evasion&Crit; small (additive) + big (multiplicative) nodes + keystones | `src/datascripts/passive_tree.ts`, `keystones.ts` · `src/livescripts/passive_allocation.ts` |
| **Stat application** | Turns allocated nodes into character stats (additive small, multiplicative big) | `src/livescripts/stat_application.ts` |
| **Abilities** | Core abilities at creation + a large purchasable pool | `src/datascripts/abilities_core.ts`, `abilities_shop.ts` |
| **Anima currency & shop** | Earn Anima from enemies/bosses; spend it in the per-run shop | `src/datascripts/anima_currency.ts` · `src/livescripts/shop_handler.ts` |
| **Class definition** | Class identity, base stats, core ability grouping | `src/config/class_config.ts` |
| **Balance knobs** | Progression pacing, gear/enemy scaling, economy, ability coefficients | `src/config/balance_tuning.ts` |

---

## Repository layout

```
.
├── docs/
│   ├── DESIGN_SPEC.md            # full design (source of truth)
│   ├── IMPLEMENTATION_ROADMAP.md # the 7 implementation phases
│   └── DECISIONS.md              # decided items + open questions
├── src/
│   ├── datascripts/              # static game data (TSWOW datascripts)
│   │   ├── passive_tree.ts
│   │   ├── abilities_core.ts
│   │   ├── abilities_shop.ts
│   │   ├── keystones.ts
│   │   └── anima_currency.ts
│   ├── livescripts/              # runtime server behavior (TSWOW livescripts)
│   │   ├── shop_handler.ts
│   │   ├── passive_allocation.ts
│   │   └── stat_application.ts
│   └── config/                   # tunable definitions + balance
│       ├── class_config.ts
│       └── balance_tuning.ts
├── PROGRESS.md                   # living status
└── README.md
```

**Datascripts vs livescripts** (TSWOW terms): *datascripts* generate static data
(spells, items, the class, tree nodes) before the server runs; *livescripts* run
inside the server and implement live behavior (allocating points, purchasing,
applying stats). Both are written in TypeScript.

---

## Progression at a glance

- **Floors 1–80:** level 1→80, +1 passive point/floor, gear +3%/floor.
- **Floors 81–300:** level capped; +1 point/floor until the tree is full at 300;
  gear +4–5%/floor; enemies scale by passive points.
- **Floors 301+:** tree full; infinite gear scaling (+6%/floor); optimize forever.

(See [`src/config/balance_tuning.ts`](src/config/balance_tuning.ts) for the exact curves.)

---

## How to contribute / continue

1. **Read** [`docs/DESIGN_SPEC.md`](docs/DESIGN_SPEC.md), then
   [`PROGRESS.md`](PROGRESS.md) for what's started and what's next.
2. **Pick up an open item** from `PROGRESS.md` "Next immediate steps" or an
   unchecked task in [`docs/IMPLEMENTATION_ROADMAP.md`](docs/IMPLEMENTATION_ROADMAP.md).
3. **Grep for `TODO`** — every spot needing real MySQL data or a design decision is
   tagged `TODO(mysql)`, `TODO(design)`, `TODO(balance)`, `TODO(phaseN)`, or
   `TODO(tswow)`.
4. **Record decisions** in [`docs/DECISIONS.md`](docs/DECISIONS.md) as you make them,
   and keep the matching code `TODO` in sync.
5. **Keep placeholders honest** — no placeholder number is balanced; don't ship
   values as final without a balance note.

### Building (once wired to TSWOW)

This is not yet a runnable TSWOW module. To integrate, drop `src/` into a TSWOW
module and call the `register*()` entry points from the module's data/live entry
files. That wiring is intentionally deferred — see the `TODO(tswow)` markers.
