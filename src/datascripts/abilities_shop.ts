/**
 * abilities_shop.ts — Phase 1 skeleton
 * ------------------------------------
 * Purchasable abilities offered by the in-run shop, bought with Anima
 * (see anima_currency.ts). Covers the four shop categories from DESIGN_SPEC.md
 * "Shop System".
 *
 * STRUCTURE ONLY: costs and effects are placeholders. Real values depend on the
 * MySQL spell export and economy tuning (see balance_tuning.ts) — TODO(mysql) /
 * TODO(balance).
 */

// import { std } from 'wow/wotlk'; // TODO(tswow): enable to create shop spells

import { Direction } from './passive_tree';

/** The four shop categories from the design spec. */
export enum ShopCategory {
  ABILITY_MASTERY = 'ability_mastery', // enhance an existing core ability
  NEW_ABILITY = 'new_ability',         // add a new button to the rotation
  UTILITY = 'utility',                 // CC / sustain / mobility
  PASSIVE_MOD = 'passive_mod',         // global modifier (e.g. faster casting)
}

/**
 * A purchasable shop entry.
 * TODO(mysql): baseSpellId + effect magnitudes from the spell export.
 * TODO(balance): animaCost from economy tuning (spec ranges below as hints).
 */
export interface ShopAbility {
  /** Stable id, e.g. "shop_frozen_orb". */
  id: string;
  /** Display name. */
  name: string;
  /** Which shop category this belongs to. */
  category: ShopCategory;
  /** Build direction this best fits (for weighted shop rolls). */
  direction: Direction;

  /** Cost in Anima. TODO(balance): spec hints 50–200 depending on category. */
  animaCost: number;

  /** For ABILITY_MASTERY: the core ability id it upgrades. */
  upgradesAbilityId?: string;
  /** For NEW_ABILITY: base WoW spell to clone. TODO(mysql). */
  baseSpellId?: number;

  /** One-line description of the effect. */
  effect: string;
}

// ---------------------------------------------------------------------------
// Example inventory (placeholder — not the full 100+ pool)
// ---------------------------------------------------------------------------
// The design targets a large pool (100+ across runs). Below is a representative
// starter set per direction so the shop handler has something to roll against.
// TODO(phase4): expand to the full pool and populate real values.

export const SHOP_ARMOR_POWER: ShopAbility[] = [
  { id: 'shop_whirlwind', name: 'Whirlwind', category: ShopCategory.NEW_ABILITY,
    direction: Direction.ARMOR_POWER, animaCost: 100, baseSpellId: -1,
    effect: 'Spinning AoE melee attack.' },
  { id: 'shop_cleave', name: 'Cleave', category: ShopCategory.NEW_ABILITY,
    direction: Direction.ARMOR_POWER, animaCost: 100, baseSpellId: -1,
    effect: 'Frontal cone strike.' },
  { id: 'shop_shield_wall_mastery', name: 'Shield Wall Mastery',
    category: ShopCategory.ABILITY_MASTERY, direction: Direction.ARMOR_POWER,
    animaCost: 100, upgradesAbilityId: 'core_last_stand',
    effect: 'Improves Last Stand mitigation / duration.' },
  { id: 'shop_rend', name: 'Rend', category: ShopCategory.NEW_ABILITY,
    direction: Direction.ARMOR_POWER, animaCost: 100, baseSpellId: -1,
    effect: 'Bleed damage over time.' },
];

export const SHOP_MAGIC_SHIELD: ShopAbility[] = [
  { id: 'shop_frozen_orb', name: 'Frozen Orb', category: ShopCategory.NEW_ABILITY,
    direction: Direction.MAGIC_SHIELD, animaCost: 150, baseSpellId: -1,
    effect: 'AoE damage + freeze.' },
  { id: 'shop_lightning_bolt', name: 'Lightning Bolt', category: ShopCategory.NEW_ABILITY,
    direction: Direction.MAGIC_SHIELD, animaCost: 100, baseSpellId: -1,
    effect: 'Fast single-target nuke.' },
  { id: 'shop_frostbolt_mastery', name: 'Frostbolt Mastery',
    category: ShopCategory.ABILITY_MASTERY, direction: Direction.MAGIC_SHIELD,
    animaCost: 100, upgradesAbilityId: 'core_ice_storm',
    effect: 'Improves frost damage / slow.' },
  { id: 'shop_faster_casting', name: 'Faster Casting', category: ShopCategory.PASSIVE_MOD,
    direction: Direction.MAGIC_SHIELD, animaCost: 100,
    effect: 'All spells cast ~15% faster.' },
];

export const SHOP_EVASION_CRIT: ShopAbility[] = [
  { id: 'shop_fan_of_knives', name: 'Fan of Knives', category: ShopCategory.NEW_ABILITY,
    direction: Direction.EVASION_CRIT, animaCost: 100, baseSpellId: -1,
    effect: 'AoE around the character.' },
  { id: 'shop_smoke_bomb', name: 'Smoke Bomb', category: ShopCategory.UTILITY,
    direction: Direction.EVASION_CRIT, animaCost: 100, baseSpellId: -1,
    effect: 'Defensive / stealth utility.' },
  { id: 'shop_marked_for_death', name: 'Marked for Death',
    category: ShopCategory.NEW_ABILITY, direction: Direction.EVASION_CRIT,
    animaCost: 125, baseSpellId: -1, effect: 'Debuff increasing damage taken.' },
  { id: 'shop_rain_of_arrows', name: 'Rain of Arrows', category: ShopCategory.NEW_ABILITY,
    direction: Direction.EVASION_CRIT, animaCost: 150, baseSpellId: -1,
    effect: 'Targeted AoE barrage.' },
];

/** Cross-direction utility available to any build. */
export const SHOP_UTILITY: ShopAbility[] = [
  { id: 'shop_drain_life', name: 'Drain Life', category: ShopCategory.UTILITY,
    direction: Direction.MAGIC_SHIELD, animaCost: 125, baseSpellId: -1,
    effect: 'Heal for ~50% of damage dealt. TODO(balance): leech %.' },
];

/** Whole placeholder pool, flat. */
export const ALL_SHOP_ABILITIES: ShopAbility[] = [
  ...SHOP_ARMOR_POWER,
  ...SHOP_MAGIC_SHIELD,
  ...SHOP_EVASION_CRIT,
  ...SHOP_UTILITY,
];

export const SHOP_ABILITY_BY_ID: Record<string, ShopAbility> =
  Object.fromEntries(ALL_SHOP_ABILITIES.map((a) => [a.id, a]));

// ---------------------------------------------------------------------------
// TSWOW registration (STUB)
// ---------------------------------------------------------------------------

/**
 * Register shop spells so they can be granted on purchase.
 * TODO(tswow): create/clone spells for NEW_ABILITY entries; mastery + passive-mod
 * entries are applied at runtime in livescripts/shop_handler.ts.
 * TODO(mysql): resolve baseSpellId + effect magnitudes first.
 */
export function registerShopAbilities(): void {
  // for (const ability of ALL_SHOP_ABILITIES) { ... }
}
