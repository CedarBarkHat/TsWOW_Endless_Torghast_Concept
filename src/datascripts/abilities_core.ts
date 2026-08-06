/**
 * abilities_core.ts — Phase 1 skeleton
 * ------------------------------------
 * Core abilities granted at character creation, grouped by build direction.
 * See DESIGN_SPEC.md "Core Abilities (Baseline Rotation)".
 *
 * These are the baseline rotation every character starts with. The passive tree
 * and shop then ENHANCE these (see abilities_shop.ts, keystones.ts). Purchasable
 * abilities live in abilities_shop.ts.
 *
 * STRUCTURE ONLY: every stat below is a placeholder. Real base spell ids, damage
 * numbers, coefficients, and cooldowns come from the MySQL `spells` export and a
 * balance pass — all marked TODO(mysql) / TODO(balance).
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
 * A core ability definition.
 * `baseSpellId` is the existing WoW spell we clone for visuals + effect template.
 * TODO(mysql): fill baseSpellId, baseDamage, scalingCoeff, cooldown, resourceCost
 * from the spell export. Values of -1 / 0 mean "not yet decided".
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

  /** Base WoW spell id to clone. TODO(mysql). */
  baseSpellId: number;
  /** Placeholder base damage (pre-scaling). TODO(balance). */
  baseDamage: number;
  /** Spell/attack power coefficient. TODO(balance). See balance_tuning.ts. */
  scalingCoeff: number;
  /** Cooldown in seconds. TODO(balance). */
  cooldownSec: number;
  /** Resource cost (mana/energy). TODO(balance). */
  resourceCost: number;

  /** One-line design intent, kept from the spec for reference. */
  notes: string;
}

// ---------------------------------------------------------------------------
// Armor & Power (Tank / Melee)
// ---------------------------------------------------------------------------

export const ARMOR_POWER_CORE: CoreAbility[] = [
  {
    id: 'core_slash', name: 'Slash', direction: Direction.ARMOR_POWER,
    role: AbilityRole.BASIC,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'Basic attack; low cost, fast.',
  },
  {
    id: 'core_overhead_smash', name: 'Overhead Smash', direction: Direction.ARMOR_POWER,
    role: AbilityRole.DAMAGE,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'Moderate damage, moderate cooldown.',
  },
  {
    id: 'core_shield_bash', name: 'Shield Bash', direction: Direction.ARMOR_POWER,
    role: AbilityRole.CC,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'Utility CC; stuns for ~2s. TODO(balance): stun duration.',
  },
  {
    id: 'core_last_stand', name: 'Last Stand', direction: Direction.ARMOR_POWER,
    role: AbilityRole.DEFENSIVE,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'Defensive cooldown; ~30% damage reduction for ~4s.',
  },
  {
    id: 'core_execute', name: 'Execute', direction: Direction.ARMOR_POWER,
    role: AbilityRole.FINISHER,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'High damage at low enemy health. TODO(design): health threshold.',
  },
  {
    id: 'core_charge', name: 'Charge', direction: Direction.ARMOR_POWER,
    role: AbilityRole.MOBILITY,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'Movement + damage; closes distance.',
  },
];

// ---------------------------------------------------------------------------
// Magic & Energy Shield (Caster)
// ---------------------------------------------------------------------------

export const MAGIC_SHIELD_CORE: CoreAbility[] = [
  {
    id: 'core_fireball', name: 'Fireball', direction: Direction.MAGIC_SHIELD,
    role: AbilityRole.DAMAGE,
    baseSpellId: 133, // canonical Fireball; TODO(mysql): confirm/replace
    baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'Ranged damage; moderate cost/cooldown.',
  },
  {
    id: 'core_ice_storm', name: 'Ice Storm', direction: Direction.MAGIC_SHIELD,
    role: AbilityRole.AOE,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'AoE damage; high cost, medium cooldown.',
  },
  {
    id: 'core_arcane_bolt', name: 'Arcane Bolt', direction: Direction.MAGIC_SHIELD,
    role: AbilityRole.BASIC,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'Fast projectile; low cost, spammable.',
  },
  {
    id: 'core_mana_shield', name: 'Mana Shield', direction: Direction.MAGIC_SHIELD,
    role: AbilityRole.DEFENSIVE,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'Converts damage taken to mana drain.',
  },
  {
    id: 'core_teleport', name: 'Teleport', direction: Direction.MAGIC_SHIELD,
    role: AbilityRole.MOBILITY,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'Movement + escape; ~15s cooldown.',
  },
  {
    id: 'core_inferno', name: 'Inferno', direction: Direction.MAGIC_SHIELD,
    role: AbilityRole.DAMAGE,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'Channel; damage ramps over ~3s.',
  },
];

// ---------------------------------------------------------------------------
// Evasion & Crit (DPS / Ranger)
// ---------------------------------------------------------------------------

export const EVASION_CRIT_CORE: CoreAbility[] = [
  {
    id: 'core_quick_shot', name: 'Quick Shot', direction: Direction.EVASION_CRIT,
    role: AbilityRole.BASIC,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'Basic ranged attack; fast, spammable.',
  },
  {
    id: 'core_piercing_arrow', name: 'Piercing Arrow', direction: Direction.EVASION_CRIT,
    role: AbilityRole.DAMAGE,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'Projectile penetrates; medium damage.',
  },
  {
    id: 'core_evasive_strike', name: 'Evasive Strike', direction: Direction.EVASION_CRIT,
    role: AbilityRole.DEFENSIVE,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'Attack + gain dodge buff after use.',
  },
  {
    id: 'core_backstab', name: 'Backstab', direction: Direction.EVASION_CRIT,
    role: AbilityRole.FINISHER,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'High burst; more damage vs low-health targets.',
  },
  {
    id: 'core_dash', name: 'Dash', direction: Direction.EVASION_CRIT,
    role: AbilityRole.MOBILITY,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
    notes: 'Movement / repositioning tool.',
  },
  {
    id: 'core_multishot', name: 'Multishot', direction: Direction.EVASION_CRIT,
    role: AbilityRole.AOE,
    baseSpellId: -1, baseDamage: 0, scalingCoeff: 0, cooldownSec: 0, resourceCost: 0,
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

// ---------------------------------------------------------------------------
// TSWOW registration (STUB)
// ---------------------------------------------------------------------------

/**
 * Create/clone the actual spells for every core ability.
 * TODO(tswow): for each CoreAbility, clone `baseSpellId` via std.Spells.create,
 * set name, and apply damage/cooldown from the (future) balance data.
 * TODO(mysql): resolve baseSpellId + damage/coeff/cooldown before this runs.
 */
export function registerCoreAbilities(): void {
  // for (const ability of ALL_CORE_ABILITIES) {
  //   TODO(tswow): std.Spells.create('torghast', ability.id, ability.baseSpellId)
  //     .Name.enGB.set(ability.name) ... apply balance values ...
  // }
}
