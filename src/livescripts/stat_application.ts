/**
 * stat_application.ts — Phase 1 skeleton (livescript)
 * ---------------------------------------------------
 * Turns a character's allocated passive nodes (+ keystones) into actual stat
 * changes on the character. See DESIGN_SPEC.md "Stat Mapping (MySQL Integration)"
 * and "Ability Enhancement Through Passive Tree".
 *
 * Core rule (from the spec):
 *   - SMALL nodes stack ADDITIVELY within a stat  (+2% five times = +10%).
 *   - BIG nodes apply a MULTIPLIER to the base stat.
 *   - Passive % bonuses multiply gear-derived base stats.
 *
 * STRUCTURE ONLY: the real read of gear/base stats and the write back to the
 * character are stubbed. Formulas below are the intended math, with TODOs where
 * MySQL data or the core stat pipeline is required.
 */

import type {
  PassiveTree,
  PassiveNode,
  CharacterTreeState,
  StatType,
} from '../datascripts/passive_tree';
import { NodeKind, ModifierAspect } from '../datascripts/passive_tree';

/**
 * Aggregated passive bonuses for one stat, split by how they combine.
 *   final = base * (1 + additivePct) * multiplier
 */
export interface StatBonus {
  /** Sum of SMALL node percents, as a fraction (0.10 = +10%). */
  additivePct: number;
  /** Product of BIG node multipliers (1.05 * 1.04 = ...). */
  multiplier: number;
}

/** Map of stat -> aggregated bonus. */
export type StatBonusMap = Map<StatType, StatBonus>;

/**
 * Aggregate all allocated nodes into per-stat bonuses.
 * Pure function over the tree + allocation state — testable without a running
 * server. This is the heart of Phase 2 and is fully specified below (the TODOs
 * are only about where the numbers ultimately come from).
 */
export function aggregateBonuses(
  tree: PassiveTree,
  state: CharacterTreeState,
): StatBonusMap {
  const bonuses: StatBonusMap = new Map();

  const ensure = (stat: StatType): StatBonus => {
    let b = bonuses.get(stat);
    if (!b) {
      b = { additivePct: 0, multiplier: 1 };
      bonuses.set(stat, b);
    }
    return b;
  };

  for (const nodeId of state.allocated) {
    const node: PassiveNode | undefined = tree.nodes.get(nodeId);
    if (!node) continue;

    switch (node.kind) {
      case NodeKind.SMALL:
        // statValue is a percent, e.g. 2 => +0.02 additive.
        ensure(node.statType).additivePct += node.statValue / 100;
        break;
      case NodeKind.BIG:
        // statValue is a percent multiplier, e.g. 5 => x1.05.
        ensure(node.statType).multiplier *= 1 + node.statValue / 100;
        break;
      case NodeKind.KEYSTONE:
        // Keystones are scripted separately (see applyKeystones).
        break;
      case NodeKind.MODIFIER:
        // Ability modifiers apply to a specific ability, not a base stat.
        // Collected separately by aggregateAbilityModifiers(); nothing to do here.
        break;
    }
  }

  return bonuses;
}

/**
 * Per-ability modifier bonuses, keyed by aspect (damage / cooldown / ...).
 * Values are additive fractions per aspect (0.15 = +15%). How each aspect is
 * finally applied (e.g. cooldown as a *reduction*) is decided in
 * applyAbilityModifiers().
 */
export type AbilityModifier = Map<ModifierAspect, number>;

/** Map of ability id -> its accumulated modifier bonuses. */
export type AbilityModifierMap = Map<string, AbilityModifier>;

/**
 * Aggregate all allocated MODIFIER nodes into per-ability bonuses.
 * Pure + testable, like aggregateBonuses(). Modifier nodes carry the ability id
 * (`modifiesAbilityId`) and the aspect (`modifierAspect`, default DAMAGE); their
 * `statValue` is the percent.
 */
export function aggregateAbilityModifiers(
  tree: PassiveTree,
  state: CharacterTreeState,
): AbilityModifierMap {
  const mods: AbilityModifierMap = new Map();

  for (const nodeId of state.allocated) {
    const node: PassiveNode | undefined = tree.nodes.get(nodeId);
    if (!node || node.kind !== NodeKind.MODIFIER) continue;
    if (!node.modifiesAbilityId) continue; // malformed modifier node; skip

    const aspect = node.modifierAspect ?? ModifierAspect.DAMAGE;
    let byAspect = mods.get(node.modifiesAbilityId);
    if (!byAspect) {
      byAspect = new Map();
      mods.set(node.modifiesAbilityId, byAspect);
    }
    // Same aspect stacks additively (e.g. two "+15% Fireball damage" => +30%).
    byAspect.set(aspect, (byAspect.get(aspect) ?? 0) + node.statValue / 100);
  }

  return mods;
}

