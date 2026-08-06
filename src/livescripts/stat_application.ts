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
import { NodeKind } from '../datascripts/passive_tree';

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
        // Ability modifiers are applied to abilities, not base stats.
        // TODO(phase4): route to ability enhancement (abilities_*).
        break;
    }
  }

  return bonuses;
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

  // TODO(phase2): for each StatType:
  //   const base = readBaseStat(state.characterId, stat); // from gear/core
  //   const final = applyBonus(base, bonuses.get(stat));
  //   writeStat(state.characterId, stat, final);           // to core
  void bonuses; // referenced to keep intent clear until phase 2 lands.

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
