/**
 * class_config.ts — Phase 1 skeleton
 * ----------------------------------
 * Definition of the custom class: identity, base stats at level 1, and the core
 * ability sets it ships with. See DESIGN_SPEC.md "Design Philosophy" and the
 * class-creation example in the TSWOW wiki (std.Classes.create).
 *
 * STRUCTURE ONLY: base stats and the cloned base class are placeholders.
 * TODO(mysql) / TODO(design) mark what still needs real data.
 */

// import { std } from 'wow/wotlk'; // TODO(tswow): enable to create the class

import { CORE_ABILITIES_BY_DIRECTION } from '../datascripts/abilities_core';

// Re-export so the class config remains the one-stop place to see what a
// character ships with, while abilities_core.ts stays the single source of truth.
export { CORE_ABILITIES_BY_DIRECTION };

/**
 * Level-1 base stats for the class. Every character enters Torghast floor 1 with
 * these (before any gear / passive tree). Values are placeholders.
 * TODO(design): decide floor-1 starting stats (see DECISIONS.md "Starting Gear").
 * TODO(mysql): reconcile stat names with the character_stats export.
 */
export interface BaseStats {
  health: number;
  mana: number;
  strength: number;
  intellect: number;
  dexterity: number;
  armor: number;
}

export const BASE_STATS_LEVEL_1: BaseStats = {
  health: 0,     // TODO(design)
  mana: 0,       // TODO(design)
  strength: 0,   // TODO(design)
  intellect: 0,  // TODO(design)
  dexterity: 0,  // TODO(design)
  armor: 0,      // TODO(design)
};

/**
 * Class identity + registration parameters.
 * The single class supports all three build directions; the passive tree is what
 * specializes a character (there are no separate "specs").
 */
export interface ClassConfig {
  /** TSWOW module + id used in std.Classes.create(module, id, baseClass). */
  moduleName: string;
  classId: string;
  /** Existing class to clone as a base. TODO(design): pick the closest fit. */
  baseClass: string;
  /** Display name. */
  displayName: string;
  /** Playable races. TODO(design): confirm. */
  races: string[];
  /** Level cap — spec: 80 (leveling ends at floor 80). */
  levelCap: number;
  /** Level-1 base stats. */
  baseStats: BaseStats;
}

export const CLASS_CONFIG: ClassConfig = {
  moduleName: 'torghast',
  classId: 'torghast-wanderer',
  // Placeholder base — the class is direction-agnostic, so any base works as a
  // starting point; WARRIOR chosen arbitrarily. TODO(design): confirm.
  baseClass: 'WARRIOR',
  displayName: 'Torghast Wanderer',
  races: ['HUMAN'], // TODO(design): expand allowed races
  levelCap: 80,
  baseStats: BASE_STATS_LEVEL_1,
};

// Core ability sets grouped by build direction come from abilities_core.ts
// (CORE_ABILITIES_BY_DIRECTION, re-exported above). A character technically
// starts with the full set; direction only reflects which abilities the passive
// tree is best positioned to enhance.
// TODO(design): decide whether floor-1 characters get ALL core abilities or pick
// a starting direction (see DESIGN_SPEC "Core Abilities" — 5–8 per direction).

// ---------------------------------------------------------------------------
// TSWOW registration (STUB)
// ---------------------------------------------------------------------------

/**
 * Register the custom class.
 * TODO(tswow): std.Classes.create(CLASS_CONFIG.moduleName, CLASS_CONFIG.classId,
 *   CLASS_CONFIG.baseClass).Name.enGB.set(displayName).Races.add(races)
 * then grant the core abilities from CORE_ABILITIES_BY_DIRECTION and set base
 * stats. Requires abilities_core.registerCoreAbilities() to have run first.
 */
export function registerClass(): void {
  // TODO(tswow): create class + grant core abilities + set base stats.
}
