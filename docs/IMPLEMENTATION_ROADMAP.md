# Implementation Roadmap

This roadmap tracks the 7 implementation phases for the Endless Torghast custom
class. It mirrors the "Implementation Roadmap" section of
[`DESIGN_SPEC.md`](./DESIGN_SPEC.md) and is the working checklist we update as
code lands.

**Status legend:** ⬜ Not started · 🟨 In progress · ✅ Done

---

## Phase 1 — Passive Tree Infrastructure (Datascripts) 🟨

Skeletons in place; real data generation and validation still to come.

**Tasks**
- [ ] Define node data structure (id, name, direction, stat type, stat value, connections, keystone flag)
- [ ] Create datascript to generate 300 nodes from specifications
- [ ] Implement node connection logic (pathfinding + allocation validation)
- [ ] Create character-specific tree storage (per-character allocation)
- [ ] Implement point-allocation system (how a player spends points)

**Deliverables**
- Passive tree DBC/data entries
- Character passive allocation table (`passive_tree_allocations`)
- Tree validation system (no double-allocation, connection rules)

**Skeleton files:** `src/datascripts/passive_tree.ts`, `keystones.ts`

---

## Phase 2 — Stat Application System ⬜

**Tasks**
- [ ] Query MySQL tables for gear stats (armor, health, spell power, etc.)
- [ ] Create stat multiplier system (additive vs multiplicative)
- [ ] Integrate passive tree bonuses into character stat calculation
- [ ] Test synergy (gear +50, tree +20% multiply correctly)

**Deliverables**
- Character stat calculation system
- Passive tree stat modifier lookup tables
- Integration with the core stat calculation

**Skeleton files:** `src/livescripts/stat_application.ts`

---

## Phase 3 — Keystone Effects ⬜

**Tasks**
- [ ] Define each keystone's scripted behavior
- [ ] Implement keystone persistence (cannot refund)
- [ ] Create behavior scripts per keystone
- [ ] Test keystone synergies

**Deliverables**
- Keystone behavior system
- Per-character keystone tracking
- Datascript implementation of keystone effects

**Skeleton files:** `src/datascripts/keystones.ts`, `src/livescripts/stat_application.ts`

---

## Phase 4 — Ability Acquisition System ⬜

**Tasks**
- [ ] Extract reference spell database from MySQL data
- [ ] Define core ability sets per archetype (5–8 spells per direction)
- [ ] Create shop inventory datascripts (purchasable abilities)
- [ ] Implement anima currency system (drop / earn / spend)
- [ ] Create modifier node datascripts (ability enhancement passives)
- [ ] Link modifier nodes to actual ability damage / cooldown values

**Deliverables**
- Core ability entries (given at character creation)
- Shop ability pool (100+ abilities across runs)
- Anima currency system and drop tables
- Modifier node definitions
- Character ability purchase tracking table

**Skeleton files:** `src/datascripts/abilities_core.ts`, `abilities_shop.ts`, `anima_currency.ts`, `src/livescripts/shop_handler.ts`

---

## Phase 5 — Class Abilities: Stat Scaling ⬜

**Tasks**
- [ ] Integrate stat scaling into core abilities (gear multipliers)
- [ ] Create scaling formulas (`damage = base + coeff * spell_power`, etc.)
- [ ] Test synergy: gear stats + passive nodes + ability masteries
- [ ] Balance ability damage expectations per floor

**Deliverables**
- Scaling formula documentation
- Ability balance tuning data

**Skeleton files:** `src/config/balance_tuning.ts`

---

## Phase 6 — Torghast Integration ⬜

**Tasks**
- [ ] Verify Endless Torghast module compatibility
- [ ] Implement floor progression system (passive point rewards)
- [ ] Set power progression curve (enemy scaling, gear drops, point allocation)
- [ ] Tune difficulty vs character power

**Deliverables**
- Floor scaling system
- Loot table integration
- Difficulty balance pass

---

## Phase 7 — Testing & Balance ⬜

**Tasks**
- [ ] Test each build archetype to floor 30+
- [ ] Identify over/underpowered keystones
- [ ] Tune stat values on nodes
- [ ] Tune shop ability costs (anima economy)
- [ ] Validate ability synergies
- [ ] Collect feedback on build diversity

**Deliverables**
- Balance tuning data
- Anima economy adjustments
- Known issues list
- Recommended builds guide

---

## Current focus

Phase 1 skeletons exist. The immediate blocker for turning skeletons into real
data is the **MySQL export** (stat tables, spell tables) — see
[`DECISIONS.md`](./DECISIONS.md) and [`../PROGRESS.md`](../PROGRESS.md).
