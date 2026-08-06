# TSWOW Torghast Custom Class Design Document

**Project:** Endless Torghast Single-Player Class  
**Generated:** August 6, 2026  
**Status:** Design Phase (Power Progression TBD)

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Passive Tree Architecture](#passive-tree-architecture)
3. [Node Types & Mechanics](#node-types--mechanics)
4. [Three Thematic Directions](#three-thematic-directions)
5. [Stat Mapping (MySQL Integration)](#stat-mapping-mysql-integration)
6. [Keystone Effects](#keystone-effects)
7. [Ability Acquisition System](#ability-acquisition-system)
8. [Character Progression Loop](#character-progression-loop)
9. [Power Progression Framework](#power-progression-framework)
10. [Synergy & Build Guide](#synergy--build-guide)
11. [Implementation Roadmap](#implementation-roadmap)
12. [MySQL Database References](#mysql-database-references)

---

## Design Philosophy

**Core Concept:** A single custom class designed around Endless Torghast progression, inspired by Path of Exile's passive tree system adapted to WoW's gear-based power scaling.

**Key Principles:**
- **Per-character permanent progression:** Each character builds their own unique passive tree path over infinite floors
- **Gear + Tree synergy:** Character power comes from both gear drops and passive tree choices
- **Infinite scaling:** No floor cap; power curve continues indefinitely
- **High replay value:** Different characters can follow different passive tree paths, creating distinct builds
- **Solo-focused:** All mechanics designed for single-player Torghast experience

**Target Playstyle:** Roguelike progression in an infinite dungeon where strategic tree choices shape how you handle increasingly difficult floors.

---

## Passive Tree Architecture

### Overview
- **Total Nodes:** 300
- **Starting Location:** Single start node
- **Structure:** Three distinct thematic directions with pathways connecting them for hybrid builds
- **Node Categories:** Small (additive), Big (multiplicative), Keystones

### The Three Directions

```
                    START
                      |
         ____________/ \____________
        /                            \
    ARMOR & POWER        MAGIC & ENERGY SHIELD        EVASION & CRIT
    (Str/Armor/HP)       (Int/Mana/Resist/ES)         (Dex/Crit/Dodge)
```

Each direction has:
- Multiple branches radiating from center
- Regional clusters (e.g., "Heavy Armor," "Spell Amplification," "Critical Strike")
- Connecting pathways to adjacent directions for hybrid builds
- 2-3 keystones per direction

### Node Distribution (300 total)

**Direction Balance:**
- Armor & Power: ~110 nodes (40 small, 20 big, 2-3 keystones, ~25 connectors)
- Magic & Energy Shield: ~110 nodes (40 small, 20 big, 2-3 keystones, ~25 connectors)
- Evasion & Crit: ~110 nodes (40 small, 20 big, 2-3 keystones, ~25 connectors)

**Connector/Hybrid Path Nodes:** ~30 nodes total (small nodes connecting directions)

### Connectivity Requirements

Each node connects to:
- **Small nodes:** 1-3 adjacent nodes
- **Big nodes:** 1-2 adjacent nodes (gateways to new regions)
- **Keystones:** 1-3 adjacent nodes (powerful but gated)

**Hybrid pathways example:** Armor direction has 2-3 dedicated connector nodes leading toward Evasion; these enable mixed builds (tank/dodge hybrid).

---

## Node Types & Mechanics

### Small Nodes (Additive Bonuses)
- **Quantity:** ~120 total across tree
- **Effect:** +X% to single stat (additive stacking)
- **Examples:**
  - +2% Armor
  - +3% Health
  - +2% Magic Resistance
  - +1.5% Crit Chance
  - +2% Dodge
  - +3% Spell Power

**Stacking Rule:** Small nodes add linearly. Example: 5 nodes of +2% Armor = +10% Armor total (multiplicative with other armor sources from gear).

### Big Nodes (Multiplicative Bonuses)
- **Quantity:** ~60 total across tree
- **Effect:** +X% multiplier to related stats OR hybrid bonuses
- **Examples:**
  - +5% all Armor values
  - +4% Maximum Health
  - +3% Spell Damage (multiplicative)
  - +2% Crit Multiplier
  - +3% Evasion chance

**Multiplier Rule:** Big nodes multiply the base stat, not add to it. Example: 20% base armor + big node (+5%) = 21% total (multiplicative).

### Keystones (Game-Changing Abilities)
- **Quantity:** 6-9 total (2-3 per direction)
- **Effect:** Fundamentally alter playstyle; require significant point investment
- **Requirement:** Usually accessed via 8-12 nodes deep into a direction
- **Cannot refund:** Once you take a keystone, it's permanent for that character (promotes meaningful choices)

**Examples by Direction:**

**Armor & Power:**
- **"Iron Will"** - Converts 50% of armor into raw damage; encourages pure tank/damage hybrid
- **"Fortress"** - Grants damage immunity for 3 seconds after taking heavy hit; 30 second cooldown

**Magic & Energy Shield:**
- **"Arcane Shield"** - ES recharges 50% faster when above 50% mana
- **"Spell Echo"** - 15% of spell damage applied as bonus ES

**Evasion & Crit:**
- **"Phantom Dancer"** - Dodge chance grants 20% attack/cast speed for 4 seconds (stacking)
- **"Assassinate"** - Crit strikes refund 10 energy; critical hits deal 30% more damage

---

## Stat Mapping (MySQL Integration)

### Gear Stats → Passive Tree Stats

Your MySQL database contains gear stat entries. The passive tree builds on these by offering percentage bonuses to existing stat pools.

**Stat Categories (from gear):**

| Stat Type | MySQL Source Table | Passive Tree Application |
|-----------|-------------------|------------------------|
| Armor | character_stats / item_stats | Small/Big nodes offer +X% Armor |
| Health | character_stats | Small/Big nodes offer +X% Max HP |
| Strength | character_stats | Small nodes cluster in Armor & Power |
| Intelligence | character_stats | Small nodes cluster in Magic & Energy Shield |
| Dexterity | character_stats | Small nodes cluster in Evasion & Crit |
| Spell Power | spell_schools table | Big nodes multiply spell damage output |
| Resistances (Fire/Cold/Shadow/Arcane/Holy/Nature) | character_stats | Small nodes per resistance; Big nodes for "all resistances +X%" |
| Critical Strike Chance | character_stats | Small nodes in Evasion/Crit direction |
| Critical Strike Multiplier | character_stats | Big nodes in Evasion/Crit direction |
| Dodge/Evasion Chance | character_stats (if exists) or custom | Small/Big nodes in Evasion branch |
| Mana / Energy Pool | character_stats | Small/Big nodes in Magic direction |
| Life/Mana Regeneration | character_stats | Big nodes in Magic direction |
| Attack/Cast Speed | character_stats | Small nodes scattered; Keystones may enhance |
| Crit Resistance | character_stats (if exists) | Big nodes in defensive branches |

### MySQL Query Pattern (for Claude implementation)

```sql
-- Example: Find all armor-related stats in gear
SELECT stat_id, stat_name, stat_type, default_value 
FROM character_stats 
WHERE stat_type = 'armor' OR stat_name LIKE '%armor%'
ORDER BY stat_id;

-- Example: Find resistances
SELECT stat_id, stat_name, stat_type, default_value 
FROM character_stats 
WHERE stat_type IN ('fire_resistance', 'cold_resistance', 'arcane_resistance', etc.)
ORDER BY stat_id;
```

### Tree-to-Gear Scaling Example

**Scenario:** Character has +50 Armor from gear.
- Passive tree node: "+2% Armor"
- Result: 50 * 1.02 = 51 Armor
- Stack 10 such nodes: 50 * 1.20 = 60 Armor (multiplicative stacking)

**Scenario:** Character has +30% Spell Power from gear.
- Big node: "+5% Spell Damage multiplier"
- Result: Spell damage multiplier goes from 1.30 → 1.365 (additive to multiplier pool, but multiplicative in damage calculation)

---

## Keystone Effects

### Armor & Power Direction (2-3 Keystones)

**Keystone 1: "Iron Will"**
- **Requirement:** 12+ nodes deep, only on Armor & Power branch
- **Effect:** 50% of Armor is converted into Weapon Damage bonus
- **Why it's a Keystone:** Forces a tank-to-damage hybrid playstyle; pure tanks don't benefit; encourages mixed builds
- **Synergy:** Works with Heavy Armor nodes; encourages taking both Armor and Damage nodes
- **Counterplay:** Requires careful itemization (gear with high armor becomes more valuable)

**Keystone 2: "Fortress"**
- **Requirement:** 10+ nodes deep, adjacent to Heavy Defense cluster
- **Effect:** After taking damage > 15% max health, gain 3 seconds of 50% damage reduction; 30 second cooldown
- **Why it's a Keystone:** Survival tool for infinite scaling; changes combat rhythm (defensive reaction vs pure offense)
- **Synergy:** Health nodes make this more effective; positioning matters
- **Counterplay:** Enemies with sustained damage overcome this; not a "carry" mechanic

### Magic & Energy Shield Direction (2-3 Keystones)

**Keystone 1: "Arcane Shield"**
- **Requirement:** 12+ nodes deep in Magic cluster
- **Effect:** Energy Shield recharges 50% faster when above 50% mana; ES regeneration starts 1 second sooner after damage when mana is high
- **Why it's a Keystone:** Mana management becomes core survival tool; encourages mana-efficient spellcasting
- **Synergy:** Mana regeneration nodes become essential; spell efficiency matters
- **Counterplay:** Mana drain mechanics hard-counter this keystone

**Keystone 2: "Spell Echo"**
- **Requirement:** 10+ nodes deep in Spell Power cluster
- **Effect:** 15% of spell damage dealt applies as bonus Energy Shield (capped at 10% max ES per hit)
- **Why it's a Keystone:** Offense becomes defense; encourages aggressive casting
- **Synergy:** Spell power nodes become defensive; hybrid casters thrive
- **Counterplay:** Physical attackers ignore this; requires spell-focused playstyle

### Evasion & Crit Direction (2-3 Keystones)

**Keystone 1: "Phantom Dancer"**
- **Requirement:** 12+ nodes deep in Evasion cluster
- **Effect:** Whenever dodge/evasion triggers, gain 20% attack and cast speed for 4 seconds (stacking up to 5 stacks)
- **Why it's a Keystone:** Dodge becomes offensive tool; encourages pure evasion builds
- **Synergy:** Crit and attack speed nodes multiply its value; creates feedback loop
- **Counterplay:** Guaranteed-hit attacks bypass this; need to manage stacks

**Keystone 2: "Assassinate"**
- **Requirement:** 10+ nodes deep in Critical Strike cluster
- **Effect:** Critical strikes refund 10 energy/mana; critical hits deal 30% more damage
- **Why it's a Keystone:** Changes resource management; encourages crit-focused builds
- **Synergy:** Crit Chance nodes become multipliers; energy efficient spells become spammable on crits
- **Counterplay:** Low crit chance characters don't benefit; requires stat investment

---

## Ability Acquisition System

### Overview

Characters don't learn abilities through passive tree nodes. Instead, abilities come from two sources:

1. **Core Abilities** — Given at class creation (baseline rotation)
2. **Shop Abilities** — Purchased with currency earned in Torghast

The passive tree then **enhances** whatever abilities you own through stat multipliers and modifier nodes.

---

### Core Abilities (Baseline Rotation)

Every character starts with 5-8 core abilities depending on their build direction. These form the foundation of combat.

**Armor & Power Direction (Tank/Melee)**
Core abilities (given at start):
- **Slash** — Basic attack; low cost, fast
- **Overhead Smash** — Moderate damage, moderate cooldown
- **Shield Bash** — Utility CC; stuns for 2 seconds
- **Last Stand** — Defensive cooldown; reduces damage 30% for 4 seconds
- **Execute** — Finish ability; high damage at low enemy health
- **Charge** — Movement + damage; closes distance

*Playstyle:* Melee rotation with defensive tools. Passive tree enhances Armor + damage scaling on these abilities.

**Magic & Energy Shield Direction (Caster)**
Core abilities (given at start):
- **Fireball** — Ranged damage; moderate cost, moderate cooldown
- **Ice Storm** — AoE damage; high cost, medium cooldown
- **Arcane Bolt** — Fast projectile; low cost, spammable
- **Mana Shield** — Defensive; converts damage to mana drain
- **Teleport** — Movement + escape; moderate cost, 15 second cooldown
- **Inferno** — Channel ability; damage ramps over 3 seconds

*Playstyle:* Spell-focused rotation with resource management. Passive tree enhances spell damage and mana efficiency.

**Evasion & Crit Direction (DPS/Ranger)**
Core abilities (given at start):
- **Quick Shot** — Basic ranged attack; fast, spammable
- **Piercing Arrow** — Projectile penetrates; medium damage
- **Evasive Strike** — Attack + dodge; gain dodge buff after use
- **Backstab** — High burst damage; increased damage vs low-health targets
- **Dash** — Movement ability; repositioning tool
- **Multishot** — AoE ranged; hits multiple enemies

*Playstyle:* Fast-paced ranged rotation. Passive tree enhances crit and attack speed on these abilities.

---

### Shop System

**When does the shop appear?**
- Every 5 floors (floors 5, 10, 15, etc.)
- OR every floor (for more frequent decisions)
- **TBD:** Need to decide based on economy tuning

**What can you buy?**

**Category 1: Ability Mastery (Enhanced versions of core abilities)**
- Example: "Fireball Mastery" — Increases base damage +30%, cooldown -0.5s
- Cost: 50-100 currency
- Effect: Your existing Fireball becomes stronger
- Why buy: Lock in your playstyle, strengthen your rotation

**Category 2: New Abilities (Situational/Specialized abilities)**
- Example: "Frozen Orb" — New ability; AoE damage + freezes
- Cost: 100-200 currency
- Effect: Adds new button to your rotation
- Why buy: Adapt to floor challenges, fill gaps in playstyle

**Category 3: Utility Abilities (CC, sustain, mobility)**
- Example: "Drain Life" — Heal yourself for 50% damage dealt
- Cost: 75-150 currency
- Effect: Adds sustain option
- Why buy: Survival tool; synergizes with your build

**Category 4: Passive Ability Mods (Enhance your abilities without passive tree)**
- Example: "Faster Casting" — All spells cast 15% faster
- Cost: 75-125 currency
- Effect: Modifies all your spells globally
- Why buy: Playstyle shift without committing passive points

**Shop Rotation:**
- Every floor has 3-5 random abilities for sale
- Never repeats on same character (once bought, won't appear again)
- Encourages build adaptation and flexibility

---

### Currency System

**What is the currency?**

**"Anima"** (Torghast thematic currency, like in-game Torghast)
- Dropped from enemies (every enemy group drops 10-50 anima)
- Dropped from boss floors (50-200 anima per boss)
- Never spent on anything except shop
- Carries over between floors
- Carries over between characters (account-wide? or per-character? **TBD**)

**Economy Example:**

```
Floor 5 shop encounter:
- Kill 20 enemy groups (200 anima) + 1 boss (75 anima) = 275 anima earned
- Shop offers:
  * "Fireball Mastery" (100 anima)
  * "Frozen Orb" (150 anima)
  * "Mana Regen Boost" (75 anima)
  
Decision: Buy all three (325)? Buy two? Buy none and save for later?
```

**Economy Goals:**
- Early floors: Shop abilities are "nice to have," not mandatory
- Mid floors (30-80): Shop becomes primary progression tool
- Late floors (80+): Mostly saving anima for specific abilities you want

---

### Ability Enhancement Through Passive Tree

**How do passives enhance abilities you've bought?**

The passive tree includes **modifier nodes** that enhance your abilities. These are separate from stat nodes.

**Example Modifier Nodes (in addition to stat nodes):**

**Damage Enhancement Nodes (Armor & Power):**
- "+10% Slash damage"
- "+15% Execute damage"
- "+20% Overhead Smash stun duration"

**Spell Enhancement Nodes (Magic & ES):**
- "+15% Fireball damage"
- "+25% Ice Storm area size"
- "+10% mana efficiency (spells cost 10% less)"

**Attack Enhancement Nodes (Evasion & Crit):**
- "+12% Quick Shot attack speed"
- "+30% Backstab damage when target < 30% health"
- "+5% dodge chance per ability used (stacking)"

**Global Enhancement Nodes (all directions):**
- "+10% all ability cooldowns reduced"
- "+20% healing received"
- "+15% movement speed"

**How it stacks:**
```
Base Fireball damage: 100
+ Shop "Fireball Mastery": +30% = 130
+ Passive tree "+15% Fireball damage": 130 * 1.15 = 149.5
+ Gear "Spell Power +50": multiplicative with modifiers
+ Big passive node "+5% Spell Damage multiplier": final multiplier

Result: Fireball does ~200+ damage instead of 100 (rough example)
```

**Synergy Example:**
- You buy "Frozen Orb" from shop
- You take passive path toward "Magic & ES" direction
- You allocate "+20% Ice damage" modifier nodes
- Your Frozen Orb becomes your primary ability, enhanced by tree investment

---

### Ability List by Build Direction

*Note: This is a placeholder. Exact abilities depend on your class fantasy and available TSWOW datascripts. Claude will populate this with actual spells from your MySQL data.*

**Armor & Power Core:** Slash, Overhead Smash, Shield Bash, Last Stand, Execute, Charge
**Shop options (examples):** Whirlwind, Cleave, Shield Wall Mastery, Rend, Intercept, Revenge

**Magic & ES Core:** Fireball, Ice Storm, Arcane Bolt, Mana Shield, Teleport, Inferno
**Shop options (examples):** Frozen Orb, Lightning Bolt, Frostbolt Mastery, Flame Burst, Mirror Image, Blizzard

**Evasion & Crit Core:** Quick Shot, Piercing Arrow, Evasive Strike, Backstab, Dash, Multishot
**Shop options (examples):** Mortal Strike, Fan of Knives, Smoke Bomb, Marked for Death, Frost Arrow Mastery, Rain of Arrows

---

### Decision Loop Per Floor (Updated)

Each floor now has multiple decision points:

1. **Combat Phase**
   - Kill enemies, earn anima
   - Use core abilities + any shop abilities purchased

2. **Shop Phase** (every 5 or 10 floors)
   - Decision: "Buy a new ability? Or save anima?"
   - Buy strategically to match build direction

3. **Passive Tree Phase**
   - Allocate 1 passive point
   - Decision: "Enhance my current abilities? Or invest in stats?"

4. **Loot Phase**
   - Pick up gear
   - Gear + abilities + passives synergize

**Example Run:**

```
Floors 1-5:
- Use core abilities (Slash, Smash, Shield Bash)
- Earn 275 anima
- First shop: Buy "Whirlwind" (100 anima) or save?
- Allocate first passive point into Armor cluster

Floors 6-15:
- Core abilities + Whirlwind
- Earn 600 anima total
- Second shop: Buy "Cleave Mastery" (100 anima)?
- Allocate passive points into Heavy Armor + Damage

Floors 16-30:
- Rotation now: Slash, Whirlwind, Cleave, Overhead Smash
- Passives are multiplying damage of these abilities
- Shop offers more specialized tools: "Shield Wall," "Rend," etc.
- Build identity clear: Tank/Melee bruiser

Floors 31+:
- Fully specialized build
- Choosing between more damage or survival upgrades
- Passive tree filling out; decisions become more incremental
```

---

### Shop Design Philosophy

**Constraints:**
- Every ability should feel valuable; no "traps"
- Shop items shouldn't be mandatory for progression (nice to have, not mandatory)
- Should encourage different build paths each run
- Random rotation means each run feels different

**Balance Goals:**
- Early floors: Abilities are "bonuses"; core rotation is sufficient
- Mid floors: Shop abilities become important (30-50% damage from shop abilities)
- Late floors: Passives are primary multipliers; abilities are fixed

---

### TBD / Implementation Notes

- [ ] **Shop frequency:** Every 5 floors or every floor? (affects economy)
- [ ] **Anima carry-over:** Per-character or account-wide?
- [ ] **Exact ability list:** Populate with your MySQL data (datascripts spells)
- [ ] **Ability cost balance:** Are 100-200 anima prices right? Tune based on economy testing
- [ ] **Modifier node frequency:** How many modifier nodes per 10 passive nodes? (recommended: 2-3 per 10)
- [ ] **New ability vs Mastery ratio:** Should shop offer mostly new abilities or mastery upgrades?

---



### A Torghast Run in Practice

**Floor 1:**
- Character enters with 0 passive tree nodes
- Baseline stats from starting gear only
- Defeat enemies → earn passive points (1 point per enemy group? TBD with power progression)
- Allocate 1-2 passive nodes from starting region
- Clear floor, collect loot

**Floor 5:**
- Character has allocated ~4-8 passive points
- Small stat bonuses noticeable (e.g., +8% Armor, +6% Health)
- Gear upgrades from floor drops
- Gear + tree synergize; power curve is smooth

**Floor 15:**
- Character has ~15-20 passive points
- 1-2 Big nodes allocated (multiplicative bonuses kick in)
- Approaching first Keystone decision
- Playstyle starting to specialize (pure tank, caster, evasion glass cannon)

**Floor 30:**
- Character has ~35-45 passive points
- 2-3 Keystones allocated (build identity locked in)
- Near-end-game tier gear from Torghast
- Infinite scaling feels smooth; no hard power spike

**Floor 100+:**
- Character has 100+ passive points
- Multiple Keystones active; full build realized
- Playstyle completely specialized
- Difficulty scaling needs to match (see Power Progression Framework)

### Decision Points Per Floor

Each floor presents:
1. **Passive point allocation:** Which cluster do I advance toward?
2. **Gear choice:** Do I take a Big damage upgrade or survivability upgrade?
3. **Keystone pathway:** Am I committed to a specific build?

This creates constant meaningful choices, not auto-pilot progression.

---

## Power Progression Framework

### FINAL DESIGN: Level-Gated Early Game → Infinite Gear Scaling

**Core Concept:** WoW's level cap (80) gates early progression; beyond that, character power comes from gear and passive tree optimization.

---

### Level & Passive Point Progression

**Floors 1-80: Leveling Phase**
- Character gains 1 level per floor (floor 1 = level 1, floor 80 = level 80)
- Character gains 1 passive point per floor
- **Total after floor 80:** Level 80 + 80 passive points allocated
- **Passive tree status:** ~27% filled (80 of 300 nodes)

**Floors 81-300: Late Game Passive Optimization**
- No more levels (capped at 80)
- Character gains 1 passive point per floor
- **Total after floor 300:** Level 80 + 300 passive points (tree complete)
- **Passive tree status:** 100% filled

**Floors 301+: Infinite Gear Scaling**
- No new levels; no new passive points (tree is full)
- Power comes exclusively from gear optimization
- Keystones are fully utilized; build identity is locked in
- Challenge is purely gear-based (finding perfect drops, optimizing stats)

---

### Gear Scaling Curve

Loot quality increases by percentage per floor. This means gear drops scale throughout infinite progression.

**Floors 1-80: Early Game Gear (+3% per floor)**
- Floor 1 loot: baseline stats (e.g., 10 armor)
- Floor 40 loot: ~50% better (15 armor)
- Floor 80 loot: ~300% better (40 armor)
- **Purpose:** Gear supports leveling; easy progression

**Floors 81-150: Mid Game Gear (+4% per floor)**
- Floor 81 loot: ~320% baseline
- Floor 150 loot: ~1000% baseline
- **Purpose:** Gear becomes primary power source as levels cap out

**Floors 151-300: Late Game Gear (+5% per floor)**
- Floor 151 loot: ~1020% baseline
- Floor 300 loot: ~32,000% baseline
- **Purpose:** Gear scaling accelerates; power explosion

**Floors 301+: Infinite Gear Scaling (+6% per floor)**
- Floor 301 loot: ~33,000% baseline
- Floor 500 loot: astronomically high
- **Purpose:** Infinite scaling without mechanical ceiling

**Scaling Formula:**
```
Loot Quality = Baseline * (1.0X)^(floor - start_floor)

Where X depends on tier:
- Floors 1-80: X = 1.03
- Floors 81-150: X = 1.04
- Floors 151-300: X = 1.05
- Floors 301+: X = 1.06
```

---

### Enemy Scaling

Enemies scale to match player progression, ensuring floors always challenge the character.

**Floors 1-80: Level-Based Scaling**
- Enemy level = player level
- Enemy health/damage scales with player level
- Simple difficulty curve; predictable progression
- **Example:** Floor 40, player level 40 → enemies level 40

**Floors 81+: Passive Point Scaling**
- Enemy level stays at 80 (no higher levels exist)
- Enemy health/damage scales with player passive point allocation
- **Scaling Rule:** Enemies gain +1% health and +0.5% damage per passive point allocated
- **Example:** Floor 200, player has 200 passive points
  - Enemies: Level 80, +200% health, +100% damage
  - Player: Level 80 + 200 passive points + upgraded gear
  - Difficulty remains balanced, not trivial or impossible

**Difficulty Progression Feel:**
- Floors 1-80: "Normal difficulty scaling"; clear progression
- Floors 81-150: "Ramping up"; passive tree focus; gear crucial
- Floors 151-300: "Endgame"; minimal gains per floor; gear becomes paramount
- Floors 301+: "Infinite grind"; optimize and chase perfect rolls

---

### Power Progression Milestones

**Floor 1-20:**
- Players are low level (1-20)
- Small gear upgrades are significant
- Passive tree just starting (10-20 nodes)
- Feels "easy"; learning the build

**Floor 30-50:**
- Player level 30-50
- First big gear spike
- 30-50 passive points; approaching first Keystone decisions
- Build identity starting to form

**Floor 80:**
- **Level cap reached** (level 80)
- Significant gear with level 80 affixes
- 80 passive points; 1-2 keystones likely allocated
- Playstyle fully specialized; ready for late game

**Floor 150:**
- Mid-late game; 150 passive points allocated
- 2-3 keystones active; full build synergy
- Gear has multiplicative passive bonuses stacking
- Difficulty noticeably ramped; requires good itemization

**Floor 300:**
- **Passive tree fully explored** (300 points)
- All keystones locked in; no more tactical choices
- Gear is the only variable
- Challenge is purely optimization; find better loot

**Floor 500+:**
- Infinite progression; no new mechanics
- Purely chasing gear perfect rolls
- Can "beat" the game; can also run forever chasing better gear

---

### Power Progression Guarantees

**These should feel true when playing:**

1. **Floors 1-80 always progress:** Each floor is noticeably stronger than last
2. **Floor 80 → 81 transition is smooth:** No sudden difficulty spike
3. **No "soft cap" until floor 300:** Progression never stops until tree is full
4. **Floors 300+ are optional:** Beating the "game" is possible; scaling allows infinite play
5. **Keystones remain relevant:** Never become useless, even at floor 500

---

### Balance Considerations

**Why this works:**

- **Early clarity:** WoW's leveling system is familiar; players understand 1-80
- **Mid-game momentum:** Passive points give constant sense of progress; gear supports
- **Late-game freedom:** Players decide when to stop (at 300, or keep going infinitely)
- **Infinite scaling:** Gear % scaling never caps; mathematically infinite
- **Difficulty consistency:** Enemy scaling matches player power growth; challenge stays balanced

**Potential tuning needed:**

- Enemy health/damage scaling (+1% health per point, +0.5% damage per point) may need adjustment based on playtesting
- Gear quality percentages (+3%, +4%, +5%, +6%) may shift based on how quickly gear becomes too strong
- Keystone strength at different floors (keystones designed for floor 150; may be overpowered at floor 50)

---

### Summary Table

| Metric | Floors 1-80 | Floors 81-300 | Floors 301+ |
|--------|------------|-------------|-----------|
| Level progression | +1 level/floor | None | None |
| Passive points | +1 point/floor | +1 point/floor | None |
| Gear scaling | +3%/floor | +4-5%/floor | +6%/floor |
| Enemy scaling | Level-based | Passive-based | Passive-based |
| Primary power | Level + gear | Gear + passives | Gear only |
| Playstyle flexibility | Changing | Solidifying | Locked |
| "Game completion" | Level 80 | Floor 300 | Optional (infinity) |

---

## Synergy & Build Guide

### Build Archetypes

**Pure Tank (Armor & Power)**
- Nodes: Heavy Armor cluster + Health cluster + Fortress keystone
- Playstyle: Survive through mitigation; DPS is secondary
- Strength: Scales infinitely with armor gear
- Weakness: Sustained damage can overwhelm; needs heals or ES
- Keystone: Fortress (damage reduction phase) + Iron Will (convert armor to offense)

**Caster Hybrid (Magic & Energy Shield)**
- Nodes: Spell Power cluster + ES cluster + Arcane Shield keystone
- Playstyle: Offense = defense; aggressive spell-slinging sustains you
- Strength: Self-sustaining; scales with spell gear
- Weakness: Mana management required; mana drain cripples you
- Keystone: Arcane Shield (ES recharge) + Spell Echo (offense sustains ES)

**Glass Cannon (Evasion & Crit)**
- Nodes: Crit Chance + Crit Damage + Evasion + Attack Speed
- Playstyle: Don't get hit; kill fast
- Strength: High damage output; fun playstyle
- Weakness: One mistake = death; requires player skill
- Keystone: Phantom Dancer (dodge → offense buff) + Assassinate (crits refund resources)

**Hybrid Tank/Damage (Armor → Evasion connector)**
- Nodes: Medium Armor + Medium Crit + connector path
- Playstyle: Balanced offense/defense
- Strength: Flexible; can adapt to situations
- Weakness: Doesn't excel at anything; "jack of all trades"
- Keystone: Iron Will (tank damage scales damage) + flexible 2nd option

**Hybrid Caster/Crit (Magic → Evasion connector)**
- Nodes: Spell Power + Crit + mana regen
- Playstyle: Spell-focused with critical burst
- Strength: High burst damage; efficient mana usage
- Weakness: Lower sustain than pure casters
- Keystone: Spell Echo (offensive sustain) + Assassinate (crits enable spam)

### Synergy Examples

**"The Berserker"** (Armor & Power → Evasion hybrid)
- Core: Armor cluster + Health cluster + Heavy Damage cluster
- Path: Iron Will keystone + connector nodes → Crit Damage nodes
- Synergy: Armor → damage conversion + high crit = massive single hits
- Gear: Focus on armor + intelligence for damage
- Playstyle: Tank who hits like a truck; DPS from armor stat

**"The Mage"** (Pure Magic & Energy Shield)
- Core: Spell Power cluster + ES cluster + All Resistances cluster
- Keystone: Arcane Shield + optional Spell Echo
- Synergy: Mana efficient spells recharge ES fast; high resist smooths damage
- Gear: Mana, spell power, resistances
- Playstyle: Spam spells efficiently; ES recharges passively

**"The Duelist"** (Evasion & Crit focused)
- Core: Crit Chance + Crit Damage + Attack Speed + Evasion
- Keystone: Phantom Dancer + Assassinate
- Synergy: Dodge buffs offense; crits refund mana → more dodges → more offense
- Gear: Dexterity, attack speed, crit
- Playstyle: Fast-paced; dodge triggers are celebrations (get stat buff)

---

## Implementation Roadmap

### Phase 1: Passive Tree Infrastructure (TSWOW Datascripts)

**Tasks:**
- [ ] Define node data structure (node ID, stats, connections, keystone flag, direction)
- [ ] Create datascript to generate 300 nodes from specifications
- [ ] Implement node connection logic (pathfinding, allocation validation)
- [ ] Create character-specific tree storage (per-character allocation)
- [ ] Implement point allocation system (how does player spend points?)

**Deliverables:**
- Passive tree DBC entries
- Character passive allocation SQL table
- Tree validation system (no double-allocations, connection rules, etc.)

### Phase 2: Stat Application System

**Tasks:**
- [ ] Query MySQL tables for gear stats (armor, health, spell power, etc.)
- [ ] Create stat multiplier system (additive vs multiplicative)
- [ ] Integrate passive tree bonuses into character stat calculation
- [ ] Test synergy (gear stat +50, tree nodes +20% = correctly multiplied)

**Deliverables:**
- Character stat calculation system
- Passive tree stat modifier lookup tables
- Integration with WoW's stat calculation

### Phase 3: Keystone Effects

**Tasks:**
- [ ] Define each Keystone's special behavior (scripted effects)
- [ ] Implement Keystone persistence (cannot refund)
- [ ] Create behavior scripts for each Keystone (if armor granted, enable damage conversion, etc.)
- [ ] Test Keystone synergies

**Deliverables:**
- Keystone behavior system
- Per-character keystone tracking
- Datascript implementation of Keystone effects

### Phase 4: Ability Acquisition System

**Tasks:**
- [ ] Extract reference spell database from MySQL data
- [ ] Define core ability sets per build archetype (5-8 spells per direction)
- [ ] Create shop inventory datascripts (purchasable abilities)
- [ ] Implement anima currency system (drop/earn/spend)
- [ ] Create modifier node datascripts (ability enhancement passives)
- [ ] Link passive modifier nodes to actual ability damage/cooldown values

**Deliverables:**
- Core ability DBC entries (given at character creation)
- Shop ability pool (100+ abilities available for purchase across runs)
- Anima currency system and drop tables
- Modifier node definitions (e.g., "+15% Fireball damage" nodes)
- Character ability purchase tracking table

### Phase 5: Class Abilities - Stat Scaling

**Tasks:**
- [ ] Integrate stat scaling into core abilities (gear multipliers)
- [ ] Create scaling formulas (damage = base + 0.6 * spell_power, etc.)
- [ ] Test synergy: gear stats + passive nodes + ability masteries
- [ ] Balance ability damage expectations per floor

**Deliverables:**
- Scaling formula documentation
- Ability balance tuning data

### Phase 6: Torghast Integration

**Tasks:**
- [ ] Verify Endless Torghast module compatibility
- [ ] Implement floor progression system (passive point rewards)
- [ ] Set power progression curve (enemy scaling, gear drops, point allocation)
- [ ] Tune difficulty vs character power

**Deliverables:**
- Floor scaling system
- Loot table integration
- Difficulty balance pass

### Phase 7: Testing & Balance

**Tasks:**
- [ ] Test each build archetype to floor 30+
- [ ] Identify keystones that are overpowered/underpowered
- [ ] Tune stat values on nodes
- [ ] Tune shop ability costs (is anima economy balanced?)
- [ ] Validate ability synergies (do passives enhance abilities well?)
- [ ] Collect feedback on build diversity

**Deliverables:**
- Balance tuning data
- Anima economy adjustments
- Known issues list
- Recommended builds guide

---

## MySQL Database References

### Tables You'll Need (from your sorted data)

**Character Stats Table:**
```
character_stats:
- stat_id (INT)
- stat_name (VARCHAR) — e.g., "armor", "max_health", "spell_power"
- stat_type (VARCHAR) — e.g., "physical", "magical", "defensive"
- default_value (FLOAT) — base value
```

**Item Stats Table:**
```
item_stats:
- item_id (INT)
- stat_id (INT) — references character_stats
- stat_value (FLOAT)
```

**Spells Table:**
```
spells:
- spell_id (INT)
- spell_name (VARCHAR)
- spell_school (VARCHAR) — e.g., "fire", "frost", "arcane"
- base_damage (FLOAT)
- scaling_coefficient (FLOAT) — how much spell_power scales this
- cooldown (FLOAT) — in seconds
```

**Custom Passive Tree Table (to be created):**
```
passive_tree_nodes:
- node_id (INT) PRIMARY KEY
- node_name (VARCHAR)
- direction (VARCHAR) — "armor_power", "magic_shield", "evasion_crit"
- stat_type (VARCHAR) — references character_stats.stat_type
- stat_value (FLOAT) — +X% to stat
- is_keystone (BOOLEAN)
- keystone_name (VARCHAR) — if is_keystone = true
- x_coordinate (INT) — for UI positioning
- y_coordinate (INT)
- connected_nodes (JSON/VARCHAR) — comma-separated node IDs this connects to

passive_tree_allocations:
- character_id (INT)
- node_id (INT)
- allocated (BOOLEAN) — whether this character has allocated this node
- allocation_order (INT) — order allocated (for history)
```

### Key Queries (for Claude implementation)

**Get all armor-related stats:**
```sql
SELECT * FROM character_stats WHERE stat_name LIKE '%armor%';
```

**Get a character's passive allocations:**
```sql
SELECT ptn.node_id, ptn.node_name, ptn.stat_type, ptn.stat_value 
FROM passive_tree_allocations pta
JOIN passive_tree_nodes ptn ON pta.node_id = ptn.node_id
WHERE pta.character_id = ? AND pta.allocated = true;
```

**Calculate a character's passive stat bonus:**
```sql
SELECT ptn.stat_type, SUM(ptn.stat_value) as total_bonus
FROM passive_tree_allocations pta
JOIN passive_tree_nodes ptn ON pta.node_id = ptn.node_id
WHERE pta.character_id = ? AND pta.allocated = true
GROUP BY ptn.stat_type;
```

---

## Open Questions & Design Decisions

**DECIDED:**
- ✓ **Power Progression:** Level-gated to 80, then infinite gear scaling
- ✓ **Passive Points Per Floor:** Fixed 1 point per floor (1-300 floors), then stops
- ✓ **Ability Acquisition:** Shop-based system with core abilities + purchasable abilities
- ✓ **Ability Enhancement:** Passive tree includes modifier nodes that enhance abilities
- ✓ **Currency:** Anima earned from enemies and bosses

**STILL TO DECIDE:**
- [ ] **Shop frequency:** Every 5 floors or every floor? (affects anima economy)
- [ ] **Anima carry-over:** Per-character only or account-wide?
- [ ] **Refund System:** Can keystones ever be refunded? (Recommend: no, permanent)
- [ ] **Tree Reset:** Can non-keystone nodes be respec'd mid-run? (Recommend: yes)
- [ ] **Visual Implementation:** How does passive tree display in-game?
- [ ] **Starting Gear:** Base stats for floor 1?
- [ ] **Enemy stat scaling:** Is +1% health / +0.5% damage per passive point balanced?
- [ ] **Modifier node ratio:** How many modifier nodes per total nodes? (Recommend: 2-3 per 10)
- [ ] **Ability list:** Populate with actual spells from your MySQL data + class fantasy

**To be filled in during implementation phase.**

---

## Next Steps

1. **Review this document** — Does this match your vision?
2. **Make decisions** on open questions (especially Power Progression)
3. **Provide your sorted MySQL data** to Claude
4. **Start Phase 1** — Tree infrastructure in TSWOW datascripts

Once you confirm, this document + your MySQL tables → Claude can begin implementation.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-06 | Initial design document; 300-node tree, 3 directions, keystones defined, power progression TBD |
| 1.1 | 2026-08-06 | Power Progression finalized: Level-gated 1-80, infinite gear scaling 81+. Passive points cap at 300. |
| 1.2 | 2026-08-06 | Ability Acquisition System added: Core abilities + Shop (anima currency). Passive tree includes modifier nodes. |

---

**Document prepared for implementation with Claude on TSWOW Datascripts.**
