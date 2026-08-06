/**
 * abilities_core.ts — Phase 1
 * ---------------------------
 * Core abilities granted at character creation, grouped by build direction.
 * See DESIGN_SPEC.md "Ability Acquisition System" > "Core Abilities (Baseline
 * Rotation)".
 *
 * These are the baseline rotation every character starts with. The passive tree
 * and shop then ENHANCE these (see abilities_shop.ts, keystones.ts). Purchasable
 * abilities live in abilities_shop.ts.
 *
 * VALUES ARE PLACEHOLDERS. There is no MySQL `spells` export available in this
 * session (the provided path was an unfilled template), so the numbers below are
 * hand-authored *relative* placeholders that only express each ability's shape
 * (a basic attack is cheap/low-cooldown; a big cooldown hits hard and rarely).
 * They are NOT balanced and NOT sourced from real spell data:
 *   - TODO(mysql):   replace baseSpellId + baseDamage/scalingCoeff with export data
 *   - TODO(balance): tune every number once the economy/damage pass happens
 * See src/config/balance_tuning.ts for the shared coefficients/cooldown floor.
 */

// import { std } from 'wow/wotlk'; // TODO(tswow): enable to clone/create spells

import { Direction } from './passive_tree';

/** How an ability primarily behaves — used later for scaling + shop grouping. */
export enum AbilityRole {
  BASIC = 'basic',           // spammable filler
  DAMAGE = 'damage',         // main damage cooldown
  AOE = 'aoe',               // area damage
  CC = 'cc',                 // crowd control / utility
  DEFENSIVE = 'defensive',   // survival cooldown
  MOBILITY = 'mobility',     // movement / escape
  FINISHER = 'finisher',     // execute-style
}

/**
 * Resource an ability spends. The design distinguishes mana (casters) from
 * energy (rogues/rangers); melee uses a rage-style pool.
 * TODO(design): confirm the resource model per direction (rage vs energy vs a
 * unified pool) — see DECISIONS.md.
 */
export enum ResourceType {
  MANA = 'mana',     // Magic & Energy Shield
  ENERGY = 'energy', // Evasion & Crit
  RAGE = 'rage',     // Armor & Power (generators cost 0 and build rage)
  NONE = 'none',     // free abilities
}

/**
 * A core ability definition.
 * `baseSpellId` is the existing WoW spell we clone for visuals + effect template.
 */
export interface CoreAbility {
  /** Stable string id used by modifier nodes + shop (e.g. "core_fireball"). */
  id: string;
  /** Display name. */
  name: string;
  /** Build direction this ability ships with. */
  direction: Direction;
  /** Behavioral role. */
  role: AbilityRole;

  /** Base WoW spell id to clone (-1 = not yet chosen). TODO(mysql). */
  baseSpellId: number;
  /** Placeholder base damage at floor 1, pre-scaling (0 for non-damage). TODO(balance). */
  baseDamage: number;
  /** Spell/attack power coefficient (fraction of power added). TODO(balance). */
  scalingCoeff: number;
  /** Cooldown in seconds (0 = only GCD-limited). TODO(balance). */
  cooldownSec: number;
  /** Resource pool this ability spends. TODO(design). */
  resourceType: ResourceType;
  /** Resource cost (0 = free / generator). TODO(balance). */
  resourceCost: number;

  /** One-line design intent, kept from the spec for reference. */
  notes: string;
}

// ---------------------------------------------------------------------------
// Armor & Power (Tank / Melee) — rage pool; basic attacks build rage.
// ---------------------------------------------------------------------------

