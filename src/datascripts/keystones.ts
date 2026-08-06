/**
 * keystones.ts — Phase 1 skeleton
 * -------------------------------
 * The 6 keystone definitions (2 per direction) from DESIGN_SPEC.md
 * "Keystone Effects". Keystones are game-changing, permanent (non-refundable)
 * nodes gated deep within a direction.
 *
 * This file defines the DATA for each keystone. The actual scripted BEHAVIOR
 * runs at runtime — see src/livescripts/stat_application.ts (and future keystone
 * behavior scripts). Values are placeholders: TODO(balance).
 */

import { Direction } from './passive_tree';

/** Kind of runtime hook a keystone needs — informs the livescript wiring. */
export enum KeystoneHook {
  STAT_CONVERSION = 'stat_conversion',   // convert one stat into another
  ON_DAMAGE_TAKEN = 'on_damage_taken',   // reactive defensive trigger
  RESOURCE_REGEN = 'resource_regen',     // modify ES/mana regen conditions
  ON_SPELL_DAMAGE = 'on_spell_damage',   // proc off dealing spell damage
  ON_DODGE = 'on_dodge',                 // proc off a dodge/evade
  ON_CRIT = 'on_crit',                   // proc off a critical strike
}

/**
 * A keystone definition.
 * `params` holds the tunable numbers each behavior needs; keys are documented
 * per keystone below. All numeric params are placeholders — TODO(balance).
 */
export interface Keystone {
  /** Stable id, referenced by PassiveNode.keystoneId. */
  id: string;
  /** Display name. */
  name: string;
  /** Direction this keystone belongs to. */
  direction: Direction;
  /** Runtime hook the livescript must implement. */
  hook: KeystoneHook;
  /** Min nodes deep before this keystone is reachable (gating). */
  requiredDepth: number;
  /** Behavior tuning parameters. TODO(balance): all placeholders. */
  params: Record<string, number>;
  /** Player-facing description. */
  description: string;
  /** Design rationale, kept from the spec. */
  rationale: string;
}

// ---------------------------------------------------------------------------
// Armor & Power
// ---------------------------------------------------------------------------

export const IRON_WILL: Keystone = {
  id: 'ks_iron_will',
  name: 'Iron Will',
  direction: Direction.ARMOR_POWER,
  hook: KeystoneHook.STAT_CONVERSION,
  requiredDepth: 12,
  // params.conversionPct: fraction of Armor converted to weapon damage.
  params: { conversionPct: 0.5 }, // TODO(balance)
  description: '50% of Armor is converted into Weapon Damage bonus.',
  rationale: 'Forces a tank-to-damage hybrid; pure tanks gain nothing.',
};

export const FORTRESS: Keystone = {
  id: 'ks_fortress',
  name: 'Fortress',
  direction: Direction.ARMOR_POWER,
  hook: KeystoneHook.ON_DAMAGE_TAKEN,
  requiredDepth: 10,
  // triggerHealthPct: hit size (of max HP) that arms it; drPct: damage reduction;
  // durationSec: how long DR lasts; cooldownSec: internal cooldown.
  params: { triggerHealthPct: 0.15, drPct: 0.5, durationSec: 3, cooldownSec: 30 }, // TODO(balance)
  description: 'After a hit > 15% max HP, gain 3s of 50% damage reduction (30s cd).',
  rationale: 'Survival tool for infinite scaling; changes combat rhythm.',
};

// ---------------------------------------------------------------------------
// Magic & Energy Shield
// ---------------------------------------------------------------------------

export const ARCANE_SHIELD: Keystone = {
  id: 'ks_arcane_shield',
  name: 'Arcane Shield',
  direction: Direction.MAGIC_SHIELD,
  hook: KeystoneHook.RESOURCE_REGEN,
  requiredDepth: 12,
  // manaThresholdPct: mana level above which the bonus applies;
  // esRechargeBonusPct: faster ES recharge; rechargeDelayReductionSec.
  params: { manaThresholdPct: 0.5, esRechargeBonusPct: 0.5, rechargeDelayReductionSec: 1 }, // TODO(balance)
  description: 'ES recharges 50% faster while above 50% mana; recharge starts 1s sooner.',
  rationale: 'Makes mana management the core survival tool.',
};

export const SPELL_ECHO: Keystone = {
  id: 'ks_spell_echo',
  name: 'Spell Echo',
  direction: Direction.MAGIC_SHIELD,
  hook: KeystoneHook.ON_SPELL_DAMAGE,
  requiredDepth: 10,
  // esGainPct: fraction of spell damage granted as ES; esGainCapPct: per-hit cap.
  params: { esGainPct: 0.15, esGainCapPct: 0.1 }, // TODO(balance)
  description: '15% of spell damage dealt becomes ES (capped 10% max ES per hit).',
  rationale: 'Offense becomes defense; rewards aggressive casting.',
};

// ---------------------------------------------------------------------------
// Evasion & Crit
// ---------------------------------------------------------------------------

export const PHANTOM_DANCER: Keystone = {
  id: 'ks_phantom_dancer',
  name: 'Phantom Dancer',
  direction: Direction.EVASION_CRIT,
  hook: KeystoneHook.ON_DODGE,
  requiredDepth: 12,
  // speedBonusPct: attack/cast speed per stack; durationSec; maxStacks.
  params: { speedBonusPct: 0.2, durationSec: 4, maxStacks: 5 }, // TODO(balance)
  description: 'On dodge, gain 20% attack/cast speed for 4s (stacks up to 5).',
  rationale: 'Turns dodge into an offensive engine; rewards pure evasion.',
};

export const ASSASSINATE: Keystone = {
  id: 'ks_assassinate',
  name: 'Assassinate',
  direction: Direction.EVASION_CRIT,
  hook: KeystoneHook.ON_CRIT,
  requiredDepth: 10,
  // resourceRefund: energy/mana returned on crit; critDamageBonusPct.
  params: { resourceRefund: 10, critDamageBonusPct: 0.3 }, // TODO(balance)
  description: 'Crits refund 10 energy/mana; crits deal 30% more damage.',
  rationale: 'Changes resource management; rewards crit-focused builds.',
};

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

export const KEYSTONES: Keystone[] = [
  IRON_WILL, FORTRESS,
  ARCANE_SHIELD, SPELL_ECHO,
  PHANTOM_DANCER, ASSASSINATE,
];

export const KEYSTONE_BY_ID: Record<string, Keystone> =
  Object.fromEntries(KEYSTONES.map((k) => [k.id, k]));

/**
 * NOTE: The spec allows 2–3 keystones per direction (6–9 total). Six are fully
 * specified above; a third per direction is left open.
 * TODO(design): decide whether to add a 3rd keystone per direction.
 */

// ---------------------------------------------------------------------------
// TSWOW registration (STUB)
// ---------------------------------------------------------------------------

/**
 * Register keystone data. Keystones don't create spells directly — their effects
 * are scripted at runtime — but they may need marker auras / spell ids for UI.
 * TODO(tswow): create marker auras per keystone if the UI needs them.
 * TODO(phase3): implement each KeystoneHook in the livescripts.
 */
export function registerKeystones(): void {
  // for (const ks of KEYSTONES) { ... optional marker aura ... }
}