/**
 * Apply an ability's accumulated modifiers to its base values.
 * Returns adjusted numbers; does NOT mutate the ability definition.
 * TODO(phase4): feed the real CoreAbility (from abilities_core.ts) through this
 * when spells are registered, and route the result into the cast/damage code.
 */
export function applyAbilityModifiers(
  base: { baseDamage: number; cooldownSec: number; resourceCost: number },
  mod: AbilityModifier | undefined,
): { baseDamage: number; cooldownSec: number; resourceCost: number } {
  if (!mod) return { ...base };
  const damagePct = mod.get(ModifierAspect.DAMAGE) ?? 0;
  const cdReductionPct = mod.get(ModifierAspect.COOLDOWN_REDUCTION) ?? 0;
  const resourcePct = mod.get(ModifierAspect.RESOURCE_EFFICIENCY) ?? 0;
  // AREA / DURATION aspects don't map onto these three fields — they're applied
  // at cast time. TODO(phase4): thread AREA/DURATION into the spell effects.
  return {
    baseDamage: base.baseDamage * (1 + damagePct),
    cooldownSec: base.cooldownSec * (1 - cdReductionPct),
    resourceCost: base.resourceCost * (1 - resourcePct),
  };
}

/**
 * Apply a stat's base value through its aggregated passive bonus.
 * final = base * (1 + additivePct) * multiplier
 */
export function applyBonus(base: number, bonus: StatBonus | undefined): number {
  if (!bonus) return base;
  return base * (1 + bonus.additivePct) * bonus.multiplier;
}

/**
 * Recompute and push all stats for a character.
 * TODO(phase2): read the character's BASE (gear-derived) stats — this is the
 *   MySQL/core integration point (character_stats + item_stats).
 * TODO(phase2): write the resulting values back through the core stat pipeline.
 */
export function recalculateStats(
  tree: PassiveTree,
  state: CharacterTreeState,
): void {
  const bonuses = aggregateBonuses(tree, state);
  const abilityMods = aggregateAbilityModifiers(tree, state);

  // TODO(phase2): for each StatType:
  //   const base = readBaseStat(state.characterId, stat); // from gear/core
  //   const final = applyBonus(base, bonuses.get(stat));
  //   writeStat(state.characterId, stat, final);           // to core
  void bonuses; // referenced to keep intent clear until phase 2 lands.

  // TODO(phase4): for each owned ability, run applyAbilityModifiers(ability,
  //   abilityMods.get(ability.id)) and push the adjusted values into the spell.
  void abilityMods;

  applyKeystones(tree, state);
}

/**
 * Apply keystone runtime effects (auras / hooks).
 * Keystones don't fit the additive/multiplier model — each has bespoke behavior
 * defined in datascripts/keystones.ts (KeystoneHook).
 * TODO(phase3): implement each hook (stat conversion, on-damage, procs, etc.).
 */
export function applyKeystones(
  _tree: PassiveTree,
  _state: CharacterTreeState,
): void {
  // for each allocated keystone node:
  //   const ks = KEYSTONE_BY_ID[node.keystoneId];
  //   switch (ks.hook) { STAT_CONVERSION | ON_DAMAGE_TAKEN | ... }
  // TODO(phase3): wire hooks to the corresponding game events.
}

// ---------------------------------------------------------------------------
// Base-stat access stubs (MySQL / core integration)
// ---------------------------------------------------------------------------

/** TODO(phase2): read a base (gear-derived) stat value for a character. */
export function readBaseStat(_characterId: number, _stat: StatType): number {
  return 0;
}

/** TODO(phase2): write a computed stat back through the core stat pipeline. */
export function writeStat(_characterId: number, _stat: StatType, _value: number): void {
  // Core stat write goes here.
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Livescript entry point. Recalculation is triggered on allocation and on login.
 * TODO(phase2): register the relevant events.
 */
export function Main(_events: unknown /* TSEvents */): void {
  // events.Player.OnLogin((player) => { recalculateStats(...); });
}
