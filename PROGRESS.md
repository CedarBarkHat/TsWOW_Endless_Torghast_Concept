# Progress

Living status of the Endless Torghast custom class. Updated as work lands.
Roadmap: [`docs/IMPLEMENTATION_ROADMAP.md`](docs/IMPLEMENTATION_ROADMAP.md) ·
Decisions: [`docs/DECISIONS.md`](docs/DECISIONS.md)

_Last updated: 2026-08-06 — initial scaffolding pass._

---

## ✅ Started (skeletons in place)

**Phase 1 — Passive Tree Infrastructure**
- `src/datascripts/passive_tree.ts` — full data model (`PassiveNode`, `PassiveTree`,
  `CharacterTreeState`), enums (Direction / NodeKind / StatType), a
  `generatePassiveTree()` **stub**, and working validation/reachability/`canAllocate`
  helpers.
- `src/datascripts/keystones.ts` — all 6 keystones fully specified as data with
  tunable `params` and a `KeystoneHook` per keystone.

**Ability system (datascripts)**
- `src/datascripts/abilities_core.ts` — 18 core abilities (6 per direction) with
  placeholder stats.
- `src/datascripts/abilities_shop.ts` — starter shop pool + 4 shop categories.
- `src/datascripts/anima_currency.ts` — drop table (10–50 group / 50–200 boss),
  scaling hook, and the `character_anima` schema.

**Runtime (livescripts)**
- `src/livescripts/passive_allocation.ts` — point award + allocation flow (uses the
  pure `canAllocate` rule); persistence stubbed.
- `src/livescripts/stat_application.ts` — `aggregateBonuses()` implements the
  additive-small / multiplicative-big math from the spec; base-stat I/O stubbed.
- `src/livescripts/shop_handler.ts` — shop roll / purchase / grant flow stubbed.

**Config**
- `src/config/class_config.ts` — class identity, level-1 base-stat shape, core
  ability grouping.
- `src/config/balance_tuning.ts` — all pacing/scaling/economy knobs in one place;
  `gearQualityMultiplier()` and `enemyScaling()` implemented from the spec curves.

**Docs**
- `docs/DESIGN_SPEC.md` — full design document (source of truth).
- `docs/IMPLEMENTATION_ROADMAP.md` — the 7 phases as a checklist.
- `docs/DECISIONS.md` — decided items + open questions.

---

## 🟢 Ready for implementation (design is settled)

- Passive-tree **math** — additive/multiplicative rules are final; `aggregateBonuses()`
  can be completed and unit-tested now (no MySQL needed).
- **Tree validation** — rules are defined; can be tested against generated trees.
- **Progression pacing** — level cap 80, 1 pt/floor to 300, gear/enemy curves are
  all in `balance_tuning.ts` and implemented.
- **Keystone data** — the 6 keystones are specified; only their runtime hooks await
  Phase 3.

---

## 🔴 Blocked — waiting on MySQL data / decisions

Marked in code as `TODO(mysql)` / `TODO(design)`:
- **Real ability values** — base spell ids, base damage, scaling coefficients,
  cooldowns (`abilities_core.ts`, `abilities_shop.ts`). Need the `spells` export.
- **Real node stat values + stat ids** — the 300 nodes' magnitudes and their mapping
  to `character_stats` (`passive_tree.ts`).
- **Base-stat read/write** — the gear/core stat pipeline integration
  (`stat_application.ts` `readBaseStat`/`writeStat`).
- **Starting gear / floor-1 base stats** (`class_config.ts`).
- **Open design questions** — shop frequency, anima carry-over, respec rules,
  adjacency rule, 3rd keystone per direction (see `docs/DECISIONS.md`).

---

## ▶️ Next immediate steps

1. **Fill `generatePassiveTree()`** — build one direction's cluster end-to-end
   (`buildDirectionCluster`) and get `validateTree()` passing for it.
2. **Add tests** for `aggregateBonuses()` and `validateTree()` — pure functions,
   no server required. (No test harness is set up yet — pick one.)
3. **Resolve the top open decisions** (shop frequency, adjacency rule) so the
   allocation + shop skeletons can be finished.
4. **Get the MySQL export** and start replacing `TODO(mysql)` placeholders,
   beginning with core ability spell ids.
5. **Wire a TSWOW module entry point** that calls the `register*()` functions once
   data is real.

---

## Notes

- Nothing here compiles against a live TSWOW runtime yet — datascript/livescript
  registration bodies are intentionally stubbed. Types are written so the pure
  logic (math, validation) is usable and testable independently.
- This is a **skeleton** pass by design; see the task brief. Do not treat placeholder
  numbers as balanced values.