export const ARMOR_POWER_CORE: CoreAbility[] = [
  {
    id: 'core_slash', name: 'Slash', direction: Direction.ARMOR_POWER,
    role: AbilityRole.BASIC,
    baseSpellId: -1, baseDamage: 12, scalingCoeff: 0.20, cooldownSec: 0,
    resourceType: ResourceType.RAGE, resourceCost: 0,
    notes: 'Basic attack; low cost, fast. Generates rage. TODO(design): rage gen amount.',
  },
  {
    id: 'core_overhead_smash', name: 'Overhead Smash', direction: Direction.ARMOR_POWER,
    role: AbilityRole.DAMAGE,
    baseSpellId: -1, baseDamage: 30, scalingCoeff: 0.45, cooldownSec: 6,
    resourceType: ResourceType.RAGE, resourceCost: 20,
    notes: 'Moderate damage, moderate cooldown.',
  },
  {
    id: 'core_shield_bash', name: 'Shield Bash', direction: Direction.ARMOR_POWER,
    role: AbilityRole.CC,
    baseSpellId: -1, baseDamage: 8, scalingCoeff: 0.10, cooldownSec: 12,
    resourceType: ResourceType.RAGE, resourceCost: 15,
    notes: 'Utility CC; stuns for ~2s. TODO(balance): stun duration.',
  },
  {
    id: 'core_last_stand', name: 'Last Stand', direction: Direction.ARMOR_POWER,
    role: AbilityRole.DEFENSIVE,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 120,
    resourceType: ResourceType.NONE, resourceCost: 0,
    notes: 'Defensive cooldown; ~30% damage reduction for ~4s. TODO(balance): DR%/duration.',
  },
  {
    id: 'core_execute', name: 'Execute', direction: Direction.ARMOR_POWER,
    role: AbilityRole.FINISHER,
    baseSpellId: -1, baseDamage: 45, scalingCoeff: 0.70, cooldownSec: 8,
    resourceType: ResourceType.RAGE, resourceCost: 25,
    notes: 'High damage at low enemy health. TODO(design): health threshold + bonus.',
  },
  {
    id: 'core_charge', name: 'Charge', direction: Direction.ARMOR_POWER,
    role: AbilityRole.MOBILITY,
    baseSpellId: -1, baseDamage: 10, scalingCoeff: 0.15, cooldownSec: 15,
    resourceType: ResourceType.RAGE, resourceCost: 0,
    notes: 'Movement + damage; closes distance. Generates rage on hit.',
  },
];

// ---------------------------------------------------------------------------
// Magic & Energy Shield (Caster) — mana pool.
// ---------------------------------------------------------------------------

export const MAGIC_SHIELD_CORE: CoreAbility[] = [
  {
    id: 'core_fireball', name: 'Fireball', direction: Direction.MAGIC_SHIELD,
    role: AbilityRole.DAMAGE,
    baseSpellId: 133, // canonical WoW Fireball; TODO(mysql): confirm/replace from export
    baseDamage: 25, scalingCoeff: 0.55, cooldownSec: 0,
    resourceType: ResourceType.MANA, resourceCost: 30,
    notes: 'Ranged damage; moderate cost/cooldown.',
  },
  {
    id: 'core_ice_storm', name: 'Ice Storm', direction: Direction.MAGIC_SHIELD,
    role: AbilityRole.AOE,
    baseSpellId: -1, baseDamage: 18, scalingCoeff: 0.40, cooldownSec: 10,
    resourceType: ResourceType.MANA, resourceCost: 60,
    notes: 'AoE damage; high cost, medium cooldown.',
  },
  {
    id: 'core_arcane_bolt', name: 'Arcane Bolt', direction: Direction.MAGIC_SHIELD,
    role: AbilityRole.BASIC,
    baseSpellId: -1, baseDamage: 14, scalingCoeff: 0.30, cooldownSec: 0,
    resourceType: ResourceType.MANA, resourceCost: 15,
    notes: 'Fast projectile; low cost, spammable.',
  },
  {
    id: 'core_mana_shield', name: 'Mana Shield', direction: Direction.MAGIC_SHIELD,
    role: AbilityRole.DEFENSIVE,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 30,
    resourceType: ResourceType.MANA, resourceCost: 40,
    notes: 'Converts damage taken to mana drain. TODO(balance): conversion ratio.',
  },
  {
    id: 'core_teleport', name: 'Teleport', direction: Direction.MAGIC_SHIELD,
    role: AbilityRole.MOBILITY,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 15,
    resourceType: ResourceType.MANA, resourceCost: 25,
    notes: 'Movement + escape; ~15s cooldown.',
  },
  {
    id: 'core_inferno', name: 'Inferno', direction: Direction.MAGIC_SHIELD,
    role: AbilityRole.DAMAGE,
    baseSpellId: -1, baseDamage: 40, scalingCoeff: 0.80, cooldownSec: 20,
    resourceType: ResourceType.MANA, resourceCost: 70,
    notes: 'Channel; damage ramps over ~3s. TODO(balance): ramp curve.',
  },
];

