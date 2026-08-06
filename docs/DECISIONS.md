# Design Decisions Log

This file tracks decisions made during implementation and the open questions
that still need answers. Each open question should become a "Decided" entry once
resolved, with a date and a short rationale.

---

## Decided (from the design spec)

| # | Decision | Rationale |
|---|----------|-----------|
| D1 | **Power progression:** level-gated 1–80, then infinite gear scaling | Familiar WoW leveling for the early game; gear % scaling gives a mathematically infinite curve |
| D2 | **Passive points:** fixed 1 point per floor, floors 1–300, then stops | Tree (300 nodes) fills exactly at floor 300; predictable pacing |
| D3 | **Ability acquisition:** core abilities at creation + shop purchases | Keeps the passive tree focused on *enhancing* abilities, not granting them |
| D4 | **Ability enhancement:** passive tree includes modifier nodes | Lets the tree scale whatever abilities the player owns |
| D5 | **Currency:** "Anima", earned from enemies and bosses | Torghast-thematic; single sink (the shop) |

---

## Decided during this scaffolding pass

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| D6 | Repo built **in place** in the existing `TsWOW_Endless_Torghast_Concept` checkout rather than a new `~/tswow-torghast-class` folder | The session already has this repo cloned with the correct remote and working branch; a second repo would be orphaned and un-pushable | 2026-08-06 |
| D7 | Work is committed on branch `claude/tswow-torghast-class-setup-422vpa` (the designated push branch). `phase-1-passive-tree` is created **locally** for ongoing work but not pushed without explicit permission | Branch policy for this task restricts pushes to the designated branch | 2026-08-06 |
| D8 | Source laid out under `src/{datascripts,livescripts,config}` | Matches TSWOW's split between static data (datascripts), runtime behavior (livescripts), and tunable constants (config) | 2026-08-06 |
| D9 | All game-value numbers are **placeholders** marked `TODO(mysql)` / `TODO(balance)` | Real values depend on the MySQL export and balance passes that have not happened yet | 2026-08-06 |

---

## Open questions (need a decision before / during implementation)

These are lifted from the design spec's "Still to decide" list plus new ones
raised by the skeleton. Resolve and move up to the tables above.

### Gameplay / economy
- [ ] **Shop frequency:** every 5 floors or every floor? Affects the whole anima economy. *(Leaning: every 5 floors — see `balance_tuning.ts` `SHOP_FLOOR_INTERVAL`.)*
- [ ] **Anima carry-over:** per-character only, or account-wide?
- [ ] **Ability cost balance:** are 50–200 anima prices right?
- [ ] **New ability vs mastery ratio** in shop rotations.
- [ ] **Starting gear / base stats** for floor 1.
- [ ] **Resource model per direction:** the skeleton assumes rage (Armor&Power),
  mana (Magic&ES), energy (Evasion&Crit) via `ResourceType` in `abilities_core.ts`.
  Confirm, and decide rage generation amounts on basic attacks.

### Itemization / spec sync
- [ ] **v1.3 Itemization System not in repo:** the repo's `DESIGN_SPEC.md` is v1.2
  and has no Itemization section (rarity tiers, directional gear, procs, jewels,
  enchants). `STAT_POOLS` (`passive_tree.ts`) was derived from the v1.2 "Stat
  Mapping" table as a stand-in. Add v1.3 and reconcile the per-direction stat pools
  against the real itemization gear stats.

### Passive tree
- [ ] **Refund system:** can keystones ever be refunded? *(Spec recommends: no, permanent.)*
- [ ] **Tree reset:** can non-keystone nodes be respec'd mid-run? *(Spec recommends: yes.)*
- [ ] **Modifier node ratio:** how many modifier nodes per 10 nodes? *(Spec recommends: 2–3 per 10.)*
- [ ] **Exact node layout / coordinates:** who owns the x/y positions — hand-authored, or procedurally generated then hand-tuned?
- [ ] **Allocation adjacency rule:** must every newly allocated node be adjacent to an already-allocated node (PoE-style), or can any unlocked node be taken? *(Skeleton assumes adjacency required.)*

### Data / integration
- [ ] **MySQL export format:** what tables/columns will the export actually contain? Needed to fill `TODO(mysql)` values (stat ids, spell ids, base damage, coefficients).
- [ ] **Spell base IDs:** which existing WoW spell IDs do we clone for each core/shop ability (visuals + effect templates)?
- [ ] **Persistence layer:** how do we store per-character anima + allocations — custom SQL table via livescript DB access, or player-data blobs? *(Skeleton assumes a custom SQL table.)*
- [ ] **Enemy scaling knobs:** is `+1% health / +0.5% damage per passive point` balanced past floor 200?
- [ ] **Passive tree UI:** how is the tree displayed and navigated in-game (custom addon)?

---

## How to use this file

1. When you make a call, add a row to a "Decided" table with a one-line rationale and the date.
2. Check the corresponding open-question box (or delete it).
3. If a decision changes a placeholder in code, update the matching `TODO` comment so code and log stay in sync.
