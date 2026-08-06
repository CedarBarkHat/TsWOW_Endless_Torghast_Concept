# Progress

Living status of the Endless Torghast custom class. Updated as work lands.
Roadmap: [`docs/IMPLEMENTATION_ROADMAP.md`](docs/IMPLEMENTATION_ROADMAP.md) ·
Decisions: [`docs/DECISIONS.md`](docs/DECISIONS.md)

_Last updated: 2026-08-06 — **Phase 1 started** (abilities populated, tree
structure + stat-pool mapping, modifier handling)._

> ## ⚠️ Two inputs were expected this session but weren't available
> 1. **Design spec is v1.2 in this repo, not v1.3.** The requested "Itemization
>    System" section (rarity tiers, directional gear, procs, jewels, enchants) is
>    **not present**. Stat pools were derived from the existing **"Stat Mapping
>    (MySQL Integration)"** table instead. Drop the v1.3 spec into
>    `docs/DESIGN_SPEC.md` to reconcile (`STAT_POOLS` in `passive_tree.ts` carries
>    a `TODO(design)` for this).
> 2. **No MySQL data.** The provided path was still the literal
>    `[INSERT YOUR PATH: ...]` template and no known dump location exists, so real
>    spell values could not be read. Ability numbers are **hand-authored relative
>    placeholders** tagged `TODO(mysql)` / `TODO(balance)`.

---

## 🟡 Phase 1 — STARTED

### Populated this pass
- `src/datascripts/abilities_core.ts` — 18 core abilities (6 per direction) now
  carry **relative placeholder values**: `baseDamage`, `scalingCoeff`,
  `cooldownSec`, `resourceCost`, plus a new `ResourceType` (rage / mana / energy).
  Values express each ability's *shape*, not balance. `TODO(mysql)`/`TODO(balance)`.
- `src/datascripts/passive_tree.ts` — added `STAT_POOLS` (which stats each
  direction offers, from the spec's Stat Mapping table), a `statBelongsToDirection`
  helper, a `ModifierAspect` enum, and a `modifierAspect` field on `PassiveNode`.
  A comment points to `keystones.ts` for the 6 keystones (kept there to avoid a
  circular import).
- `src/livescripts/stat_application.ts` — added `aggregateAbilityModifiers()` +
  `applyAbilityModifiers()` so MODIFIER nodes accumulate per-ability, per-aspect
  bonuses (damage / cooldown / area / resource / duration). Wired (stubbed) into
  `recalculateStats()`.
- `src/config/class_config.ts` — de-duplicated `CORE_ABILITIES_BY_DIRECTION`
  (now single-sourced from `abilities_core.ts`).

### Already in place (previous scaffolding pass)
**Passive Tree Infrastructure**
- `src/datascripts/passive_tree.ts` — data model (`PassiveNode`, `PassiveTree`,
  `CharacterTreeState`), enums, `generatePassiveTree()` **stub**, and working
  validation / reachability / `canAllocate` helpers.
- `src/datascripts/keystones.ts` — all 6 keystones as data with tunable `params`
  and a `KeystoneHook` each.

**Ability system (datascripts)**
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
- **Stat pools** — `STAT_POOLS` now defines which stats each direction offers, so
  node generation has a valid stat set to draw from per direction.
- **Ability shape** — core abilities have relative placeholder values, enough to
  reason about rotations and to be enhanced by modifier nodes.

---

## 🔴 Still TODO / blocked

**Node generation (the big remaining Phase 1 item)** — `generatePassiveTree()` and
`buildDirectionCluster()` are still stubs. The 299 non-origin nodes aren't created
yet. Blocked only on a design confirmation (layout/coordinates + how many
modifier nodes per cluster), not on MySQL. `TODO(phase1)` / `TODO(design)`.

**Waiting on MySQL data** (`TODO(mysql)`):
- **Real ability values** — base spell ids, base damage, scaling coefficients
  (`abilities_core.ts`, `abilities_shop.ts`). Need the `spells` export.
- **Real node stat magnitudes + stat ids** — mapping `StatType` to
  `character_stats` rows (`passive_tree.ts`).
- **Base-stat read/write** — the gear/core stat pipeline integration
  (`stat_application.ts` `readBaseStat`/`writeStat`).

**Waiting on design decisions** (`TODO(design)`):
- v1.3 spec + Itemization System (reconcile `STAT_POOLS`, gear stat pools).
- Starting gear / floor-1 base stats (`class_config.ts`).
- Shop frequency, anima carry-over, respec rules, adjacency rule, resource model
  per direction, 3rd keystone per direction (see `docs/DECISIONS.md`).

---

## ▶️ Next immediate steps

1. **Drop in the v1.3 spec** with the Itemization System, then reconcile
   `STAT_POOLS` and gear stat pools.
2. **Fill `generatePassiveTree()`** — build one direction's cluster end-to-end
   (`buildDirectionCluster`) using `STAT_POOLS`, and get `validateTree()` passing.
3. **Add tests** for `aggregateBonuses()`, `aggregateAbilityModifiers()`, and
   `validateTree()` — all pure functions, no server required. (No test harness set
   up yet — pick one.)
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