// ---------------------------------------------------------------------------
// Evasion & Crit (DPS / Ranger) — energy pool.
// ---------------------------------------------------------------------------

export const EVASION_CRIT_CORE: CoreAbility[] = [
  {
    id: 'core_quick_shot', name: 'Quick Shot', direction: Direction.EVASION_CRIT,
    role: AbilityRole.BASIC,
    baseSpellId: -1, baseDamage: 13, scalingCoeff: 0.25, cooldownSec: 0,
    resourceType: ResourceType.ENERGY, resourceCost: 10,
    notes: 'Basic ranged attack; fast, spammable.',
  },
  {
    id: 'core_piercing_arrow', name: 'Piercing Arrow', direction: Direction.EVASION_CRIT,
    role: AbilityRole.DAMAGE,
    baseSpellId: -1, baseDamage: 28, scalingCoeff: 0.50, cooldownSec: 6,
    resourceType: ResourceType.ENERGY, resourceCost: 25,
    notes: 'Projectile penetrates; medium damage.',
  },
  {
    id: 'core_evasive_strike', name: 'Evasive Strike', direction: Direction.EVASION_CRIT,
    role: AbilityRole.DEFENSIVE,
    baseSpellId: -1, baseDamage: 15, scalingCoeff: 0.20, cooldownSec: 12,
    resourceType: ResourceType.ENERGY, resourceCost: 20,
    notes: 'Attack + gain dodge buff after use. TODO(balance): dodge buff amount/duration.',
  },
  {
    id: 'core_backstab', name: 'Backstab', direction: Direction.EVASION_CRIT,
    role: AbilityRole.FINISHER,
    baseSpellId: -1, baseDamage: 42, scalingCoeff: 0.65, cooldownSec: 8,
    resourceType: ResourceType.ENERGY, resourceCost: 30,
    notes: 'High burst; more damage vs low-health targets. TODO(design): threshold.',
  },
  {
    id: 'core_dash', name: 'Dash', direction: Direction.EVASION_CRIT,
    role: AbilityRole.MOBILITY,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 15,
    resourceType: ResourceType.ENERGY, resourceCost: 15,
    notes: 'Movement / repositioning tool.',
  },
  {
    id: 'core_multishot', name: 'Multishot', direction: Direction.EVASION_CRIT,
    role: AbilityRole.AOE,
    baseSpellId: -1, baseDamage: 20, scalingCoeff: 0.35, cooldownSec: 8,
    resourceType: ResourceType.ENERGY, resourceCost: 35,
    notes: 'AoE ranged; hits multiple enemies.',
  },
];

/** All core abilities, flat. */
export const ALL_CORE_ABILITIES: CoreAbility[] = [
  ...ARMOR_POWER_CORE,
  ...MAGIC_SHIELD_CORE,
  ...EVASION_CRIT_CORE,
];

/** Lookup by id (used by modifier nodes + shop mastery entries). */
export const CORE_ABILITY_BY_ID: Record<string, CoreAbility> =
  Object.fromEntries(ALL_CORE_ABILITIES.map((a) => [a.id, a]));

/** Core abilities grouped by direction (mirrors the spec's per-direction lists). */
export const CORE_ABILITIES_BY_DIRECTION: Record<Direction, CoreAbility[]> = {
  [Direction.ARMOR_POWER]: ARMOR_POWER_CORE,
  [Direction.MAGIC_SHIELD]: MAGIC_SHIELD_CORE,
  [Direction.EVASION_CRIT]: EVASION_CRIT_CORE,
  [Direction.CONNECTOR]: [], // connectors have no abilities of their own
};

// ---------------------------------------------------------------------------
// TSWOW registration (STUB)
// ---------------------------------------------------------------------------

/**
 * Create/clone the actual spells for every core ability.
 * TODO(tswow): for each CoreAbility, clone `baseSpellId` via std.Spells.create,
 * set name, and apply damage/cooldown from the balance data.
 * TODO(mysql): resolve baseSpellId + damage/coeff for the -1/placeholder entries
 * before this runs.
 */
export function registerCoreAbilities(): void {
  // for (const ability of ALL_CORE_ABILITIES) {
  //   TODO(tswow): std.Spells.create('torghast', ability.id, ability.baseSpellId)
  //     .Name.enGB.set(ability.name) ... apply balance values ...
  // }
}
